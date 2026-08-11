import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Cpu, Plus, Wifi, CheckCircle2, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { Device } from '../types';

export const DevicesView: React.FC = () => {
  const { activeDevice, user } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  const [deviceList, setDeviceList] = useState<Device[]>([
    activeDevice,
    {
      id: 'dev-002',
      device_id: 'MOTOR-002',
      device_name: 'Secondary Test Rig',
      description: 'ESP32 DevKit V1 Node with MPU6050',
      motor_type: '3.7V DC Motor',
      location: 'Engineering Lab Station B',
      status: 'online',
      wifi_status: 'connected',
      firmware_version: 'v1.2.4',
      last_seen: new Date().toISOString(),
      created_at: '2026-08-05T00:00:00Z',
    },
    {
      id: 'dev-003',
      device_id: 'MOTOR-003',
      device_name: 'High-Torque Bench',
      description: 'Industrial Bearing Test Rig',
      motor_type: '12V DC Gear Motor',
      location: 'Vibration Testing Cell #3',
      status: 'maintenance',
      wifi_status: 'weak',
      firmware_version: 'v1.1.0',
      last_seen: new Date(Date.now() - 3600000).toISOString(),
      created_at: '2026-07-20T00:00:00Z',
    },
  ]);

  // Form for adding device
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newMotorType, setNewMotorType] = useState('3.7V DC Motor');
  const [newLocation, setNewLocation] = useState('Station C');

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    const newDev: Device = {
      id: `dev-${Date.now()}`,
      device_id: newDeviceId.toUpperCase(),
      device_name: newDeviceName,
      description: 'ESP32 Node registered via dashboard',
      motor_type: newMotorType,
      location: newLocation,
      status: 'online',
      wifi_status: 'connected',
      firmware_version: 'v1.2.4',
      last_seen: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setDeviceList([...deviceList, newDev]);
    setModalOpen(false);
    setNewDeviceId('');
    setNewDeviceName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center space-x-3">
            <Cpu className="w-7 h-7 text-cyan-400" />
            <span>IoT Devices Fleet Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Registered ESP32 Telemetry Nodes (`devices` table)
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs hover:brightness-110 shadow-glow-cyan transition-all font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Device</span>
          </button>
        )}
      </div>

      {/* Device Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        {deviceList.map((dev) => (
          <div
            key={dev.id}
            className="bg-surface-100 border border-surface-border hover:border-cyan-500/50 rounded-2xl p-5 shadow-xl space-y-4 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-100 text-base">{dev.device_id}</span>
              <StatusBadge status={dev.status} />
            </div>

            <div className="space-y-1 text-slate-300">
              <div className="font-bold text-sm text-cyan-400">{dev.device_name}</div>
              <p className="text-slate-400 text-[11px] font-sans">{dev.description}</p>
            </div>

            <div className="p-3 rounded-xl bg-surface-200 border border-surface-border space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Motor Type:</span>
                <span className="text-slate-200 font-semibold">{dev.motor_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="text-slate-200">{dev.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Wi-Fi Status:</span>
                <span className="text-blue-400 font-semibold uppercase">{dev.wifi_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Firmware:</span>
                <span className="text-purple-300">{dev.firmware_version}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Last Seen: {new Date(dev.last_seen).toLocaleTimeString()}</span>
              <span className="text-emerald-400 font-bold">● Active Stream</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal to Register Device */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-100 border border-surface-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3 font-mono">
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Register New ESP32 Node</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAddDevice} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Device ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MOTOR-004"
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                  className="w-full bg-surface-200 border border-surface-border rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Device Name</label>
                <input
                  type="text"
                  required
                  placeholder="PredictGuard Motor Node"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="w-full bg-surface-200 border border-surface-border rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Motor Type</label>
                <input
                  type="text"
                  required
                  value={newMotorType}
                  onChange={(e) => setNewMotorType(e.target.value)}
                  className="w-full bg-surface-200 border border-surface-border rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Location / Test Station</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-surface-200 border border-surface-border rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold hover:brightness-110 shadow-glow-cyan"
              >
                Create Device Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
