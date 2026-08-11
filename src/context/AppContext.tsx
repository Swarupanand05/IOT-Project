import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ViewType,
  Device,
  SensorReading,
  AiPrediction,
  Alert,
  MaintenanceRecord,
  MotorCommand,
  UserProfile,
  ThresholdConfig,
} from '../types';
import { demoEngine, DemoStateMode } from '../lib/demoEngine';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AppContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  isLiveMode: boolean;
  setIsLiveMode: (live: boolean) => void;
  activeDevice: Device;
  latestReading: SensorReading | null;
  sensorHistory: SensorReading[];
  latestPrediction: AiPrediction | null;
  aiHistory: AiPrediction[];
  alerts: Alert[];
  unreadAlertCount: number;
  maintenanceRecords: MaintenanceRecord[];
  motorCommands: MotorCommand[];
  thresholds: ThresholdConfig;
  setThresholds: React.Dispatch<React.SetStateAction<ThresholdConfig>>;
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  demoFaultMode: DemoStateMode;
  setDemoFaultMode: (mode: DemoStateMode) => void;
  sendCommand: (command: 'START' | 'STOP' | 'SET_SPEED', speedPct?: number) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  addMaintenanceRecord: (rec: Omit<MaintenanceRecord, 'id' | 'created_at'>) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  lastUpdated: string;
}

const defaultThresholds: ThresholdConfig = {
  warningVibration: 11.0,
  criticalVibration: 14.0,
  temperatureThreshold: 45.0,
};

