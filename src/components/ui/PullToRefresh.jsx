import { useState, useRef } from 'react';

export default function PullToRefresh({ onRefresh, children }) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const threshold = 80;

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = async (e) => {
    const diff = e.changedTouches[0].clientY - startY.current;
    if (diff > threshold && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ minHeight: '100%' }}
    >
      {refreshing && (
        <div style={{
          textAlign: 'center',
          padding: '12px',
          color: '#F59E0B',
          fontSize: '13px',
          fontWeight: 700,
        }}>
          ⚡ Refreshing...
        </div>
      )}
      {children}
    </div>
  );
}