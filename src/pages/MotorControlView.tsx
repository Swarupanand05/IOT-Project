import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Sliders, Play, Square, Gauge, Zap, Clock, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

export const MotorControlView: React.FC = () => {
  const { latestReading, sendCommand, motorCommands, activeDevice, isLiveMode } = useApp();
  const [sliderSpeed, setSliderSpeed] = useState<number>(latestReading?.pwm_value ? Math.round((latestReading.pwm_value / 255) * 100) : 68);
  const [lastActionStatus, setLastActionStatus] = useState<string | null>(null);

  const isRunning = (latestReading?.motor_speed ?? 0) > 50;
  const currentRPM = latestReading?.motor_speed ?? 1450;
  const currentPWM = latestReading?.pwm_value ?? 173;

  const handleStart = () => {
    sendCommand('START', sliderSpeed || 50);
    setLastActionStatus('Command "START" dispatched to ESP32 queue (Status: PENDING)');
  };

  const handleStop = () => {
    sendCommand('STOP', 0);
    setLastActionStatus('Command "STOP" dispatched to ESP32 queue (Status: PENDING)');
  };

  const handleSetSpeed = (pct: number) => {
    setSliderSpeed(pct);
    sendCommand('SET_SPEED', pct);
    setLastActionStatus(`Command "SET_SPEED (${pct}%)" dispatched to ESP32 queue (Status: PENDING)`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center space-x-3">
          <Sliders className="w-7 h-7 text-cyan-400" />
          <span>L298N Motor Control Center</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Two-Way ESP32 Control Interface (PWM Speed Duty Cycle & Direct Relay State)
        </p>
      </div>

      {/* Main Motor Status & Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Live Status Indicators (1 col) */}
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-6 shadow-xl space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase font-semibold">Node Status</span>
            <span className="text-xs font-bold text-cyan-400">{activeDevice.device_id}</span>
          </div>

          {/* Large Motor State Banner */}
          <div className={`p-4 rounded-xl border text-center space-y-1 ${
            isRunning
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-glow-green'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-glow-red'
          }`}>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Current Motor State</div>
            <div className="text-2xl font-extrabold flex items-center justify-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></span>
              <span>{isRunning ? 'RUNNING' : 'STOPPED'}</span>
            </div>
          </div>

          {/* Dynamic Metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-surface-200 border border-surface-border rounded-lg">
              <span className="text-slate-400 text-[10px]">Calculated RPM</span>
              <div className="text-lg font-bold text-cyan-400 mt-0.5">{currentRPM}</div>
              <span className="text-[10px] text-slate-500">RPM</span>
            </div>
            <div className="p-3 bg-surface-200 border border-surface-border rounded-lg">
              <span className="text-slate-400 text-[10px]">PWM Duty Cycle</span>
              <div className="text-lg font-bold text-amber-400 mt-0.5">{currentPWM}/255</div>
              <span className="text-[10px] text-slate-500">{Math.round((currentPWM / 255) * 100)}% Speed</span>
            </div>
            <div className="p-3 bg-surface-200 border border-surface-border rounded-lg">
              <span className="text-slate-400 text-[10px]">Operating Voltage</span>
              <div className="text-lg font-bold text-blue-400 mt-0.5">3.7V</div>
              <span className="text-[10px] text-slate-500">DC Motor</span>
            </div>
            <div className="p-3 bg-surface-200 border border-surface-border rounded-lg">
              <span className="text-slate-400 text-[10px]">Driver IC</span>
              <div className="text-lg font-bold text-purple-400 mt-0.5">L298N</div>
              <span className="text-[10px] text-slate-500">Dual H-Bridge</span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Speed Sliders (2 cols) */}
        <div className="lg:col-span-2 bg-surface-100 border border-surface-border rounded-2xl p-6 shadow-xl space-y-6 font-mono">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">Hardware Command Triggers</h3>
            <span className="text-xs text-slate-400">GPIO 18 PWM Frequency: 5.0 kHz</span>
          </div>

          {/* START / STOP Toggle Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleStart}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-extrabold text-sm flex items-center justify-center space-x-2 hover:brightness-110 shadow-glow-green transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START MOTOR</span>
            </button>
            <button
              onClick={handleStop}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-extrabold text-sm flex items-center justify-center space-x-2 hover:brightness-110 shadow-glow-red transition-all"
            >
              <Square className="w-5 h-5 fill-current" />
              <span>STOP MOTOR</span>
            </button>
          </div>

          {/* Speed Slider */}
          <div className="space-y-3 bg-surface-200/50 p-4 rounded-xl border border-surface-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">SET MOTOR SPEED:</span>
              <span className="text-cyan-400 font-extrabold text-base">{sliderSpeed}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={sliderSpeed}
              onChange={(e) => setSliderSpeed(Number(e.target.value))}
              onMouseUp={() => handleSetSpeed(sliderSpeed)}
              onTouchEnd={() => handleSetSpeed(sliderSpeed)}
              className="w-full h-2 bg-surface-border rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />

            {/* Quick Speed Preset Buttons */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => handleSetSpeed(pct)}
                  className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    sliderSpeed === pct
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                      : 'bg-surface-100 border-surface-border text-slate-400 hover:text-white'
                  }`}
                >
                  {pct}% Speed
                </button>
              ))}
            </div>
          </div>

          {/* Feedback banner */}
          {lastActionStatus && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center space-x-2">
              <Send className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{lastActionStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* Motor Command Queue & Audit Log */}
      <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Motor Command Log (`motor_commands` table)</span>
          </h3>
          <span className="text-slate-400 text-[11px]">Realtime ESP32 Command Queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Command</th>
                <th className="py-2.5 px-3">Speed %</th>
                <th className="py-2.5 px-3">Target PWM</th>
                <th className="py-2.5 px-3">Requested By</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-slate-300 text-[11px]">
              {motorCommands.slice(0, 10).map((cmd) => (
                <tr key={cmd.id} className="hover:bg-surface-hover">
                  <td className="py-2.5 px-3">{new Date(cmd.created_at).toLocaleTimeString()}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-100">{cmd.command}</td>
                  <td className="py-2.5 px-3 text-cyan-400">{cmd.speed_percentage ?? 0}%</td>
                  <td className="py-2.5 px-3 text-amber-400">{cmd.pwm_value ?? 0}</td>
                  <td className="py-2.5 px-3 text-slate-400">{cmd.requested_by}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={cmd.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
