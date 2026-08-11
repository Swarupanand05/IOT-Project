import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Wrench, Calendar, Plus, ShieldCheck, Clock, User, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { MaintenanceRecord } from '../types';

export const MaintenanceView: React.FC = () => {
  const { maintenanceRecords, addMaintenanceRecord, user, activeDevice, latestReading } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  // Form state for adding record
  const [maintType, setMaintType] = useState('Bearing Lubrication & Alignment');
  const [description, setDescription] = useState('');
  const [performedBy, setPerformedBy] = useState(user?.full_name || 'Eng. Alex Vance');
  const [maintDate, setMaintDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState('2026-08-26');
  const [notes, setNotes] = useState('');

  const currentMag = latestReading?.vibration_magnitude ?? 9.8;
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - (currentMag > 9.8 ? (currentMag - 9.8) * 12 : 0))));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMaintenanceRecord({
      device_id: activeDevice.device_id,
      maintenance_type: maintType,
      description,
      performed_by: performedBy,
      maintenance_date: maintDate,
      next_due_date: nextDueDate,
      notes,
    });
    setModalOpen(false);
    setDescription('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center space-x-3">
            <Wrench className="w-7 h-7 text-cyan-400" />
            <span>Predictive Maintenance Planner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            RUL (Remaining Useful Life) Estimation & Maintenance Audit Logs
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'operator') && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs hover:brightness-110 shadow-glow-cyan transition-all font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>Log Maintenance Record</span>
          </button>
        )}
      </div>

      {/* 5 Predictive Maintenance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 font-mono text-xs">
        <div className="bg-surface-100 border border-surface-border rounded-xl p-4 shadow-lg">
          <div className="text-slate-400 uppercase">Current Machine Health</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{healthScore}%</div>
          <div className="text-[10px] text-slate-500">Vibration Index</div>
        </div>
        <div className="bg-surface-100 border border-surface-border rounded-xl p-4 shadow-lg">
          <div className="text-slate-400 uppercase">Maintenance Risk</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {healthScore >= 85 ? 'LOW' : healthScore >= 60 ? 'MEDIUM' : 'HIGH'}
          </div>
          <div className="text-[10px] text-slate-500">Risk Assessment</div>
        </div>
        <div className="bg-surface-100 border border-surface-border rounded-xl p-4 shadow-lg">
          <div className="text-slate-400 uppercase">Recommended Inspection</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">15 Days</div>
          <div className="text-[10px] text-slate-500">RUL Window</div>
        </div>
        <div className="bg-surface-100 border border-surface-border rounded-xl p-4 shadow-lg">
          <div className="text-slate-400 uppercase">Last Serviced</div>
          <div className="text-sm font-bold text-slate-200 mt-2">01 Aug 2026</div>
          <div className="text-[10px] text-slate-500">Routine Check</div>
        </div>
        <div className="bg-surface-100 border border-surface-border rounded-xl p-4 shadow-lg">
          <div className="text-slate-400 uppercase">Next Service Due</div>
          <div className="text-sm font-bold text-amber-400 mt-2">16 Aug 2026</div>
          <div className="text-[10px] text-amber-300">Scheduled Target</div>
        </div>
      </div>

      {/* Maintenance History Table */}
      <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Maintenance History (`maintenance_records` table)</span>
          </h3>
          <span className="text-slate-400 text-[11px]">{maintenanceRecords.length} records on file</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Maintenance Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Performed By</th>
                <th className="py-2.5 px-3">Next Due Date</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-slate-300 text-[11px]">
              {maintenanceRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-surface-hover">
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{rec.maintenance_date}</td>
                  <td className="py-2.5 px-3 text-slate-100 font-semibold">{rec.maintenance_type}</td>
                  <td className="py-2.5 px-3 max-w-xs">{rec.description}</td>
                  <td className="py-2.5 px-3 text-purple-300">{rec.performed_by}</td>
                  <td className="py-2.5 px-3 text-amber-400 font-bold">{rec.next_due_date}</td>
                  <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">{rec.notes || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Maintenance Record Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-100 border border-surface-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="font-bold text-sm text-slate-100 font-mono flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>Log Maintenance Entry</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white font-mono text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Maintenance Type</label>
                <input
                  type="text"
                  required
                  value={maintType}
                  onChange={(e) => setMaintType(e.target.value)}
                  className="w-full bg-surface-200 border border-surface-border rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description of Work Done</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Replaced MPU6050 vibration dampener foam and torqued motor mounting bracket."
                  className="w-full bg-surface-200 border border-surface-border rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Performed By</label>
                  <input
                    type="text"
                    required
                    value={performedBy}
                    onChange={(e) => setPerformedBy(e.target.value)}
                    className="w-full bg-surface-200 border border-surface-border rounded-lg p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Date Performed</label>
                  <input
                    type="date"
                    required
                    value={maintDate}
                    onChange={(e) => setMaintDate(e.target.value)}
                    className="w-full bg-surface-200 border border-surface-border rounded-lg p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Next Service Due Date</label>
                <input
                  type="date"
                  required
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full bg-surface-200 border border-surface-border rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Notes / Observations</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes"
                  className="w-full bg-surface-200 border border-surface-border rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold hover:brightness-110 shadow-glow-cyan"
              >
                Save Record to Supabase
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
