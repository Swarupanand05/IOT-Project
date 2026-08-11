import React from 'react';
import { useApp } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { LineChart as ChartIcon, Activity, Layers, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

export const VibrationAnalysisView: React.FC = () => {
  const { sensorHistory } = useApp();

  // Compute statistical aggregations over past 50 readings
  const sample = sensorHistory.slice(0, 50);

  const avgX = sample.reduce((acc, curr) => acc + curr.acceleration_x, 0) / (sample.length || 1);
  const avgY = sample.reduce((acc, curr) => acc + curr.acceleration_y, 0) / (sample.length || 1);
  const avgZ = sample.reduce((acc, curr) => acc + curr.acceleration_z, 0) / (sample.length || 1);
  const avgMag = sample.reduce((acc, curr) => acc + curr.vibration_magnitude, 0) / (sample.length || 1);
  const avgRMS = sample.reduce((acc, curr) => acc + curr.rms_vibration, 0) / (sample.length || 1);

  const peakVal = Math.max(...sample.map((s) => s.peak_vibration), 1.2);

  // Standard deviation calculation for magnitude
  const variance = sample.reduce((acc, curr) => acc + Math.pow(curr.vibration_magnitude - avgMag, 2), 0) / (sample.length || 1);
  const stdDev = Math.sqrt(variance);

  const chartData = [...sample].reverse().map((s) => ({
    time: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    AccX: s.acceleration_x,
    AccY: s.acceleration_y,
    AccZ: s.acceleration_z,
    Magnitude: s.vibration_magnitude,
    RMS: s.rms_vibration,
    Peak: s.peak_vibration,
  }));

  // Frequency spectrum distribution (FFT bin mock)
  const fftData = [
    { freq: '10 Hz (1x)', power: 2.4 },
    { freq: '20 Hz (2x)', power: 8.5 },
    { freq: '30 Hz (3x)', power: 3.1 },
    { freq: '40 Hz', power: 1.2 },
    { freq: '50 Hz', power: 0.8 },
    { freq: '60 Hz', power: 0.5 },
    { freq: '70 Hz', power: 0.3 },
    { freq: '80 Hz', power: 0.2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center space-x-3">
          <ChartIcon className="w-7 h-7 text-cyan-400" />
          <span>Detailed Vibration Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Statistical decomposition, RMS vibration, peak acceleration, and standard deviation analysis
        </p>
      </div>

      {/* 4 Main Statistical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-surface-100 border border-surface-border rounded-xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 uppercase">RMS Vibration</div>
          <div className="text-3xl font-extrabold text-purple-400 mt-2">{avgRMS.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">m/s² (Root Mean Square)</div>
        </div>
        <div className="bg-surface-100 border border-surface-border rounded-xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 uppercase">Peak Vibration</div>
          <div className="text-3xl font-extrabold text-rose-400 mt-2">{peakVal.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">m/s² (Max Acceleration)</div>
        </div>
        <div className="bg-surface-100 border border-surface-border rounded-xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 uppercase">Average Vibration</div>
          <div className="text-3xl font-extrabold text-cyan-400 mt-2">{avgMag.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">m/s² (Mean Magnitude)</div>
        </div>
        <div className="bg-surface-100 border border-surface-border rounded-xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 uppercase">Standard Deviation</div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">{stdDev.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">Sigma (Variance Spread)</div>
        </div>
      </div>

      {/* 3 Individual Axis Waveform Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acc X */}
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs font-bold text-blue-400">ACCELERATION X (AXIAL)</span>
            <span className="font-mono text-xs text-slate-400">Mean: {avgX.toFixed(3)} m/s²</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F1724', borderColor: '#1E293B', fontSize: '10px' }} />
                <Line type="monotone" dataKey="AccX" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Acc Y */}
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs font-bold text-emerald-400">ACCELERATION Y (HORIZONTAL)</span>
            <span className="font-mono text-xs text-slate-400">Mean: {avgY.toFixed(3)} m/s²</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F1724', borderColor: '#1E293B', fontSize: '10px' }} />
                <Line type="monotone" dataKey="AccY" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Acc Z */}
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs font-bold text-amber-400">ACCELERATION Z (VERTICAL GRAVITY)</span>
            <span className="font-mono text-xs text-slate-400">Mean: {avgZ.toFixed(3)} m/s²</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F1724', borderColor: '#1E293B', fontSize: '10px' }} />
                <Line type="monotone" dataKey="AccZ" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FFT Frequency Spectrum Overview */}
      <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-slate-100 font-mono">Fast Fourier Transform (FFT) Frequency Spectrum</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Harmonic Peak: 20 Hz (1x RPM)</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fftData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="freq" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0F1724', borderColor: '#1E293B', fontSize: '11px' }} />
              <Bar dataKey="power" fill="#06B6D4" radius={[4, 4, 0, 0]} name="Spectral Power (dB)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
