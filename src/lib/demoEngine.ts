import {
  SensorReading,
  AiPrediction,
  Alert,
  MaintenanceRecord,
  MotorCommand,
  Device,
  MachineCondition,
  FaultSeverity,
} from '../types';

export type DemoStateMode = 'healthy' | 'warning' | 'unbalance' | 'loose_mounting' | 'bearing_wear' | 'critical';

class DemoEngine {
  private currentMode: DemoStateMode = 'healthy';
  private motorRunning: boolean = true;
  private targetSpeedPercentage: number = 68; // 0-100%
  private currentPWM: number = 173; // 0-255
  private tickCount: number = 0;
  private deviceId: string = 'MOTOR-001';

  private sensorHistory: SensorReading[] = [];
  private aiHistory: AiPrediction[] = [];
  private activeAlerts: Alert[] = [];
  private maintenanceLogs: MaintenanceRecord[] = [];
  private commandQueue: MotorCommand[] = [];

  constructor() {
    this.initSeedData();
  }

  public setMode(mode: DemoStateMode) {
    this.currentMode = mode;
  }

  public getMode(): DemoStateMode {
    return this.currentMode;
  }

  public setMotorState(running: boolean, speedPct: number = 68) {
    this.motorRunning = running;
    this.targetSpeedPercentage = running ? speedPct : 0;
    this.currentPWM = Math.round((this.targetSpeedPercentage / 100) * 255);
  }

  public isMotorRunning(): boolean {
    return this.motorRunning;
  }

  public getSpeedPercentage(): number {
    return this.targetSpeedPercentage;
  }

  public getPWM(): number {
    return this.currentPWM;
  }

