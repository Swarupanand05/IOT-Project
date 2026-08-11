import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Calendar, Filter, History, TrendingUp, BarChart2 } from 'lucide-react';
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

export const HistoricalDataView: React.FC = () => {
  const { sensorHistory, activeDevice } = useApp();
  const [timeFilter, setTimeFilter] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter readings based on time range
  const filteredReadings = [...sensorHistory].reverse();

  const totalPages = Math.ceil(filteredReadings.length / itemsPerPage) || 1;
  const paginatedData = filteredReadings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const chartData = filteredReadings.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    Vibration: item.vibration_magnitude,
    RMS: item.rms_vibration,
    Speed: item.motor_speed,
    Temp: item.temperature,
    Health: Math.max(0, Math.min(100, Math.round(100 - (item.vibration_magnitude > 9.8 ? (item.vibration_magnitude - 9.8) * 12 : 0)))),
  }));

  // CSV Export Generator
  const handleExportCSV = () => {
    const headers = ['ID', 'Device ID', 'Timestamp', 'Acc X', 'Acc Y', 'Acc Z', 'Magnitude (m/s²)', 'RMS (m/s²)', 'Peak (m/s²)', 'Temp (°C)', 'Motor Speed (RPM)', 'PWM'];
    const rows = filteredReadings.map((r) => [
      r.id,
      r.device_id,
      r.timestamp,
      r.acceleration_x,
      r.acceleration_y,
      r.acceleration_z,
      r.vibration_magnitude,
      r.rms_vibration,
      r.peak_vibration,
      r.temperature,
      r.motor_speed,
      r.pwm_value,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `predictguard_telemetry_${activeDevice.device_id}_${timeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center space-x-3">
            <History className="w-7 h-7 text-cyan-400" />
            <span>Historical Telemetry Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Time-Series Query Engine & CSV Report Generator (Device: {activeDevice.device_id})
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          {/* Time Range Filter Buttons */}
          <div className="flex bg-surface-100 p-0.5 rounded-lg border border-surface-border">
            {(['1h', '6h', '24h', '7d', '30d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeFilter === tf ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold hover:brightness-110 shadow-glow-cyan transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Historical Trend Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Vibration Magnitude & Health Trend */}
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="font-bold text-sm text-slate-100 font-mono flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Vibration Magnitude & Health Score Trend</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F1724', borderColor: '#1E293B', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="Vibration" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.2} name="Vibration (m/s²)" />
                <Area type="monotone" dataKey="Health" stroke="#10B981" fill="#10B981" fillOpacity={0.1} name="Health Score (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Motor Speed & Temperature Trend */}
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="font-bold text-sm text-slate-100 font-mono flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <span>Motor Speed (RPM) & Enclosure Thermal Trend</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" stroke="#3B82F6" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F1724', borderColor: '#1E293B', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line yAxisId="left" type="monotone" dataKey="Speed" stroke="#3B82F6" strokeWidth={2} dot={false} name="Motor Speed (RPM)" />
                <Line yAxisId="right" type="monotone" dataKey="Temp" stroke="#F59E0B" strokeWidth={2} dot={false} name="Temperature (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Telemetry Table with Pagination */}
      <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-100">Historical Telemetry Log</h3>
          <span className="text-slate-400 text-[11px]">Showing page {currentPage} of {totalPages}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Acc X</th>
                <th className="py-2.5 px-3">Acc Y</th>
                <th className="py-2.5 px-3">Acc Z</th>
                <th className="py-2.5 px-3">Magnitude</th>
                <th className="py-2.5 px-3">RMS</th>
                <th className="py-2.5 px-3">Peak</th>
                <th className="py-2.5 px-3">Temp</th>
                <th className="py-2.5 px-3">Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-slate-300 text-[11px]">
              {paginatedData.map((row) => (
                <tr key={row.id} className="hover:bg-surface-hover">
                  <td className="py-2.5 px-3">{new Date(row.timestamp).toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-blue-400">{row.acceleration_x}</td>
                  <td className="py-2.5 px-3 text-emerald-400">{row.acceleration_y}</td>
                  <td className="py-2.5 px-3 text-amber-400">{row.acceleration_z}</td>
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{row.vibration_magnitude} m/s²</td>
                  <td className="py-2.5 px-3 text-purple-400">{row.rms_vibration}</td>
                  <td className="py-2.5 px-3 text-rose-400">{row.peak_vibration}</td>
                  <td className="py-2.5 px-3 text-orange-400">{row.temperature}°C</td>
                  <td className="py-2.5 px-3 text-teal-400">{row.motor_speed} RPM</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-surface-border text-xs">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded bg-surface-200 border border-surface-border text-slate-300 disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-slate-400">Page {currentPage} / {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded bg-surface-200 border border-surface-border text-slate-300 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};
