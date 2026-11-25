// N.7.3 Parent emails — runs hourly from pg_cron. Picks, in each parent's own timezone:
//  • Weekly summary: weekly_email on, today = weekly_day, 9 am local, not sent yet today.
//  • Daily reminder: reminder_on, local hour = reminder_hour, max 1 a day, only if a child with reminders on
//    hasn't learned yet today. Calm copy, no guilt.
// Plain HTML (600 wide), one-tap unsubscribe, no tracking pixels. Sent with Resend (RESEND_API_KEY).
// Auth: x-cron-secret header, checked against the vault secret via cron_secret_ok().
// Test: ?dry=1 (no sending, returns previews) · ?user=<uuid>&force=weekly|reminder (ignores the schedule).
import { createClient } from "npm:@supabase/supabase-js@2";

const SITE = Deno.env.get("SITE_URL") ?? "https://gurmukhi-virsa.sjagjeet528.workers.dev";
const FROM = Deno.env.get("EMAIL_FROM") ?? "Gurmukhi Virsa <onboarding@resend.dev>";
const FN = `${Deno.env.get("SUPABASE_URL")}/functions/v1`;
const LETTERS = "ੳ ਅ ੲ ਸ ਹ ਕ ਖ ਗ ਘ ਙ ਚ ਛ ਜ ਝ ਞ ਟ ਠ ਡ ਢ ਣ ਤ ਥ ਦ ਧ ਨ ਪ ਫ ਬ ਭ ਮ ਯ ਰ ਲ ਵ ੜ".split(" ");
const WEEKLY_HOUR = 9;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Profile = {
  id: string; email: string | null; plan: string; trial_ends_at: string | null; setup_done: boolean;
  weekly_email: boolean; weekly_day: number; reminder_on: boolean; reminder_hour: number; timezone: string;
  email_token: string; last_weekly_on: string | null; last_reminder_on: string | null;
};
type Child = { id: string; parent_id: string; name: string; streak_days: number; reminder: boolean; created_at: string };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function localNow(tz: string, d = new Date()) {
  const fmt = (zone: string) =>
    Object.fromEntries(
      new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false, weekday: "short" })
        .formatToParts(d)
        .map((x) => [x.type, x.value]),
    );
  let p: Record<string, string>;
  try {
    p = fmt(tz);
  } catch {
    p = fmt("UTC");
  }
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) % 24, dow: DAYS.indexOf(p.weekday) };
}

function layout(title: string, body: string, unsubUrl: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;background:#FFF9F2;font-family:Arial,Helvetica,sans-serif;color:#2A1F14">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;border:1px solid #F0E4D4">
<tr><td style="padding:28px 28px 8px;font-size:14px;color:#6E6155">Gurmukhi Virsa · ਗੁਰਮੁਖੀ ਵਿਰਸਾ</td></tr>
<tr><td style="padding:0 28px 24px;font-size:16px;line-height:1.55">${body}</td></tr>
</table>
<p style="font-size:12px;color:#6E6155;margin:16px 0 0"><a href="${unsubUrl}" style="color:#6E6155">Unsubscribe</a> · <a href="${SITE}/parent/emails" style="color:#6E6155">Manage emails</a></p>
</td></tr></table></body></html>`;
}

const button = (href: string, label: string) =>
  `<p style="margin:24px 0 0"><a href="${href}" style="display:inline-block;background:#BD550E;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px">${label}</a></p>`;

async function send(to: string, subject: string, html: string, text: string, unsubUrl: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return { ok: false, reason: "NO_RESEND_KEY" };
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM, to, subject, html, text,
      headers: { "List-Unsubscribe": `<${unsubUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    }),
  });
  return { ok: r.ok, reason: r.ok ? undefined : `RESEND_${r.status}` };
}

