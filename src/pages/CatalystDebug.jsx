import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function CatalystDebug() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);

  const runDebug = async () => {
    setLoading(true);
    setLogs([]);
    setResult(null);

    try {
      const response = await base44.functions.invoke('newsInterpreterDebug', {});
      
      setLogs(response.data.logs || []);
      setResult({
        rawNewsCount: response.data.rawNewsCount,
        interpretedCount: response.data.interpretedCount,
        interpretationFailures: response.data.interpretationFailures || 0,
        catalysts: response.data.catalysts || [],
        sampleCatalysts: response.data.sampleCatalysts || [],
        success: response.data.success
      });

      console.log('Full response:', response.data);
    } catch (error) {
      setLogs([`ERROR: ${error.message}`]);
      console.error('Debug error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Catalyst Pipeline Debug</h1>

        <button
          onClick={runDebug}
          disabled={loading}
          className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg mb-6 disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Full Pipeline Debug'}
        </button>

        {result && (
          <div className="space-y-6 mb-8">
            <div className="rounded-lg bg-card border border-border p-4">
              <h2 className="text-lg font-bold text-foreground mb-3">Summary</h2>
              <div className="space-y-2 text-sm">
                <p>Status: <span className={result.success ? 'text-green-500' : 'text-red-500'}>{result.success ? '✓ Success' : '✗ Failed'}</span></p>
                <p>Raw news items: <span className="font-bold">{result.rawNewsCount}</span></p>
                <p>Interpreted catalysts: <span className="font-bold">{result.interpretedCount}</span></p>
                <p>Interpretation failures: <span className="font-bold text-orange-500">{result.interpretationFailures}</span></p>
              </div>
            </div>

            {result.sampleCatalysts.length > 0 && (
              <div className="rounded-lg bg-card border border-border p-4">
                <h2 className="text-lg font-bold text-foreground mb-3">Sample Catalysts (First 2)</h2>
                {result.sampleCatalysts.map((cat, i) => (
                  <div key={i} className="mb-4 pb-4 border-b border-border last:border-b-0">
                    <p className="font-bold text-foreground">{cat.headline}</p>
                    <p className="text-sm text-muted-foreground mt-1">Source: {cat.source_name}</p>
                    <p className="text-sm text-muted-foreground">Market State: {cat.market_state}</p>
                    <p className="text-sm text-muted-foreground">Regions: {cat.regions?.join(', ')}</p>
                    <p className="text-sm text-muted-foreground">Confidence: {cat.confidence}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="rounded-lg bg-card border border-border p-4">
          <h2 className="text-lg font-bold text-foreground mb-3">Full Logs</h2>
          <div className="bg-background rounded p-4 font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log, i) => (
                <div key={i} className="text-muted-foreground">
                  {log}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Run debug to see logs</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}