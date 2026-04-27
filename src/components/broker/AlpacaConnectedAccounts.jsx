import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Shield } from 'lucide-react';

/**
 * "Connected accounts" section for the Settings page.
 * Shows connect or disconnect state for Alpaca.
 */
export default function AlpacaConnectedAccounts({ user, onDisconnect }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isConnected = !!user?.alpaca_connected;

  return (
    <div>
      {/* Header */}
      <h2 className="text-[11px] font-black uppercase tracking-[0.18em] mb-4" style={{ color: '#F59E0B' }}>
        {t('settings.connectedAccounts', 'CONNECTED ACCOUNTS')}
      </h2>

      <div
        className="rounded-xl p-5"
        style={{ background: isConnected ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isConnected ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}` }}
      >
        {/* Alpaca logo row */}
        <div className="flex items-center gap-3 mb-4">
          {/* Alpaca logo approximation */}
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
            style={{ background: 'rgba(255,199,0,0.12)', border: '1px solid rgba(255,199,0,0.25)', color: '#FFC700' }}
          >
            A
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white/90">Alpaca Markets</span>
              {isConnected && (
                <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <CheckCircle2 className="h-2.5 w-2.5" /> {t('alpaca.connected', 'Connected')}
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/40 mt-0.5">
              {isConnected ? t('alpaca.liveActive', 'Live trading active via Alpaca Securities') : t('alpaca.connectDesc', 'Connect your Alpaca account to trade directly from TREDIO')}
            </p>
          </div>
        </div>

        {isConnected ? (
          <>
            {user?.alpaca_account_id && (
              <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] text-white/30 mb-0.5 uppercase tracking-wider">{t('alpaca.accountId', 'Account ID')}</p>
                <p className="text-xs font-mono text-white/70">{user.alpaca_account_id}</p>
              </div>
            )}
            <p className="text-[10px] text-white/30 mb-3 leading-relaxed">
              {t('alpaca.revokingWarning', 'Revoking access will disable live trading from TREDIO. Paper trading and signals remain available.')}
            </p>
            <button
              onClick={onDisconnect}
              className="w-full py-2.5 rounded-lg font-bold text-sm border border-white/[0.1] hover:border-white/20 transition-colors text-white/55"
            >
              {t('settings.disconnect', 'DISCONNECT')}
            </button>
          </>
        ) : (
          <>
            {/* Info block */}
            <div className="mb-4 p-3 rounded-lg flex items-start gap-2.5" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <Shield className="h-3.5 w-3.5 text-[#F59E0B] mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-white/50 leading-relaxed">
                {t('alpaca.infoBlock', 'TREDIO provides AI-powered trading signals. Order execution is handled through your Alpaca brokerage account. You\'ll authorize TREDIO to read your portfolio and place trades on your behalf.')}
              </p>
            </div>

            <button
              onClick={() => navigate('/alpaca-connect')}
              className="w-full py-3 rounded-xl font-black text-sm tracking-wide transition-all hover:opacity-90 mb-2"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}
            >
              {t('settings.connectAlpaca', 'CONNECT ALPACA - FREE →')}
            </button>

            <p className="text-[10px] text-white/25 text-center">
              {t('alpaca.loginNote', 'You\'ll be taken to Alpaca to log in or create a free account.')}
            </p>
          </>
        )}
      </div>

      {/* Legal */}
      <p className="text-[9px] text-white/20 mt-3 leading-relaxed text-center">
        {t('alpaca.legalDisclaimer', 'TREDIO is not a registered broker-dealer. Trading is executed through Alpaca Securities LLC, a FINRA/SIPC member.')}
      </p>
    </div>
  );
}