import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice, formatPercent, validatePrice, validatePercent } from '@/lib/dataValidation';
import { useLastKnownValue } from '@/hooks/useLoadingState';
import { SkeletonPrice } from './SkeletonLoader';

/**
 * Safe Price Display with Loading States
 * Shows skeleton → last known value (if cached) → live price
 */
export function PriceDisplay({ 
  price, 
  change, 
  isLoading = false, 
  symbol = '', 
  decimals = 2,
  showUpdating = false 
}) {
  const { displayValue: displayPrice, isStale, isUpdating } = useLastKnownValue(
    validatePrice(price),
    `price_${symbol}`
  );
  
  const displayChange = validatePercent(change);

  if (isLoading && !displayPrice) {
    return <SkeletonPrice />;
  }

  const priceStr = formatPrice(displayPrice, decimals);
  const changeStr = changeStr ? formatPercent(displayChange, 1) : null;

  return (
    <div className="space-y-1.5">
      {/* Price with updating indicator */}
      <div className="flex items-baseline gap-2">
        <span className={`font-mono font-bold text-2xl transition-colors duration-300 ${
          isStale ? 'text-white/60' : 'text-white'
        }`}>
          ${priceStr}
        </span>
        {isStale && <span className="text-xs text-white/40">cached</span>}
        {isUpdating && <span className="text-xs text-primary animate-pulse">updating...</span>}
      </div>

      {/* Change % */}
      {changeStr && (
        <div className={`flex items-center gap-1 text-sm font-bold transition-colors duration-300 ${
          displayChange >= 0 ? 'text-chart-3' : 'text-destructive'
        }`}>
          {displayChange >= 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {changeStr}
        </div>
      )}
    </div>
  );
}

/**
 * Inline Price Ticker
 * For watchlists and tables
 */
export function PriceTicker({ 
  symbol, 
  price, 
  change, 
  isLoading = false,
  compact = false 
}) {
  const validPrice = validatePrice(price);
  const validChange = validatePercent(change);

  if (isLoading && !validPrice) {
    return <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />;
  }

  const priceStr = formatPrice(validPrice, compact ? 0 : 2);
  const changeStr = validChange !== null ? formatPercent(validChange, 1) : null;

  return (
    <div className="flex items-center gap-2 font-mono text-sm">
      <span className="font-bold text-white">${priceStr}</span>
      {changeStr && (
        <span className={validChange >= 0 ? 'text-chart-3' : 'text-destructive'}>
          {changeStr}
        </span>
      )}
    </div>
  );
}