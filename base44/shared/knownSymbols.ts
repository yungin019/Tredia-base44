// Symbols that may be shown as a ticker tag. Mirrors the app's asset list
// (src/lib/assetUniverse.js + assetDatabase.js) plus the index/ETF proxies the
// signal engine quotes. Anything else — $FBI, $UN, $NAACP — is not a tradable
// symbol and must never be tagged.

const SYMBOLS: string[] = [
  // Core / mega cap stocks
  'AAPL', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'GOOG', 'META', 'NFLX', 'MSFT', 'MAGN',
  'CRM', 'ADBE', 'INTC', 'AMD', 'QCOM', 'JPM', 'BAC', 'GS', 'MS', 'BLK', 'WFC',
  'JNJ', 'PFE', 'ABBV', 'MRK', 'LLY', 'UNH', 'CVS', 'VRTX', 'AMGN', 'AZN', 'GILD',
  'WMT', 'KO', 'PEP', 'MCD', 'SBUX', 'NKE', 'LULULEMON', 'HD', 'LOW', 'TJX', 'ULTA',
  'COST', 'TGT', 'MO', 'PM', 'MDLZ', 'GIS', 'SJM', 'K', 'BUD', 'DEO',
  'SNOW', 'COIN', 'UPST', 'RBLX', 'TSM', 'ARM', 'SMCI', 'DDOG', 'SHOP', 'PYPL', 'SQ',
  'SNAP', 'PINS', 'ROKU', 'SPOT', 'DBX', 'DOCN', 'MSTR', 'MARA', 'RIOT', 'HUT',
  'ORCL', 'AVGO', 'MU', 'ASML', 'SNX', 'VRSN', 'TMUS', 'VZ',
  'XOM', 'CVX', 'PSX', 'MPC', 'KMI', 'OKE', 'OXY',
  'BA', 'CAT', 'GE', 'MMM', 'ITW', 'GWW', 'RSG', 'WM', 'UPS', 'FDX', 'XPO',
  'DAL', 'UAL', 'LUV', 'ALK', 'AIRB', 'ACHR', 'DASH', 'LYFT', 'UBER', 'PENN',
  'NEE', 'DUK', 'SO', 'EXC', 'AEP', 'SRE', 'PCG',
  'AMT', 'CCI', 'EQIX', 'PLD', 'DLR', 'AVB', 'EQR', 'VICI', 'WELL', 'SLG', 'STAG', 'REXR',
  'CSGP', 'MAR', 'C', 'DNOW', 'MSGS', 'SNDL', 'TLRY', 'ACB', 'CGC',
  'LAD', 'AZO', 'FCX', 'LIN', 'ALB',

  // Index / sector / treasury ETFs used by the signal engine
  'SPY', 'QQQ', 'DIA', 'IWM', 'VOO', 'VTI', 'SCHB', 'TLT', 'IEF', 'SHY', 'HYG', 'LQD',
  'GLD', 'SLV', 'USO', 'UNG', 'VIXY', 'VIX',
  'XLK', 'XLF', 'XLE', 'XLV', 'XLY', 'XLI', 'XLP', 'XLU', 'XLRE', 'XLB', 'XLH',
  'ARKK', 'ARKF', 'ARKW', 'EEM', 'EFA', 'FXI',

  // Crypto in the app's asset list
  'BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK', 'MATIC', 'SHIB',
  'UNI', 'AAVE', 'ATOM', 'ALGO', 'FIL', 'NEAR', 'GRT', 'CRV', 'MKR', 'FTM', 'ARB', 'PEPE', 'FLOW',

  // FX pairs quoted in the app
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
];

import { ASSET_INDEX } from './assetSymbols.ts';

// The universe (601 symbols, generated from src/lib/assetUniverse.js) plus the
// handful of quote proxies the signal engine uses that are not tradable assets.
const KNOWN = new Set<string>([
  ...Object.keys(ASSET_INDEX),
  ...SYMBOLS.map((s) => s.toUpperCase()),
  'VIXY', 'CPER', 'PPLT', 'LIT', 'URA', 'WEAT', 'CORN', 'DBA',
  'USDSEK', 'EURSEK', 'USDCNH', 'USDMXN', 'USDBRL', 'USDZAR', 'USDTRY', 'USDINR',
]);

export function isKnownSymbol(symbol: unknown): boolean {
  return KNOWN.has(String(symbol || '').trim().toUpperCase());
}

/**
 * The app's crypto universe, so backend code can tell a coin from an equity
 * without loading the frontend asset list. Mirrors the CRYPTO block of
 * src/lib/assetUniverse.js.
 */
export const CRYPTO_SYMBOLS = new Set<string>([
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'TRX', 'AVAX', 'LINK', 'TON', 'SHIB',
  'DOT', 'BCH', 'NEAR', 'LTC', 'UNI', 'ICP', 'APT', 'ATOM', 'XLM', 'ARB', 'FIL', 'VET',
  'MKR', 'OP', 'STX', 'IMX', 'INJ', 'GRT', 'THETA', 'LDO', 'RUNE', 'ALGO', 'EGLD', 'AAVE',
  'SAND', 'MANA', 'AXS', 'FLOW', 'XTZ', 'EOS', 'GALA', 'NEO', 'QNT', 'CHZ', 'KAVA', 'ZEC',
  'DASH', 'COMP', 'SNX', 'CRV', 'ENJ', 'BAT', '1INCH', 'YFI', 'SUSHI', 'UMA', 'ZRX', 'BAL',
  'KNC', 'ANKR', 'CELO', 'ICX', 'ZIL', 'KSM', 'AR', 'ROSE', 'JASMY', 'MASK', 'DYDX', 'GMX',
  'PENDLE', 'BLUR', 'SEI', 'SUI', 'TIA', 'JUP', 'PYTH', 'WIF', 'BONK', 'FLOKI', 'PEPE',
  'ORDI', 'ASTR', 'GLMR', 'CFG', 'PHA', 'CTSI', 'LRC', 'SKL', 'STORJ', 'SC', 'DGB', 'RVN',
  'IOTA', 'HBAR', 'XDC', 'CSPR', 'ONE', 'QTUM', 'ONT', 'WAVES', 'OCEAN', 'REN', 'TLM',
  'DENT', 'HOT', 'BTT', 'WIN', 'CKB', 'KAS', 'RNDR', 'TAO', 'FET', 'AGIX', 'AKT', 'NTRN',
  'OSMO', 'AXL', 'WOO', 'MAGIC', 'ID', 'ARKM', 'WLD', 'EDU', 'ETHFI', 'ENA', 'ONDO', 'JTO',
  'STRK', 'DYM', 'ALT', 'MANTA', 'ZK', 'ZRO', 'TNSR', 'REZ', 'BLAST', 'IO', 'ZETA', 'MEW',
  'NOT', 'DOGS', 'HMSTR', 'NEIRO', 'GOAT', 'PNUT', 'BOME', 'MYRO', 'POPCAT', 'MOG', 'TURBO',
  'LADYS', 'MATIC', 'SUSDE',
]);

export const KNOWN_SYMBOLS = KNOWN;