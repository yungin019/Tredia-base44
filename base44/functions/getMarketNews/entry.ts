import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const FINNHUB_KEY = Deno.env.get('FINNHUB_API_KEY');

    // Fetch general market news from Finnhub
    const res = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`);
    if (!res.ok) throw new Error(`Finnhub error: ${res.status}`);
    const articles = await res.json();

    // Filter to English, recent, with images
    const filtered = articles
      .filter(a => a.headline && a.url && a.source)
      .slice(0, 12)
      .map(a => ({
        title: a.headline,
        url: a.url,
        domain: a.source,
        image: a.image || null,
        summary: a.summary || '',
        seendate: a.datetime ? new Date(a.datetime * 1000).toISOString() : null,
      }));

    return Response.json({ articles: filtered });
  } catch (error) {
    return Response.json({ error: error.message, articles: [] }, { status: 500 });
  }
});