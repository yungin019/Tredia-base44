// Transform generic catalyst language into concrete, visual terms
// Maps forbidden words → specific observations

const GENERIC_REPLACEMENTS = {
  // Market state transformations
  'neutral': 'market waiting for direction',
  'rebounding': 'stocks bouncing after selling',
  'uncertain': 'market sideways with no clear direction',
  'recovering': 'buyers stepping back in',
  'positive': 'prices moving higher',
  'negative': 'sellers in control',
  'mixed': 'conflicting signals',

  // Driver transformations
  'earnings performance': 'companies beating estimates',
  'recent selloff recovery': 'buyers returning after heavy selling',
  'positive sentiment': 'more buyers than sellers',
  'negative sentiment': 'more sellers than buyers',
  'technological advancement': 'AI spending increasing',
  'economic growth': 'jobs rising, spending holding up',
  'market volatility': 'prices swinging wider than normal',
  'buybacks and reliable income': 'companies buying back stock and paying dividends',
  'reliable income': 'steady dividend payouts',
  'investor sentiment': 'what traders are actually buying/selling',

  // Impact transformations
  'positive': 'stocks likely to rise',
  'negative': 'stocks likely to fall',
  'mixed': 'some stocks up, others down',
  'uncertain': 'unclear what happens next',
  'performance': 'price moves',
};

export function transformCatalystLanguage(catalyst) {
  const transformed = { ...catalyst };

  // Transform market_state
  if (transformed.market_state) {
    let state = transformed.market_state.toLowerCase();
    
    // Direct replacements
    Object.entries(GENERIC_REPLACEMENTS).forEach(([generic, concrete]) => {
      state = state.replace(new RegExp(`\\b${generic}\\b`, 'gi'), concrete);
    });

    // Ensure it starts with capital and reads naturally
    transformed.market_state = state.charAt(0).toUpperCase() + state.slice(1);
  }

  // Transform driver
  if (transformed.driver) {
    let driver = transformed.driver.toLowerCase();
    Object.entries(GENERIC_REPLACEMENTS).forEach(([generic, concrete]) => {
      driver = driver.replace(new RegExp(`\\b${generic}\\b`, 'gi'), concrete);
    });
    transformed.driver = driver.charAt(0).toUpperCase() + driver.slice(1);
  }

  // Transform impact
  if (transformed.impact) {
    let impact = transformed.impact.toLowerCase();
    Object.entries(GENERIC_REPLACEMENTS).forEach(([generic, concrete]) => {
      impact = impact.replace(new RegExp(`\\b${generic}\\b`, 'gi'), concrete);
    });
    transformed.impact = impact.charAt(0).toUpperCase() + impact.slice(1);
  }

  return transformed;
}