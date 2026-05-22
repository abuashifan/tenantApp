'use client';

import { X } from 'lucide-react';
import type { PrimaryTab } from './types';

type PrimaryVirtualTabsProps = {
  tabs: PrimaryTab[];
  activeTabId: string;
  onSelectTab: (tab: PrimaryTab) => void;
  onCloseTab: (tabId: string) => void;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function PrimaryVirtualTabs({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
}: PrimaryVirtualTabsProps) {
  return (
    <div className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto pt-3">
      {tabs.map((tab) => {
        const active = tab.id === activeTabId;

        return (
          <div
            key={tab.id}
            className={cx(
              'group flex h-11 min-w-36 max-w-60 items-center gap-2 rounded-t-xl border border-b-0 px-3 text-sm transition',
              active
                ? 'border-rose-400 bg-rose-500 text-white shadow-sm'
                : 'border-slate-300 bg-slate-200 text-slate-700 hover:bg-white',
            )}
          >
            <button
              type="button"
              onClick={() => onSelectTab(tab)}
              className="min-w-0 flex-1 truncate text-left font-semibold"
            >
              {tab.label}
            </button>
            {tab.closable ? (
              <button
                type="button"
                onClick={() => onCloseTab(tab.id)}
                className={cx(
                  'rounded-full p-0.5 transition',
                  active ? 'hover:bg-white/20' : 'hover:bg-slate-300',
                )}
                aria-label={`Close ${tab.label}`}
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
