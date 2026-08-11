import React from 'react';
import { MachineCondition } from '../../types';
import { Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

interface HealthGaugeProps {
  score: number; // 0 - 100
  condition: MachineCondition;
  deviceName?: string;
  motorType?: string;
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({
  score,
  condition,
  deviceName = 'MOTOR-001',
  motorType = '3.7V DC Motor',
}) => {
  // SVG Gauge calculations
  const radius = 64;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getStatusColor = () => {
    if (score >= 85) {
      return {
        text: 'text-emerald-400',
        stroke: '#10B981',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        shadow: 'shadow-glow-green',
        label: 'HEALTHY',
      };
    } else if (score >= 60) {
      return {
        text: 'text-amber-400',
        stroke: '#F59E0B',
        bg: 'bg-amber-500/10 border-amber-500/30',
        shadow: 'shadow-glow-amber',
        label: 'WARNING',
      };
    } else {
      return {
        text: 'text-rose-400',
        stroke: '#EF4444',
        bg: 'bg-rose-500/10 border-rose-500/30',
        shadow: 'shadow-glow-red',
        label: 'CRITICAL',
      };
    }
  };

  const status = getStatusColor();

  return (
    <div className="bg-gradient-to-b from-surface-100 to-surface-200 border border-surface-border rounded-2xl p-6 relative overflow-hidden shadow-2xl">
      {/* Background ambient glow */}
      <div
        className={`absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
          score >= 85 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
        }`}
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left Machine Meta */}
        <div className="space-y-3 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-surface-hover border border-surface-border text-cyan-400">
              {deviceName}
            </span>
            <span className="text-xs font-mono text-slate-400">{motorType}</span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">Machine Condition</h2>
            <div className="flex items-center justify-center md:justify-start space-x-2 mt-1">
              {score >= 85 ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
              )}
              <span className={`text-lg font-mono font-bold uppercase tracking-wider ${status.text}`}>
                {condition}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-sans">
            Continuous MPU6050 vibration telemetry analyzed by TinyML neural classifier.
          </p>
        </div>

        {/* Right Circular Gauge */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Gauge Background Track */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="#1E293B"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Gauge Active Progress Line */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke={status.stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Gauge Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold font-mono text-slate-100">{score}%</span>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                Health Score
              </span>
            </div>
          </div>

          {/* Status Badge Pills */}
          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-mono font-bold border ${status.bg}`}>
            ● {status.label}
          </div>
        </div>
      </div>
    </div>
  );
};
