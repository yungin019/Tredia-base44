import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAIL = 'nevry95@hotmail.se';

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
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
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ background: '#080B12', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', fontSize: '14px' }}>
      Loading...
    </div>
  );

  return (
    <div style={{ background: '#080B12', minHeight: '100vh', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ color: '#F59E0B', fontSize: '22px', fontWeight: '900', letterSpacing: '4px', margin: 0 }}>TREDIO ADMIN</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: '4px 0 0' }}>{users.length} users total</p>
          </div>
          <button onClick={() => navigate('/Home')} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px' }}>
            ← Back
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', fontSize: '13px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(user => (
            <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '600', margin: 0 }}>{user.full_name || '—'}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: '2px 0 0', fontFamily: 'monospace' }}>{user.email}</p>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {['free', 'pro', 'elite'].map(tier => (
                  <button key={tier} onClick={() => updateTier(user.id, tier)}
                    style={{
                      padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', border: 'none',
                      background: user.subscription_tier === tier
                        ? (tier === 'elite' ? '#F59E0B' : tier === 'pro' ? '#3b82f6' : '#6b7280')
                        : 'rgba(255,255,255,0.07)',
                      color: user.subscription_tier === tier ? '#0A0A0F' : 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase', letterSpacing: '1px',
                    }}>
                    {tier}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}