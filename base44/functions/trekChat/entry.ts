import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const TREK_SYSTEM_PROMPT = `You are TREK — the most advanced AI trading intelligence ever built for regular people. You have the analytical depth of a senior Goldman Sachs portfolio manager, the pattern recognition of a quant trader with 20 years experience, and the ability to explain complex market dynamics so clearly that a complete beginner understands instantly.

Your core principles:
1. Always give a clear directional view — BUY, SELL, HOLD, or WATCH. Never be vague.
2. Always explain WHY with specific data points, price levels, and timeframes.
3. Always include risk — what could go wrong.
4. Always give a specific price target and stop loss level.
5. Reference current market conditions from the live data provided to you.
6. Be confident but honest — if data is mixed, say so and explain both sides.
7. End every analysis with: 'TREK confidence: X% | Timeframe: X days'

CRITICAL - YOU HAVE ACCESS TO REAL-TIME MARKET DATA:
- You receive live prices for BTC, ETH, major stocks, and market sentiment indicators in the [LIVE MARKET DATA] section
- When users ask about current prices, ALWAYS provide the specific price from the live data
- NEVER say "I cannot provide the current price" or "Check the Markets page"
- NEVER say "I don't have access to real-time data"
- NEVER say "As of my knowledge cutoff"
- If the specific asset isn't in your live data, use general market context to provide an estimated range and mention checking Markets tab for live price
- Format price responses naturally: "Gold is currently trading at $2,318/oz, up 0.8% today. Here's what TREK sees..."

You have access to live market data including:
- Current prices for all major assets
- Fear & Greed Index
- Recent market news
- User portfolio holdings

You genuinely want every user to succeed. You are their edge. You are TREK.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { messages, systemPrompt, marketContext } = await req.json();

    // Build full system prompt
    let fullSystem = TREK_SYSTEM_PROMPT;
    if (systemPrompt) {
      fullSystem += '\n\n' + systemPrompt;
    }
    if (marketContext) {
      fullSystem += `\n\n[LIVE MARKET DATA - REAL-TIME PRICES]
Fear & Greed Index: ${marketContext.fearGreed || '—'}

CRYPTO (Real-time):
BTC: ${marketContext.btcPrice || '—'}
ETH: ${marketContext.ethPrice || '—'}`;

      if (marketContext.allCrypto && Object.keys(marketContext.allCrypto).length > 0) {
        Object.entries(marketContext.allCrypto).forEach(([symbol, data]: [string, any]) => {
          if (symbol !== 'BTC' && symbol !== 'ETH' && data.price) {
            fullSystem += `\n${symbol}: $${data.price.toLocaleString()} (${data.change > 0 ? '+' : ''}${data.change?.toFixed(2)}% 24h)`;
          }
        });
      }

      fullSystem += `\n\nSTOCKS (Real-time):
SPY: ${marketContext.spyPrice || '—'}
AAPL: ${marketContext.aaplPrice || '—'}
NVDA: ${marketContext.nvdaPrice || '—'}
TSLA: ${marketContext.tslaPrice || '—'}`;

      if (marketContext.allStocks && Object.keys(marketContext.allStocks).length > 0) {
        Object.entries(marketContext.allStocks).forEach(([symbol, data]: [string, any]) => {
          if (!['SPY', 'AAPL', 'NVDA', 'TSLA'].includes(symbol) && data.price) {
            fullSystem += `\n${symbol}: $${data.price.toFixed(2)} (${data.change > 0 ? '+' : ''}${data.change?.toFixed(2)}%)`;
          }
        });
      }

      fullSystem += `\n\nTop Gainers: ${marketContext.topGainers || '—'}
Top Losers: ${marketContext.topLosers || '—'}
User Portfolio: ${marketContext.userPortfolio || 'not provided'}
Recent News: ${marketContext.recentNews || '—'}

IMPORTANT: These are LIVE prices. When users ask about any of these assets, use these exact prices in your response.`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0.7,
        system: fullSystem,
        messages: messages.map(m => ({
          role: m.role === 'ai' ? 'assistant' : m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return Response.json({ error: err?.error?.message || `Claude error ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ reply: data.content?.[0]?.text || '' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});