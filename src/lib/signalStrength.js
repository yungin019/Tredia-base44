/**
 * Signal Strength System
 * 
 * Determines STRONG / MODERATE / WEAK based on:
 * - confidence score
 * - data alignment  
 * - volatility context
 * 
 * Returns visual tokens + metadata
 */

export function calculateSignalStrength(signal) {
  const confidence = signal.importance || 50;

  // STRONG: 80–100
  if (confidence >= 80) {
    return {
      level: 'STRONG',
      confidence,
      glow: 'rgba(14,200,220,0.25)', // strong glow
      glowSize: '40px',
      opacity: 1,
      borderWidth: '2px',
      pulse: true, // slight animation
      scale: 1.01,
    };
  }

  // MODERATE: 60–79
  if (confidence >= 60) {
    return {
      level: 'MODERATE',
      confidence,
      glow: 'rgba(14,200,220,0.12)', // normal glow
      glowSize: '24px',
      opacity: 0.85,
      borderWidth: '1px',
      pulse: false,
      scale: 1,
    };
  }

  // WEAK: <60
  return {
    level: 'WEAK',
    confidence,
    glow: 'rgba(14,200,220,0.06)', // minimal glow
    glowSize: '16px',
    opacity: 0.6,
    borderWidth: '1px',
    pulse: false,
    scale: 1,
  };
}

export function getSignalColor(direction) {
  const dir = (direction || 'neutral').toLowerCase();
  if (dir === 'bullish') return '#0ec8dc';
  if (dir === 'bearish') return '#ef4444';
  if (dir === 'neutral') return '#F59E0B';
  return '#6b7280'; // wait
}

/**
 * Cognitive validation: does this card pass instant understanding?
 */
export function validateSignalCognition(signal) {
  const tests = {
    directionClear: !!(signal.direction && signal.marketState),
    actionClear: !!(signal.actionBias || signal.action),
    strengthPerceivable: signal.importance >= 40,
  };

  const pass = Object.values(tests).every(v => v === true);

  return {
    pass,
    tests,
    recommendation: !pass ? 'Simplify text, increase contrast' : null,
  };
}