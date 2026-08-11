import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Wifi,
  WifiOff,
  Bell,
  User,
  Sliders,
  Radio,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DemoStateMode } from '../../lib/demoEngine';

interface NavbarProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const {
    isLiveMode,
    setIsLiveMode,
    activeDevice,
    unreadAlertCount,
    alerts,
    user,
    setAuthModalOpen,
    setUser,
    demoFaultMode,
    setDemoFaultMode,
    lastUpdated,
    setCurrentView,
  } = useApp();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const activeAlertsList = alerts.filter((a) => a.status === 'active');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'warning':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'critical':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0B0F17]/90 backdrop-blur-md border-b border-surface-border px-4 py-2.5 flex items-center justify-between transition-all">
      {/* Left: Mobile Menu Button & Brand Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMobileMenuToggle}
          className="p-1.5 rounded-lg lg:hidden text-slate-400 hover:text-slate-100 hover:bg-surface-hover transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-glow-cyan">
            <div className="w-full h-full bg-[#0B0F17] rounded-[7px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                PredictGuard AI
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                v1.2 IoT
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-slate-400 tracking-wide font-medium">
              Vibration Predictive Maintenance Engine
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Hardware Status Badges & Mode Selector */}
      <div className="hidden md:flex items-center space-x-3">
        {/* Device Status */}
        <div className={`flex items-center space-x-1.5 text-xs font-mono px-2.5 py-1 rounded-full border ${getStatusColor(activeDevice.status)} shadow-sm`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold">{activeDevice.device_id}</span>
          <span className="uppercase text-[10px] text-slate-300">({activeDevice.status})</span>
        </div>

        {/* Wi-Fi Status */}
        <div className="flex items-center space-x-1.5 text-xs font-mono px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400">
          <Wifi className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span className="font-semibold text-[11px]">CONNECTED</span>
        </div>

        {/* Dynamic Timestamp */}
        <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono bg-surface-100 px-2.5 py-1 rounded-md border border-surface-border">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{lastUpdated}</span>
        </div>

        {/* Live vs. Demo Mode Toggle Switch */}
        <div className="flex items-center bg-surface-100 p-0.5 rounded-lg border border-surface-border">
          <button
            onClick={() => setIsLiveMode(false)}
            className={`flex items-center space-x-1 text-xs font-mono px-2.5 py-1 rounded-md transition-all ${
              !isLiveMode
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-glow-amber'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>DEMO MODE</span>
          </button>
          <button
            onClick={() => setIsLiveMode(true)}
            className={`flex items-center space-x-1 text-xs font-mono px-2.5 py-1 rounded-md transition-all ${
              isLiveMode
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-bold shadow-glow-green'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-3 h-3" />
            <span>LIVE MODE</span>
          </button>
        </div>

        {/* Demo Anomaly Trigger Dropdown (when Demo Mode active) */}
        {!isLiveMode && (
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center space-x-1.5 text-xs font-mono px-2.5 py-1 rounded-md bg-surface-hover border border-surface-border text-amber-300 hover:border-amber-500/50 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="capitalize font-medium">Fault Sim: {demoFaultMode.replace('_', ' ')}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-100 border border-surface-border rounded-lg shadow-2xl z-50 py-1 font-mono text-xs">
                <div className="px-3 py-1.5 text-[10px] text-slate-400 uppercase font-semibold border-b border-surface-border">
                  Inject Hardware Anomaly
                </div>
                {(['healthy', 'warning', 'unbalance', 'loose_mounting', 'bearing_wear', 'critical'] as DemoStateMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setDemoFaultMode(mode);
                      setDemoMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-surface-hover capitalize flex items-center justify-between ${
                      demoFaultMode === mode ? 'text-cyan-400 font-bold bg-cyan-500/10' : 'text-slate-300'
                    }`}
                  >
                    <span>{mode.replace('_', ' ')}</span>
                    {demoFaultMode === mode && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center space-x-3">
        {/* Notification Bell Icon */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface-hover transition-colors"
            aria-label="View Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadAlertCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-glow-red animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Notifications Popover Drawer */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-100 border border-surface-border rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3 bg-surface-200 border-b border-surface-border flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-sm text-slate-100">Notifications</span>
                  <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-mono">
                    {unreadAlertCount} Active
                  </span>
                </div>
                <button
                  onClick={() => setCurrentView('alerts')}
                  className="text-xs text-cyan-400 hover:underline font-mono"
                >
                  View All
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-surface-border/50">
                {activeAlertsList.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                    No active critical system alerts.
                  </div>
                ) : (
                  activeAlertsList.map((alert) => (
                    <div key={alert.id} className="p-3 hover:bg-surface-hover transition-colors flex items-start space-x-3">
                      <div className="mt-0.5">
                        {alert.severity === 'critical' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">{alert.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1 line-clamp-2 text-[11px]">{alert.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center">
              <User className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-200 leading-tight">{user?.full_name || 'Guest User'}</div>
              <div className="text-[10px] text-cyan-400 uppercase font-mono leading-tight">{user?.role || 'operator'}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-100 border border-surface-border rounded-xl shadow-2xl z-50 py-1.5 text-xs">
              <div className="px-4 py-2 border-b border-surface-border">
                <p className="font-semibold text-slate-100">{user?.full_name}</p>
                <p className="text-[11px] text-slate-400 font-mono">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setCurrentView('settings');
                  setUserDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-surface-hover text-slate-300 flex items-center space-x-2"
              >
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Account Settings</span>
              </button>
              <button
                onClick={() => {
                  setAuthModalOpen(true);
                  setUserDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-surface-hover text-cyan-400 flex items-center space-x-2 border-t border-surface-border/50"
              >
                <User className="w-4 h-4" />
                <span>Switch / Login Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
