'use client';

import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { WorkspaceRow, WorkspaceRowAction } from './types';

type WorkspaceActionMenuProps<T extends WorkspaceRow> = {
  row: T;
  actions: WorkspaceRowAction<T>[];
};

export function WorkspaceActionMenu<T extends WorkspaceRow>({
  row,
  actions,
}: WorkspaceActionMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('touchstart', closeOnOutsideClick);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('touchstart', closeOnOutsideClick);
    };
  }, []);

  if (actions.length === 0) return null;

  return (
    <div ref={containerRef} className="relative inline-flex justify-end">
      <button
        type="button"
        aria-label="Open row actions"
        onClick={() => setOpen((current) => !current)}
        className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-cerulean-500)]"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 text-left shadow-xl shadow-slate-900/10">
          {actions.map((action) => {
            const disabled = action.disabled?.(row) ?? false;
            const className = `flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
              action.danger
                ? 'text-rose-700 hover:bg-rose-50'
                : 'text-slate-700 hover:bg-slate-50'
            } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`;

            if (action.href && !disabled) {
              return (
                <Link
                  key={action.key}
                  href={action.href(row)}
                  className={className}
                  onClick={() => setOpen(false)}
                >
                  {action.icon}
                  {action.label}
                </Link>
              );
            }

            return (
              <button
                key={action.key}
                type="button"
                disabled={disabled}
                onClick={() => {
                  action.onClick?.(row);
                  setOpen(false);
                }}
                className={className}
              >
                {action.icon}
                {action.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
