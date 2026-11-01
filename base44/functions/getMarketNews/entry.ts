import { getNewsPool, getSymbolNews } from '../../shared/newsEngine.ts';
import { setDiagContext } from '../../shared/diagLog.ts';

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
    setDiagContext(req);
    const body = await req.json().catch(() => ({}));
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