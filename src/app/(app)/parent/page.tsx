import type { Metadata } from "next";
import { ParentHome } from "./ParentHome";

export const metadata: Metadata = { title: "Parent", robots: { index: false } };

export default function Page() {
  return <ParentHome />;
}