Deno.serve(async (req) => {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const secret = req.headers.get("x-cron-secret") ?? "";
  const { data: ok } = await admin.rpc("cron_secret_ok", { p: secret });
  if (!ok) return new Response("Forbidden", { status: 403 });

  const url = new URL(req.url);
  const dry = url.searchParams.get("dry") === "1";
  const onlyUser = url.searchParams.get("user");
  const force = url.searchParams.get("force");

  let q = admin
    .from("profiles")
    .select("id,email,plan,trial_ends_at,setup_done,weekly_email,weekly_day,reminder_on,reminder_hour,timezone,email_token,last_weekly_on,last_reminder_on")
    .eq("setup_done", true)
    .not("email", "is", null);
  if (onlyUser) q = q.eq("id", onlyUser);
  else q = q.or("weekly_email.eq.true,reminder_on.eq.true");
  const { data: profiles, error } = await q;
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const results: unknown[] = [];
  for (const p of (profiles ?? []) as Profile[]) {
    const now = localNow(p.timezone);
    const dueWeekly = force === "weekly" || (!force && p.weekly_email && now.dow === p.weekly_day && now.hour === WEEKLY_HOUR && p.last_weekly_on !== now.date);
    const dueReminder = force === "reminder" || (!force && p.reminder_on && now.hour === p.reminder_hour && p.last_reminder_on !== now.date);
    if (!dueWeekly && !dueReminder) continue;

    const { data: kidsData } = await admin.from("children").select("id,parent_id,name,streak_days,reminder,created_at").eq("parent_id", p.id).order("created_at");
    const kids = (kidsData ?? []) as Child[];
    if (!kids.length) continue;
    const ids = kids.map((k) => k.id);
    const since = new Date(Date.now() - 8 * 86_400_000);
    const [{ data: prog }, { data: act }] = await Promise.all([
      admin.from("progress").select("child_id,kind,item_id,completed_at").in("child_id", ids).gte("completed_at", since.toISOString()),
      admin.from("activity").select("child_id,day,seconds").in("child_id", ids).gte("day", since.toISOString().slice(0, 10)),
    ]);
    const family = p.plan === "family" || (!!p.trial_ends_at && new Date(p.trial_ends_at) > new Date());

    if (dueWeekly) {
      const weekAgo = Date.now() - 7 * 86_400_000;
      const rows = kids.map((k) => {
        const mine = (prog ?? []).filter((r) => r.child_id === k.id && new Date(r.completed_at).getTime() >= weekAgo);
        const letters = mine.filter((r) => r.kind === "letter").map((r) => LETTERS[Number(r.item_id.replace(/\D/g, "")) - 1]).filter(Boolean);
        const sakhis = mine.filter((r) => r.kind === "sakhi").length;
        const minutes = Math.round((act ?? []).filter((r) => r.child_id === k.id).reduce((s, r) => s + r.seconds, 0) / 60);
        return { k, letters, sakhis, minutes };
      });
      const total = rows.reduce((s, r) => s + r.minutes, 0);
      const blocks = rows
        .map((r) => {
          const name = esc(r.k.name);
          if (!r.letters.length && !r.minutes && !r.sakhis) return `<p style="margin:16px 0 0"><b>${name}</b><br>A quiet week. A 3-minute lesson is a lovely way to start again.</p>`;
          const letterLine = r.letters.length ? `${r.letters.length} letter${r.letters.length === 1 ? "" : "s"}${family ? `: <span lang="pa" style="font-size:18px">${r.letters.join(" ")}</span>` : ""}` : "";
          const bits = [letterLine, `${r.minutes} minutes`, r.k.streak_days ? `${r.k.streak_days}-day streak` : "", r.sakhis ? `${r.sakhis} sakhi${r.sakhis === 1 ? "" : "s"}` : ""].filter(Boolean);
          return `<p style="margin:16px 0 0"><b>${name}'s week</b><br>${bits.join(" · ")}</p>`;
        })
        .join("");
      const unsub = `${FN}/unsubscribe?t=${p.email_token}&k=weekly`;
      const html = layout(
        "Your family's week",
        `<h1 style="font-size:24px;margin:8px 0 4px">Sat Sri Akal!</h1><p style="margin:0">Here's your family's week: <b>${total} minutes</b> of learning together.</p>${blocks}${family ? "" : `<p style="margin:16px 0 0;color:#6E6155;font-size:14px">The Family plan adds which letters each child learned.</p>`}${button(`${SITE}/parent`, "Open dashboard")}`,
        unsub,
      );
      const text = `Sat Sri Akal! Your family's week: ${total} minutes.\n` + rows.map((r) => `${r.k.name}: ${r.letters.length} letters, ${r.minutes} min, ${r.k.streak_days}-day streak`).join("\n") + `\n\nOpen dashboard: ${SITE}/parent\nUnsubscribe: ${unsub}`;
      const res = dry ? { ok: true, reason: "DRY" } : await send(p.email!, "Your family's week on Gurmukhi Virsa", html, text, unsub);
      if (res.ok && !dry) await admin.from("profiles").update({ last_weekly_on: now.date }).eq("id", p.id);
      results.push({ user: p.id, kind: "weekly", ...res, ...(dry ? { html } : {}) });
    }

    if (dueReminder) {
      const today = now.date;
      const waiting = kids.filter((k) => k.reminder && !(act ?? []).some((r) => r.child_id === k.id && r.day === today && r.seconds > 0));
      if (!waiting.length) {
        results.push({ user: p.id, kind: "reminder", ok: true, reason: "ALL_LEARNED_TODAY" });
      } else {
        const names = waiting.map((k) => esc(k.name));
        const who = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
        const streak = waiting.find((k) => k.streak_days > 0);
        const unsub = `${FN}/unsubscribe?t=${p.email_token}&k=reminder`;
        const html = layout(
          "A few minutes of Gurmukhi?",
          `<h1 style="font-size:22px;margin:8px 0 4px">A few minutes of Gurmukhi today?</h1><p style="margin:0">${who} could do a short lesson or story today.${streak ? ` ${esc(streak.name)}'s streak is ${streak.streak_days} days.` : ""} Even 3 minutes is enough.</p>${button(`${SITE}/learn`, "Start learning")}`,
          unsub,
        );
        const text = `A few minutes of Gurmukhi today? ${waiting.map((k) => k.name).join(", ")} could do a short lesson.\n${SITE}/learn\nTurn off reminders: ${unsub}`;
        const res = dry ? { ok: true, reason: "DRY" } : await send(p.email!, "A few minutes of Gurmukhi today?", html, text, unsub);
        if (res.ok && !dry) await admin.from("profiles").update({ last_reminder_on: today }).eq("id", p.id);
        results.push({ user: p.id, kind: "reminder", ...res, ...(dry ? { html } : {}) });
      }
    }
  }
  return new Response(JSON.stringify({ ran: new Date().toISOString(), results }), { headers: { "Content-Type": "application/json" } });
});
