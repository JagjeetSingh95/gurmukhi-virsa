import type { Metadata } from "next";
import { Demo } from "./Demo";

export const metadata: Metadata = { title: "Styleguide", robots: { index: false } };

export default function Styleguide() {
  return <Demo />;
}
