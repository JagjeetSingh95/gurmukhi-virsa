# Supabase setup — Gurmukhi Virsa

Project: **gurmukhi-virsa** (`plkevjftjmiohxsedule`, London eu-west-2) · https://supabase.com/dashboard/project/plkevjftjmiohxsedule
Schema, RLS and functions are already applied (migrations `n21_core_schema`, `n23_functions_limits`, `n23b_hide_pin_hash`).
To get them as files: `npx supabase link --project-ref plkevjftjmiohxsedule && npx supabase db pull`.

These auth settings can only be changed in the dashboard:

## 1. URL configuration (Authentication → URL Configuration)
- Site URL: `https://gurmukhi-virsa.sjagjeet528.workers.dev` (later your custom domain)
- Redirect URLs: `https://gurmukhi-virsa.sjagjeet528.workers.dev/auth/confirm`, `https://gurmukhi-virsa.sjagjeet528.workers.dev/**` (the app always sends sign-in links to this URL, even from localhost — NEXT_PUBLIC_SITE_URL)

## 2. Email OTP (Authentication → Providers → Email)
- Email OTP expiration: **900** seconds (15 min, per U.2)
- Email OTP length: **6**
- "Confirm email": on

## 3. Email templates (Authentication → Email Templates)
Paste into **both** "Magic Link" and "Confirm signup". Link and code use the same one-time token, and the link works in any browser.

Subject: `Your Gurmukhi Virsa sign-in`

```html
<div style="font-family:Nunito,Arial,sans-serif;max-width:480px;margin:auto;color:#2A2018">
  <h2 style="color:#A94C0C">Sign in to Gurmukhi Virsa</h2>
  <p>Tap the button to sign in. It works once and expires in 15 minutes.</p>
  <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email"
        style="display:inline-block;background:#E07B1F;color:#fff;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:800">Sign in</a></p>
  <p>Or enter this code in the app:</p>
  <p style="font-size:32px;font-weight:900;letter-spacing:8px">{{ .Token }}</p>
  <p style="color:#6E6155;font-size:13px">If you didn't ask for this, you can ignore this email.</p>
</div>
```

## 4. SMTP (Project Settings → Authentication → SMTP)
The built-in mailer only sends to your own team's addresses, a few per hour — fine for testing, not for launch.
Add Resend: host `smtp.resend.com`, port 465, user `resend`, password = Resend API key, sender `Gurmukhi Virsa <hello@gurmukhivirsa.app>` (verify the domain in Resend).

## 5. Google sign-in (Authentication → Providers → Google)
1. Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web).
2. Authorised redirect URI: `https://plkevjftjmiohxsedule.supabase.co/auth/v1/callback`
3. Paste the Client ID + Secret into Supabase and enable.

## Rules enforced in the database
- Free: 1 child, letters `ltr-01…ltr-10`, sakhis `sakhi-01…02`. Family (or active trial): 5 children, everything. A client can't change its own plan.
- Parent PIN: bcrypt, 3 wrong → 30 s lockout; the hash can't be read by clients (`has_pin` flag only).
- RPCs: `give_consent`, `finish_setup`, `set_parent_pin`, `clear_parent_pin`, `verify_parent_pin`, `record_progress`, `merge_guest`.

## Parent emails + 2nd device (N.7.2 / N.7.3)
Already done in the project: tables/columns + RPCs (migrations in `supabase/migrations/`), Edge Functions
`join-family`, `parent-emails`, `unsubscribe` (source in `supabase/functions/`), pg_cron job `parent-emails`
(hourly at :05, secret in Vault as `cron_secret`).

Your steps (Dashboard → Edge Functions → Secrets):
1. `RESEND_API_KEY` — from resend.com (API Keys). Without it the function runs but sends nothing (`NO_RESEND_KEY`).
2. `EMAIL_FROM` — e.g. `Gurmukhi Virsa <hello@yourdomain>` once the domain is verified in Resend
   (default `onboarding@resend.dev` only delivers to your own Resend account email).
3. Optional `SITE_URL` (default https://gurmukhi-virsa.sjagjeet528.workers.dev, built into parent-emails) for links in emails.

Test without sending (SQL editor):
`select net.http_post(url := 'https://plkevjftjmiohxsedule.supabase.co/functions/v1/parent-emails?dry=1&user=<parent uuid>&force=weekly', headers := jsonb_build_object('x-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='cron_secret')), body := '{}'::jsonb);`
then `select content from net._http_response order by id desc limit 1;`
