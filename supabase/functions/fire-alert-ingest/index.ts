import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req) => {
  try {
    const body = await req.json();

    const code = String(body.code ?? "").trim();
    const location = String(body.location ?? "").trim();
    const buildingId = body.building_id ?? null;
    const status = String(body.status ?? "online").trim();
    const temperatureC = Number(body.temperature_c ?? 0);
    const humidityPct = Number(body.humidity_pct ?? 0);
    const smokeLevel = String(body.smoke_level ?? "normal").trim();
    const flameDetected = Boolean(body.flame_detected);
    const irDetected = Boolean(body.ir_detected);
    const loadPct = Number.isFinite(Number(body.load_pct)) ? Number(body.load_pct) : null;

    if (!code || !location) {
      return new Response(
        JSON.stringify({ ok: false, error: "code and location are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const { data: existingNode, error: fetchError } = await supabase
      .from("sensor_nodes")
      .select("id, code, location, building_id")
      .eq("code", code)
      .maybeSingle();

    if (fetchError) {
      return new Response(
        JSON.stringify({ ok: false, error: fetchError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const nodePayload = {
      code,
      location,
      building_id: buildingId,
      status,
      temperature_c: Number.isFinite(temperatureC) ? temperatureC : 0,
      humidity_pct: Number.isFinite(humidityPct) ? humidityPct : 0,
      smoke_level: smokeLevel,
      flame_detected: flameDetected,
      ir_detected: irDetected,
      load_pct: Number.isFinite(loadPct) ? loadPct : null,
      updated_at: new Date().toISOString(),
    };

    const { data: upsertedNode, error: upsertError } = await supabase
      .from("sensor_nodes")
      .upsert(nodePayload, { onConflict: "code" })
      .select()
      .single();

    if (upsertError || !upsertedNode) {
      return new Response(
        JSON.stringify({ ok: false, error: upsertError?.message ?? "Unable to save node" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    let alertData = null;
    const shouldCreateAlert = flameDetected || irDetected || smokeLevel === "high" || temperatureC >= 45;

    if (shouldCreateAlert) {
      const { data: insertedAlert, error: insertError } = await supabase
        .from("alerts")
        .insert([
          {
            title: `FIRE ALERT - ${code}`,
            location,
            building_id: buildingId,
            node_id: upsertedNode.id,
            severity: flameDetected || temperatureC >= 60 ? "critical" : "warning",
            status: "open",
          },
        ])
        .select()
        .single();

      if (insertError) {
        return new Response(
          JSON.stringify({ ok: false, error: insertError.message }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }

      alertData = insertedAlert;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        node: upsertedNode,
        alert: alertData,
        createdAlert: Boolean(alertData),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
