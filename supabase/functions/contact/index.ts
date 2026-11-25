// N.9.2 Contact form → email to support via Resend. Nothing is stored except an IP rate-limit row (5/hour).
// Secrets: RESEND_API_KEY, EMAIL_FROM, optional SUPPORT_EMAIL (defaults to EMAIL_FROM address).
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const TOPICS = ["General", "Billing", "Schools", "Bug report", "Content", "Account"];
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "METHOD" }, 405);
  const b = await req.json().catch(() => ({}));
  const topic = TOPICS.includes(b.topic) ? b.topic : "General";
  const email = String(b.email ?? "").trim().slice(0, 200);
  const name = String(b.name ?? "").trim().slice(0, 80);
  const message = String(b.message ?? "").trim().slice(0, 4000);
  if (!/^\S+@\S+\.\S+$/.test(email) || message.length < 10) return json({ error: "INVALID" }, 400);
  if (b.website) return json({ ok: true }); // honeypot

  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM");
  if (!key || !from) return json({ error: "NOT_CONFIGURED" }, 503);
  const to = Deno.env.get("SUPPORT_EMAIL") || from.replace(/^.*<(.+)>$/, "$1");

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await admin.from("contact_attempts").select("ip", { count: "exact", head: true }).eq("ip", ip).gte("at", since);
  if ((count ?? 0) >= 5) return json({ error: "TOO_MANY" }, 429);
  await admin.from("contact_attempts").insert({ ip });

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject: `[${topic}] Gurmukhi Virsa — ${name || email}`,
      text: `${message}\n\n— ${name || "Parent"} <${email}>`,
      html: `<p style="white-space:pre-wrap">${esc(message)}</p><p>— ${esc(name || "Parent")} &lt;${esc(email)}&gt;</p>`,
    }),
  });
  if (!r.ok) return json({ error: "SEND_FAILED" }, 502);
  return json({ ok: true });
});
