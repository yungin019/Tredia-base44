import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAIL = 'nevry95@hotmail.se';

function StatCard({ label, value, color = '#F59E0B' }) {
  return (
    <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px 20px' }}>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>{label}</p>
      <p style={{ color, fontSize: '24px', fontWeight: '900', margin: 0 }}>{value}</p>
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.email !== ADMIN_EMAIL) {
        navigate('/Home', { replace: true });
        return;
      }
      loadUsers();
    }).catch(() => navigate('/SignIn', { replace: true }));
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.User.list();
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTier = async (userId, tier) => {
    try {
      await base44.entities.User.update(userId, { subscription_tier: tier });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription_tier: tier } : u));
    } catch (err) {
      console.error('Failed to update tier:', err);
    }
  };

  const filtered = users.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const connected = users.filter(u => u.broker_status === 'connected' || u.alpaca_connected).length;
  const liveMode = users.filter(u => u.trading_mode === 'live').length;
  const practiceMode = users.filter(u => u.trading_mode !== 'live').length;
  const ogClaimed = users.filter(u => u.og_number).length;
  const eliteCount = users.filter(u => u.subscription_tier === 'elite').length;

  const TIER_COLORS = { elite: '#F59E0B', pro: '#3b82f6', free: '#6b7280' };
  const BROKER_COLORS = { connected: '#22c55e', pending: '#F59E0B', error: '#ef4444', not_connected: '#6b7280' };
  const PATH_LABELS = { existing: 'Existing', new: 'New', practice: 'Practice', undefined: '—' };

  if (loading) return (
    <div style={{ background: '#080B12', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', fontSize: '14px' }}>
      Loading...
    </div>
  );

  return (
    <div style={{ background: '#080B12', minHeight: '100vh', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ color: '#F59E0B', fontSize: '20px', fontWeight: '900', letterSpacing: '4px', margin: 0 }}>TREDIO ADMIN</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '4px 0 0' }}>{users.length} total users</p>
          </div>
          <button onClick={() => navigate('/Home')}
            style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px' }}>
            ← Back
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '24px' }}>
          <StatCard label="Total Users" value={users.length} />
          <StatCard label="Broker Connected" value={connected} color="#22c55e" />
          <StatCard label="Live Mode" value={liveMode} color="#22c55e" />
          <StatCard label="Practice Mode" value={practiceMode} color="#6b7280" />
          <StatCard label="OG100 Claimed" value={ogClaimed} color="#F59E0B" />
          <StatCard label="Elite Tier" value={eliteCount} color="#F59E0B" />
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', fontSize: '13px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' }}
        />

        {/* User List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtered.map(user => {
            const tier = user.subscription_tier || 'free';
            const brokerStatus = user.broker_status || (user.alpaca_connected ? 'connected' : 'not_connected');
            const pathChoice = user.broker_path_choice;
            return (
              <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>

                {/* Identity */}
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '600', margin: 0 }}>{user.full_name || '—'}</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: '2px 0 0', fontFamily: 'monospace' }}>{user.email}</p>
                </div>

                {/* Onboarding Path */}
                <div style={{ minWidth: '80px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 3px' }}>Path</p>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: pathChoice ? '#F59E0B' : 'rgba(255,255,255,0.2)' }}>
                    {PATH_LABELS[pathChoice] || '—'}
                  </span>
                </div>

                {/* Broker Status */}
                <div style={{ minWidth: '90px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 3px' }}>Broker</p>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: BROKER_COLORS[brokerStatus] || '#6b7280', textTransform: 'capitalize' }}>
                    {brokerStatus.replace('_', ' ')}
                  </span>
                </div>

                {/* Trading Mode */}
                <div style={{ minWidth: '70px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 3px' }}>Mode</p>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: user.trading_mode === 'live' ? '#22c55e' : '#6b7280', textTransform: 'capitalize' }}>
                    {user.trading_mode || 'practice'}
                  </span>
                </div>

                {/* OG Number */}
                {user.og_number && (
                  <div style={{ minWidth: '50px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 3px' }}>OG</p>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#F59E0B' }}>#{user.og_number}</span>
                  </div>
                )}

                {/* Tier Buttons */}
                <div style={{ display: 'flex', gap: '5px' }}>
                  {['free', 'pro', 'elite'].map(t => (
                    <button key={t} onClick={() => updateTier(user.id, t)}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', border: 'none',
                        background: tier === t ? TIER_COLORS[t] : 'rgba(255,255,255,0.07)',
                        color: tier === t ? '#0A0A0F' : 'rgba(255,255,255,0.35)',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '40px', fontSize: '13px' }}>No users found.</p>
        )}
      </div>
    </div>
  );
}