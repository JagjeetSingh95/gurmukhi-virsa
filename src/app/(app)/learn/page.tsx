import type { Metadata } from "next";
import { Placeholder } from "@/components/shell/Placeholder";

export const metadata: Metadata = { title: "Learn", robots: { index: false } };

export default function Page() {
  return <Placeholder title="Learn" task="N.5.1" body="A path of 35 Gurmukhi letters with tracing and quizzes. The first 10 letters are free." mood="cheer" />;
}
