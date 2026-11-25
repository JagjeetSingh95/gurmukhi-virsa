"use client";
// Renders children only in the browser. For personal screens that use dates, randomness or device storage.
import { useSyncExternalStore, type ReactNode } from "react";

const noop = () => () => {};
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  return mounted ? <>{children}</> : <>{fallback}</>;
}
