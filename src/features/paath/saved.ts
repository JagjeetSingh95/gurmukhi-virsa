"use client";
// N.4.5 Bookmarks (lines) + favourites (whole banis).
// Guest/adult without account → this device (merged into the account at sign-in by merge_guest).
// Signed in → Supabase (RLS). Kids' bookmarks are stored against the active child.
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { local, type GuestBookmark } from "@/lib/local";
import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";
import { useLocal } from "@/lib/useLocal";

export type SavedLine = { baniSlug: string; lineId: string; createdAt: string };

const FAV = "gv.favourites";
const readFavs = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(FAV) ?? "[]") as string[];
  } catch {
    return [];
  }
};
const writeFavs = (f: string[]) => {
  try {
    localStorage.setItem(FAV, JSON.stringify(f));
    window.dispatchEvent(new Event("gv-local"));
  } catch {}
};

export function useSaved() {
  const { session } = useAuth();
  const mode = useLocal(local.mode, null);
  const activeChild = useLocal(local.activeChild, null);
  const childId = session && mode === "family" ? activeChild : null;
  const guest = useLocal(local.guestBookmarks, [] as GuestBookmark[]);
  const favs = useLocal(readFavs, [] as string[]);
  const [remote, setRemote] = useState<SavedLine[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return setRemote(null);
    let q = supabase().from("bookmarks").select("bani_slug,line_id,created_at").order("created_at", { ascending: false });
    q = childId ? q.eq("child_id", childId) : q.is("child_id", null);
    const { data, error } = await q;
    if (error) return setError("Couldn't load your saved lines.");
    setRemote((data ?? []).map((b) => ({ baniSlug: b.bani_slug, lineId: b.line_id, createdAt: b.created_at })));
    // Favourites sync through the parent's settings row.
    const s = await supabase().from("settings").select("data").is("child_id", null).maybeSingle();
    const remoteFavs = ((s.data?.data as { favourites?: string[] } | null)?.favourites ?? []) as string[];
    if (remoteFavs.length) writeFavs(Array.from(new Set([...readFavs(), ...remoteFavs])));
  }, [session, childId]);

  useEffect(() => {
    void load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  const bookmarks: SavedLine[] = session ? (remote ?? []) : guest;
  const isBookmarked = (slug: string, lineId: string) => bookmarks.some((b) => b.baniSlug === slug && b.lineId === lineId);

  const add = async (slug: string, lineId: string) => {
    const item = { baniSlug: slug, lineId, createdAt: new Date().toISOString() };
    if (!session) return local.setGuestBookmarks([item, ...guest.filter((b) => !(b.baniSlug === slug && b.lineId === lineId))]);
    setRemote((r) => [item, ...(r ?? [])]);
    const { error } = await supabase().from("bookmarks").insert({ user_id: session.user.id, child_id: childId, bani_slug: slug, line_id: lineId });
    if (error && !/duplicate/i.test(error.message)) {
      setError("Couldn't save. Check your connection.");
      void load();
    }
  };
  const remove = async (slug: string, lineId: string) => {
    if (!session) return local.setGuestBookmarks(guest.filter((b) => !(b.baniSlug === slug && b.lineId === lineId)));
    setRemote((r) => (r ?? []).filter((b) => !(b.baniSlug === slug && b.lineId === lineId)));
    let q = supabase().from("bookmarks").delete().eq("bani_slug", slug).eq("line_id", lineId);
    q = childId ? q.eq("child_id", childId) : q.is("child_id", null);
    const { error } = await q;
    if (error) {
      setError("Couldn't remove. Check your connection.");
      void load();
    }
  };
  const toggle = (slug: string, lineId: string) => (isBookmarked(slug, lineId) ? remove(slug, lineId) : add(slug, lineId));

  const setFavourite = async (slug: string, on: boolean) => {
    const next = on ? Array.from(new Set([slug, ...favs])) : favs.filter((f) => f !== slug);
    writeFavs(next);
    if (session) {
      const cur = await supabase().from("settings").select("data").is("child_id", null).maybeSingle();
      const data = { ...((cur.data?.data as Record<string, unknown>) ?? {}), favourites: next } as unknown as Json;
      if (cur.data) await supabase().from("settings").update({ data, updated_at: new Date().toISOString() }).eq("user_id", session.user.id).is("child_id", null);
      else await supabase().from("settings").insert({ user_id: session.user.id, child_id: null, data });
    }
  };

  return { bookmarks, isBookmarked, add, remove, toggle, favourites: favs, setFavourite, error, synced: !!session };
}
