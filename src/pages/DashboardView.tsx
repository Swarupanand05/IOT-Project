import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HealthGauge } from '../components/common/HealthGauge';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Activity,
  Zap,
  Gauge,
  BrainCircuit,
  Wrench,
  Cpu,
  Play,
  Pause,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    activeDevice,
    latestReading,
    sensorHistory,
    latestPrediction,
    alerts,
    thresholds,
    setCurrentView,
    isPaused,
    setIsPaused,
  } = useApp();

  const [timeWindow, setTimeWindow] = useState<'10s' | '30s' | '1m' | '5m'>('30s');

  const activeAlerts = alerts.filter((a) => a.status === 'active');

  // Filter time window data
  const getWindowData = () => {
    let limit = 30;
    if (timeWindow === '10s') limit = 10;
    if (timeWindow === '30s') limit = 25;
    if (timeWindow === '1m') limit = 40;
    if (timeWindow === '5m') limit = 60;

    return [...sensorHistory].slice(0, limit).reverse().map((item) => ({
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      X: item.acceleration_x,
      Y: item.acceleration_y,
      Z: item.acceleration_z,
      Magnitude: item.vibration_magnitude,
      RMS: item.rms_vibration,
      Speed: item.motor_speed,
    }));
  };

  const chartData = getWindowData();

  // Compute machine health score from vibration and predictions
  const currentMag = latestReading?.vibration_magnitude ?? 9.8;
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - (currentMag > 9.8 ? (currentMag - 9.8) * 12 : 0))));

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center space-x-3">
            <Activity className="w-7 h-7 text-cyan-400" />
            <span>Motor Health Overview</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Real-Time MPU6050 Vibration Telemetry & TinyML Anomaly Classification
          </p>
        </div>

        {/* Quick action controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold border transition-all ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-surface-100 text-slate-300 border-surface-border hover:bg-surface-hover'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume Stream' : 'Pause Stream'}</span>
          </button>

          <button
            onClick={() => setCurrentView('live')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:brightness-110 shadow-glow-cyan"
          >
            <span>Live Analysis</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Key KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Machine Health"
          value={`${healthScore}%`}
          icon={ShieldCheck}
          status={healthScore >= 85 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical'}
          subtitle="Overall Score"
          trend={healthScore >= 85 ? 'Optimal' : 'Degraded'}
          onClick={() => setCurrentView('vibration')}
        />
        <MetricCard
          title="Current Vibration"
          value={latestReading?.vibration_magnitude.toFixed(2) ?? '9.82'}
          unit="m/s²"
          icon={Activity}
          status={
            (latestReading?.vibration_magnitude ?? 9.8) > thresholds.criticalVibration
              ? 'critical'
              : (latestReading?.vibration_magnitude ?? 9.8) > thresholds.warningVibration
              ? 'warning'
              : 'healthy'
          }
          subtitle="MPU6050 Composite"
          trend="Real-time"
        />
        <MetricCard
          title="Motor Speed"
          value={latestReading?.motor_speed ?? 1450}
          unit="RPM"
          icon={Gauge}
          status="info"
          subtitle={`PWM: ${latestReading?.pwm_value ?? 173}/255`}
          trend="L298N Speed"
          onClick={() => setCurrentView('motor')}
        />
        <MetricCard
          title="AI Condition"
          value={latestPrediction?.prediction ?? 'Healthy'}
          icon={BrainCircuit}
          status={
            latestPrediction?.prediction === 'Healthy'
              ? 'healthy'
              : latestPrediction?.severity === 'Critical'
              ? 'critical'
              : 'warning'
          }
          subtitle={`Conf: ${latestPrediction?.confidence ?? 96.4}%`}
          trend="TinyML"
          onClick={() => setCurrentView('ai')}
        />
        <MetricCard
          title="Maintenance Risk"
          value={healthScore >= 85 ? 'LOW' : healthScore >= 60 ? 'MEDIUM' : 'HIGH'}
          icon={Wrench}
          status={healthScore >= 85 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical'}
          subtitle="Next due in 15d"
          trend="Predictive"
          onClick={() => setCurrentView('maintenance')}
        />
        <MetricCard
          title="Device Status"
          value={activeDevice.status.toUpperCase()}
          icon={Cpu}
          status={activeDevice.status === 'online' ? 'healthy' : 'warning'}
          subtitle={activeDevice.device_id}
          trend="CONNECTED"
          onClick={() => setCurrentView('devices')}
        />
      </div>

      {/* Main Machine Health Circular Card */}
      <HealthGauge
        score={healthScore}
        condition={latestPrediction?.prediction ?? 'Healthy'}
        deviceName={activeDevice.device_id}
        motorType={activeDevice.motor_type}
      />

      {/* Real-time Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-Time Vibration Acceleration (X, Y, Z) */}
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-100 font-mono flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Real-Time Vibration Acceleration</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Tri-axial MPU6050 raw waveforms (m/s²)</p>
            </div>

            {/* Time Window Buttons */}
            <div className="flex items-center bg-surface-200 p-0.5 rounded-lg border border-surface-border font-mono text-[10px]">
              {(['10s', '30s', '1m', '5m'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setTimeWindow(w)}
                  className={`px-2 py-1 rounded transition-colors ${
                    timeWindow === w ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F1724', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="X" stroke="#3B82F6" strokeWidth={1.5} dot={false} name="X Acceleration" />
                <Line type="monotone" dataKey="Y" stroke="#10B981" strokeWidth={1.5} dot={false} name="Y Acceleration" />
                <Line type="monotone" dataKey="Z" stroke="#F59E0B" strokeWidth={1.5} dot={false} name="Z Acceleration" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vibration Magnitude with Configurable Thresholds */}
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-100 font-mono flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Vibration Magnitude & Limits</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Warning limit: {thresholds.warningVibration} m/s² | Critical: {thresholds.criticalVibration} m/s²
              </p>
            </div>
            <button
              onClick={() => setCurrentView('settings')}
              className="text-[11px] font-mono text-cyan-400 hover:underline"
            >
              Configure Limits
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} domain={[0, 20]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F1724', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }}
                />
                <ReferenceLine
                  y={thresholds.warningVibration}
                  stroke="#F59E0B"
                  strokeDasharray="4 4"
                  label={{ value: 'WARNING THRESHOLD', fill: '#F59E0B', fontSize: 9, position: 'insideTopRight' }}
                />
                <ReferenceLine
                  y={thresholds.criticalVibration}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  label={{ value: 'CRITICAL THRESHOLD', fill: '#EF4444', fontSize: 9, position: 'insideTopRight' }}
                />
                <Line
                  type="monotone"
                  dataKey="Magnitude"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#06B6D4' }}
                  name="Magnitude (m/s²)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Alerts & AI Prediction Summary Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts Panel (2 cols) */}
        <div className="lg:col-span-2 bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-slate-100 font-mono">Active System Alerts</h3>
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono font-bold">
                {activeAlerts.length}
              </span>
            </div>
            <button
              onClick={() => setCurrentView('alerts')}
              className="text-xs text-cyan-400 hover:underline font-mono"
            >
              Alert Center →
            </button>
          </div>

          <div className="space-y-2.5">
            {activeAlerts.length === 0 ? (
              <div className="p-4 rounded-xl bg-surface-200 border border-surface-border text-center text-xs text-slate-400 font-mono">
                No active critical alerts. Motor operating within normal envelope.
              </div>
            ) : (
              activeAlerts.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-xl bg-surface-200 border border-surface-border flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={a.severity} />
                      <span className="font-semibold text-slate-200">{a.title}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-mono">{a.description}</p>
                  </div>
                  <button
                    onClick={() => setCurrentView('alerts')}
                    className="px-2.5 py-1 rounded bg-surface-hover text-slate-300 text-[11px] font-mono hover:text-white"
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* TinyML Classifier Overview Card */}
        <div className="bg-gradient-to-br from-surface-100 to-surface-200 border border-surface-border rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-purple-400">
            <BrainCircuit className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-100 font-mono">TinyML Engine Status</h3>
          </div>

          <div className="p-3 rounded-xl bg-surface-300/80 border border-surface-border space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Classification:</span>
              <span className="font-bold text-purple-300">{latestPrediction?.prediction}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Confidence:</span>
              <span className="font-bold text-emerald-400">{latestPrediction?.confidence}%</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Fault Signature:</span>
              <span className="text-slate-300 truncate max-w-[140px]">{latestPrediction?.fault_type}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Recommendation: {latestPrediction?.recommendation}
          </p>

          <button
            onClick={() => setCurrentView('ai')}
            className="w-full py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold transition-all text-center block"
          >
            Inspect AI Model Details →
          </button>
        </div>
      </div>
    </div>
  );
};
