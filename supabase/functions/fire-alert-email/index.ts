import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "https://esm.sh/nodemailer@6.9.16";

const GMAIL_USER = Deno.env.get("GMAIL_USER");
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    let body: any;

    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ ok: false, error: "Invalid or missing JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const alert = body?.alert;

    if (!alert) {
      return new Response(JSON.stringify({ ok: false, error: "Missing alert payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const severity = alert.severity;
    const location = alert.location;

    if (!["critical", "emergency"].includes(severity)) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing GMAIL_APP_PASSWORD secret" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("email, role, building, department")
      .in("role", ["student", "faculty", "rescue"]);

    if (profileError) {
      return new Response(JSON.stringify({ ok: false, error: profileError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const recipients = (profiles ?? [])
      .map((p) => p.email)
      .filter(Boolean);

    if (!recipients.length) {
      return new Response(JSON.stringify({ ok: true, sent: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const subject = `Fire alert in ${location}`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #1f2937;">
        <h2 style="color: #b91c1c;">Fire alert in ${location}</h2>
        <p><strong>Severity:</strong> ${severity}</p>
        <p><strong>Title:</strong> ${alert.title ?? "Fire incident"}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Time:</strong> ${new Date(alert.created_at ?? Date.now()).toLocaleString()}</p>
        <p>Please follow emergency procedures and move to the nearest safe area.</p>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    const mailResult = await transporter.sendMail({
      from: `FireAlert <${GMAIL_USER}>`,
      to: recipients,
      subject,
      html,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        sent: recipients.length,
        messageId: mailResult.messageId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
