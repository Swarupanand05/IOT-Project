import React from 'react';
import { Activity, Cpu, ShieldCheck, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-surface-border bg-[#0B0F17] py-6 px-4 md:px-8 text-xs text-slate-400 font-mono mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left branding */}
        <div className="flex items-center space-x-3 text-left">
          <div className="w-7 h-7 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="font-bold text-slate-200">PredictGuard AI</div>
            <div className="text-[11px] text-slate-400">AI-Based Predictive Maintenance System</div>
          </div>
        </div>

        {/* Center Hardware Tech Badge */}
        <div className="flex items-center space-x-4 text-[11px] text-slate-400 bg-surface-100 px-3 py-1.5 rounded-lg border border-surface-border">
          <span className="flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>ESP32 + MPU6050</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>TinyML Int8 Engine</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Realtime</span>
          </span>
        </div>

        {/* Right Credits */}
        <div className="text-center md:text-right text-[11px]">
          <span className="text-slate-300 font-semibold">Electrical Engineering Project</span>
          <p className="text-slate-400 text-[10px]">Smart Motor Health Monitoring & Maintenance</p>
        </div>
      </div>
    </footer>
  );
};
