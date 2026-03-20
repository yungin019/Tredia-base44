export const COMMODITIES = [
  {
    symbol: 'GC=F',
    name: 'Gold',
    icon: '🥇',
    unit: '/oz',
    price: 2345.60,
    change: 0.82,
    signal: 'BUY',
    trekAnalysis: 'Safe haven demand rising. Hedge against inflation. Central bank buying supports floor.'
  },
  {
    symbol: 'SI=F',
    name: 'Silver',
    icon: '🥈',
    unit: '/oz',
    price: 27.43,
    change: 1.15,
    signal: 'BUY',
    trekAnalysis: 'Industrial demand plus safe haven dual role. Undervalued vs gold ratio.'
  },
  {
    symbol: 'CL=F',
    name: 'Oil WTI',
    icon: '🛢️',
    unit: '/bbl',
    price: 78.92,
    change: -0.45,
    signal: 'HOLD',
    trekAnalysis: 'Supply constraints from OPEC+ supporting price floor. Seasonal demand uptick.'
  },
  {
    symbol: 'BZ=F',
    name: 'Oil Brent',
    icon: '🛢️',
    unit: '/bbl',
    price: 83.17,
    change: -0.31,
    signal: 'HOLD',
    trekAnalysis: 'Geopolitical risk premium embedded. Supply side discipline holding.'
  },
  {
    symbol: 'NG=F',
    name: 'Natural Gas',
    icon: '⚡',
    unit: '/MMBtu',
    price: 2.41,
    change: 2.34,
    signal: 'BUY',
    trekAnalysis: 'Storage levels below average. Winter demand catalyst approaching.'
  },
  {
    symbol: 'HG=F',
    name: 'Copper',
    icon: '🔶',
    unit: '/lb',
    price: 4.21,
    change: 0.67,
    signal: 'BUY',
    trekAnalysis: 'Green energy transition driving structural demand. China stimulus bullish.'
  },
  {
    symbol: 'ZW=F',
    name: 'Wheat',
    icon: '🌾',
    unit: '/bu',
    price: 548.25,
    change: -0.92,
    signal: 'HOLD',
    trekAnalysis: 'Supply disruptions from key exporters. Weather risk in crop regions.'
  },
  {
    symbol: 'ZC=F',
    name: 'Corn',
    icon: '🌽',
    unit: '/bu',
    price: 432.75,
    change: -1.23,
    signal: 'SELL',
    trekAnalysis: 'Ethanol demand stable. South American harvest pressure on prices.'
  }
];

export async function fetchCommodityPrices() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(COMMODITIES);
    }, 100);
  });
}
