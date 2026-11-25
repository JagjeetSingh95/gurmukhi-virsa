"use client";
// Living styleguide for N.0.2 + N.1.1–N.1.4 (noindex). Visual check at 390 / 1024 / 1440.
import { useState } from "react";
import { IkOnkar } from "@/components/IkOnkar";
import { Sheru, type SheruMood } from "@/components/sheru/Sheru";
import { Button, Chip, CodeInput, Input, Segmented, Toggle } from "@/components/ui/controls";
import { Badge, Card, ListRow, LockTag, ProfileTile, Progress } from "@/components/ui/display";
import { ConfirmDialog, QuizTile, Sheet, Skeleton, StateView, ToastProvider, useToast } from "@/components/ui/feedback";

const swatches = ["saffron-50", "saffron-100", "saffron-300", "saffron-500", "saffron-600", "saffron-800", "navy-50", "navy-300", "navy-600", "navy-800", "navy-900"];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-line py-8">
      <h2 className="text-h2">{title}</h2>
      {children}
    </section>
  );
}

function Inner() {
  const toast = useToast();
  const [chip, setChip] = useState("Kids");
  const [on, setOn] = useState(true);
  const [seg, setSeg] = useState<"adult" | "kids">("adult");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [sheet, setSheet] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-10 web:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">Gurmukhi Virsa — Styleguide</h1>
        <Segmented
          label="Theme"
          value={theme}
          onChange={(t) => {
            setTheme(t);
            document.documentElement.dataset.theme = t;
          }}
          options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]}
        />
      </div>

      <Block title="Colour">
        <div className="flex flex-wrap gap-3">
          {swatches.map((s) => (
            <div key={s} className="flex flex-col gap-1 text-caption text-ink-2">
              <span className="size-16 rounded-md border border-line" style={{ background: `var(--${s})` }} />
              {s}
            </div>
          ))}
        </div>
      </Block>

      <Block title="Type">
        <p className="text-display">Display 40</p>
        <p className="text-h1">H1 32</p>
        <p className="text-h2">H2 24</p>
        <p className="text-h3">H3 20</p>
        <p className="text-body-l">Body L 18 — The quick brown fox.</p>
        <p className="text-body">Body 16 — The quick brown fox.</p>
        <p lang="pa" className="text-letter-l text-brand-text">ੳ ਅ ੲ ਸ ਹ</p>
        <p lang="pa" className="text-gurmukhi-h">ਗੁਰਮੁਖੀ ਵਿਰਸਾ</p>
        <p lang="pa" className="text-gurbani-adult"><IkOnkar /> ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ</p>
        <p lang="pa" className="text-gurbani-kids"><IkOnkar /> ਸਤਿ ਨਾਮੁ</p>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="navy">Navy</Button>
          <Button variant="success">Check</Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
        </div>
      </Block>

      <Block title="Chips, toggle, segmented">
        <div className="flex flex-wrap items-center gap-3">
          {["All", "Kids", "Bedtime", "Saved"].map((c) => (
            <Chip key={c} selected={chip === c} onClick={() => setChip(c)}>{c}</Chip>
          ))}
          <Toggle label="Transliteration" checked={on} onChange={setOn} />
          <Segmented label="Reader mode" value={seg} onChange={setSeg} options={[{ value: "adult", label: "Adult" }, { value: "kids", label: "Kids" }]} />
        </div>
      </Block>

      <Block title="Inputs">
        <div className="grid gap-5 tab:grid-cols-2">
          <Input label="Child's first name" placeholder="e.g. Simran" hint="First name only" />
          <Input label="Parent email" type="email" defaultValue="parent@" error="Enter a valid email" />
          <CodeInput label="6-digit sign-in code" value={code} onChange={setCode} />
          <CodeInput label="Parent PIN" length={4} value={pin} onChange={setPin} secret />
        </div>
      </Block>

      <Block title="Cards, rows, tiles, progress, badges">
        <div className="grid gap-5 tab:grid-cols-2">
          <Card>
            <ListRow icon="book" title="Japji Sahib" subtitle="Pauris 1–5 · 12 min" href="/paath" />
            <ListRow icon="moon" title="Kirtan Sohila" subtitle="Bedtime" trailing={<LockTag />} />
          </Card>
          <Card className="flex flex-col gap-3">
            <Progress value={65} label="Letters" />
            <Progress value={30} label="Sakhis" tone="success" />
            <div className="flex flex-wrap gap-2">
              <Badge>Brand</Badge><Badge tone="navy">Navy</Badge><Badge tone="success" icon="check">Done</Badge>
              <Badge tone="error">Error</Badge><Badge tone="reward" icon="star">Streak</Badge><Badge tone="info">Info</Badge>
            </div>
          </Card>
        </div>
        <div className="flex flex-wrap gap-6">
          <ProfileTile name="Simran" emoji="🦋" selected />
          <ProfileTile name="Arjan" emoji="🚀" colorIndex={1} />
          <ProfileTile name="Add" emoji="＋" colorIndex={2} />
        </div>
      </Block>

      <Block title="Sheet, dialog, toast">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setSheet(true)}>Open sheet</Button>
          <Button variant="secondary" onClick={() => setDialog(true)}>Open dialog</Button>
          <Button variant="secondary" onClick={() => toast("Bookmark saved", "success")}>Show toast</Button>
        </div>
        <Sheet open={sheet} onClose={() => setSheet(false)} title="Reader settings" footer={<Button onClick={() => setSheet(false)}>Done</Button>}>
          Text size, transliteration and meaning settings go here.
        </Sheet>
        <ConfirmDialog open={dialog} onClose={() => setDialog(false)} onConfirm={() => setDialog(false)} title="Remove Arjan?" body="Arjan's progress will be deleted. This can't be undone." confirmLabel="Remove" destructive />
      </Block>

      <Block title="States & quiz">
        <div className="grid gap-5 web:grid-cols-3">
          <Card><StateView kind="empty" title="No bookmarks yet" body="Tap the bookmark on any line to save it." /></Card>
          <Card><StateView kind="error" title="Something went wrong" action={<Button size="sm">Try again</Button>} /></Card>
          <Card><StateView kind="offline" title="You're offline" body="We'll sync when you're back." /></Card>
        </div>
        <div className="flex gap-3"><Skeleton className="h-12 w-12" /><div className="flex flex-1 flex-col gap-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-1/3" /></div></div>
        <div className="grid grid-cols-2 gap-3 web:grid-cols-4">
          <QuizTile index={1} label="ਕ" gurmukhi />
          <QuizTile index={2} label="ਖ" gurmukhi state="selected" />
          <QuizTile index={3} label="ਗ" gurmukhi state="correct" />
          <QuizTile index={4} label="ਘ" gurmukhi state="wrong" />
        </div>
      </Block>

      <Block title="Sheru">
        <div className="flex flex-wrap items-end gap-6">
          {(["happy", "cheer", "think", "oops", "sleepy", "proud"] as SheruMood[]).map((m) => <Sheru key={m} mood={m} size={96} />)}
          <Sheru size={48} /><Sheru size={160} /><Sheru size={240} />
        </div>
      </Block>
    </div>
  );
}

export function Demo() {
  return (
    <ToastProvider>
      <Inner />
    </ToastProvider>
  );
}
