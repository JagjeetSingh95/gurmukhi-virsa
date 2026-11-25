// N.7.2 "Join my family" on a 2nd device: trade a 6-digit family code for a one-time sign-in token.
// The code is single-use, expires in 10 minutes and is created by a signed-in parent (create_family_code).
// Rate limit: 10 failed tries per IP per hour.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "METHOD" }, 405);
  const { code } = await req.json().catch(() => ({ code: "" }));
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) return json({ error: "BAD_CODE" }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await admin.from("family_code_attempts").select("ip", { count: "exact", head: true }).eq("ip", ip).gte("at", since);
  if ((count ?? 0) >= 10) return json({ error: "TOO_MANY" }, 429);

  const now = new Date().toISOString();
  const { data: row } = await admin
    .from("family_codes")
    .update({ used_at: now })
    .eq("code", code)
    .is("used_at", null)
    .gt("expires_at", now)
    .select("parent_id")
    .maybeSingle();
  if (!row) {
    await admin.from("family_code_attempts").insert({ ip });
    return json({ error: "BAD_CODE" }, 404);
  }

  const { data: u } = await admin.auth.admin.getUserById(row.parent_id);
  const email = u?.user?.email;
  if (!email) return json({ error: "NOT_FOUND" }, 404);
  const { data: link, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !link?.properties?.hashed_token) return json({ error: "LINK_FAILED" }, 500);
  return json({ token_hash: link.properties.hashed_token });
});
