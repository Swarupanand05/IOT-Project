import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert, Filter, Clock } from 'lucide-react';
import { AlertSeverity, AlertStatus } from '../types';

export const AlertsView: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert, activeDevice } = useApp();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning' && a.status === 'active').length;
  const resolvedCount = alerts.filter((a) => a.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center space-x-3">
          <Bell className="w-7 h-7 text-amber-400" />
          <span>Industrial Alert Management Center</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Automated Threshold Breaches & TinyML Anomaly Notifications (Device: {activeDevice.device_id})
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-surface-100 border border-surface-border rounded-xl p-4 shadow-lg">
          <div className="text-slate-400 uppercase">Active Alerts</div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{activeCount}</div>
          <div className="text-[10px] text-slate-500">Requires Action</div>
        </div>
        <div className="bg-surface-100 border border-rose-500/30 rounded-xl p-4 shadow-lg bg-rose-500/5">
          <div className="text-rose-400 uppercase">Critical Alerts</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{criticalCount}</div>
          <div className="text-[10px] text-rose-300">Urgent Hardware Risk</div>
        </div>
        <div className="bg-surface-100 border border-amber-500/30 rounded-xl p-4 shadow-lg bg-amber-500/5">
          <div className="text-amber-400 uppercase">Warning Alerts</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{warningCount}</div>
          <div className="text-[10px] text-amber-300">Elevated Noise</div>
        </div>
        <div className="bg-surface-100 border border-emerald-500/30 rounded-xl p-4 shadow-lg bg-emerald-500/5">
          <div className="text-emerald-400 uppercase">Resolved Alerts</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{resolvedCount}</div>
          <div className="text-[10px] text-emerald-300">History Logged</div>
        </div>
      </div>

      {/* Alert List with Filters */}
      <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3 text-xs">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">Alert Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Severity filter */}
            <div className="flex bg-surface-200 p-0.5 rounded-lg border border-surface-border">
              {['all', 'critical', 'warning', 'info'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded capitalize transition-colors ${
                    filterSeverity === sev ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex bg-surface-200 p-0.5 rounded-lg border border-surface-border">
              {['all', 'active', 'acknowledged', 'resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded capitalize transition-colors ${
                    filterStatus === st ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts Stack */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-50" />
              No matching alerts found for current filters.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  alert.severity === 'critical'
                    ? 'bg-rose-500/5 border-rose-500/30 hover:border-rose-500/60'
                    : alert.severity === 'warning'
                    ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/60'
                    : 'bg-surface-200 border-surface-border'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className="mt-1">
                    {alert.severity === 'critical' ? (
                      <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={alert.severity} />
                      <span className="font-bold text-slate-100 text-sm">{alert.title}</span>
                      <StatusBadge status={alert.status} size="sm" />
                    </div>

                    <p className="text-slate-300 text-xs font-sans leading-relaxed">{alert.description}</p>

                    <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-mono pt-1">
                      <span>Timestamp: {new Date(alert.created_at).toLocaleString()}</span>
                      {alert.value !== undefined && <span>Measured: {alert.value.toFixed(2)}</span>}
                      {alert.threshold !== undefined && <span>Limit: {alert.threshold.toFixed(2)}</span>}
                    </div>
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="flex items-center space-x-2 shrink-0 font-mono text-xs w-full md:w-auto justify-end">
                  {alert.status === 'active' && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition-all"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== 'resolved' && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold transition-all"
                    >
                      Resolve Alert
                    </button>
                  )}
                  {alert.status === 'resolved' && (
                    <span className="text-[11px] text-slate-500 italic">
                      Resolved {alert.resolved_at ? new Date(alert.resolved_at).toLocaleTimeString() : ''}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
