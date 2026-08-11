-- ========================================================
-- PredictGuard AI Database Migration Schema
-- Project: AI-Based Predictive Maintenance Using Vibration Analysis
-- Target: Supabase / PostgreSQL
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- 1. PROFILES TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operator', 'viewer')) DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for User lookup
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- --------------------------------------------------------
-- 2. DEVICES TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT UNIQUE NOT NULL,
  device_name TEXT NOT NULL,
  description TEXT,
  motor_type TEXT NOT NULL DEFAULT '3.7V DC Motor',
  location TEXT DEFAULT 'Industrial Test Bench #1',
  status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'maintenance', 'warning', 'critical')) DEFAULT 'online',
  wifi_status TEXT NOT NULL CHECK (wifi_status IN ('connected', 'disconnected', 'weak')) DEFAULT 'connected',
  firmware_version TEXT NOT NULL DEFAULT 'v1.0.0',
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_device_id ON public.devices(device_id);

-- Seed initial device
INSERT INTO public.devices (device_id, device_name, description, motor_type, location, status, wifi_status, firmware_version)
VALUES ('MOTOR-001', 'PredictGuard Motor Node', 'ESP32 + MPU6050 + L298N Test Node', '3.7V DC Motor', 'Engineering Lab Station A', 'online', 'connected', 'v1.2.4')
ON CONFLICT (device_id) DO NOTHING;

-- --------------------------------------------------------
-- 3. SENSOR READINGS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES public.devices(device_id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acceleration_x NUMERIC(8, 4) NOT NULL,
  acceleration_y NUMERIC(8, 4) NOT NULL,
  acceleration_z NUMERIC(8, 4) NOT NULL,
  vibration_magnitude NUMERIC(8, 4) NOT NULL,
  rms_vibration NUMERIC(8, 4) NOT NULL,
  peak_vibration NUMERIC(8, 4) NOT NULL,
  temperature NUMERIC(5, 2) NOT NULL DEFAULT 25.0,
  motor_speed INT NOT NULL DEFAULT 0,
  pwm_value INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes for Time Series Queries
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_time ON public.sensor_readings (device_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_created ON public.sensor_readings (created_at DESC);

-- --------------------------------------------------------
-- 4. AI PREDICTIONS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES public.devices(device_id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prediction TEXT NOT NULL, -- Healthy, Warning, Unbalance, Loose Mounting, Bearing Wear, Critical Fault
  confidence NUMERIC(5, 2) NOT NULL,
  healthy_probability NUMERIC(5, 2) NOT NULL,
  warning_probability NUMERIC(5, 2) NOT NULL,
  fault_probability NUMERIC(5, 2) NOT NULL,
  fault_type TEXT NOT NULL DEFAULT 'None',
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Low',
  recommendation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_predictions_device_time ON public.ai_predictions (device_id, timestamp DESC);

-- --------------------------------------------------------
-- 5. ALERTS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES public.devices(device_id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('vibration', 'temperature', 'motor', 'ai_prediction', 'device', 'system')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  value NUMERIC(8, 4),
  threshold NUMERIC(8, 4),
  status TEXT NOT NULL CHECK (status IN ('active', 'acknowledged', 'resolved')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_device_status ON public.alerts (device_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON public.alerts (created_at DESC);

-- --------------------------------------------------------
-- 6. MAINTENANCE RECORDS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES public.devices(device_id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL, -- Inspection, Lubrication, Bearing Replacement, Alignment, General Servicing
  description TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  maintenance_date DATE NOT NULL,
  next_due_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_device ON public.maintenance_records (device_id, maintenance_date DESC);

-- --------------------------------------------------------
-- 7. MOTOR COMMANDS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.motor_commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES public.devices(device_id) ON DELETE CASCADE,
  command TEXT NOT NULL CHECK (command IN ('START', 'STOP', 'SET_SPEED')),
  speed_percentage INT CHECK (speed_percentage BETWEEN 0 AND 100),
  pwm_value INT CHECK (pwm_value BETWEEN 0 AND 255),
  requested_by TEXT NOT NULL DEFAULT 'Operator',
  status TEXT NOT NULL CHECK (status IN ('pending', 'executed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_motor_commands_device_status ON public.motor_commands (device_id, status);

-- --------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motor_commands ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view devices and telemetry
CREATE POLICY "Allow public read access to devices" ON public.devices FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read to sensor_readings" ON public.sensor_readings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read to ai_predictions" ON public.ai_predictions FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read to alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read to maintenance_records" ON public.maintenance_records FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read to motor_commands" ON public.motor_commands FOR SELECT USING (true);
CREATE POLICY "Allow authenticated user write access to motor_commands" ON public.motor_commands FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated user write access to alerts" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated user update access to alerts" ON public.alerts FOR UPDATE USING (true);

-- --------------------------------------------------------
-- SUPABASE REALTIME CONFIGURATION
-- --------------------------------------------------------
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.sensor_readings, 
    public.ai_predictions, 
    public.alerts, 
    public.devices, 
    public.motor_commands;
COMMIT;
