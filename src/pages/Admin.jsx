import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, DollarSign, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const OWNER_EMAIL = 'nevry95@hotmail.se';
const TIER_PRICES = { free: 0, pro: 29, elite: 99 };

export default function Admin() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    ogClaimed: 0,
    totalRevenue: 0,
    tierCounts: { free: 0, pro: 0, elite: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user) {
        navigate('/SignIn');
        return;
      }
      if (user.email !== OWNER_EMAIL) {
        toast.error('Access Denied - Owner Only');
        navigate('/Home');
        return;
      }
      setCurrentUser(user);
      fetchUsers();
    }).catch(() => {
      navigate('/SignIn');
    });
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.User.list('-created_date', 200);
      setUsers(data || []);

      const totalUsers = data?.length || 0;
      const ogClaimed = data?.filter(u => u.og_number != null).length || 0;
      const tierCounts = {
        free: data?.filter(u => !u.subscription_tier || u.subscription_tier === 'free').length || 0,
        pro: data?.filter(u => u.subscription_tier === 'pro').length || 0,
        elite: data?.filter(u => u.subscription_tier === 'elite').length || 0,
      };
      const totalRevenue =
        (tierCounts.pro * TIER_PRICES.pro) +
        (tierCounts.elite * TIER_PRICES.elite);

      setStats({ totalUsers, ogClaimed, totalRevenue, tierCounts });
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const changeTier = async (userId, newTier) => {
    try {
      await base44.entities.User.update(userId, { subscription_tier: newTier });
      toast.success(`Tier updated to ${newTier.toUpperCase()}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update tier');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getTierDisplay = (user) => {
    return user.subscription_tier || 'free';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080B12' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="text-2xl font-black text-[#F59E0B]">TREDIO Admin</div>
          <div className="w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#080B12' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/Home')} className="p-2 rounded-lg text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Shield className="h-7 w-7 text-[#F59E0B]" />
          <div>
            <h1 className="text-2xl font-black text-white">TREDIO Admin</h1>
            <p className="text-xs text-white/40">Owner Dashboard · {currentUser?.email}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-white/[0.08] bg-[#111118] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-white/40" />
              <span className="text-xs text-white/40">Total Users</span>
            </div>
            <div className="text-3xl font-black text-white">{stats.totalUsers}</div>
          </div>

          <div className="rounded-xl border border-[#F59E0B]/20 bg-[#111118] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-[#F59E0B]" />
              <span className="text-xs text-white/40">OG100 Claimed</span>
            </div>
            <div className="text-3xl font-black text-[#F59E0B]">{stats.ogClaimed} <span className="text-lg text-white/30">/ 100</span></div>
          </div>

          <div className="rounded-xl border border-green-500/20 bg-[#111118] p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-xs text-white/40">Est. Revenue/mo</span>
            </div>
            <div className="text-3xl font-black text-green-400">${stats.totalRevenue}</div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#111118] p-4">
            <div className="text-xs text-white/40 mb-2">Tier Distribution</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-white/50">
                <span>FREE</span><span className="font-bold text-white">{stats.tierCounts.free}</span>
              </div>
              <div className="flex justify-between text-blue-400">
                <span>PRO</span><span className="font-bold">{stats.tierCounts.pro}</span>
              </div>
              <div className="flex justify-between text-[#F59E0B]">
                <span>ELITE</span><span className="font-bold">{stats.tierCounts.elite}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-white/[0.08] bg-[#111118] overflow-hidden">
          <div className="p-5 border-b border-white/[0.06]">
            <h2 className="text-base font-black text-white">User Management</h2>
            <p className="text-xs text-white/40 mt-0.5">Manage all registered users and their subscription tiers</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-white/30 uppercase tracking-wider">Email</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-white/30 uppercase tracking-wider">Joined</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-white/30 uppercase tracking-wider">Tier</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-white/30 uppercase tracking-wider">OG #</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-white/30 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const tier = getTierDisplay(u);
                  return (
                    <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-sm text-white/80 font-mono">{u.email}</td>
                      <td className="py-3 px-4 text-xs text-white/40">{formatDate(u.created_date)}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                          tier === 'elite' ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30' :
                          tier === 'pro' ? 'bg-blue-500/15 text-blue-400 border border-blue-400/30' :
                          'bg-white/[0.05] text-white/40 border border-white/[0.1]'
                        }`}>
                          {tier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.og_number ? (
                          <div className="flex items-center gap-1">
                            <Crown className="h-3 w-3 text-[#F59E0B]" />
                            <span className="text-sm font-bold text-[#F59E0B]">#{u.og_number}</span>
                          </div>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1.5">
                          {['free', 'pro', 'elite'].map(t => (
                            <button
                              key={t}
                              onClick={() => changeTier(u.id, t)}
                              disabled={tier === t}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                                tier === t
                                  ? t === 'elite' ? 'bg-[#F59E0B]/20 text-[#F59E0B] cursor-default' :
                                    t === 'pro' ? 'bg-blue-500/20 text-blue-400 cursor-default' :
                                    'bg-white/[0.08] text-white/50 cursor-default'
                                  : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60 border border-white/[0.06]'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-white/30 text-sm">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}