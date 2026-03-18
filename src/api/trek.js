import { buildUserContext } from '@/api/userContext';

const BASE_SYSTEM_PROMPT = `You are TREK, the market intelligence brain of TREDIA. You analyze real market data and deliver clear, specific market intelligence. Be direct and specific. Always explain the WHY. Give concrete levels and timeframes. Be honest about both opportunity AND risk. Talk like a knowledgeable friend, not a legal document. Always give specific price levels (support, resistance), a clear timeframe, and the main risk to the thesis. END EVERY RESPONSE with exactly this line: ⚡ TREK Intelligence · For informational purposes · You make the final call.`;

function buildSystemPrompt(marketContext, user) {
  let prompt = BASE_SYSTEM_PROMPT;

  if (marketContext) {
    const { fng_value, fng_label, btc_price, btc_change_24h, eth_price, eth_change_24h, portfolio } = marketContext;
    prompt += `\n\nLive market context: Fear & Greed: ${fng_value ?? '—'} (${fng_label ?? '—'}), BTC: $${btc_price ?? '—'} (${btc_change_24h ?? '—'}% 24h), ETH: $${eth_price ?? '—'} (${eth_change_24h ?? '—'}% 24h). User portfolio: ${portfolio ?? 'not provided'}.`;
  }

  const userCtx = buildUserContext(user);
  if (userCtx) {
    prompt += `\n\n${userCtx}`;
  }

  return prompt;
}

export async function askTrek(messages, marketContext, user = null) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;
  const systemPrompt = buildSystemPrompt(marketContext, user);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI API error ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}