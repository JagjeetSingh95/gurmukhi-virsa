# Gurmukhi Virsa — website

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres + Auth) · Cloudflare Workers via OpenNext.

Backend setup: see [docs/supabase-setup.md](docs/supabase-setup.md). Content: `src/content` (banis from Shabad OS via `scripts/extract-banis.py` + `scripts/build-banis.mjs`).

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck && npm run lint && npm run build
npm run preview      # Cloudflare runtime locally
npm run deploy       # needs `npx wrangler login` once
```

## Structure
- `src/app/(site)` — marketing: `/`, `/features`, `/pricing`, `/about`, `/contact`, `/download`, `/support`, `/privacy`, `/terms` (+ root `not-found`, sitemap, robots, manifest, OG image)
- `src/app/(app)` — app shell: `/paath`, `/learn`, `/culture`, `/parent`, `/settings` (placeholders until N.3–N.9)
- `src/app/styleguide` — living component library (noindex)
- `src/styles/tokens.css` — D.2 tokens as CSS variables (light/dark via `prefers-color-scheme` or `data-theme`)
- `src/components/ui` — controls (N.1.1), display (N.1.2), feedback (N.1.3); `sheru/` (N.1.4); `shell/` (N.0.3)
- `src/content` — marketing copy, later bani/letter JSON

Fonts are self-hosted via Fontsource (no Google requests). Breakpoints: `tab:` 600 · `web:` 1024 · `wide:` 1280.

## Deploy (Cloudflare Workers Builds)
Cloudflare dashboard → Workers & Pages → Create → Import a repository → this repo.
Build command `npx opennextjs-cloudflare build`, deploy command `npx opennextjs-cloudflare deploy`. Previews per branch are automatic.
