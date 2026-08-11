import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AiPayload {
  device_id: string;
  prediction: string;
  confidence: number;
  healthy_probability: number;
  warning_probability: number;
  fault_probability: number;
  fault_type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  recommendation: string;
  timestamp?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: AiPayload = await req.json();

    if (!payload.device_id || !payload.prediction) {
      return new Response(
        JSON.stringify({ error: "Invalid AI prediction payload. device_id and prediction are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const timestamp = payload.timestamp || new Date().toISOString();

    // 1. Insert AI prediction
    const { error: insertError } = await supabase
      .from("ai_predictions")
      .insert({
        device_id: payload.device_id,
        timestamp,
        prediction: payload.prediction,
        confidence: payload.confidence,
        healthy_probability: payload.healthy_probability,
        warning_probability: payload.warning_probability,
        fault_probability: payload.fault_probability,
        fault_type: payload.fault_type,
        severity: payload.severity,
        recommendation: payload.recommendation,
      });

    if (insertError) {
      throw insertError;
    }

    // 2. Trigger Alert if prediction is Warning or Fault
    if (payload.prediction !== "Healthy") {
      const alertSeverity = payload.severity === "Critical" || payload.severity === "High" ? "critical" : "warning";
      await supabase.from("alerts").insert({
        device_id: payload.device_id,
        alert_type: "ai_prediction",
        severity: alertSeverity,
        title: `AI Classification: ${payload.prediction}`,
        description: `TinyML inferencing detected anomaly: ${payload.fault_type}. Confidence: ${payload.confidence}%. Recommendation: ${payload.recommendation}`,
        value: payload.confidence,
        threshold: 75.0,
        status: "active",
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "AI prediction stored successfully.", timestamp }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
