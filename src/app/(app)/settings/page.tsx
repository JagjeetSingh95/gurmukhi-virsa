import type { Metadata } from "next";
import { Placeholder } from "@/components/shell/Placeholder";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default function Page() {
  return <Placeholder title="Settings" task="N.9.1" body="Language (English / ਪੰਜਾਬੀ), text size, theme and account." />;
}
