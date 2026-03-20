import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchCommodityPrices } from '../../api/commodities';

export default function CommoditiesTab() {
  const navigate = useNavigate();
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommodities() {
      try {
        const data = await fetchCommodityPrices();
        setCommodities(data);
      } catch (error) {
        console.error('Error loading commodities:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCommodities();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/[0.07] bg-[#111118] p-8 text-center"
      >
        <p className="text-white/30 text-sm">Loading commodities data...</p>
      </motion.div>
    );
  }

  const getSignalColor = (signal) => {
    if (signal === 'BUY') return 'text-chart-3 bg-chart-3/10 border-chart-3/20';
    if (signal === 'SELL') return 'text-destructive bg-destructive/10 border-destructive/20';
    return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-white/[0.05]">
        <h3 className="text-sm font-bold text-white/80">Commodities ({commodities.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-[0.1em] text-white/25 uppercase">
                Commodity
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold tracking-[0.1em] text-white/25 uppercase">
                Price
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold tracking-[0.1em] text-white/25 uppercase">
                Change
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold tracking-[0.1em] text-white/25 uppercase">
                Signal
              </th>
            </tr>
          </thead>
          <tbody>
            {commodities.map((commodity, i) => (
              <tr
                key={i}
                onClick={() => navigate(`/Asset/${commodity.symbol}`)}
                className="border-b border-white/[0.04] hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors last:border-0 cursor-pointer"
                style={{ minHeight: '56px' }}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{commodity.icon}</span>
                    <div>
                      <div className="font-mono font-black text-[13px] text-white/85">{commodity.name}</div>
                      <div className="text-[10px] text-white/30">{commodity.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="font-mono text-[12px] text-white/85 font-bold">
                    ${commodity.price.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-white/30">{commodity.unit}</div>
                </td>
                <td className={`px-4 py-3 text-right font-mono text-[12px] font-bold ${commodity.change >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                  <div className="flex items-center justify-end gap-1">
                    {commodity.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {commodity.change >= 0 ? '+' : ''}{commodity.change.toFixed(2)}%
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border ${getSignalColor(commodity.signal)}`}>
                    {commodity.signal}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
