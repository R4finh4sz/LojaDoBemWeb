"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_KEY = "recicla-theme";

type ThemeToggleProps = { compact?: boolean };

export const ThemeToggle = ({ compact = false }: ThemeToggleProps) => {
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
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 ${compact ? "w-10 px-0" : "px-3"}`}>
      {dark ? <Sun size={18} /> : <Moon size={18} />}
      {!compact && <span className="hidden sm:inline">{dark ? "Modo claro" : "Modo noturno"}</span>}
    </button>
  );
};
