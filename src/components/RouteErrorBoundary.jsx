import React from 'react';

/**
 * RouteErrorBoundary — a crash inside any screen shows a dark fallback
 * instead of an empty page, and can be retried without losing the app.
 */
export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, detail: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, detail: error?.message || String(error) };
  }

  componentDidCatch(error, info) {
    console.error('[TREDIO] route error:', error?.message || error, info?.componentStack || '');
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ minHeight: '100vh', background: '#080B12', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '340px' }}>
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>{'⚠️'}</div>
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '17px', fontWeight: 800, marginBottom: '8px' }}>
            Something went wrong.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: 1.6, marginBottom: '22px' }}>
            This screen could not load. Your data is safe.
          </p>
          {import.meta.env.DEV && this.state.detail && (
            <p data-testid="route-error-detail" style={{ color: 'rgba(255,120,120,0.8)', fontSize: '11px', fontFamily: 'monospace', marginBottom: '16px', wordBreak: 'break-word' }}>
              {this.state.detail}
            </p>
          )}
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{ width: '100%', padding: '13px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', background: 'linear-gradient(135deg,#0ec8dc,#0aa8be)', color: '#030810', border: 'none', cursor: 'pointer', minHeight: '48px' }}
          >
            Retry
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{ width: '100%', padding: '11px', marginTop: '10px', borderRadius: '12px', fontWeight: 600, fontSize: '13px', background: 'transparent', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', minHeight: '44px' }}
          >
            Reload app
          </button>
        </div>
      </div>
    );
  }
}