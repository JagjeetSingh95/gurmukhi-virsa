// N.9.2 Delete account (U12): signed-in parent, re-authenticated in the last 10 minutes (email code).
// Deleting the auth user cascades to profiles → children → progress, bookmarks, settings, activity, family codes.
// Backups roll off within 30 days (stated in Privacy).
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const REAUTH_MS = 10 * 60_000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "METHOD" }, 405);
  const { confirm } = await req.json().catch(() => ({ confirm: "" }));
  if (confirm !== "DELETE") return json({ error: "CONFIRM" }, 400);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data, error } = await admin.auth.getUser(token);
  const user = data?.user;
  if (error || !user) return json({ error: "AUTH" }, 401);
  const last = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0;
  if (Date.now() - last > REAUTH_MS) return json({ error: "REAUTH" }, 401);

  const del = await admin.auth.admin.deleteUser(user.id);
  if (del.error) return json({ error: "DELETE_FAILED" }, 500);
  return json({ ok: true });
});
