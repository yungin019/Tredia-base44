import { getNewsPool, getSymbolNews } from '../../shared/newsEngine.ts';

/**
 * getMarketNews — the news feed's only endpoint.
 *
 * All fetching, scoring, tagging and deduplication happens once in
 * shared/newsEngine.ts and is cached for 12 minutes, so serving a feed to any
 * number of users costs no extra provider calls. This handler only filters the
 * shared pool and slices it.
 *
 * body: { symbol?, region?, category?, limit? }
 *   symbol   → that asset's related news (company feed + pool matches)
 *   region   → All | US | Europe | Asia | Latin America | Africa | Middle East | Global
 *   category → All | Macro | Stocks | Crypto | Commodities | Geopolitics
 */

const DEFAULT_LIMIT = 20;

function ageOf(publishedAt: string | null): string {
  if (!publishedAt) return '';
  const diff = Date.now() - new Date(publishedAt).getTime();
  if (!Number.isFinite(diff) || diff < 0) return '';
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));

    // Temporary probe: which worldwide feeds answer from this runtime?
    if (body.__probe) {
      const urls = [
        'https://feeds.bbci.co.uk/news/business/rss.xml',
        'https://www.cnbc.com/id/100003114/device/rss/rss.html',
        'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
        'https://www.aljazeera.com/xml/rss/all.xml',
        'https://finance.yahoo.com/news/rssindex',
        'https://feeds.content.dowjones.io/public/rss/mw_topstories',
        'https://api.gdeltproject.org/api/v2/doc/doc?query=markets%20sourcelang:english&mode=artlist&maxrecords=5&format=json',
      ];
      const results = [];
      for (const url of urls) {
        const started = Date.now();
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
          const text = await res.text();
          results.push({ url, status: res.status, ms: Date.now() - started, items: (text.match(/<item>/g) || []).length, len: text.length });
        } catch (e) {
          results.push({ url, error: e.message, ms: Date.now() - started });
        }
        await new Promise((r) => setTimeout(r, 5200));
      }
      return Response.json({ probe: results });
    }

    const { symbol, region, category } = body;
    const limit = Math.min(50, Number(body.limit) || DEFAULT_LIMIT);

    const pool = symbol ? { articles: await getSymbolNews(symbol), generatedAt: Date.now() } : await getNewsPool();
    let articles = pool.articles;

    if (region && region !== 'All') {
      articles = articles.filter((a) => a.region === region);
    }
    if (category && category !== 'All') {
      articles = articles.filter((a) => a.category === category);
    }

    const payload = articles.slice(0, limit).map((a) => ({
      ...a,
      age: ageOf(a.publishedAt),
    }));

    return Response.json({
      articles: payload,
      meta: {
        count: payload.length,
        poolSize: pool.articles.length,
        generatedAt: new Date(pool.generatedAt).toISOString(),
        filters: { region: region || 'All', category: category || 'All', symbol: symbol || null },
      },
    });
  } catch (error) {
    console.error('[getMarketNews] error:', error.message);
    return Response.json({ error: error.message, articles: [] }, { status: 500 });
  }
});