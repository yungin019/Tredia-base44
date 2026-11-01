import { useEffect, useState } from 'react';
import { db } from '@/api/userData';

/**
 * The signed-in user's watchlist + portfolio symbols, used to float the
 * articles that touch their own assets to the top of the news feed.
 * Fails quietly: without a Firebase token the feed simply stays unpersonalised.
 */
export default function useMyAssets() {
  const [symbols, setSymbols] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [watchlist, portfolio] = await Promise.all([
          db.watchlist.list().catch(() => []),
          db.portfolio.list().catch(() => []),
        ]);
        const set = new Set(
          [...(watchlist || []), ...(portfolio || [])]
            .map((row) => String(row?.symbol || '').toUpperCase())
            .filter(Boolean),
        );
        if (alive) setSymbols([...set]);
      } catch (_) {
        // not signed in yet — no personalisation
      }
    })();
    return () => { alive = false; };
  }, []);

  return symbols;
}