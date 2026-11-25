// Server-safe (no "use client"): storage key + inline boot script used by the root layout.
export const PREFS_KEY = "gv.prefs";

/** Inline <head> script: applies the saved theme before first paint (no flash). */
export const prefsBootScript = `try{var p=JSON.parse(localStorage.getItem("${PREFS_KEY}")||"{}");if(p.theme==="light"||p.theme==="dark")document.documentElement.dataset.theme=p.theme;if(p.lang==="pa")document.documentElement.lang="pa"}catch(e){}`;
