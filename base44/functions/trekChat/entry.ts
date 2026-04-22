import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TREK_SYSTEM_PROMPT = `You are TREK — the most advanced AI trading intelligence ever built for regular people. You have the analytical depth of a senior Goldman Sachs portfolio manager, the pattern recognition of a quant trader with 20 years experience, and the ability to explain complex market dynamics so clearly that a complete beginner understands instantly.

Your core principles:
1. Always give a clear directional view — BUY, SELL, HOLD, or WATCH. Never be vague.
2. Always explain WHY with specific data points, price levels, and timeframes.
3. Always include risk — what could go wrong.
4. Always give a specific price target and stop loss level.
5. Reference current market conditions from the live data provided to you.
6. Be confident but honest — if data is mixed, say so and explain both sides.
7. End every analysis with: 'TREK confidence: X% | Timeframe: X days'

You have access to live market data including:
- Current prices for all major assets
- Fear & Greed Index
- Recent market news
- User portfolio holdings

You genuinely want every user to succeed. You are their edge. You are TREK.`;

const ANALYST_PROMPT = `You are a senior quantitative trading analyst. Your job is to provide a rigorous, data-driven trading assessment.

Rules:
- Give a clear signal: BUY, SELL, HOLD, or WATCH
- Give a confidence % (0-100) based on signal strength
- Keep your analysis to 3-4 sentences maximum
- Be specific: use price levels, % moves, timeframes
- Never be vague. Take a clear position.
- End with: SIGNAL: [BUY/SELL/HOLD/WATCH] | CONFIDENCE: [XX]%`;

const SYNTHESIZER_PROMPT = `You are TREK — the master AI synthesizer. You have just received two independent analyst reports on the same asset. Your job is to synthesize them into one definitive TREK verdict.

Rules:
- If both analysts agree: reflect high consensus and boost confidence
- If they disagree: identify WHY and take the stronger position with explanation
- Always output a single, clear signal: BUY, SELL, HOLD, or WATCH
- Final confidence must be a weighted blend (not just average) — explain the reasoning
- Format your final output exactly like this:

⚡ TREK SAYS: [BUY/SELL/HOLD/WATCH]

[2-3 sentence synthesis explanation]

📊 WHY THIS MATTERS: [One key market insight]

💡 WHAT TO WATCH: [One specific price level or event]

TREK confidence: [XX]% | Timeframe: [X] days`;

function buildContext(marketContext) {
  if (!marketContext) return '';
  return `\n\n[LIVE MARKET DATA]
Fear & Greed Index: ${marketContext.fearGreed || '—'}
BTC: ${marketContext.btcPrice || '—'}
SPX: ${marketContext.spxPrice || '—'}
Top Gainers: ${marketContext.topGainers || '—'}
Top Losers: ${marketContext.topLosers || '—'}
User Portfolio: ${marketContext.userPortfolio || 'not provided'}
Recent News: ${marketContext.recentNews || '—'}`;
}

async function callClaude(systemPrompt, messages) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      temperature: 0.5,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.content,
      })),
    }),
  });
  if (!response.ok) throw new Error(`Claude error ${response.status}`);
  const data = await response.json();
  return data.content?.[0]?.text || '';
}

async function callOpenAI(systemPrompt, messages) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 800,
      temperature: 0.5,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role === 'ai' ? 'assistant' : m.role,
          content: m.content,
        })),
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenAI error ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { messages, systemPrompt, marketContext } = await req.json();

    const contextBlock = buildContext(marketContext);

    // For simple conversational messages (not asset analysis), skip multi-model
    const lastMessage = messages?.[messages.length - 1]?.content || '';
    const isDeepAnalysis = lastMessage.toLowerCase().includes('analysis') ||
      lastMessage.toLowerCase().includes('signal') ||
      lastMessage.toLowerCase().includes('buy') ||
      lastMessage.toLowerCase().includes('sell') ||
      lastMessage.toLowerCase().includes('trek') ||
      lastMessage.toLowerCase().includes('confidence') ||
      /[A-Z]{1,5}/.test(lastMessage); // has a ticker symbol

    if (!isDeepAnalysis) {
      // Simple chat: just use Claude
      const system = (systemPrompt || TREK_SYSTEM_PROMPT) + contextBlock;
      const reply = await callClaude(system, messages);
      return Response.json({ reply });
    }

    // DEEP ANALYSIS MODE: Run both models in parallel as independent analysts
    const analystSystem = ANALYST_PROMPT + (systemPrompt ? `\n\n${systemPrompt}` : '') + contextBlock;

    const [claudeAnalysis, openaiAnalysis] = await Promise.allSettled([
      callClaude(analystSystem, messages),
      callOpenAI(analystSystem, messages),
    ]);

    const claudeText = claudeAnalysis.status === 'fulfilled' ? claudeAnalysis.value : null;
    const openaiText = openaiAnalysis.status === 'fulfilled' ? openaiAnalysis.value : null;

    // If only one model succeeded, use it directly
    if (!claudeText && !openaiText) {
      return Response.json({ reply: "TREK analysis temporarily unavailable. Please try again." });
    }

    if (!claudeText || !openaiText) {
      const fallback = claudeText || openaiText;
      return Response.json({ reply: fallback });
    }

    // Both models responded — synthesize with Claude as the master
    const synthMessages = [{
      role: 'user',
      content: `Asset query: "${lastMessage}"

ANALYST 1 (Quantitative Model):
${claudeText}

ANALYST 2 (Fundamental Model):
${openaiText}

Synthesize these two analyses into one definitive TREK verdict.`,
    }];

    const synthSystem = SYNTHESIZER_PROMPT + contextBlock;
    const finalReply = await callClaude(synthSystem, synthMessages);

    return Response.json({ reply: finalReply, _debug: { claudeText, openaiText } });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});