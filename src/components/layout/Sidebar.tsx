import React from 'react';
import { useApp } from '../../context/AppContext';
import { ViewType } from '../../types';
import {
  LayoutDashboard,
  Activity,
  LineChart,
  BrainCircuit,
  Sliders,
  History,
  Bell,
  Wrench,
  Cpu,
  Info,
  Settings,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentView, setCurrentView, unreadAlertCount } = useApp();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Monitoring', icon: Activity },
    { id: 'vibration', label: 'Vibration Analysis', icon: LineChart },
    { id: 'ai', label: 'AI Prediction', icon: BrainCircuit, highlight: true },
    { id: 'motor', label: 'Motor Control', icon: Sliders },
    { id: 'history', label: 'Historical Data', icon: History },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadAlertCount > 0 ? unreadAlertCount : undefined },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'devices', label: 'Devices', icon: Cpu },
    { id: 'system', label: 'System Information', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (viewId: ViewType) => {
    setCurrentView(viewId);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B0F17] border-r border-surface-border flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-auto`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center">
              <Activity className="w-4 h-4 text-black font-bold" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-100 tracking-wide font-mono">PredictGuard AI</h1>
              <p className="text-[10px] text-cyan-400 font-mono">ESP32 + TinyML Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-surface-border">
          <div className="px-3 mb-2 text-[10px] font-mono font-semibold uppercase text-slate-400 tracking-wider">
            Industrial Control
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-surface-hover border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {item.highlight && !isActive && (
                    <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                  )}
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-rose-500 text-white shadow-glow-red">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer Info Box */}
        <div className="p-3 border-t border-surface-border bg-surface-200/50 m-3 rounded-xl">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold">Hardware Stack:</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono leading-relaxed">
            ESP32 • MPU6050 • L298N • OLED • Potentiometer
          </p>
        </div>
      </aside>
    </>
  );
};
