/**
 * Official central-bank releases, rewritten into what actually happened.
 *
 * A release feed says "Monetary policy decisions" or "Federal Reserve issues
 * FOMC statement". That is a document title, not news: it tells the reader
 * nothing about what the bank did or what it means for markets. So for the
 * official feeds we fetch the release itself and read the decision out of its
 * own text — the action verb and the rate figure — and rebuild the headline:
 *
 *   "Monetary policy decisions"        → "ECB holds rates at 2.50% / 2.65% / 2.90%"
 *   "Federal Reserve issues FOMC stat." → "Fed cuts rates to 3.75%-4.00%"
 *   "Monetary policy update"           → "Riksbank holds policy rate at 1.75%"
 *
 * Everything here is deterministic parsing of the release text, not a summary by
 * an LLM: the numbers in a rate decision must be the bank's own numbers. When a
 * release carries no rate decision (a supervision notice, an appointment), this
 * returns null and the caller keeps the original title — routine notices are then
 * dropped by the relevance penalties in newsEngine, not rewritten here.
 */

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

export type OfficialRewrite = { title: string; summary: string };

/** The institution's short name as a headline says it. */
const BANK_NAMES: { match: RegExp; name: string }[] = [
  { match: /federal reserve/i, name: 'Fed' },
  { match: /\becb\b|european central bank/i, name: 'ECB' },
  { match: /riksbank/i, name: 'Riksbank' },
];

const lc = (value: unknown) => String(value || '').toLowerCase();

function plainText(html: string): string {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

/** "3-3/4" → 3.75, "3-1/2" → 3.5, "1/2" → 0.5, "2.50" → 2.5, "4" → 4. */
function parseRate(raw: string): number | null {
  const value = String(raw || '').replace(/[%\s]/g, '');
  const mixed = value.match(/^(\d+)-(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const fraction = value.match(/^(\d+)\/(\d+)$/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  const plain = value.match(/^(\d+(?:\.\d+)?)$/);
  return plain ? Number(plain[1]) : null;
}

const pct = (value: number) => `${value.toFixed(2)}%`;

/** Did the bank hold, cut or raise? Read from the decision sentence only. */
function actionOf(sentence: string): 'holds' | 'cuts' | 'raises' {
  const text = lc(sentence);
  const tightening = /(raise|raises|raised|increase|increases|increased|hike|hikes|hiked|lift|lifts|lifted|höjer|höjt|höja)/;
  const easing = /(lower|lowers|lowered|cut|cuts|cutting|reduce|reduces|reduced|decrease|decreases|decreased|trim|trims|trimmed|sänker|sänkt|sänka)/;
  if (tightening.test(text) && !easing.test(text)) return 'raises';
  if (easing.test(text) && !tightening.test(text)) return 'cuts';
  return 'holds';
}

function firstSentenceMatching(text: string, pattern: RegExp): string {
  return sentences(text).find((sentence) => pattern.test(sentence)) || '';
}

/** The Fed states its decision as a target range: "…at 3-3/4 to 4 percent". */
function fedDecision(text: string): OfficialRewrite | null {
  const sentence = firstSentenceMatching(text, /target range for the federal funds rate/i);
  if (!sentence) return null;
  const range = sentence.match(/target range for the federal funds rate\s+(?:at|to)\s+([^.]{0,60}?)\s*(?:percent|%)/i);
  if (!range) return null;
  const bounds = range[1].split(/\s+to\s+/i).map(parseRate).filter((n) => n !== null) as number[];
  if (bounds.length === 0) return null;
  const action = actionOf(sentence);
  const rate = bounds.length >= 2 ? `${pct(bounds[0])}-${pct(bounds[1])}` : pct(bounds[0]);
  return {
    title: `Fed ${action} rates ${action === 'holds' ? 'at' : 'to'} ${rate}`,
    summary: `${sentence.replace(/\s*in support of[\s\S]*$/i, '').trim()}.`,
  };
}

/** The ECB states all three key rates in one line. */
function ecbDecision(text: string): OfficialRewrite | null {
  // Take the sentence that carries the most rate figures: the ECB lists them
  // together ("unchanged at 2.50%, 2.65% and 2.90%"), while the first "%" in the
  // document is often a single rate quoted in an unrelated paragraph.
  const ratesOf = (sentence: string) => (sentence.match(/\d[\d.,]*\s*%/g) || [])
    .map((value) => Number(value.replace(/[%\s]/g, '').replace(',', '.')))
    .filter((value) => Number.isFinite(value));
  const candidates = sentences(text).filter((sentence) => ratesOf(sentence).length > 0
    && /(interest rate|policy rate|unchanged|deposit facility|refinancing|decided)/i.test(sentence));
  if (candidates.length === 0) return null;
  const decision = candidates.sort((a, b) => ratesOf(b).length - ratesOf(a).length)[0];
  const rates = ratesOf(decision);
  if (rates.length === 0) return null;
  const action = actionOf(decision);
  return {
    title: `ECB ${action} rates ${action === 'holds' ? 'at' : 'to'} ${rates.slice(0, 3).map(pct).join(' / ')}`,
    summary: decision.replace(/\s+/g, ' ').trim(),
  };
}

/** The Riksbank states one policy rate. */
function riksbankDecision(text: string): OfficialRewrite | null {
  const sentence = firstSentenceMatching(text, /policy rate/i);
  if (!sentence) return null;
  const rate = sentence.match(/policy rate[^.]{0,70}?at\s+(\d+(?:[.,]\d+)?)\s*(?:per ?cent|%)/i);
  if (!rate) return null;
  const value = Number(rate[1].replace(',', '.'));
  if (!Number.isFinite(value)) return null;
  const action = actionOf(sentence);
  return {
    title: `Riksbank ${action} policy rate ${action === 'holds' ? 'at' : 'to'} ${pct(value)}`,
    summary: `${sentence}.`,
  };
}

/**
 * Read one official release. Returns the rewritten headline and the release's
 * own decision sentence, or null when the page carries no rate decision (a
 * supervision notice, a survey, an appointment) — the caller then keeps the
 * original title and the engine's relevance penalties decide its fate.
 */
export async function describeOfficialRelease(
  url: string,
  source: string,
): Promise<OfficialRewrite | null> {
  const bank = BANK_NAMES.find((b) => b.match.test(String(source || '')));
  if (!bank || !url) return null;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(7000),
      headers: { 'User-Agent': UA, Accept: 'text/html' },
    });
    if (!res.ok) return null;
    const text = plainText(await res.text());
    if (!text || text.length < 200) return null;
    // The release body, not the navigation: start at the first decision word.
    const body = text.slice(Math.max(0, text.search(/Governing Council|Committee|Executive Board|the Board/i)));

    const decision = bank.name === 'Fed'
      ? fedDecision(body) || fedDecision(text)
      : bank.name === 'ECB'
        ? ecbDecision(body) || ecbDecision(text)
        : riksbankDecision(body) || riksbankDecision(text);

    if (!decision) return null;
    return {
      title: decision.title.slice(0, 140),
      summary: String(decision.summary || '').slice(0, 240),
    };
  } catch (_) {
    return null;
  }
}