import type { Metadata } from "next";
import { Placeholder } from "@/components/shell/Placeholder";

export const metadata: Metadata = { title: "Parent", robots: { index: false } };

export default function Page() {
  return <Placeholder title="Parent" task="N.7.1" body="Progress for each child, weekly summary and settings — always behind the parent gate." />;
}
