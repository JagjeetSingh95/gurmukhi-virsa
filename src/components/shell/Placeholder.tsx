import { TopBar } from "@/components/ui/display";
import { Badge } from "@/components/ui/display";
import { Sheru, type SheruMood } from "@/components/sheru/Sheru";

/** Temporary screen until the module's N.x task builds it. */
export function Placeholder({ title, task, body, mood }: { title: string; task: string; body: string; mood?: SheruMood }) {
  return (
    <>
      <TopBar title={title} />
      <section className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        {mood && <Sheru mood={mood} size={160} decorative />}
        <Badge tone="info">Coming in {task}</Badge>
        <h2 className="text-h2">{title}</h2>
        <p className="max-w-md text-body text-ink-2">{body}</p>
      </section>
    </>
  );
}
