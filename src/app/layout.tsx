import type { Metadata, Viewport } from "next";
// Self-hosted fonts (no third-party requests — matches "no tracking" rule).
import "@fontsource/nunito/500.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "@fontsource/nunito/900.css";
import "@fontsource/baloo-paaji-2/gurmukhi-500.css";
import "@fontsource/baloo-paaji-2/gurmukhi-700.css";
import "@fontsource/mukta-mahee/gurmukhi-500.css";
import "@fontsource/mukta-mahee/gurmukhi-600.css";
import "@fontsource/noto-sans-gurmukhi/gurmukhi-500.css";
import "./globals.css";
import { prefsBootScript } from "@/lib/prefsBoot";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, locale: "en_GB" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFAF3" },
    { media: "(prefers-color-scheme: dark)", color: "#16141C" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before paint (N.9.1). */}
        <script dangerouslySetInnerHTML={{ __html: prefsBootScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
