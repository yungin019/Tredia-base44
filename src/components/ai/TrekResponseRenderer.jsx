import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Shield, Clock, BarChart2 } from 'lucide-react';

function parseVerdict(text) {
  const verdictMatch = text.match(/VERDICT:\s*([^\n]+)/);
  if (!verdictMatch) return null;
  const line = verdictMatch[1].trim();
  if (line.startsWith('BUY')) return { action: 'BUY', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', rest: line.replace(/^BUY\s*[—-]?\s*/, '') };
  if (line.startsWith('SELL')) return { action: 'SELL', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', rest: line.replace(/^SELL\s*[—-]?\s*/, '') };
  return { action: 'WAIT', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', rest: line.replace(/^WAIT\s*[—-]?\s*/, '') };
}

function parseTradePlan(text) {
  const plan = {};
  const entryM = text.match(/Entry:\s*\$?([\d,.]+)/i);
  const targetM = text.match(/Target:\s*\$?([\d,.]+)/i);
  const stopM = text.match(/Stop\s*[Ll]oss:\s*\$?([\d,.]+)/i);
  const tfM = text.match(/Timeframe:\s*([^\n]+)/i);
  const riskM = text.match(/Risk(?:\s*Level)?:\s*(Low|Medium|High)/i);
  const confM = text.match(/Confidence:\s*(\d+)%/i);
  if (entryM) plan.entry = entryM[1];
  if (targetM) plan.target = targetM[1];
  if (stopM) plan.stop = stopM[1];
  if (tfM) plan.timeframe = tfM[1].trim();
  if (riskM) plan.risk = riskM[1];
  if (confM) plan.confidence = confM[1];
  return plan;
}

function parseWhyPoints(text) {
  const whyM = text.match(/WHY:([\s\S]*?)(?:TRADE PLAN:|━━|$)/i);
  if (!whyM) return [];
  return whyM[1]
    .split('\n')
    .map(l => l.replace(/^[▸•\-\*]\s*/, '').trim())
    .filter(l => l.length > 10);
}

function parseClosingLine(text) {
  const lines = text.split('\n').filter(l => l.trim() && !l.includes('━━'));
  const last = lines[lines.length - 1]?.replace(/^[⚡•▸\-]\s*/, '').trim();
  if (last && !last.toLowerCase().includes('trek') && last.length > 20) return last;
  return null;
}

const RISK_COLOR = { Low: '#22c55e', Medium: '#F59E0B', High: '#ef4444' };
const VERDICT_ICON = { BUY: TrendingUp, SELL: TrendingDown, WAIT: Minus };

export default function TrekResponseRenderer({ content }) {
  // Try to parse as structured TREK response
  const verdict = parseVerdict(content);
  if (!verdict) {
    // Plain text fallback
    return (
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{content}</p>
    );
  }

  const plan = parseTradePlan(content);
  const why = parseWhyPoints(content);
  const closing = parseClosingLine(content);
  const VIcon = VERDICT_ICON[verdict.action] || Minus;
  const hasPlan = plan.entry || plan.target || plan.stop;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* VERDICT */}
      <div
        style={{
          background: verdict.bg,
          border: `1px solid ${verdict.border}`,
          borderRadius: 12,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <div
          style={{
            background: `${verdict.color}25`,
            border: `1px solid ${verdict.color}40`,
            borderRadius: 8,
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            flexShrink: 0,
          }}
        >
          <VIcon style={{ width: 12, height: 12, color: verdict.color }} />
          <span style={{ fontSize: 12, fontWeight: 900, color: verdict.color, letterSpacing: '0.08em' }}>{verdict.action}</span>
        </div>
        {verdict.rest && (
          <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{verdict.rest}</p>
        )}
      </div>

      {/* WHY */}
      {why.length > 0 && (
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Why</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {why.map((point, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                <span style={{ color: '#F59E0B', fontWeight: 900, fontSize: 13, marginTop: -1, flexShrink: 0 }}>▸</span>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{point}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRADE PLAN */}
      {hasPlan && (
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '10px 14px',
          }}
        >
          <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Trade Plan</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
            {plan.entry && (
              <div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Entry</div>
                <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 800, color: 'rgba(255,255,255,0.75)' }}>${plan.entry}</div>
              </div>
            )}
            {plan.target && (
              <div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Target style={{ width: 8, height: 8 }} /> Target
                </div>
                <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 800, color: '#22c55e' }}>${plan.target}</div>
              </div>
            )}
            {plan.stop && (
              <div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Shield style={{ width: 8, height: 8 }} /> Stop
                </div>
                <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 800, color: '#ef4444' }}>${plan.stop}</div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {plan.timeframe && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock style={{ width: 9, height: 9, color: 'rgba(255,255,255,0.25)' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{plan.timeframe}</span>
              </div>
            )}
            {plan.risk && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Shield style={{ width: 9, height: 9, color: RISK_COLOR[plan.risk] || '#F59E0B' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: RISK_COLOR[plan.risk] || '#F59E0B' }}>{plan.risk} Risk</span>
              </div>
            )}
            {plan.confidence && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <BarChart2 style={{ width: 9, height: 9, color: '#F59E0B' }} />
                <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 800, color: '#F59E0B' }}>{plan.confidence}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Closing line */}
      {closing && (
        <p style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, borderLeft: '2px solid rgba(245,158,11,0.3)', paddingLeft: 10 }}>
          {closing}
        </p>
      )}
    </div>
  );
}