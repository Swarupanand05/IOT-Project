export type DeviceStatus = 'online' | 'offline' | 'maintenance' | 'warning' | 'critical';
export type WifiStatus = 'connected' | 'disconnected' | 'weak';
export type UserRole = 'admin' | 'operator' | 'viewer';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type AlertType = 'vibration' | 'temperature' | 'motor' | 'ai_prediction' | 'device' | 'system';
export type FaultSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type MachineCondition = 'Healthy' | 'Warning' | 'Unbalance' | 'Loose Mounting' | 'Bearing Wear' | 'Critical Fault';
export type CommandStatus = 'pending' | 'executed' | 'failed';
export type MotorAction = 'START' | 'STOP' | 'SET_SPEED';

export type ViewType =
  | 'dashboard'
  | 'live'
  | 'vibration'
  | 'ai'
  | 'motor'
  | 'history'
  | 'alerts'
  | 'maintenance'
  | 'devices'
  | 'system'
  | 'settings';

export interface Device {
  id: string;
  device_id: string;
  device_name: string;
  description: string;
  motor_type: string;
  location: string;
  status: DeviceStatus;
  wifi_status: WifiStatus;
  firmware_version: string;
  last_seen: string;
  created_at: string;
}

export interface SensorReading {
  id: string;
  device_id: string;
  timestamp: string;
  acceleration_x: number;
  acceleration_y: number;
  acceleration_z: number;
  vibration_magnitude: number;
  rms_vibration: number;
  peak_vibration: number;
  temperature: number;
  motor_speed: number;
  pwm_value: number;
  created_at?: string;
}

export interface AiPrediction {
  id: string;
  device_id: string;
  timestamp: string;
  prediction: MachineCondition;
  confidence: number;
  healthy_probability: number;
  warning_probability: number;
  fault_probability: number;
  fault_type: string;
  severity: FaultSeverity;
  recommendation: string;
  created_at?: string;
}

export interface Alert {
  id: string;
  device_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  value?: number;
  threshold?: number;
  status: AlertStatus;
  created_at: string;
  resolved_at?: string | null;
}

export interface MaintenanceRecord {
  id: string;
  device_id: string;
  maintenance_type: string;
  description: string;
  performed_by: string;
  maintenance_date: string;
  next_due_date: string;
  notes?: string;
  created_at?: string;
}

export interface MotorCommand {
  id: string;
  device_id: string;
  command: MotorAction;
  speed_percentage?: number;
  pwm_value?: number;
  requested_by: string;
  status: CommandStatus;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface ThresholdConfig {
  warningVibration: number; // default: 11.0 m/s²
  criticalVibration: number; // default: 14.0 m/s²
  temperatureThreshold: number; // default: 45.0 °C
}
