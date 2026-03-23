import React from 'react';
import { cn } from '@/lib/utils';

export function SkeletonPulse({ className = 'h-4 w-24' }) {
  return (
    <div className={cn('bg-white/5 rounded animate-pulse', className)} />
  );
}

export function SkeletonPrice() {
  return (
    <div className="space-y-2">
      <SkeletonPulse className="h-8 w-32" />
      <SkeletonPulse className="h-4 w-20" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="w-full h-64 bg-white/3 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-white/20 text-sm">Loading chart...</div>
    </div>
  );
}

export function SkeletonSignal() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SkeletonPulse className="h-6 w-16 rounded-full" />
        <SkeletonPulse className="h-4 w-24" />
      </div>
      <SkeletonPulse className="h-4 w-full" />
      <SkeletonPulse className="h-4 w-3/4" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.03] p-4 space-y-4">
      <SkeletonPulse className="h-5 w-1/3" />
      <div className="space-y-2">
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-5/6" />
      </div>
    </div>
  );
}

export function LoadingMessage({ message = 'Loading...', timeout = false }) {
  return (
    <div className={cn(
      'flex items-center justify-center py-8 text-sm',
      timeout ? 'text-destructive' : 'text-muted-foreground'
    )}>
      {!timeout && (
        <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin mr-2" />
      )}
      {message}
    </div>
  );
}

export function DataUnavailable({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-3">
      <p className="text-sm text-white/50">Live data unavailable</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}