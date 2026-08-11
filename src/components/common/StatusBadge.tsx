import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'device' | 'alert' | 'ai' | 'command';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getBadgeStyle = () => {
    const s = status.toLowerCase();

    if (['online', 'healthy', 'connected', 'executed', 'resolved', 'low'].includes(s)) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (['warning', 'unbalance', 'loose_mounting', 'bearing_wear', 'medium', 'high', 'acknowledged', 'pending', 'weak'].includes(s)) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    if (['critical', 'offline', 'critical fault', 'failed', 'active'].includes(s)) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  };

  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center space-x-1 font-mono font-bold uppercase rounded-md border ${px} ${getBadgeStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span>{status.replace('_', ' ')}</span>
    </span>
  );
};
