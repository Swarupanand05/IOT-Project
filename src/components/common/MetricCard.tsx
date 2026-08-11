import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  status?: 'healthy' | 'warning' | 'critical' | 'info';
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  status = 'info',
  trend,
  trendDirection = 'neutral',
  onClick,
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'healthy':
        return {
          border: 'border-emerald-500/30 hover:border-emerald-500/60',
          glow: 'shadow-glow-green',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          iconBg: 'bg-emerald-500/10 text-emerald-400',
        };
      case 'warning':
        return {
          border: 'border-amber-500/30 hover:border-amber-500/60',
          glow: 'shadow-glow-amber',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          iconBg: 'bg-amber-500/10 text-amber-400',
        };
      case 'critical':
        return {
          border: 'border-rose-500/30 hover:border-rose-500/60',
          glow: 'shadow-glow-red',
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          iconBg: 'bg-rose-500/10 text-rose-400',
        };
      default:
        return {
          border: 'border-surface-border hover:border-blue-500/40',
          glow: 'hover:shadow-glow-blue',
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          iconBg: 'bg-blue-500/10 text-blue-400',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      onClick={onClick}
      className={`bg-surface-100/90 backdrop-blur-md rounded-xl p-4 border transition-all duration-300 ${
        styles.border
      } ${styles.glow} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${styles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline space-x-1.5 mt-1">
        <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">{value}</span>
        {unit && <span className="text-xs font-mono text-slate-400 font-medium">{unit}</span>}
      </div>

      <div className="flex items-center justify-between mt-3 text-xs">
        {subtitle && <span className="text-slate-400 text-[11px] font-sans truncate">{subtitle}</span>}
        {trend && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-semibold ${styles.badge}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