const defaultUser: UserProfile = {
  id: 'usr-admin-01',
  user_id: 'admin-uuid',
  full_name: 'Dr. Robert Vance (Lead Engineer)',
  email: 'admin@predictguard.ai',
  role: 'admin',
  created_at: new Date().toISOString(),
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [activeDevice, setActiveDevice] = useState<Device>(demoEngine.getDeviceInfo());
  const [sensorHistory, setSensorHistory] = useState<SensorReading[]>(demoEngine.getSensorHistory());
  const [latestReading, setLatestReading] = useState<SensorReading | null>(sensorHistory[0] || null);
  const [aiHistory, setAiHistory] = useState<AiPrediction[]>(demoEngine.getAiHistory());
  const [latestPrediction, setLatestPrediction] = useState<AiPrediction | null>(aiHistory[0] || null);
  const [alerts, setAlerts] = useState<Alert[]>(demoEngine.getActiveAlerts());
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(demoEngine.getMaintenanceRecords());
  const [motorCommands, setMotorCommands] = useState<MotorCommand[]>(demoEngine.getCommandQueue());
  const [thresholds, setThresholds] = useState<ThresholdConfig>(defaultThresholds);
  const [user, setUser] = useState<UserProfile | null>(defaultUser);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [demoFaultMode, setDemoFaultModeState] = useState<DemoStateMode>('healthy');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  const unreadAlertCount = alerts.filter((a) => a.status === 'active').length;

  const setDemoFaultMode = (mode: DemoStateMode) => {
    setDemoFaultModeState(mode);
    demoEngine.setMode(mode);
  };

  // Demo telemetry generator loop (500ms interval)
  useEffect(() => {
    if (isLiveMode || isPaused) return;

    const interval = setInterval(() => {
      const reading = demoEngine.generateNextReading();
      const prediction = demoEngine.generatePrediction(reading);

      setLatestReading(reading);
      setLatestPrediction(prediction);
      setSensorHistory([...demoEngine.getSensorHistory()]);
      setAiHistory([...demoEngine.getAiHistory()]);
      setAlerts([...demoEngine.getActiveAlerts()]);
      setMotorCommands([...demoEngine.getCommandQueue()]);
      setActiveDevice(demoEngine.getDeviceInfo());
      setLastUpdated(new Date().toLocaleTimeString());
    }, 500);

    return () => clearInterval(interval);
  }, [isLiveMode, isPaused]);

  // Supabase Realtime Subscription when Live Mode is ON
  useEffect(() => {
    if (!isLiveMode || !isSupabaseConfigured()) return;

    // Fetch initial device info
    supabase
      .from('devices')
      .select('*')
      .eq('device_id', 'MOTOR-001')
      .single()
      .then(({ data }) => {
        if (data) setActiveDevice(data);
      });

    // Fetch initial readings
    supabase
      .from('sensor_readings')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSensorHistory(data);
          setLatestReading(data[0]);
        }
      });

    // Subscribe to sensor_readings stream
    const channel = supabase
      .channel('realtime_sensor_readings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
        (payload) => {
          const newReading = payload.new as SensorReading;
          setLatestReading(newReading);
          setSensorHistory((prev) => [newReading, ...prev.slice(0, 100)]);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ai_predictions' },
        (payload) => {
          const newPred = payload.new as AiPrediction;
          setLatestPrediction(newPred);
          setAiHistory((prev) => [newPred, ...prev.slice(0, 50)]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          const newAlert = payload.new as Alert;
          setAlerts((prev) => [newAlert, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLiveMode]);

  const sendCommand = useCallback((command: 'START' | 'STOP' | 'SET_SPEED', speedPct?: number) => {
    if (!isLiveMode) {
      demoEngine.sendMotorCommand(command, speedPct);
      setMotorCommands([...demoEngine.getCommandQueue()]);
    } else {
      // Send command to Supabase table
      const pwm = speedPct !== undefined ? Math.round((speedPct / 100) * 255) : 0;
      supabase.from('motor_commands').insert({
        device_id: activeDevice.device_id,
        command,
        speed_percentage: speedPct,
        pwm_value: pwm,
        requested_by: user?.full_name || 'Operator',
        status: 'pending',
      }).then(() => {
        // Refresh command list
        supabase.from('motor_commands').select('*').order('created_at', { ascending: false }).limit(20)
          .then(({ data }) => {
            if (data) setMotorCommands(data);
          });
      });
    }
  }, [isLiveMode, activeDevice, user]);

  const acknowledgeAlert = useCallback((id: string) => {
    if (!isLiveMode) {
      demoEngine.acknowledgeAlert(id);
      setAlerts([...demoEngine.getActiveAlerts()]);
    } else {
      supabase.from('alerts').update({ status: 'acknowledged' }).eq('id', id).then(() => {
        setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'acknowledged' } : a)));
      });
    }
  }, [isLiveMode]);

  const resolveAlert = useCallback((id: string) => {
    if (!isLiveMode) {
      demoEngine.resolveAlert(id);
      setAlerts([...demoEngine.getActiveAlerts()]);
    } else {
      const resolved_at = new Date().toISOString();
      supabase.from('alerts').update({ status: 'resolved', resolved_at }).eq('id', id).then(() => {
        setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'resolved', resolved_at } : a)));
      });
    }
  }, [isLiveMode]);

  const addMaintenanceRecord = useCallback((rec: Omit<MaintenanceRecord, 'id' | 'created_at'>) => {
    if (!isLiveMode) {
      demoEngine.addMaintenanceRecord(rec);
      setMaintenanceRecords([...demoEngine.getMaintenanceRecords()]);
    } else {
      supabase.from('maintenance_records').insert({
        ...rec,
        device_id: activeDevice.device_id,
      }).then(({ data, error }) => {
        if (!error) {
          supabase.from('maintenance_records').select('*').order('maintenance_date', { ascending: false })
            .then(({ data }) => {
              if (data) setMaintenanceRecords(data);
            });
        }
      });
    }
  }, [isLiveMode, activeDevice]);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        isLiveMode,
        setIsLiveMode,
        activeDevice,
        latestReading,
        sensorHistory,
        latestPrediction,
        aiHistory,
        alerts,
        unreadAlertCount,
        maintenanceRecords,
        motorCommands,
        thresholds,
        setThresholds,
        user,
        setUser,
        authModalOpen,
        setAuthModalOpen,
        demoFaultMode,
        setDemoFaultMode,
        sendCommand,
        acknowledgeAlert,
        resolveAlert,
        addMaintenanceRecord,
        isPaused,
        setIsPaused,
        lastUpdated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
