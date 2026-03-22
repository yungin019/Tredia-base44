import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, DollarSign, Shield } from 'lucide-react';
import { toast } from 'sonner';

const OWNER_EMAIL = 'nevry95@hotmail.se';
const TIER_PRICES = { FREE: 0, PRO: 29, ELITE: 99 };

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    ogClaimed: 0,
    totalRevenue: 0,
    tierCounts: { FREE: 0, PRO: 0, ELITE: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/SignIn');
      return;
    }

    if (user.email !== OWNER_EMAIL) {
      toast.error('Access Denied - Owner Only');
      navigate('/Home');
      return;
    }

    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await User.list();

      setUsers(data || []);

      // Calculate stats
      const totalUsers = data?.length || 0;
      const ogClaimed = data?.filter(u => u.ogNumber !== null).length || 0;
      const tierCounts = {
        FREE: data?.filter(u => u.subscriptionTier === 'FREE').length || 0,
        PRO: data?.filter(u => u.subscriptionTier === 'PRO').length || 0,
        ELITE: data?.filter(u => u.subscriptionTier === 'ELITE').length || 0
      };
      const totalRevenue =
        (tierCounts.PRO * TIER_PRICES.PRO) +
        (tierCounts.ELITE * TIER_PRICES.ELITE);

      setStats({ totalUsers, ogClaimed, totalRevenue, tierCounts });
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const changeTier = async (userId, newTier) => {
    try {
      await User.update(userId, {
        subscriptionTier: newTier
      });

      toast.success(`Tier updated to ${newTier}`);
      fetchUsers();
    } catch (err) {
      console.error('Error updating tier:', err);
      toast.error('Failed to update tier');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="text-white/60">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-[#F59E0B]" />
          <div>
            <h1 className="text-3xl font-black text-white">TREDIO Admin</h1>
            <p className="text-sm text-white/40">Owner Dashboard</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-white/60">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-white/60">
                <Crown className="h-4 w-4 text-[#F59E0B]" />
                OG100 Claimed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#F59E0B]">{stats.ogClaimed} / 100</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-white/60">
                <DollarSign className="h-4 w-4 text-green-400" />
                Est. Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">${stats.totalRevenue}</div>
              <div className="text-xs text-white/40 mt-1">Monthly recurring</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white/60">Tier Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-white/60">
                  <span>FREE:</span>
                  <span className="font-semibold">{stats.tierCounts.FREE}</span>
                </div>
                <div className="flex justify-between text-blue-400">
                  <span>PRO:</span>
                  <span className="font-semibold">{stats.tierCounts.PRO}</span>
                </div>
                <div className="flex justify-between text-[#F59E0B]">
                  <span>ELITE:</span>
                  <span className="font-semibold">{stats.tierCounts.ELITE}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">User Management</CardTitle>
            <CardDescription className="text-white/40">
              Manage all registered users and their subscription tiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-white/60 uppercase">Email</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-white/60 uppercase">Signup Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-white/60 uppercase">Tier</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-white/60 uppercase">OG #</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-white/60 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-sm text-white/80">{user.email}</td>
                      <td className="py-3 px-4 text-sm text-white/60">{formatDate(user.createdAt)}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            user.subscriptionTier === 'FREE' ? 'border-white/20 text-white/60' :
                            user.subscriptionTier === 'PRO' ? 'border-blue-400/30 text-blue-400' :
                            'border-[#F59E0B]/30 text-[#F59E0B]'
                          }
                        >
                          {user.subscriptionTier}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {user.ogNumber ? (
                          <div className="flex items-center gap-1">
                            <Crown className="h-3 w-3 text-[#F59E0B]" />
                            <span className="text-sm font-semibold text-[#F59E0B]">#{user.ogNumber}</span>
                          </div>
                        ) : (
                          <span className="text-white/30 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={user.subscriptionTier === 'FREE' ? 'default' : 'outline'}
                            onClick={() => changeTier(user.id, 'FREE')}
                            disabled={user.subscriptionTier === 'FREE'}
                            className="h-7 px-3 text-xs"
                          >
                            FREE
                          </Button>
                          <Button
                            size="sm"
                            variant={user.subscriptionTier === 'PRO' ? 'default' : 'outline'}
                            onClick={() => changeTier(user.id, 'PRO')}
                            disabled={user.subscriptionTier === 'PRO'}
                            className="h-7 px-3 text-xs"
                          >
                            PRO
                          </Button>
                          <Button
                            size="sm"
                            variant={user.subscriptionTier === 'ELITE' ? 'default' : 'outline'}
                            onClick={() => changeTier(user.id, 'ELITE')}
                            disabled={user.subscriptionTier === 'ELITE'}
                            className="h-7 px-3 text-xs"
                          >
                            ELITE
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
