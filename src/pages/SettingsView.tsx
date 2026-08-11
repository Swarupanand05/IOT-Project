import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Sliders, Bell, Cloud, User, ShieldCheck, Save, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { thresholds, setThresholds, user, activeDevice } = useApp();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [warningVib, setWarningVib] = useState(thresholds.warningVibration);
  const [criticalVib, setCriticalVib] = useState(thresholds.criticalVibration);
  const [tempThresh, setTempThresh] = useState(thresholds.temperatureThreshold);

  // Cloud Config Inputs
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(import.meta.env.VITE_SUPABASE_URL || 'https://predictguard-ai.supabase.co');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '');

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalBuzzer, setCriticalBuzzer] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setThresholds({
      warningVibration: warningVib,
      criticalVibration: criticalVib,
      temperatureThreshold: tempThresh,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center space-x-3">
          <Settings className="w-7 h-7 text-cyan-400" />
          <span>System Settings & Parameter Tuning</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Vibration Threshold Limits, Cloud Credentials & Notification Preferences
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Threshold configurations saved and applied across dashboard real-time charts!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Vibration Thresholds */}
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2 border-b border-surface-border pb-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Vibration & Thermal Anomaly Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 mb-1">Warning Vibration Limit (m/s²)</label>
              <input
                type="number"
                step="0.1"
                value={warningVib}
                onChange={(e) => setWarningVib(Number(e.target.value))}
                className="w-full bg-surface-200 border border-surface-border rounded-lg p-2.5 text-slate-100 focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500">Triggers Yellow Warning</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Critical Fault Limit (m/s²)</label>
              <input
                type="number"
                step="0.1"
                value={criticalVib}
                onChange={(e) => setCriticalVib(Number(e.target.value))}
                className="w-full bg-surface-200 border border-surface-border rounded-lg p-2.5 text-slate-100 focus:border-rose-500"
              />
              <span className="text-[10px] text-slate-500">Triggers Red Alert & Buzzer</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Thermal Limit (°C)</label>
              <input
                type="number"
                step="0.5"
                value={tempThresh}
                onChange={(e) => setTempThresh(Number(e.target.value))}
                className="w-full bg-surface-200 border border-surface-border rounded-lg p-2.5 text-slate-100 focus:border-orange-500"
              />
              <span className="text-[10px] text-slate-500">Enclosure Overheat Cutoff</span>
            </div>
          </div>
        </div>

        {/* Section 2: Notifications */}
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2 border-b border-surface-border pb-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <span>Notification & Alert System Options</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-200 border border-surface-border cursor-pointer">
              <div>
                <div className="font-bold text-slate-200">Email Anomaly Digest</div>
                <div className="text-[11px] text-slate-400">Send critical vibration fault reports to operator email</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-200 border border-surface-border cursor-pointer">
              <div>
                <div className="font-bold text-slate-200">ESP32 Hardware Buzzer Alarm</div>
                <div className="text-[11px] text-slate-400">Sound physical buzzer on critical fault classification</div>
              </div>
              <input
                type="checkbox"
                checked={criticalBuzzer}
                onChange={(e) => setCriticalBuzzer(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
            </label>
          </div>
        </div>

        {/* Section 3: Cloud Credentials */}
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2 border-b border-surface-border pb-2">
            <Cloud className="w-4 h-4 text-purple-400" />
            <span>Supabase Cloud Integration Parameters</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 mb-1">VITE_SUPABASE_URL</label>
              <input
                type="text"
                value={supabaseUrlInput}
                onChange={(e) => setSupabaseUrlInput(e.target.value)}
                className="w-full bg-surface-200 border border-surface-border rounded-lg p-2.5 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">VITE_SUPABASE_ANON_KEY</label>
              <input
                type="password"
                value={supabaseKeyInput}
                onChange={(e) => setSupabaseKeyInput(e.target.value)}
                className="w-full bg-surface-200 border border-surface-border rounded-lg p-2.5 text-slate-100"
              />
              <span className="text-[10px] text-slate-500">Anon key only. Service role keys are never stored in client.</span>
            </div>
          </div>
        </div>

        {/* Section 4: Account Information */}
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2 border-b border-surface-border pb-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span>User Account & Security Role</span>
          </h3>

          <div className="p-3 bg-surface-200 rounded-xl space-y-1 text-slate-300">
            <div>Logged in as: <span className="font-bold text-slate-100">{user?.full_name}</span></div>
            <div>Email: <span className="text-cyan-400">{user?.email}</span></div>
            <div>Role Permission: <span className="font-bold uppercase text-purple-400">{user?.role}</span></div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-sm hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>SAVE SYSTEM SETTINGS</span>
        </button>
      </form>
    </div>
  );
};
