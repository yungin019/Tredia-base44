import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { adminApi } from '@/api/userData';

function StatCard({ label, value, color = '#F59E0B' }) {
  return (
    <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px' }}>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>{label}</p>
      <p style={{ color, fontSize: '22px', fontWeight: '900', margin: 0 }}>{value}</p>
    </div>
  );
}

/** The original user management screen, kept intact and moved into a tab. */
export default function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState(null);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await adminApi.users();
      setUsers(list || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePushToGitHub = async () => {
    setPushing(true);
    setPushResult(null);
    try {
      const filesToPush = [
        'src/App.jsx', 'src/index.css', 'src/pages/Home.jsx', 'src/pages/Markets.jsx',
        'src/pages/SignIn.jsx', 'src/pages/Admin.jsx', 'src/pages/Settings.jsx',
        'src/components/layout/AppShell.jsx', 'src/lib/FirebaseAuthContext.jsx',
      ];
      const files = {};
      await Promise.all(filesToPush.map(async (path) => {
        const res = await fetch(path.replace('src/', '/src/')).catch(() => null);
        if (res && res.ok) files[path] = await res.text();
      }));
      const res = await base44.functions.invoke('pushToGitHub', {
        files,
        message: `TREDIO — ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`,
      });
      if (res?.data?.success) {
        setPushResult({ success: true, commit: res.data.commit, url: res.data.url, count: res.data.files?.length });
      } else {
        setPushResult({ success: false, error: res?.data?.error || 'Unknown error' });
      }
    } catch (err) {
      setPushResult({ success: false, error: err.message });
    } finally {
      setPushing(false);
    }
  };

  const updateTier = async (userId, tier) => {
    try {
      await adminApi.setTier(userId, tier);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, subscription_tier: tier } : u)));
    } catch (err) {
      console.error('Failed to update tier:', err);
    }
  };

  const filtered = users.filter((u) =>
    !search
    || u.email?.toLowerCase().includes(search.toLowerCase())
    || u.full_name?.toLowerCase().includes(search.toLowerCase()));

  const connected = users.filter((u) => u.broker_status === 'connected' || u.alpaca_connected).length;
  const ogClaimed = users.filter((u) => u.og_number).length;
  const eliteCount = users.filter((u) => u.subscription_tier === 'elite').length;
  const TIER_COLORS = { elite: '#F59E0B', pro: '#3b82f6', free: '#6b7280' };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={handlePushToGitHub} disabled={pushing}
          style={{ padding: '7px 14px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B', fontSize: '12px', fontWeight: '700' }}>
          {pushing ? '⏳ Pushing…' : '⬆ Push to GitHub'}
        </button>
      </div>

      {pushResult && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: pushResult.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${pushResult.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, fontSize: '12px', color: pushResult.success ? '#22c55e' : '#ef4444' }}>
          {pushResult.success ? `✅ Pushed ${pushResult.count} files — ${pushResult.commit?.slice(0, 7)} — ` : `❌ ${pushResult.error}`}
          {pushResult.success && <a href={pushResult.url} target="_blank" rel="noreferrer" style={{ color: '#22c55e' }}>View commit ↗</a>}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
        <StatCard label="Total Users" value={users.length} />
        <StatCard label="Broker Connected" value={connected} color="#22c55e" />
        <StatCard label="OG100 Claimed" value={ogClaimed} />
        <StatCard label="Elite Tier" value={eliteCount} />
      </div>

      <input
        type="text"
        placeholder="Search by email or name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
      />

      {loading && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Loading users…</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {filtered.map((user) => {
          const tier = user.subscription_tier || 'free';
          return (
            <div key={user.id} style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: '600', margin: 0 }}>{user.full_name || '—'}</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: '2px 0 0', fontFamily: 'monospace' }}>{user.email}</p>
              </div>
              {user.og_number && <span style={{ fontSize: '10px', fontWeight: '700', color: '#F59E0B' }}>OG #{user.og_number}</span>}
              <div style={{ display: 'flex', gap: '5px' }}>
                {['free', 'pro', 'elite'].map((t) => (
                  <button key={t} onClick={() => updateTier(user.id, t)}
                    style={{
                      padding: '4px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: '700', cursor: 'pointer', border: 'none',
                      background: tier === t ? TIER_COLORS[t] : 'rgba(255,255,255,0.07)',
                      color: tier === t ? '#0A0A0F' : 'rgba(255,255,255,0.35)',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <p style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '30px', fontSize: '12px' }}>No users found.</p>
      )}
    </div>
  );
}