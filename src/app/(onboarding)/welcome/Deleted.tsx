"use client";
// Shown after account deletion (/welcome?deleted=1).
import { useSearchParams } from "next/navigation";

export function Deleted() {
  if (useSearchParams().get("deleted") !== "1") return null;
  return (
    <p role="status" className="w-full rounded-xl bg-success-bg px-4 py-3 text-[15px] font-bold text-success">
      Your account and all family data have been deleted. Paath is always here, free.
    </p>
  );
}
