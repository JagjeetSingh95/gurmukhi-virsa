// Marketing copy. Prices are intentionally not set (open decision: Family [PRICE]).
export const faqs: { q: string; a: string; group: "general" | "pricing" | "privacy" }[] = [
  {
    group: "general",
    q: "Who is Gurmukhi Virsa for?",
    a: "Kids aged 4–12 learning Gurmukhi and Paath — especially families living outside Punjab. Parents, adults and Punjabi schools use it too. Adults can read Paath without an account.",
  },
  {
    group: "general",
    q: "Do I need to know Punjabi to help my child?",
    a: "No. Every letter, word and Gurbani line comes with transliteration and a simple English meaning, so you can learn alongside your child.",
  },
  {
    group: "general",
    q: "Which banis are included?",
    a: "At launch: Mool Mantar, Japji Sahib (pauris 1–5), Kirtan Sohila and Sukhmani Sahib, with text, transliteration, meaning and audio. More banis will follow.",
  },
  {
    group: "general",
    q: "Is the Gurbani audio recorded by real people?",
    a: "Yes. We never use AI-generated voices for Gurbani.",
  },
  {
    group: "general",
    q: "Does it work on phones and tablets?",
    a: "Yes. The web app works in any modern browser on phone, tablet and computer. Android and iOS apps are planned.",
  },
  {
    group: "pricing",
    q: "What is free?",
    a: "Paath is free forever for everyone. On the Free plan kids also get the first 10 Gurmukhi letters and 2 sakhis, for 1 child profile.",
  },
  {
    group: "pricing",
    q: "What does the Family plan add?",
    a: "All 35 letters, words and sentences, every sakhi and culture lesson, up to 5 child profiles, and the weekly progress email.",
  },
  {
    group: "pricing",
    q: "Is there a free trial?",
    a: "Yes — 7 days. We email you a reminder on day 5, before the trial ends. Cancel any time.",
  },
  {
    group: "pricing",
    q: "Will my child see prices or buy buttons?",
    a: "No. Kids never see prices. Anything to do with payment sits behind the parent gate.",
  },
  {
    group: "privacy",
    q: "What data do you collect?",
    a: "Only the parent's email, each child's first name, and learning progress. No photos, no location, no contacts.",
  },
  {
    group: "privacy",
    q: "Are there ads or trackers?",
    a: "No ads, ever. No third-party analytics or tracking.",
  },
  {
    group: "privacy",
    q: "How do I delete my account?",
    a: "Parent area → Account & data (behind the parent gate). We email you a code to confirm, then delete everything straight away; backups clear within 30 days. You can download your data first.",
  },
];

export const pillars = [
  {
    key: "paath",
    title: "Paath",
    gurmukhi: "ਪਾਠ",
    icon: "book" as const,
    free: "Free forever",
    body: "Read Gurbani line by line with transliteration, meaning and recorded audio. A calm, distraction-free reader with a kids mode.",
    points: ["Line-by-line audio sync", "Transliteration + meaning toggles", "Bigger text in kids mode", "Bookmarks and recent"],
  },
  {
    key: "learn",
    title: "Learn",
    gurmukhi: "ਸਿੱਖੋ",
    icon: "letter" as const,
    free: "First 10 letters free",
    body: "A playful path from all 35 letters of the Painti to laga matra, first words and short sentences kids can read on their own.",
    points: ["Trace letters with a finger", "Build and read real words", "Read short sentences", "Numbers, colours and family words"],
  },
  {
    key: "culture",
    title: "Culture",
    gurmukhi: "ਵਿਰਸਾ",
    icon: "culture" as const,
    free: "2 sakhis free",
    body: "Stories and lessons about the 10 Gurus, the 5 Ks, Gurdwaras, Gurpurabs and etiquette — told simply and respectfully.",
    points: ["Narrated sakhis", "Gurpurab calendar", "Gurdwara etiquette", "The 5 Ks explained"],
  },
  {
    key: "parent",
    title: "Parent",
    gurmukhi: "ਮਾਪੇ",
    icon: "parent" as const,
    free: "Included",
    body: "See each child's progress, get a weekly summary by email, and keep settings behind a parent gate.",
    points: ["Up to 5 child profiles", "Weekly progress email", "Parent gate (PIN / maths)", "Join from a 2nd device"],
  },
];

export const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0 / $0",
    note: "Free forever",
    cta: "Start free",
    features: [
      ["Paath — all banis, audio, meaning", true],
      ["First 10 Gurmukhi letters", true],
      ["2 sakhis", true],
      ["1 child profile", true],
      ["All 35 letters, words & sentences", false],
      ["All sakhis & culture lessons", false],
      ["Weekly progress email", false],
    ] as [string, boolean][],
  },
  {
    id: "family",
    name: "Family",
    price: "Price coming soon",
    note: "7-day free trial · cancel any time",
    cta: "Try Family free",
    features: [
      ["Paath — all banis, audio, meaning", true],
      ["All 35 letters, laga matra, words & sentences", true],
      ["All sakhis & culture lessons", true],
      ["Up to 5 child profiles", true],
      ["Practice mode", true],
      ["Weekly progress email", true],
      ["Use on multiple devices", true],
    ] as [string, boolean][],
  },
];

/** Respect rules (D.4) — shown publicly on About. */
export const principles = [
  { title: "Gurbani first", body: "No mascot, jokes or decoration near Gurbani. The reader stays calm and plain." },
  { title: "Real voices only", body: "Gurbani audio is always recorded by people — never AI-generated." },
  { title: "Respectful art", body: "We never depict the Gurus or Sahibzade, and never put articles of faith on animals." },
  { title: "No ads, no tracking", body: "No advertising and no third-party analytics. Kids are not the product." },
  { title: "Minimal data", body: "Only a parent email, a child's first name and progress. Nothing else." },
  { title: "No guilt", body: "Gentle reminders, no streak shaming, no pressure on the paywall." },
];
