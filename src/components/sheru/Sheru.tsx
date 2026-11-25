// Sheru (ਸ਼ੇਰੂ) — lion-cub mascot, 6 moods, from canvas board D04.
// Respect rules: never place near Gurbani / Paath reader. Sizes 48/96/160/240.
export type SheruMood = "happy" | "cheer" | "think" | "oops" | "sleepy" | "proud";

const S = { stroke: "#7A3E0E", strokeWidth: 3, strokeLinecap: "round" as const, fill: "none" };

function Face({ mood }: { mood: SheruMood }) {
  switch (mood) {
    case "happy":
      return (
        <>
          <circle cx="40" cy="53" r="3.6" fill="#3A2210" />
          <circle cx="60" cy="53" r="3.6" fill="#3A2210" />
          <path d="M44 70 Q50 76 56 70" {...S} />
        </>
      );
    case "cheer":
      return (
        <>
          <path d="M35 55 Q40 48 45 55" {...S} />
          <path d="M55 55 Q60 48 65 55" {...S} />
          <ellipse cx="50" cy="72" rx="6" ry="5" fill="#8B2E1A" />
          <ellipse cx="50" cy="74.5" rx="3.5" ry="2" fill="#F07A6A" />
          <circle cx="12" cy="22" r="3" fill="#E5A912" />
          <circle cx="88" cy="18" r="4" fill="#E5A912" />
          <circle cx="92" cy="34" r="2.5" fill="#2F7FC8" />
        </>
      );
    case "think":
      return (
        <>
          <circle cx="42" cy="50" r="3.4" fill="#3A2210" />
          <circle cx="62" cy="50" r="3.4" fill="#3A2210" />
          <path d="M45 72 L55 70" {...S} />
          <text x="80" y="20" fontFamily="Nunito" fontWeight="900" fontSize="20" fill="#1E2A5A">?</text>
        </>
      );
    case "oops":
      return (
        <>
          <circle cx="40" cy="53" r="4.4" fill="#3A2210" />
          <circle cx="60" cy="53" r="4.4" fill="#3A2210" />
          <circle cx="41.5" cy="51.5" r="1.4" fill="#fff" />
          <circle cx="61.5" cy="51.5" r="1.4" fill="#fff" />
          <ellipse cx="50" cy="72" rx="3.5" ry="4" fill="#8B2E1A" />
          <path d="M78 38 Q82 46 78 50 Q74 46 78 38z" fill="#7CB7EA" />
        </>
      );
    case "sleepy":
      return (
        <>
          <path d="M35 53 Q40 57 45 53" {...S} />
          <path d="M55 53 Q60 57 65 53" {...S} />
          <path d="M46 71 Q50 73 54 71" {...S} />
          <text x="76" y="22" fontFamily="Nunito" fontWeight="900" fontSize="16" fill="#1E2A5A">z</text>
          <text x="86" y="12" fontFamily="Nunito" fontWeight="900" fontSize="11" fill="#1E2A5A">z</text>
        </>
      );
    case "proud":
      return (
        <>
          <path d="M35 54 Q40 48 45 54" {...S} />
          <path d="M55 54 Q60 48 65 54" {...S} />
          <path d="M42 69 Q50 78 58 69" {...S} />
          <circle cx="80" cy="80" r="11" fill="#E5A912" />
          <polygon
            points="80 73 82.2 77.6 87 78.2 83.4 81.5 84.4 86.3 80 83.9 75.6 86.3 76.6 81.5 73 78.2 77.8 77.6"
            fill="#FFF5D6"
          />
        </>
      );
  }
}

export function Sheru({
  mood = "happy",
  size = 96,
  className,
  decorative = false,
}: {
  mood?: SheruMood;
  size?: 48 | 96 | 160 | 240 | number;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : `Sheru the lion cub, ${mood}`}
    >
      <circle cx="50" cy="52" r="44" fill="#C9661A" />
      <circle cx="50" cy="52" r="37" fill="#EE9A3C" />
      <circle cx="29" cy="30" r="10" fill="#FFD49A" />
      <circle cx="71" cy="30" r="10" fill="#FFD49A" />
      <circle cx="29" cy="30" r="5" fill="#F3AE68" />
      <circle cx="71" cy="30" r="5" fill="#F3AE68" />
      <circle cx="50" cy="56" r="28" fill="#FFD49A" />
      <ellipse cx="50" cy="67" rx="14" ry="10" fill="#FFF0D6" />
      <ellipse cx="50" cy="62" rx="4.5" ry="3.2" fill="#7A3E0E" />
      <Face mood={mood} />
    </svg>
  );
}
