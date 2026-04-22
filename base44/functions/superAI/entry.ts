import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CLAUDE_TECHNICAL_PROMPT = `You are the technical analysis engine of TREK. Analyze the asset using: price action, moving averages (20, 50, 200 MA), RSI, MACD, volume, support/resistance levels, chart patterns. Give a clear BULLISH/BEARISH/NEUTRAL verdict with specific price levels. Be concise — max 100 words. End with: Verdict: BULLISH or BEARISH or NEUTRAL`;

const GPT_FUNDAMENTAL_PROMPT = `You are the fundamental analysis engine of TREK. Analyze the asset using: earnings growth, revenue trends, profit margins, P/E ratio vs sector, competitive position, recent news, insider activity, institutional ownership. Give a clear BULLISH/BEARISH/NEUTRAL verdict. Be concise — max 100 words. End with: Verdict: BULLISH or BEARISH or NEUTRAL`;

const GEMINI_SENTIMENT_PROMPT = `You are the sentiment analysis engine of TREK. Analyze the asset using: social media sentiment, news sentiment from last 7 days, options market sentiment (put/call ratio), retail vs institutional positioning, Fear & Greed Index impact. Give a clear BULLISH/BEARISH/NEUTRAL verdict. Be concise — max 100 words. End with: Verdict: BULLISH or BEARISH or NEUTRAL`;

async function callClaude(question, marketContext) {
  const contextStr = marketContext ? `\nMarket Context: ${JSON.stringify(marketContext)}` : '';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: CLAUDE_TECHNICAL_PROMPT + contextStr,
      messages: [{ role: 'user', content: question }],
    }),
  });
  if (!res.ok) throw new Error(`Claude error ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

async function callGPT(question, marketContext) {
  const contextStr = marketContext ? `\nMarket Context: ${JSON.stringify(marketContext)}` : '';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 300,
      messages: [
        { role: 'system', content: GPT_FUNDAMENTAL_PROMPT + contextStr },
        { role: 'user', content: question },
      ],
    }),
  });
  if (!res.ok) throw new Error(`GPT error ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini(question, marketContext) {
  const contextStr = marketContext ? `\nMarket Context: ${JSON.stringify(marketContext)}` : '';
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: GEMINI_SENTIMENT_PROMPT + contextStr + '\n\nUser question: ' + question }] }],
      generationConfig: { maxOutputTokens: 300 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function extractVerdict(text) {
  const match = text.match(/Verdict:\s*(BULLISH|BEARISH|NEUTRAL)/i);
  return match ? match[1].toUpperCase() : 'NEUTRAL';
}

function buildMasterVerdict(verdicts, rawTexts) {
  const bullish = verdicts.filter(v => v === 'BULLISH').length;
  const bearish = verdicts.filter(v => v === 'BEARISH').length;

  // Parse any explicit confidence % from model outputs to calibrate master confidence
  let totalParsed = 0, parsedCount = 0;
  rawTexts.forEach(t => {
    const m = t.match(/confidence[:\s]+(\d{1,3})%/i);
    if (m) { totalParsed += parseInt(m[1], 10); parsedCount++; }
  });
  const avgParsed = parsedCount > 0 ? Math.round(totalParsed / parsedCount) : null;

  if (bullish === 3) {
    const conf = avgParsed ? Math.min(97, Math.max(85, avgParsed)) : 92;
    return { action: 'STRONG BUY', confidence: conf, consensus: '3/3 models bullish — full consensus' };
  }
  if (bullish === 2) {
    const conf = avgParsed ? Math.min(82, Math.max(62, avgParsed)) : 72;
    return { action: 'BUY', confidence: conf, consensus: '2/3 models bullish — majority consensus' };
  }
  if (bearish === 3) {
    const conf = avgParsed ? Math.min(97, Math.max(85, avgParsed)) : 91;
    return { action: 'STRONG SELL', confidence: conf, consensus: '3/3 models bearish — full consensus' };
  }
  if (bearish === 2) {
    const conf = avgParsed ? Math.min(82, Math.max(62, avgParsed)) : 70;
    return { action: 'SELL', confidence: conf, consensus: '2/3 models bearish — majority consensus' };
  }
  const conf = avgParsed ? Math.min(60, Math.max(40, avgParsed)) : 48;
  return { action: 'HOLD', confidence: conf, consensus: '1/3 split — models diverge, wait for clarity' };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Tier gate: Super AI requires pro or elite
    const allowedTiers = ['pro', 'elite', 'yearly', 'lifetime'];
    const userTier = user.subscription_tier || 'free';
    if (!allowedTiers.includes(userTier)) {
      return Response.json({ error: 'Super AI requires a Pro or Elite subscription.', upgrade: true }, { status: 403 });
    }

    const { question, marketContext } = await req.json();
    if (!question) return Response.json({ error: 'question is required' }, { status: 400 });

    // Call all 3 models in parallel
    const [claudeRaw, gptRaw, geminiRaw] = await Promise.all([
      callClaude(question, marketContext).catch(e => `Analysis unavailable: ${e.message}`),
      callGPT(question, marketContext).catch(e => `Analysis unavailable: ${e.message}`),
      callGemini(question, marketContext).catch(e => `Analysis unavailable: ${e.message}`),
    ]);

    const claudeVerdict = extractVerdict(claudeRaw);
    const gptVerdict = extractVerdict(gptRaw);
    const geminiVerdict = extractVerdict(geminiRaw);

    const master = buildMasterVerdict([claudeVerdict, gptVerdict, geminiVerdict], [claudeRaw, gptRaw, geminiRaw]);

    return Response.json({
      claude: { analysis: claudeRaw, verdict: claudeVerdict },
      gpt: { analysis: gptRaw, verdict: gptVerdict },
      gemini: { analysis: geminiRaw, verdict: geminiVerdict },
      master,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});