"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_KEY = "recicla-theme";

export const ThemeToggle = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    const enabled = stored === "dark";
    document.documentElement.classList.toggle("dark", enabled);
    const frame = window.requestAnimationFrame(() => setDark(enabled));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem(THEME_KEY, next ? "dark" : "light");
  };

  return (
    <button type="button" onClick={toggle} aria-label={dark ? "Ativar modo claro" : "Ativar modo noturno"}
      className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-md transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
      <span className="hidden sm:inline">{dark ? "Modo claro" : "Modo noturno"}</span>
    </button>
  );
};
