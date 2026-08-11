import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, Play, Pause, RefreshCw, Terminal, Sliders, Cpu, Zap } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export const LiveMonitoringView: React.FC = () => {
  const { latestReading, sensorHistory, isPaused, setIsPaused, activeDevice } = useApp();
  const [windowSize, setWindowSize] = useState<'10s' | '30s' | '1m' | '5m'>('30s');
  const [activeTab, setActiveTab] = useState<'waveform' | 'rms' | 'log'>('waveform');

  const getLimit = () => {
    switch (windowSize) {
      case '10s':
        return 10;
      case '30s':
        return 25;
      case '1m':
        return 45;
      case '5m':
        return 80;
    }
  };

  const chartData = [...sensorHistory].slice(0, getLimit()).reverse().map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    AccX: r.acceleration_x,
    AccY: r.acceleration_y,
    AccZ: r.acceleration_z,
    Magnitude: r.vibration_magnitude,
    RMS: r.rms_vibration,
    Peak: r.peak_vibration,
    Temp: r.temperature,
    Speed: r.motor_speed,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center space-x-3">
            <Activity className="w-7 h-7 text-cyan-400 animate-pulse" />
            <span>Live Telemetry Stream</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            High-Frequency MPU6050 Accelerometer Feed (Node: {activeDevice.device_id})
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-bold border transition-all ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>{isPaused ? 'RESUME STREAM' : 'PAUSE STREAM'}</span>
          </button>

          <div className="flex bg-surface-100 p-0.5 rounded-lg border border-surface-border">
            {(['10s', '30s', '1m', '5m'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setWindowSize(w)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  windowSize === w ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Matrix (8 Grid Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono">
        <div className="bg-surface-100 border border-surface-border rounded-xl p-3">
          <div className="text-[10px] text-slate-400">ACC X</div>
          <div className="text-lg font-bold text-blue-400 mt-1">{latestReading?.acceleration_x.toFixed(3) ?? '0.120'}</div>
          <div className="text-[10px] text-slate-500">m/s²</div>
        </div>
        <div className="bg-surface-100 border border-surface-border rounded-xl p-3">
          <div className="text-[10px] text-slate-400">ACC Y</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">{latestReading?.acceleration_y.toFixed(3) ?? '-0.080'}</div>
          <div className="text-[10px] text-slate-500">m/s²</div>
        </div>
        <div className="bg-surface-100 border border-surface-border rounded-xl p-3">
          <div className="text-[10px] text-slate-400">ACC Z</div>
          <div className="text-lg font-bold text-amber-400 mt-1">{latestReading?.acceleration_z.toFixed(3) ?? '9.720'}</div>
          <div className="text-[10px] text-slate-500">m/s²</div>
        </div>
        <div className="bg-surface-100 border border-surface-border rounded-xl p-3">
          <div className="text-[10px] text-slate-400">MAGNITUDE</div>
          <div className="text-lg font-bold text-cyan-400 mt-1">{latestReading?.vibration_magnitude.toFixed(3) ?? '9.820'}</div>
          <div className="text-[10px] text-slate-500">m/s²</div>
        </div>
        <div className="bg-surface-100 border border-surface-border rounded-xl p-3">
          <div className="text-[10px] text-slate-400">RMS VIB</div>
          <div className="text-lg font-bold text-purple-400 mt-1">{latestReading?.rms_vibration.toFixed(3) ?? '0.891'}</div>
          <div className="text-[10px] text-slate-500">m/s²</div>
        </div>
        <div className="bg-surface-100 border border-surface-border rounded-xl p-3">
          <div className="text-[10px] text-slate-400">PEAK VIB</div>
          <div className="text-lg font-bold text-rose-400 mt-1">{latestReading?.peak_vibration.toFixed(3) ?? '1.230'}</div>
          <div className="text-[10px] text-slate-500">m/s²</div>
        </div>
        <div className="bg-surface-100 border border-surface-border rounded-xl p-3">
          <div className="text-[10px] text-slate-400">TEMP</div>
          <div className="text-lg font-bold text-orange-400 mt-1">{latestReading?.temperature.toFixed(1) ?? '36.2'}</div>
          <div className="text-[10px] text-slate-500">°C</div>
        </div>
        <div className="bg-surface-100 border border-surface-border rounded-xl p-3">
          <div className="text-[10px] text-slate-400">MOTOR RPM</div>
          <div className="text-lg font-bold text-teal-400 mt-1">{latestReading?.motor_speed ?? 1450}</div>
          <div className="text-[10px] text-slate-500">PWM: {latestReading?.pwm_value ?? 173}</div>
        </div>
      </div>

      {/* Main Stream View Tabs */}
      <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex space-x-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab('waveform')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'waveform' ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tri-Axial Waveform (X, Y, Z)
            </button>
            <button
              onClick={() => setActiveTab('rms')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'rms' ? 'bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              RMS & Peak Vibration
            </button>
            <button
              onClick={() => setActiveTab('log')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'log' ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Raw Json Terminal</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Sampling @ 100 Hz</span>
          </div>
        </div>

        {/* Tab 1: Waveform Chart */}
        {activeTab === 'waveform' && (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F1724', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="AccX" stroke="#3B82F6" strokeWidth={2} dot={false} name="Acc X (m/s²)" />
                <Line type="monotone" dataKey="AccY" stroke="#10B981" strokeWidth={2} dot={false} name="Acc Y (m/s²)" />
                <Line type="monotone" dataKey="AccZ" stroke="#F59E0B" strokeWidth={2} dot={false} name="Acc Z (m/s²)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 2: RMS Area Chart */}
        {activeTab === 'rms' && (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F1724', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="RMS" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} name="RMS Vibration" />
                <Area type="monotone" dataKey="Peak" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} name="Peak Vibration" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 3: Raw Terminal JSON Feed */}
        {activeTab === 'log' && (
          <div className="bg-[#080B10] rounded-xl p-4 border border-surface-border font-mono text-xs max-h-80 overflow-y-auto space-y-1.5 text-cyan-400">
            {sensorHistory.slice(0, 15).map((log, i) => (
              <div key={log.id} className="opacity-90 hover:opacity-100 transition-opacity">
                <span className="text-slate-500">[{new Date(log.timestamp).toISOString()}]</span>{' '}
                <span className="text-emerald-400">INGEST_OK</span> device={log.device_id} acc_x={log.acceleration_x}{' '}
                acc_y={log.acceleration_y} acc_z={log.acceleration_z} mag={log.vibration_magnitude} rms={log.rms_vibration}{' '}
                speed={log.motor_speed}rpm temp={log.temperature}°C
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
