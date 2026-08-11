import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SensorPayload {
  device_id: string;
  acceleration_x: number;
  acceleration_y: number;
  acceleration_z: number;
  vibration_magnitude: number;
  rms_vibration: number;
  peak_vibration: number;
  temperature?: number;
  motor_speed?: number;
  pwm_value?: number;
  timestamp?: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: SensorPayload = await req.json();

    // Validation
    if (!payload.device_id || typeof payload.vibration_magnitude !== "number") {
      return new Response(
        JSON.stringify({ error: "Invalid sensor payload. device_id and vibration_magnitude are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const timestamp = payload.timestamp || new Date().toISOString();

    // 1. Insert sensor reading
    const { error: insertError } = await supabase
      .from("sensor_readings")
      .insert({
        device_id: payload.device_id,
        timestamp,
        acceleration_x: payload.acceleration_x,
        acceleration_y: payload.acceleration_y,
        acceleration_z: payload.acceleration_z,
        vibration_magnitude: payload.vibration_magnitude,
        rms_vibration: payload.rms_vibration,
        peak_vibration: payload.peak_vibration,
        temperature: payload.temperature ?? 25.0,
        motor_speed: payload.motor_speed ?? 0,
        pwm_value: payload.pwm_value ?? 0,
      });

    if (insertError) {
      throw insertError;
    }

    // 2. Update device last_seen and status
    let deviceStatus = "online";
    if (payload.vibration_magnitude > 14.0) {
      deviceStatus = "critical";
    } else if (payload.vibration_magnitude > 11.0) {
      deviceStatus = "warning";
    }

    await supabase
      .from("devices")
      .update({
        last_seen: new Date().toISOString(),
        wifi_status: "connected",
        status: deviceStatus,
      })
      .eq("device_id", payload.device_id);

    // 3. Automated Alert Triggering
    if (payload.vibration_magnitude > 14.0) {
      await supabase.from("alerts").insert({
        device_id: payload.device_id,
        alert_type: "vibration",
        severity: "critical",
        title: "Critical Vibration Threshold Exceeded",
        description: `Measured vibration magnitude of ${payload.vibration_magnitude.toFixed(2)} m/s² exceeded critical limit (14.00 m/s²). Inspect motor assembly immediately.`,
        value: payload.vibration_magnitude,
        threshold: 14.0,
        status: "active",
      });
    } else if (payload.vibration_magnitude > 11.0) {
      await supabase.from("alerts").insert({
        device_id: payload.device_id,
        alert_type: "vibration",
        severity: "warning",
        title: "High Vibration Warning",
        description: `Measured vibration magnitude of ${payload.vibration_magnitude.toFixed(2)} m/s² exceeded warning limit (11.00 m/s²). Check mounting and alignment.`,
        value: payload.vibration_magnitude,
        threshold: 11.0,
        status: "active",
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Sensor data ingested successfully.", timestamp }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
