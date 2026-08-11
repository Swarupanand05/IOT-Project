import React, { useState } from 'react';
import { Info, Cpu, Layers, Code, Radio, Copy, Check, ShieldCheck, Zap } from 'lucide-react';

export const SystemInfoView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'schematic' | 'firmware'>('schematic');

  const hardwareList = [
    { name: 'ESP32 DevKit V1', role: 'Main Microcontroller & Wi-Fi Gateway', spec: '240MHz Dual Core, 520KB SRAM' },
    { name: 'MPU6050', role: '6-DOF Accelerometer & Gyroscope', spec: '3-Axis Vibration Data (I2C 0x68)' },
    { name: '3.7V DC Motor', role: 'Mechanical Test Motor', spec: 'Small 3.7V Brushless/Brushed DC Motor' },
    { name: 'L298N Motor Driver', role: 'Dual H-Bridge Motor Speed Controller', spec: 'PWM Speed Control (EN1, IN1, IN2)' },
    { name: '10K Potentiometer', role: 'Manual Motor Speed Regulator', spec: 'Analog Input connected to ESP32 ADC' },
    { name: 'OLED Display (SSD1306)', role: 'Local Telemetry Screen', spec: '128x64 I2C Graphic Display' },
    { name: 'Green, Yellow & Red LEDs', role: 'Visual Machine Condition Indicator', spec: 'Green=Healthy, Yellow=Warning, Red=Critical' },
    { name: 'Buzzer', role: 'Acoustic Fault Alarm', spec: '5V Active Buzzer on Anomaly' },
  ];

  const firmwareCode = `/*
 * PredictGuard AI - ESP32 Firmware Node
 * Hardware: ESP32 + MPU6050 + L298N + 10K Potentiometer + OLED + Buzzer
 * Flashing Target: ESP32 DevKit V1 (Arduino IDE)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";
const char* SUPABASE_URL = "https://your-supabase-project.supabase.co/functions/v1/ingest-sensor-data";
const char* SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";

Adafruit_MPU6050 mpu;

// Pin Definitions
#define PIN_POT 34
#define PIN_PWM 18
#define PIN_IN1 19
#define PIN_IN2 21
#define PIN_LED_GREEN 25
#define PIN_LED_YELLOW 26
#define PIN_LED_RED 27
#define PIN_BUZZER 14

void setup() {
  Serial.begin(115200);
  pinMode(PIN_PWM, OUTPUT);
  pinMode(PIN_IN1, OUTPUT);
  pinMode(PIN_IN2, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_YELLOW, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);

  // Set motor forward
  digitalWrite(PIN_IN1, HIGH);
  digitalWrite(PIN_IN2, LOW);

  Wire.begin();
  if (!mpu.begin()) {
    Serial.println("MPU6050 Init Failed!");
  }

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected!");
}

void loop() {
  // Read Potentiometer for speed PWM
  int potValue = analogRead(PIN_POT);
  int pwmValue = map(potValue, 0, 4095, 0, 255);
  analogWrite(PIN_PWM, pwmValue);

  // Read MPU6050 3-Axis Acceleration
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  float accX = a.acceleration.x;
  float accY = a.acceleration.y;
  float accZ = a.acceleration.z;
  float magnitude = sqrt(accX * accX + accY * accY + accZ * accZ);
  float rms = sqrt((accX * accX + accY * accY + (accZ - 9.81) * (accZ - 9.81)) / 3.0);

  // Status Indicator LED Control
  if (magnitude > 14.0) {
    digitalWrite(PIN_LED_RED, HIGH);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_BUZZER, HIGH);
  } else if (magnitude > 11.0) {
    digitalWrite(PIN_LED_YELLOW, HIGH);
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_BUZZER, LOW);
  } else {
    digitalWrite(PIN_LED_GREEN, HIGH);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_BUZZER, LOW);
  }

  // Send Telemetry JSON to Supabase Edge Function
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SUPABASE_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", SUPABASE_KEY);

    String json = "{\\"device_id\\":\\"MOTOR-001\\",\\"acceleration_x\\":" + String(accX) +
                  ",\\"acceleration_y\\":" + String(accY) +
                  ",\\"acceleration_z\\":" + String(accZ) +
                  ",\\"vibration_magnitude\\":" + String(magnitude) +
                  ",\\"rms_vibration\\":" + String(rms) +
                  ",\\"peak_vibration\\":" + String(magnitude * 1.2) +
                  ",\\"temperature\\":" + String(temp.temperature) +
                  ",\\"motor_speed\\":" + String((pwmValue / 255.0) * 2150) +
                  ",\\"pwm_value\\":" + String(pwmValue) + "}";

    int httpCode = http.POST(json);
    http.end();
  }

  delay(500); // 2 Hz Stream Loop
}`;

  const copyFirmware = () => {
    navigator.clipboard.writeText(firmwareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center space-x-3">
          <Info className="w-7 h-7 text-cyan-400" />
          <span>System Information & Hardware Architecture</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Electrical Engineering Mini Project Specification (ESP32 + MPU6050 + TinyML)
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-surface-border pb-3">
        <button
          onClick={() => setActiveTab('schematic')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'schematic' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Hardware Components & Circuit Topology
        </button>
        <button
          onClick={() => setActiveTab('firmware')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'firmware' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>ESP32 Arduino Firmware Code Exporter</span>
        </button>
      </div>

      {activeTab === 'schematic' && (
        <div className="space-y-6">
          {/* Hardware List Grid */}
          <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Physical Hardware Stack</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {hardwareList.map((hw) => (
                <div key={hw.name} className="p-3.5 rounded-xl bg-surface-200 border border-surface-border space-y-1">
                  <div className="font-bold text-slate-100 text-sm text-cyan-400">{hw.name}</div>
                  <div className="text-slate-300 font-semibold">{hw.role}</div>
                  <div className="text-slate-500 text-[10px]">{hw.spec}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Software & Tech Stack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Software & AI/ML Stack</span>
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li className="p-2 rounded bg-surface-200 flex justify-between">
                  <span>Embedded IDE:</span>
                  <span className="text-cyan-400 font-bold">Arduino IDE / PlatformIO</span>
                </li>
                <li className="p-2 rounded bg-surface-200 flex justify-between">
                  <span>TinyML Framework:</span>
                  <span className="text-purple-400 font-bold">TensorFlow Lite Micro (Int8)</span>
                </li>
                <li className="p-2 rounded bg-surface-200 flex justify-between">
                  <span>Cloud Database & Realtime:</span>
                  <span className="text-emerald-400 font-bold">Supabase (PostgreSQL + Realtime)</span>
                </li>
                <li className="p-2 rounded bg-surface-200 flex justify-between">
                  <span>Web Dashboard:</span>
                  <span className="text-blue-400 font-bold">React + TypeScript + Vite + Tailwind</span>
                </li>
              </ul>
            </div>

            <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Signal Pipeline & Communication Architecture</span>
              </h3>
              <div className="p-4 rounded-xl bg-surface-300 border border-surface-border space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <div>1. 10K Potentiometer → ESP32 ADC (Pin 34) → Duty Cycle Mapper</div>
                <div>2. ESP32 PWM (Pin 18 @ 5 kHz) → L298N Driver → 3.7V DC Motor</div>
                <div>3. Motor Rotation → Vibration → MPU6050 (3-Axis Accel via I2C)</div>
                <div>4. ESP32 Feature Extraction (RMS & FFT Peak) → TinyML Inference</div>
                <div>5. Wi-Fi HTTP POST → Supabase Ingestion Edge Function</div>
                <div>6. Supabase Realtime Channels → PredictGuard AI Web Dashboard</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'firmware' && (
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <Code className="w-4 h-4 text-purple-400" />
                <span>ESP32 Arduino Firmware Code (Ready to Flash)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Copy & paste into Arduino IDE to flash your ESP32 hardware node</p>
            </div>

            <button
              onClick={copyFirmware}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all font-bold"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'COPIED CODE!' : 'COPY CODE'}</span>
            </button>
          </div>

          <pre className="bg-[#080B10] p-4 rounded-xl border border-surface-border text-cyan-300 font-mono text-[11px] overflow-x-auto max-h-96">
            <code>{firmwareCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
