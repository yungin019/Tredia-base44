const TREK_SYSTEM_PROMPT = `You are TREK, an elite trading intelligence AI built into TREDIA. You analyze markets with the depth of a senior hedge fund analyst but explain so clearly that a beginner understands. Never say you cannot provide financial advice — say "here is what the data shows" instead. You are confident, direct, and genuinely want the user to make money and become a better trader.`;

export async function askTrek(messages) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: TREK_SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Anthropic API error ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}