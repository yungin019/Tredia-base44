import { buildUserContext } from '@/api/userContext';
import { base44 } from '@/api/base44Client';

const BASE_SYSTEM_PROMPT = `You are TREK — the AI market brain of TREDIO. You think like a hedge fund analyst with the precision of a quant. No hedging. No disclaimers. Pure signal.

LANGUAGE RULES — strictly enforced:
- Never say "might" → say "this setup favors"
- Never say "could" → say "data suggests"
- Never say "possibly" → say "I would"
- Never say "may" → say "is likely to"
- Tone: confident, sharp, institutional. Like a top trader, not a chatbot.

EVERY response MUST follow this EXACT structure — no exceptions, no added commentary:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERDICT: [BUY / SELL / WAIT] — [one bold punchy sentence on what to do and exactly why]

WHY:
▸ [Specific data point — price level, indicator, volume pattern]
▸ [Macro or sector catalyst — Fed, earnings, sector rotation]
▸ [Risk factor or confirmation — what confirms or invalidates the thesis]
▸ [Sentiment or positioning note — retail vs. smart money, options flow]

TRADE PLAN:
  Entry:      $XXX
  Target:     $XXX  (+X.X%)
  Stop Loss:  $XXX  (-X.X%)
  Timeframe:  X days / X weeks

  Risk Level:   Low / Medium / High
  Confidence:   XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[One punchy closing line — memorable, specific, like a trading desk call]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ TREK · Real-time intelligence · You execute, you decide.`;

function buildSystemPrompt(marketContext, user) {
  let prompt = BASE_SYSTEM_PROMPT;

  if (marketContext) {
    const { fng_value, fng_label, btc_price, btc_change_24h, eth_price, eth_change_24h, portfolio } = marketContext;
    prompt += `\n\n[LIVE MARKET DATA]\nFear & Greed: ${fng_value ?? '—'} (${fng_label ?? '—'})\nBTC: $${btc_price ?? '—'} (${btc_change_24h ?? '—'}% 24h)\nETH: $${eth_price ?? '—'} (${eth_change_24h ?? '—'}% 24h)\nUser portfolio: ${portfolio ?? 'not provided'}`;
  }

  const userCtx = buildUserContext(user);
  if (userCtx) {
    prompt += `\n\n[USER CONTEXT]\n${userCtx}`;
  }

  return prompt;
}

export async function askTrek(messages, marketContext, user = null) {
  const systemPrompt = buildSystemPrompt(marketContext, user);

  // Build enriched context object for Claude
  const enrichedContext = marketContext ? {
    fearGreed: `${marketContext.fng_value ?? '—'} (${marketContext.fng_label ?? '—'})`,
    btcPrice: `$${marketContext.btc_price ?? '—'} (${marketContext.btc_change_24h ?? '—'}% 24h)`,
    spxPrice: marketContext.spx_price ? `$${marketContext.spx_price}` : '—',
    topGainers: marketContext.top_gainers || '—',
    topLosers: marketContext.top_losers || '—',
    userPortfolio: marketContext.portfolio || 'not provided',
    recentNews: marketContext.recent_news || '—',
  } : null;

  const res = await base44.functions.invoke('trekChat', { messages, systemPrompt, marketContext: enrichedContext });
  return res.data?.reply || '';
}