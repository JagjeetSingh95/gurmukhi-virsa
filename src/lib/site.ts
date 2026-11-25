// Site-wide config. TODO(user): confirm domain + support email before launch (N.11.1).
export const site = {
  name: "Gurmukhi Virsa",
  nameGurmukhi: "ਗੁਰਮੁਖੀ ਵਿਰਸਾ",
  tagline: "Gurmukhi, Paath and Sikh heritage — made for kids.",
  description:
    "Gurmukhi Virsa helps kids aged 4–12 learn the Gurmukhi alphabet, read Paath with meaning and discover Sikh heritage. Paath is free forever. No ads, no tracking.",
  url: process.env.SITE_URL ?? "https://gurmukhivirsa.app",
  supportEmail: "support@gurmukhivirsa.app",
  appEntry: "/paath",
} as const;

export const marketingNav = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/support", label: "Help" },
] as const;
