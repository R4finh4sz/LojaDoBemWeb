"use client";

import { Ellipsis, Trash2, type LucideIcon } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

export const directoryGrid = "grid gap-4 @min-[24rem]:grid-cols-2 @min-[40rem]:grid-cols-3 @min-[56rem]:grid-cols-4";

type Props = {
  name: string;
  icon: LucideIcon;
  children?: ReactNode;
  disabled?: boolean;
  onDelete: () => void;
};

export function DirectoryCard({ name, icon: Icon, children, disabled, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  return (
    <li className={`relative flex min-h-36 min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 pb-4 pt-7 text-center dark:border-slate-700 dark:bg-slate-800/60 ${menuOpen ? "z-10" : ""}`}>
      <div className="absolute right-2 top-2"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
        }}
        onKeyDown={(event) => {
          if (menuOpen && event.key === "Escape") {
            event.stopPropagation();
            event.currentTarget.querySelector("button")?.focus();
            setMenuOpen(false);
          }
        }}>
        <button type="button" title="Mais opções" aria-label={`Opções de ${name}`}
          aria-expanded={menuOpen} aria-controls={menuOpen ? menuId : undefined}
          disabled={disabled} onClick={() => setMenuOpen((open) => !open)}
          className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700">
          <Ellipsis size={20} aria-hidden="true" />
        </button>
        {menuOpen && (
          <div id={menuId} className="absolute right-0 top-full mt-1 w-32 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <button type="button" disabled={disabled} onClick={() => {
              setMenuOpen(false);
              onDelete();
            }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40">
              <Trash2 size={16} aria-hidden="true" /> Excluir
            </button>
          </div>
        )}
      </div>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0 max-w-full break-words">
        <p className="font-semibold">{name}</p>
        {children && <div className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-300">{children}</div>}
      </div>
    </li>
  );
}
