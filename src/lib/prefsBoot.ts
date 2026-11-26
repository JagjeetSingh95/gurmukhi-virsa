// Server-safe (no "use client"): storage key + inline boot script used by the root layout.
export const PREFS_KEY = "gv.prefs";

/** Inline <head> script: applies the saved theme before first paint (no flash). */
export const prefsBootScript = `try{var p=JSON.parse(localStorage.getItem("${PREFS_KEY}")||"{}");var d=document.documentElement;if(p.theme==="system")delete d.dataset.theme;else d.dataset.theme=p.theme==="dark"?"dark":"light";if(p.lang==="pa")document.documentElement.lang="pa"}catch(e){}`;
