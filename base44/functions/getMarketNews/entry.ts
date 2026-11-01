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

const MAX_PER_SOURCE = 3;
const MAX_REGION_SHARE = 0.4;

/**
 * Balance the feed: no single source takes more than 3 of the slots shown and
 * no single region more than 40% of them, so one prolific publisher cannot own
 * the page. Pass one honours both caps; pass two lifts the region cap (so a
 * thin world can still fill 20 slots) and keeps the source cap; pass three
 * fills any remainder. Input order — newest first — is preserved throughout.
 */
function balanceFeed<T extends { source?: string; region?: string }>(list: T[], limit: number): T[] {
  const regionCap = Math.max(2, Math.floor(limit * MAX_REGION_SHARE));
  const picked: T[] = [];
  const used = new Set<number>();
  const perSource = new Map<string, number>();
  const perRegion = new Map<string, number>();

  const pass = (respectRegion: boolean, respectSource: boolean) => {
    list.forEach((article, index) => {
      if (picked.length >= limit || used.has(index)) return;
      const source = String(article.source || 'News').toLowerCase();
      const region = article.region || 'Global';
      if (respectSource && (perSource.get(source) || 0) >= MAX_PER_SOURCE) return;
      if (respectRegion && (perRegion.get(region) || 0) >= regionCap) return;
      picked.push(article);
      used.add(index);
      perSource.set(source, (perSource.get(source) || 0) + 1);
      perRegion.set(region, (perRegion.get(region) || 0) + 1);
    });
  };

  pass(true, true);
  pass(false, true);
  pass(false, false);
  return picked;
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

    // A symbol feed is inherently one subject, so it is not re-balanced.
    const selected = symbol ? articles.slice(0, limit) : balanceFeed(articles, limit);
    const payload = selected.map((a) => ({
      ...a,
      age: ageOf(a.publishedAt),
    }));

    const countBy = (key: keyof typeof payload[number]) => {
      const out: Record<string, number> = {};
      for (const article of payload) {
        const k = String(article[key] || 'unknown');
        out[k] = (out[k] || 0) + 1;
      }
      return out;
    };

    return Response.json({
      articles: payload,
      meta: {
        count: payload.length,
        poolSize: pool.articles.length,
        generatedAt: new Date(pool.generatedAt).toISOString(),
        filters: { region: region || 'All', category: category || 'All', symbol: symbol || null },
        bySource: countBy('source'),
        byRegion: countBy('region'),
      },
    });
  } catch (error) {
    console.error('[getMarketNews] error:', error.message);
    return Response.json({ error: error.message, articles: [] }, { status: 500 });
  }
});