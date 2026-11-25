import type { SVGProps } from "react";

export type IconName =
  | "book" | "letter" | "culture" | "parent" | "settings" | "check" | "close" | "lock"
  | "play" | "star" | "shield" | "heart" | "menu" | "arrow-right" | "search" | "sparkle"
  | "devices" | "mail" | "moon" | "chevron-down" | "info" | "alert" | "wifi-off" | "users"
  | "bookmark" | "bookmark-on" | "pause" | "volume" | "keyboard" | "heart-on" | "clock";

const paths: Record<IconName, React.ReactNode> = {
  book: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />,
  letter: <path d="M5 20 11 4h2l6 16M7.5 14h9" />,
  culture: <path d="M12 3 3 9h18zM5 9v10M19 9v10M9.5 9v10M14.5 9v10M3 21h18" />,
  parent: <><circle cx="9" cy="7" r="3.5" /><path d="M2.5 21v-1a6.5 6.5 0 0 1 13 0v1M17 11a3 3 0 1 0 0-6M21.5 21v-1a5 5 0 0 0-3.5-4.8" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  lock: <><rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  play: <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />,
  star: <path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.4l-5.6 2.9 1.1-6.2L3 9.7l6.2-.9z" />,
  shield: <path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6zM8.5 12l2.5 2.5 4.5-5" />,
  heart: <path d="M12 20.5s-8-4.7-8-10.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 8 2.5c0 5.9-8 10.6-8 10.6z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
  devices: <><rect x="2.5" y="5" width="13" height="10" rx="1.5" /><path d="M6 19h6M9 15v4" /><rect x="17" y="8" width="5" height="12" rx="1.5" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.5v.5" /></>,
  alert: <><path d="M12 3.5 2.5 20h19z" /><path d="M12 10v4.5M12 17v.5" /></>,
  "wifi-off": <path d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.7M14 10.3A10 10 0 0 1 19 13M2 9.5a15 15 0 0 1 4.5-2.8M12 20h.01" />,
  users: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" /></>,
  bookmark: <path d="M6 3.5h12v17l-6-4-6 4z" />,
  "bookmark-on": <path d="M6 3.5h12v17l-6-4-6 4z" fill="currentColor" />,
  pause: <path d="M7 4.5h3.5v15H7zM13.5 4.5H17v15h-3.5z" fill="currentColor" />,
  volume: <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />,
  keyboard: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M7 14h10" /></>,
  "heart-on": <path d="M12 20.5s-8-4.7-8-10.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 8 2.5c0 5.9-8 10.6-8 10.6z" fill="currentColor" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
};

export function Icon({ name, size = 24, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
