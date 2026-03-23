import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Determine user's region from timezone or stored preference
 * Returns region code and relevant market focus
 */
export function useRegionalContext() {
  const [region, setRegion] = useState(null);

  useEffect(() => {
    async function detectRegion() {
      try {
        const user = await base44.auth.me();
        
        // Check if user has stored region preference
        if (user && user.region) {
          setRegion(user.region);
          return;
        }

        // Fallback: detect from browser timezone
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        
        let detectedRegion = 'US'; // Default to US
        
        if (tz.includes('Europe')) detectedRegion = 'EU';
        else if (tz.includes('London')) detectedRegion = 'UK';
        else if (tz.includes('Asia') || tz.includes('Tokyo') || tz.includes('Hong_Kong') || tz.includes('Singapore')) detectedRegion = 'APAC';
        else if (tz.includes('Sydney') || tz.includes('Melbourne')) detectedRegion = 'APAC';
        else if (tz.includes('America/New_York') || tz.includes('America/Chicago') || tz.includes('America/Los_Angeles')) detectedRegion = 'US';
        
        setRegion(detectedRegion);
      } catch {
        setRegion('US'); // Safe default
      }
    }

    detectRegion();
  }, []);

  const regionConfig = {
    US: {
      label: 'US Markets',
      markets: ['SPY', 'QQQ', 'DIA'],
      indices: ['S&P 500', 'Nasdaq', 'Dow'],
      keyEvents: ['Fed', 'FOMC', 'Employment', 'CPI'],
      timezone: 'EST'
    },
    EU: {
      label: 'European Markets',
      markets: ['STOXX50E', 'DAX', 'CAC40'],
      indices: ['Euro Stoxx 50', 'DAX', 'CAC 40'],
      keyEvents: ['ECB', 'Eurostat', 'PMI', 'Unemployment'],
      timezone: 'CET'
    },
    UK: {
      label: 'UK Markets',
      markets: ['FTSE', 'LSE'],
      indices: ['FTSE 100', 'FTSE 250'],
      keyEvents: ['BoE', 'ONS', 'Inflation', 'Growth'],
      timezone: 'GMT'
    },
    APAC: {
      label: 'Asia-Pacific Markets',
      markets: ['Nikkei', 'Hang Seng', 'ASX'],
      indices: ['Nikkei 225', 'Hang Seng', 'ASX 200'],
      keyEvents: ['BoJ', 'PBOC', 'RBA', 'Trade'],
      timezone: 'JST'
    }
  };

  return {
    region: region || 'US',
    config: regionConfig[region] || regionConfig.US
  };
}

/**
 * Determine if an event is relevant to user's region
 */
export function isEventRelevant(event, userRegion) {
  if (!event.affectedRegions) return true; // No region filter = relevant everywhere
  return event.affectedRegions.includes(userRegion);
}

/**
 * Rank market reactions by relevance to user's region
 */
export function rankByRegionalRelevance(reactions, userRegion) {
  return reactions.sort((a, b) => {
    const aScore = a.affectedRegions.includes(userRegion) ? 10 : 0;
    const bScore = b.affectedRegions.includes(userRegion) ? 10 : 0;
    
    // Then by importance/confidence
    return (bScore + b.importance) - (aScore + a.importance);
  });
}