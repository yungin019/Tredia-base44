import React, { useCallback, useEffect, useState } from 'react';
import { invokeFunction } from '@/api/functionsClient';

const BAND_ORDER = ['75+', '50-74', 'under 50'];
const HORIZON_LABELS = { '1d': '1 day', '1w': '1 week', '1m': '1 month' };

function AccuracyRow({ label, checks, accuracy }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-white/[0.05] last:border-0">
      <span className="text-[11px] text-white/60 truncate">{label}</span>
      <span className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-white/25 font-mono">{checks}</span>
        <span className="text-[11px] font-bold font-mono" style={{ color: accuracy >= 50 ? '#22c55e' : '#ef4444' }}>
          {accuracy}%
        </span>
      </span>
    </div>
  );
}

function Group({ title, rows, sort }) {
  const ordered = sort ? sort(rows) : rows;
  if (!ordered?.length) return null;
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[1.5px] text-white/25 mb-1">{title}</p>
      {ordered.map((row) => (
        <AccuracyRow
          key={row.key}
          label={HORIZON_LABELS[row.key] || row.key}
          checks={row.checks}
          accuracy={row.accuracy}
        />
      ))}
    </div>
  );
}

/**
 * Track record — admin only. Accuracy of every logged signal, graded after
 * 1 day, 1 week and 1 month by the scheduled check. Read-only: nothing here can
 * edit or delete a logged signal.
 */
export default function TrackRecordCard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await invokeFunction('signalTracker', { action: 'stats' });
      setData(result);
      setError('');
    } catch (err) {
      setError(err.status === 403 ? 'Admin only.' : (err.message || 'Could not load the track record.'));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const bandOrder = (rows) => BAND_ORDER
    .map((band) => rows.find((row) => row.key === band))
    .filter(Boolean);

  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-[12px] font-bold text-white/85">Signal track record</h3>
          <p className="text-[10px] text-white/30">
            Graded after 1 day, 1 week and 1 month · logged signals are never edited
          </p>
        </div>
        <button onClick={load} className="text-[10px] font-bold px-2 py-1 rounded tap-feedback"
          style={{ background: 'rgba(245,158,11,0.13)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>
          Refresh
        </button>
      </div>

      {error && <p className="text-[11px] text-rose-400">{error}</p>}
      {!data && !error && <p className="text-[11px] text-white/30">Loading…</p>}

      {data && (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Signals logged', value: data.totalSignals },
              { label: 'Checks graded', value: data.gradedChecks },
              { label: 'Accuracy', value: data.overallAccuracy == null ? '—' : `${data.overallAccuracy}%` },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg px-2 py-1.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-[9px] text-white/30 uppercase tracking-wide">{stat.label}</p>
                <p className="text-sm font-black text-white/85 font-mono">{stat.value}</p>
              </div>
            ))}
          </div>

          {data.gradedChecks === 0 ? (
            <p className="text-[11px] text-white/30">
              Signals are being logged. The first checks appear once a signal is 24 hours old.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Group title="By confidence" rows={data.byBand} sort={bandOrder} />
              <Group title="By horizon" rows={data.byHorizon} />
              <Group title="By generator" rows={data.bySource} />
              <Group title="By direction" rows={data.byDirection} />
              <Group title="By symbol" rows={(data.bySymbol || []).slice(0, 8)} />
            </div>
          )}

          {data.recent?.length > 0 && (
            <div className="mt-3">
              <p className="text-[9px] uppercase tracking-[1.5px] text-white/25 mb-1">Latest checks</p>
              <div className="space-y-1">
                {data.recent.map((row, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-white/55">
                      {row.symbol} · {row.direction} · {row.confidence}% · {HORIZON_LABELS[row.horizon] || row.horizon}
                    </span>
                    <span className="flex items-center gap-2">
                      <span style={{ color: row.changePct >= 0 ? '#22c55e' : '#ef4444' }}>
                        {row.changePct >= 0 ? '+' : ''}{row.changePct}%
                      </span>
                      <span style={{ color: row.correct ? '#22c55e' : '#ef4444' }}>{row.correct ? '✓' : '✗'}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}