'use client';

import { X } from 'lucide-react';
import { getSubmenuIcon } from './navigation';
import type { ModuleNavGroup, ModuleNavItem } from './types';

type FloatingSubmenuPanelProps = {
  open: boolean;
  group: ModuleNavGroup | null;
  activeItemId: string | null;
  onClose: () => void;
  onItemSelect: (group: ModuleNavGroup, item: ModuleNavItem) => void;
};

const submenuCardThemes = [
  { bg: '#edf8f1', border: '#b6e2c5', icon: '#2c6d43' },
  { bg: '#f7fbe9', border: '#e1f1a7', icon: '#6c8415' },
  { bg: '#edf7f5', border: '#b7e1d5', icon: '#2d6c5a' },
  { bg: '#ecf8f9', border: '#b1e5e7', icon: '#257274' },
  { bg: '#e9f6fb', border: '#a7d9f1', icon: '#156184' },
  { bg: '#fff7ed', border: '#fed7aa', icon: '#c2410c' },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function FloatingSubmenuPanel({
  open,
  group,
  activeItemId,
  onClose,
  onItemSelect,
}: FloatingSubmenuPanelProps) {
  if (!open || !group || group.items.length === 0) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close submenu panel"
        className="fixed bottom-0 right-0 top-0 z-[35] cursor-default bg-transparent"
        style={{ left: '5rem' }}
        onClick={onClose}
      />
      <section className="fixed left-24 top-24 z-40 w-[min(44rem,calc(100vw-7rem))] rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-rose-500/70 pb-4">
          <div>
            <h2 className="text-2xl font-light text-slate-700">{group.label}</h2>
            <p className="mt-1 text-xs text-slate-400">Pilih submenu untuk membuka halaman.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close submenu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {group.items.map((item, index) => {
            const theme = submenuCardThemes[index % submenuCardThemes.length];
            const isActive = activeItemId === item.id;
            const ItemIcon = getSubmenuIcon(item.key, item.label);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onItemSelect(group, item)}
                className={cx(
                  'group flex min-h-28 flex-col items-center justify-center rounded-lg border p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                  isActive && 'ring-2 ring-slate-900/10',
                )}
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
                  <ItemIcon className="h-7 w-7" style={{ color: theme.icon }} />
                </div>
                <p className="mt-3 text-sm font-semibold leading-tight text-slate-700">
                  {item.label}
                </p>
                {item.description ? (
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-500">
                    {item.description}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
