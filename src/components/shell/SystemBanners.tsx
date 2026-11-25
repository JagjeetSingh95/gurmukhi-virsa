"use client";
// N.9.3 System states (U09): service worker registration, offline banner, signed-out ("session expired") banner.
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { local } from "@/lib/local";
import { useLocal } from "@/lib/useLocal";

const subscribe = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};
export const useOnline = () => useSyncExternalStore(subscribe, () => navigator.onLine, () => true);

export function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
  }, []);
}

export function SystemBanners() {
  useServiceWorker();
  const online = useOnline();
  const { ready, configured, session } = useAuth();
  const mode = useLocal(local.mode, null);
  const [hideSignedOut, setHideSignedOut] = useState(false);
  // Family mode on this device but no session any more → the sign-in expired or was ended elsewhere.
  const signedOut = ready && configured && online && mode === "family" && !session && !hideSignedOut;

  if (online && !signedOut) return null;
  return (
    <div className="sticky top-0 z-40 flex flex-col">
      {!online && (
        <div role="status" className="flex items-center gap-2 bg-inverse px-4 py-2 text-[14px] font-bold text-ink-inverse">
          <Icon name="wifi-off" size={18} />
          <span className="flex-1">You&apos;re offline. Saved banis still work.</span>
          <Link href="/paath/saved?tab=offline" className="underline">Saved offline</Link>
        </div>
      )}
      {signedOut && (
        <div role="alert" className="flex flex-wrap items-center gap-2 bg-info-bg px-4 py-2 text-[14px] font-bold text-info">
          <Icon name="info" size={18} />
          <span className="flex-1">You&apos;ve been signed out. A grown-up can sign in again to keep saving progress.</span>
          <Link href="/signin" className="underline">Sign in</Link>
          <button type="button" className="underline" onClick={() => { setHideSignedOut(true); local.setMode("adult"); }}>
            Continue as guest
          </button>
        </div>
      )}
    </div>
  );
}
