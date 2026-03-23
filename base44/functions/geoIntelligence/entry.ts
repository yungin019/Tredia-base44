import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const REGION_PRIORITIES = {
  'US': { assets: ['NVDA', 'MSFT', 'AAPL', 'SPY', 'QQQ'], sectors: ['Tech', 'Finance', 'Energy'], forex: ['EURUSD', 'GBPUSD', 'USDJPY'] },
  'EU': { assets: ['MC.PA', 'SAP.DE', 'ASML.AS', 'BABA'], sectors: ['Tech', 'Luxury', 'Banking'], forex: ['EURUSD', 'EURGBP', 'EURCHF'] },
  'SE': { assets: ['VOLV-B.ST', 'ERIC.ST', 'HEXAB.ST'], sectors: ['Auto', 'Tech', 'Finance'], forex: ['EURSEK', 'USDSEK'] },
  'GB': { assets: ['HSBC', 'LSE:BARC', 'UNILEVER'], sectors: ['Banking', 'Pharma', 'Consumer'], forex: ['GBPUSD', 'EURGBP'] },
  'JP': { assets: ['7203.T', '6758.T', '8306.T'], sectors: ['Auto', 'Tech', 'Banking'], forex: ['USDJPY', 'EURJPY'] },
  'CN': { assets: ['BABA', 'TCEHY', 'PDD'], sectors: ['Tech', 'E-Commerce', 'Consumer'], forex: ['USDCNY', 'EURCNY'] },
  'AE': { assets: ['IBX.AE', 'FAB.AE'], sectors: ['Energy', 'Banking', 'Real Estate'], forex: ['USDAED', 'EURAED'] },
  'AU': { assets: ['BHP', 'CBA.AX', 'ANZ.AX'], sectors: ['Mining', 'Banking', 'Finance'], forex: ['AUDUSD', 'EURAUD'] },
};

const EVENT_CATEGORIES = {
  'FED_DECISION': { regions: ['US', 'EU', 'GB', 'JP'], assetClasses: ['forex', 'stocks', 'crypto'], severity: 'HIGH' },
  'EARNINGS_MISS': { regions: ['all'], assetClasses: ['stocks'], severity: 'MEDIUM' },
  'GEOPOLITICAL': { regions: ['all'], assetClasses: ['forex', 'commodities', 'stocks'], severity: 'HIGH' },
  'OIL_SPIKE': { regions: ['EU', 'AE', 'SE'], assetClasses: ['commodities', 'stocks', 'forex'], severity: 'HIGH' },
  'CRYPTO_RALLY': { regions: ['all'], assetClasses: ['crypto', 'stocks'], severity: 'MEDIUM' },
  'RECESSION_SIGNAL': { regions: ['all'], assetClasses: ['all'], severity: 'CRITICAL' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { event, userRegion, userInterests } = body;

    if (!event || !userRegion) {
      return Response.json({ error: 'Missing event or userRegion' }, { status: 400 });
    }

    const eventConfig = EVENT_CATEGORIES[event.type] || { regions: ['all'], assetClasses: ['all'], severity: 'MEDIUM' };
    const regionConfig = REGION_PRIORITIES[userRegion] || REGION_PRIORITIES['US'];

    // Determine relevance
    const isRelevant = eventConfig.regions.includes('all') || eventConfig.regions.includes(userRegion);
    const interestMatch = userInterests?.some(interest =>
      eventConfig.assetClasses.includes(interest)
    ) ?? true;

    // Calculate priority (0-100)
    let priority = 50;
    if (isRelevant) priority += 25;
    if (interestMatch) priority += 15;
    if (eventConfig.severity === 'CRITICAL') priority += 10;
    if (eventConfig.severity === 'HIGH') priority += 5;

    // Get affected assets for this region
    const affectedAssets = event.affectedAssets?.filter(a => {
      const assetRegion = getAssetRegion(a);
      return assetRegion === userRegion || assetRegion === 'all';
    }) || [];

    return Response.json({
      priority: Math.min(100, priority),
      isRelevant,
      affectedAssets,
      regionConfig,
      shouldNotify: isRelevant && priority > 60,
      impactSummary: `This ${event.type} primarily affects ${userRegion} users with exposure to ${affectedAssets.slice(0, 3).join(', ')}`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getAssetRegion(symbol) {
  if (/\.(PA|DE|AS|SW|MI|MC|AT|OL|ST|CO|HE)$/.test(symbol)) return 'EU';
  if (/\.(T|HK|KL|SI|AX|NZ)$/.test(symbol)) return 'ASIA';
  if (/\.ST$/.test(symbol)) return 'SE';
  if (/\.AE$/.test(symbol)) return 'AE';
  if (/\.(L|LN)$/.test(symbol)) return 'GB';
  if (/^[0-9]{4}\.T$/.test(symbol)) return 'JP';
  if (/^[A-Z]{4}[HY]$/.test(symbol)) return 'CN';
  return 'US';
}