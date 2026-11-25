"use client";
import { useMemo, useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  window.addEventListener("gv-local", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("gv-local", cb);
    window.removeEventListener("storage", cb);
  };
};

/** Re-render when device-local state changes. Server render uses the fallback. */
export function useLocal<T>(read: () => T, fallback: T): T {
  const snap = useSyncExternalStore(subscribe, () => JSON.stringify(read() ?? null), () => JSON.stringify(fallback ?? null));
  return useMemo(() => JSON.parse(snap) as T, [snap]);
}
