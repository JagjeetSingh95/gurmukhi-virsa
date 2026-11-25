import type { Metadata } from "next";
import { Placeholder } from "@/components/shell/Placeholder";

export const metadata: Metadata = { title: "Culture", robots: { index: false } };

export default function Page() {
  return <Placeholder title="Culture" task="N.6.1" body="The 10 Gurus, sakhis, the 5 Ks, Gurdwaras and the Gurpurab calendar." mood="think" />;
}
