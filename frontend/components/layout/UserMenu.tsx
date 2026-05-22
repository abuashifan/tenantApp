'use client';

import { ChevronDown, KeyRound, LogOut, User, UserCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type UserMenuProps = {
  onLogout: () => void;
};

export function UserMenu({ onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm transition hover:bg-slate-50"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--erp-lime-soft)]">
          <UserCircle className="h-5 w-5 text-[var(--erp-emerald-dark)]" />
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-xs font-bold text-slate-950">User</p>
          <p className="text-[11px] text-slate-500">Account</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute right-0 top-14 z-[80] w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/15">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <User className="h-4 w-4" /> Edit Profile
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <KeyRound className="h-4 w-4" /> Edit Password
          </button>
          <div className="my-2 border-t border-slate-100" />
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>
      ) : null}
    </div>
  );
}
