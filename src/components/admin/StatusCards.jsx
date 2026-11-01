import React from 'react';

const DOT = { green: 'bg-emerald-500', yellow: 'bg-amber-400', red: 'bg-rose-500' };
const TEXT = { green: 'text-emerald-400', yellow: 'text-amber-300', red: 'text-rose-400' };

function short(iso) {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff)) return '—';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function Card({ title, status, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: '#101218', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2 mb-3">
        {status && <span className={`h-2 w-2 rounded-full ${DOT[status] || DOT.yellow}`} />}
        <h3 className="text-[11px] font-black tracking-[1px] uppercase text-white/60">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, tone }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-[3px]">
      <span className="text-[11px] text-white/40">{label}</span>
      <span className={`text-[11px] font-semibold ${tone || 'text-white/80'}`}>{value}</span>
    </div>
  );
}

function Big({ label, value, tone = 'text-white/90' }) {
  return (
    <div className="flex-1 min-w-[86px]">
      <p className="text-[9px] uppercase tracking-wider text-white/30 mb-1">{label}</p>
      <p className={`text-lg font-black leading-none ${tone}`}>{value}</p>
    </div>
  );
}

export default function StatusCards({ digest }) {
  if (!digest) return null;

  const health = digest.health || [];
  const overall = health.some((h) => h.status === 'red')
    ? 'red'
    : health.some((h) => h.status === 'yellow') || (digest.crashes || []).length > 0
      ? 'yellow'
      : 'green';

  return (
    <div className="space-y-3">
      <Card title="System health" status={overall}>
        <div className="space-y-1">
          {health.length === 0 && <p className="text-[11px] text-white/30">No health check has run yet.</p>}
          {health.map((h) => (
            <div key={h.check} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${DOT[h.status] || DOT.yellow}`} />
                <span className="text-[11px] text-white/70 truncate">{h.label || h.check}</span>
              </div>
              <span className={`text-[10px] font-mono shrink-0 ${TEXT[h.status] || TEXT.yellow}`}>
                {h.ok ? 'ok' : 'FAILING'} · {h.latencyMs}ms · {short(h.at)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Data providers" status={(digest.providers || []).some((p) => p.status === 'red') ? 'red' : 'green'}>
        <div className="space-y-2">
          {digest.providers.map((p) => (
            <div key={p.name} className="border-b border-white/[0.05] last:border-0 pb-2 last:pb-0">
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${DOT[p.status] || DOT.yellow}`} />
                <span className="text-[12px] font-semibold text-white/85 capitalize">{p.name}</span>
                <span className="ml-auto text-[10px] text-white/35">{short(p.lastOkAt)}</span>
              </div>
              <div className="pl-3.5 mt-1 grid grid-cols-2 gap-x-4">
                <Row label="errors 24h" value={p.errors24h} tone={p.errors24h > 0 ? 'text-rose-400' : 'text-white/60'} />
                <Row label="429 / limits" value={p.rateLimits24h} tone={p.rateLimits24h > 0 ? 'text-amber-300' : 'text-white/60'} />
                <Row label="cache age" value={p.cacheAgeSec === null ? 'n/a' : `${p.cacheAgeSec}s`} />
                <Row label="last error" value={p.lastError ? short(p.lastErrorAt) : 'none'} tone={p.lastError ? 'text-rose-400' : 'text-emerald-400'} />
              </div>
              {p.lastError && <p className="pl-3.5 mt-1 text-[10px] text-white/35 truncate">{p.lastError}</p>}
            </div>
          ))}
        </div>
      </Card>

      <Card title="Backend functions (24h)">
        {digest.functions.length === 0 ? (
          <p className="text-[11px] text-white/30">No instrumented calls in the window.</p>
        ) : (
          <div className="space-y-1">
            {digest.functions.slice(0, 10).map((f) => (
              <div key={f.name} className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-white/70 truncate">{f.name}</span>
                <span className="text-[10px] font-mono text-white/45 shrink-0">
                  {f.calls} calls · {f.errorRate}% err
                </span>
              </div>
            ))}
            {digest.functions.some((f) => f.lastError) && (
              <p className="text-[10px] text-rose-400/80 pt-1 truncate">
                last: {digest.functions.find((f) => f.lastError)?.lastError}
              </p>
            )}
          </div>
        )}
      </Card>

      <Card title="TREK AI" status={digest.ai.errorsToday > 0 ? 'yellow' : 'green'}>
        <div className="flex flex-wrap gap-3 mb-2">
          <Big label="requests today" value={digest.ai.requestsToday} />
          <Big label="errors" value={digest.ai.errorsToday} tone={digest.ai.errorsToday > 0 ? 'text-rose-400' : 'text-white/90'} />
          <Big label="avg" value={digest.ai.avgMs ? `${digest.ai.avgMs}ms` : '—'} />
        </div>
        <Row label="est. cost today" value={`$${digest.ai.costToday}`} />
        <Row label="est. cost this month" value={`$${digest.ai.costMonth}`} />
        {digest.ai.models.map((m) => (
          <Row key={m.model} label={`· ${m.model}`} value={`${m.requests} req · $${m.costToday} today`} />
        ))}
      </Card>

      <Card title="Users">
        <div className="flex flex-wrap gap-3 mb-2">
          <Big label="total" value={digest.users.total} />
          <Big label="new today" value={digest.users.newToday} tone="text-emerald-400" />
          <Big label="new 7d" value={digest.users.new7d} />
        </div>
        <Row label="active today" value={digest.users.activeToday} />
        <Row label="onboarding complete" value={digest.users.onboardingRate === null ? '—' : `${digest.users.onboardingRate}%`} />
        <Row label="deletions 24h" value={`${digest.users.deletions24h} (total ${digest.users.deletionsTotal})`} />
      </Card>

      <Card title="Subscriptions (RevenueCat)">
        <div className="flex flex-wrap gap-3 mb-2">
          <Big label="PRO" value={digest.subscriptions.pro} />
          <Big label="ELITE" value={digest.subscriptions.elite} tone="text-amber-300" />
          <Big label="OG100" value={digest.subscriptions.og100} />
        </div>
        <Row label="OG100 spots left" value={digest.subscriptions.og100SpotsLeft} />
        <Row label="failed purchases 24h" value={digest.subscriptions.failedPurchases24h} tone={digest.subscriptions.failedPurchases24h > 0 ? 'text-amber-300' : undefined} />
        <Row label="trials" value="see RevenueCat" />
      </Card>

      <Card title="Auth failures (24h)" status={digest.auth.total > 0 ? 'yellow' : 'green'}>
        <Row label="Google" value={digest.auth.google} />
        <Row label="Apple" value={digest.auth.apple} />
        <Row label="Email" value={digest.auth.email} />
        <Row label="other" value={digest.auth.other} />
      </Card>
    </div>
  );
}