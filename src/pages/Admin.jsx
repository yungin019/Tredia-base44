import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { invokeFunction } from '@/api/functionsClient';
import { useFirebaseAuth } from '@/lib/FirebaseAuthContext';
import { isAdminUser } from '@/lib/adminAccess';
import StatusCards from '@/components/admin/StatusCards';
import LiveFeed from '@/components/admin/LiveFeed';
import CrashesSection from '@/components/admin/CrashesSection';
import AskDiagnostics from '@/components/admin/AskDiagnostics';
import UsersPanel from '@/components/admin/UsersPanel';
import TrackRecordCard from '@/components/admin/TrackRecordCard';

const TABS = [
  { id: 'status', label: 'Status' },
  { id: 'live', label: 'Live' },
  { id: 'crashes', label: 'Crashes' },
  { id: 'ask', label: 'Ask' },
  { id: 'users', label: 'Users' },
];

export default function Admin() {
  const navigate = useNavigate();
  const { firebaseUser, isLoading } = useFirebaseAuth();
  const [tab, setTab] = useState('status');
  const [digest, setDigest] = useState(null);
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const admin = isAdminUser(firebaseUser);

  useEffect(() => {
    if (!isLoading && !admin) navigate('/Home', { replace: true });
  }, [isLoading, admin, navigate]);

  const load = useCallback(async () => {
    try {
      const result = await invokeFunction('adminDiagnostics', { action: 'overview' });
      setDigest(result.digest);
      setReport(result.report || '');
      setError('');
    } catch (err) {
      setError(err.status === 403 ? 'This account is not an admin.' : (err.message || 'Could not load diagnostics.'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Live view refreshes every 10s; the rest every 30s.
  useEffect(() => {
    if (!admin) return undefined;
    load();
    const interval = setInterval(load, tab === 'live' ? 10000 : 30000);
    return () => clearInterval(interval);
  }, [admin, tab, load]);

  const copyReport = async () => {
    try {
      const fresh = await invokeFunction('adminDiagnostics', { action: 'report' });
      await navigator.clipboard.writeText(fresh.report || report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) { /* clipboard blocked */ }
  };

  const setStatus = async (id, status) => {
    setBusyId(id);
    try {
      await invokeFunction('adminDiagnostics', { action: 'setGroupStatus', id, status });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading || !admin) {
    return <div className="min-h-screen app-bg flex items-center justify-center text-[12px] text-white/30">Checking access…</div>;
  }

  return (
    <div className="min-h-screen app-bg p-4 pb-24">
      <div className="max-w-[1100px] mx-auto space-y-4">

        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg font-black tracking-[3px]" style={{ color: '#F59E0B' }}>TREDIO ADMIN</h1>
            <p className="text-[10px] text-white/30 mt-0.5">
              {digest ? `Updated ${new Date(digest.generatedAt).toLocaleTimeString()} · ${digest.totals.errors24h} errors / 24h · ${digest.totals.openCrashes} open crashes` : 'Loading diagnostics…'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyReport}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold tap-feedback"
              style={{ background: 'rgba(245,158,11,0.13)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy full report'}
            </button>
            <button onClick={load} aria-label="Refresh"
              className="flex items-center justify-center h-8 w-8 rounded-lg tap-feedback"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <RefreshCw className="h-3.5 w-3.5 text-white/50" />
            </button>
            <button onClick={() => navigate('/Home')}
              className="rounded-lg px-3 py-1.5 text-[11px] font-bold tap-feedback"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}>
              ← Back
            </button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap tap-feedback"
              style={tab === item.id
                ? { background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.32)', color: '#F59E0B' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>
              {item.label}
              {item.id === 'crashes' && digest?.totals.openCrashes > 0 ? ` (${digest.totals.openCrashes})` : ''}
            </button>
          ))}
        </div>

        {error && <p className="text-[11px] text-rose-400">{error}</p>}

        {loading && !digest && <p className="text-[11px] text-white/30">Loading…</p>}

        {tab === 'status' && (
          <>
            <StatusCards digest={digest} />
            <TrackRecordCard />
          </>
        )}
        {tab === 'live' && <LiveFeed lines={digest?.live} />}
        {tab === 'crashes' && (
          <CrashesSection crashes={digest?.crashes} onStatusChange={setStatus} busyId={busyId} />
        )}
        {tab === 'ask' && (
          <AskDiagnostics
            digest={digest}
            onAsk={(question) => invokeFunction('adminDiagnostics', { action: 'ask', question })}
          />
        )}
        {tab === 'users' && <UsersPanel />}
      </div>
    </div>
  );
}