  // Generate real-time single frame telemetry
  public generateNextReading(): SensorReading {
    this.tickCount++;
    const t = this.tickCount * 0.2; // time step

    // Calculate dynamic PWM smoothing
    const targetPWM = this.motorRunning ? Math.round((this.targetSpeedPercentage / 100) * 255) : 0;
    this.currentPWM += (targetPWM - this.currentPWM) * 0.15;
    const effectivePWM = Math.round(this.currentPWM);
    const rpm = Math.round((effectivePWM / 255) * 2150);

    // Vibration baseline dependent on motor speed
    const speedFactor = effectivePWM / 255;
    const baseNoise = this.motorRunning ? 0.05 + speedFactor * 0.2 : 0.01;

    let faultX = 0;
    let faultY = 0;
    let faultZ = 0;
    let tempOffset = 0;

    switch (this.currentMode) {
      case 'healthy':
        faultX = Math.sin(t * 2.5) * 0.12 * speedFactor;
        faultY = Math.cos(t * 2.5) * 0.10 * speedFactor;
        faultZ = Math.sin(t * 5.0) * 0.08 * speedFactor;
        tempOffset = 0;
        break;
      case 'warning':
        faultX = Math.sin(t * 3.1) * 1.45 * speedFactor;
        faultY = Math.cos(t * 3.1) * 1.30 * speedFactor;
        faultZ = Math.sin(t * 6.2) * 0.95 * speedFactor;
        tempOffset = 6.5;
        break;
      case 'unbalance':
        faultX = Math.sin(t * 2.0) * 2.8 * speedFactor; // 1x RPM rotational frequency dominance
        faultY = Math.cos(t * 2.0) * 2.6 * speedFactor;
        faultZ = Math.sin(t * 4.0) * 1.1 * speedFactor;
        tempOffset = 9.0;
        break;
      case 'loose_mounting':
        faultX = (Math.sin(t * 2.0) + Math.sin(t * 4.0) * 0.8) * 3.2 * speedFactor; // harmonics 2x, 3x
        faultY = Math.cos(t * 2.0) * 2.1 * speedFactor;
        faultZ = Math.sin(t * 2.0) * 3.8 * speedFactor; // high vertical chatter
        tempOffset = 11.2;
        break;
      case 'bearing_wear':
        faultX = (Math.random() - 0.5) * 4.8 * speedFactor; // high frequency random impact noise
        faultY = (Math.random() - 0.5) * 4.2 * speedFactor;
        faultZ = Math.sin(t * 12.0) * 3.5 * speedFactor;
        tempOffset = 14.8;
        break;
      case 'critical':
        faultX = Math.sin(t * 2.2) * 5.8 * speedFactor + (Math.random() - 0.5) * 3.0;
        faultY = Math.cos(t * 2.2) * 5.2 * speedFactor + (Math.random() - 0.5) * 2.8;
        faultZ = Math.sin(t * 4.4) * 4.9 * speedFactor;
        tempOffset = 19.5;
        break;
    }

    const accX = Number((faultX + (Math.random() - 0.5) * baseNoise).toFixed(3));
    const accY = Number((faultY + (Math.random() - 0.5) * baseNoise).toFixed(3));
    const accZ = Number((9.72 + faultZ + (Math.random() - 0.5) * baseNoise).toFixed(3)); // 9.72 m/s² gravity baseline

    // Magnitude & RMS & Peak
    const magnitude = Number(Math.sqrt(accX * accX + accY * accY + accZ * accZ).toFixed(3));
    const rms = Number(Math.sqrt((accX * accX + accY * accY + (accZ - 9.72) * (accZ - 9.72)) / 3).toFixed(3));
    const peak = Number(Math.max(Math.abs(accX), Math.abs(accY), Math.abs(accZ - 9.72)).toFixed(3));
    const temp = Number((28.5 + (effectivePWM / 255) * 11.0 + tempOffset).toFixed(1));

    const reading: SensorReading = {
      id: `sr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      device_id: this.deviceId,
      timestamp: new Date().toISOString(),
      acceleration_x: accX,
      acceleration_y: accY,
      acceleration_z: accZ,
      vibration_magnitude: magnitude,
      rms_vibration: rms,
      peak_vibration: peak,
      temperature: temp,
      motor_speed: rpm,
      pwm_value: effectivePWM,
    };

    // Store in circular buffer (max 200 items)
    this.sensorHistory.unshift(reading);
    if (this.sensorHistory.length > 200) {
      this.sensorHistory.pop();
    }

    return reading;
  }

  // Generate TinyML prediction from current reading
  public generatePrediction(reading: SensorReading): AiPrediction {
    let prediction: MachineCondition = 'Healthy';
    let faultType = 'None';
    let severity: FaultSeverity = 'Low';
    let confidence = 96.4;
    let healthyProb = 96.4;
    let warningProb = 2.8;
    let faultProb = 0.8;
    let recommendation = 'No immediate maintenance required. Continue monitoring vibration trend.';

    switch (this.currentMode) {
      case 'healthy':
        prediction = 'Healthy';
        faultType = 'None';
        severity = 'Low';
        confidence = 96.8;
        healthyProb = 96.8;
        warningProb = 2.4;
        faultProb = 0.8;
        recommendation = 'Motor operates within optimal parameters. Next routine service in 15 days.';
        break;
      case 'warning':
        prediction = 'Warning';
        faultType = 'Elevated RMS Noise';
        severity = 'Medium';
        confidence = 88.5;
        healthyProb = 10.2;
        warningProb = 88.5;
        faultProb = 1.3;
        recommendation = 'Vibration magnitude elevated. Inspect base mounting bolts and check motor load alignment.';
        break;
      case 'unbalance':
        prediction = 'Unbalance';
        faultType = 'Rotational Unbalance (1x RPM)';
        severity = 'High';
        confidence = 92.1;
        healthyProb = 3.5;
        warningProb = 14.2;
        faultProb = 82.3;
        recommendation = 'Strong 1x rotational component detected. Re-balance motor rotor shaft and clean drive coupling.';
        break;
      case 'loose_mounting':
        prediction = 'Loose Mounting';
        faultType = 'Structural Looseness (Harmonic Chatter)';
        severity = 'High';
        confidence = 94.7;
        healthyProb = 1.1;
        warningProb = 11.2;
        faultProb = 87.7;
        recommendation = 'Vertical harmonic chatter detected. Torque L298N chassis and motor mounting screws immediately.';
        break;
      case 'bearing_wear':
        prediction = 'Bearing Wear';
        faultType = 'Outer Race Bearing Degradation';
        severity = 'High';
        confidence = 95.3;
        healthyProb = 0.5;
        warningProb = 8.5;
        faultProb = 91.0;
        recommendation = 'High-frequency impacts present. Apply high-temp grease or replace drive shaft ball bearing assembly.';
        break;
      case 'critical':
        prediction = 'Critical Fault';
        faultType = 'Severe Mechanical Anomaly & Overheating';
        severity = 'Critical';
        confidence = 98.9;
        healthyProb = 0.1;
        warningProb = 2.5;
        faultProb = 97.4;
        recommendation = 'CRITICAL: Shut down motor immediately to prevent total catastrophic hardware failure!';
        break;
    }

    const aiPred: AiPrediction = {
      id: `ai-${Date.now()}`,
      device_id: this.deviceId,
      timestamp: reading.timestamp,
      prediction,
      confidence,
      healthy_probability: healthyProb,
      warning_probability: warningProb,
      fault_probability: faultProb,
      fault_type: faultType,
      severity,
      recommendation,
    };

    this.aiHistory.unshift(aiPred);
    if (this.aiHistory.length > 50) {
      this.aiHistory.pop();
    }

    return aiPred;
  }

  // Create motor command and process simulated execution
  public sendMotorCommand(command: 'START' | 'STOP' | 'SET_SPEED', speedPct?: number): MotorCommand {
    const pwm = speedPct !== undefined ? Math.round((speedPct / 100) * 255) : 0;
    const cmd: MotorCommand = {
      id: `cmd-${Date.now()}`,
      device_id: this.deviceId,
      command,
      speed_percentage: speedPct,
      pwm_value: pwm,
      requested_by: 'Operator (Dashboard)',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    this.commandQueue.unshift(cmd);

    // Simulate async execution by ESP32 hardware in 1.2s
    setTimeout(() => {
      cmd.status = 'executed';
      if (command === 'START') {
        this.setMotorState(true, speedPct ?? 68);
      } else if (command === 'STOP') {
        this.setMotorState(false, 0);
      } else if (command === 'SET_SPEED' && speedPct !== undefined) {
        this.setMotorState(true, speedPct);
      }
    }, 1200);

    return cmd;
  }

  public getCommandQueue(): MotorCommand[] {
    return this.commandQueue;
  }

  public getActiveAlerts(): Alert[] {
    return this.activeAlerts;
  }

  public acknowledgeAlert(id: string) {
    const alert = this.activeAlerts.find((a) => a.id === id);
    if (alert) alert.status = 'acknowledged';
  }

  public resolveAlert(id: string) {
    const alert = this.activeAlerts.find((a) => a.id === id);
    if (alert) {
      alert.status = 'resolved';
      alert.resolved_at = new Date().toISOString();
    }
  }

  public getMaintenanceRecords(): MaintenanceRecord[] {
    return this.maintenanceLogs;
  }

  public addMaintenanceRecord(rec: Omit<MaintenanceRecord, 'id' | 'created_at'>): MaintenanceRecord {
    const newRecord: MaintenanceRecord = {
      ...rec,
      id: `maint-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.maintenanceLogs.unshift(newRecord);
    return newRecord;
  }

  public getDeviceInfo(): Device {
    return {
      id: 'dev-001',
      device_id: this.deviceId,
      device_name: 'PredictGuard Motor Node',
      description: 'ESP32 DevKit V1 + MPU6050 + L298N Hardware Node',
      motor_type: '3.7V DC Motor',
      location: 'Test Station #1',
      status: this.currentMode === 'critical' ? 'critical' : this.currentMode === 'healthy' ? 'online' : 'warning',
      wifi_status: 'connected',
      firmware_version: 'v1.2.4 (TinyML Int8)',
      last_seen: new Date().toISOString(),
      created_at: '2026-08-01T00:00:00Z',
    };
  }

  public getSensorHistory(): SensorReading[] {
    return this.sensorHistory;
  }

  public getAiHistory(): AiPrediction[] {
    return this.aiHistory;
  }

  private initSeedData() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // Seed 30 recent sensor readings
    for (let i = 30; i >= 0; i--) {
      const timeStr = new Date(now - i * 5000).toISOString();
      const baseMag = 9.8 + Math.sin(i * 0.4) * 0.3 + (Math.random() - 0.5) * 0.15;
      const reading: SensorReading = {
        id: `sr-seed-${i}`,
        device_id: this.deviceId,
        timestamp: timeStr,
        acceleration_x: Number((0.1 + Math.sin(i * 0.3) * 0.15).toFixed(3)),
        acceleration_y: Number((-0.08 + Math.cos(i * 0.3) * 0.12).toFixed(3)),
        acceleration_z: Number((9.72 + Math.sin(i * 0.5) * 0.2).toFixed(3)),
        vibration_magnitude: Number(baseMag.toFixed(3)),
        rms_vibration: Number((0.85 + Math.sin(i * 0.2) * 0.08).toFixed(3)),
        peak_vibration: Number((1.42 + Math.cos(i * 0.4) * 0.2).toFixed(3)),
        temperature: Number((36.2 + Math.sin(i * 0.1) * 1.5).toFixed(1)),
        motor_speed: 1450 + Math.floor(Math.sin(i * 0.2) * 35),
        pwm_value: 173,
      };
      this.sensorHistory.push(reading);
    }

    // Seed initial AI predictions
    this.aiHistory = [
      {
        id: 'ai-seed-1',
        device_id: this.deviceId,
        timestamp: new Date(now - 30000).toISOString(),
        prediction: 'Healthy',
        confidence: 96.4,
        healthy_probability: 96.4,
        warning_probability: 2.8,
        fault_probability: 0.8,
        fault_type: 'None',
        severity: 'Low',
        recommendation: 'No immediate maintenance required. Continue monitoring vibration trend.',
      },
      {
        id: 'ai-seed-2',
        device_id: this.deviceId,
        timestamp: new Date(now - 120000).toISOString(),
        prediction: 'Healthy',
        confidence: 95.8,
        healthy_probability: 95.8,
        warning_probability: 3.2,
        fault_probability: 1.0,
        fault_type: 'None',
        severity: 'Low',
        recommendation: 'Motor operating smoothly within target RMS limits.',
      },
    ];

    // Seed active/historical alerts
    this.activeAlerts = [
      {
        id: 'alert-101',
        device_id: this.deviceId,
        alert_type: 'vibration',
        severity: 'warning',
        title: 'Vibration Spike Detected',
        description: 'Vibration magnitude reached 11.45 m/s² during speed transition (Threshold: 11.00 m/s²).',
        value: 11.45,
        threshold: 11.0,
        status: 'active',
        created_at: new Date(now - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 'alert-102',
        device_id: this.deviceId,
        alert_type: 'temperature',
        severity: 'info',
        title: 'Thermal Stability Check',
        description: 'Motor enclosure temperature stabilized at 38.4°C.',
        value: 38.4,
        threshold: 45.0,
        status: 'acknowledged',
        created_at: new Date(now - 45 * 60 * 1000).toISOString(),
      },
      {
        id: 'alert-103',
        device_id: this.deviceId,
        alert_type: 'ai_prediction',
        severity: 'warning',
        title: 'Unbalance Anomaly Logged',
        description: 'TinyML classifier flagged 1x RPM harmonic rise at 1450 RPM.',
        value: 88.5,
        threshold: 75.0,
        status: 'resolved',
        created_at: new Date(now - 120 * 60 * 1000).toISOString(),
        resolved_at: new Date(now - 100 * 60 * 1000).toISOString(),
      },
    ];

    // Seed maintenance records
    this.maintenanceLogs = [
      {
        id: 'maint-001',
        device_id: this.deviceId,
        maintenance_type: 'Routine Inspection & Bearing Lubrication',
        description: 'Applied NLGI #2 high-speed synth grease to DC motor drive bearings and verified coupling alignment.',
        performed_by: 'Eng. Alex Vance (EE Team)',
        maintenance_date: '2026-08-01',
        next_due_date: '2026-08-16',
        notes: 'Vibration baseline reduced by 0.4 m/s² after lubrication.',
      },
      {
        id: 'maint-002',
        device_id: this.deviceId,
        maintenance_type: 'L298N Driver Terminal Tightening',
        description: 'Inspected power supply connections and checked PWM signal line integrity from ESP32 GPIO 18.',
        performed_by: 'Tech. Sarah Connor',
        maintenance_date: '2026-07-15',
        next_due_date: '2026-08-01',
        notes: 'PWM frequency verified at 5.0 kHz on oscilloscope.',
      },
    ];

    // Seed motor commands
    this.commandQueue = [
      {
        id: 'cmd-001',
        device_id: this.deviceId,
        command: 'SET_SPEED',
        speed_percentage: 68,
        pwm_value: 173,
        requested_by: 'Operator',
        status: 'executed',
        created_at: new Date(now - 10 * 60 * 1000).toISOString(),
      },
      {
        id: 'cmd-002',
        device_id: this.deviceId,
        command: 'START',
        speed_percentage: 50,
        pwm_value: 128,
        requested_by: 'Automated Rule',
        status: 'executed',
        created_at: new Date(now - 60 * 60 * 1000).toISOString(),
      },
    ];
  }
}

export const demoEngine = new DemoEngine();
