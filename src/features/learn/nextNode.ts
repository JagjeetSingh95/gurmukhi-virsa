import { allNodes } from "./content";

export function nextAfter(id: string) {
  const i = allNodes.findIndex((n) => n.id === id);
  const n = allNodes[i + 1];
  return n ? { href: n.href, label: "Next lesson" } : { href: "/learn", label: "Back to the path" };
}

export function badgeFor(lettersDone: number) {
  if (lettersDone === 5) return "First 5 letters";
  if (lettersDone === 10) return "First 10 letters";
  if (lettersDone === 35) return "All 35 letters";
  return null;
}
