// N.7.3 One-tap unsubscribe (GET from the email link, POST for List-Unsubscribe-Post). No login needed:
// the per-parent email_token identifies the account. ?k=weekly (default) or ?k=reminder.
import { createClient } from "npm:@supabase/supabase-js@2";

const page = (msg: string) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Gurmukhi Virsa</title><body style="font-family:system-ui,sans-serif;background:#FFF9F2;color:#2A1F14;display:grid;place-items:center;min-height:90vh;margin:0"><div style="max-width:420px;padding:24px;text-align:center"><h1 style="font-size:24px">${msg}</h1><p>You can turn emails back on any time in the Parent area of Gurmukhi Virsa.</p></div></body>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const t = url.searchParams.get("t") ?? "";
  const kind = url.searchParams.get("k") === "reminder" ? "reminder" : "weekly";
  if (!/^[0-9a-f-]{36}$/i.test(t)) return page("This link isn't valid.");
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const patch = kind === "reminder" ? { reminder_on: false } : { weekly_email: false };
  const { data } = await admin.from("profiles").update(patch).eq("email_token", t).select("id");
  if (!data?.length) return page("This link isn't valid.");
  return page(kind === "reminder" ? "Reminders are off." : "You're unsubscribed from the weekly summary.");
});
