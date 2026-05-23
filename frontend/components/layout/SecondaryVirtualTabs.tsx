'use client';

import { ListTree, Plus, X } from 'lucide-react';
import type { PrimaryTab, SecondaryTab } from './types';

type SecondaryVirtualTabsProps = {
  activePrimaryTab: PrimaryTab;
  tabs: SecondaryTab[];
  activeTabId: string | null;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tab: SecondaryTab) => void;
  onAddTab: () => void;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function SecondaryVirtualTabs({
  activePrimaryTab,
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
}: SecondaryVirtualTabsProps) {
  if (activePrimaryTab.id === '/dashboard') return null;

  return (
    <div className="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex min-h-11 items-end gap-1 overflow-x-auto pt-1">
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              className={cx(
                'group flex h-10 items-center gap-2 rounded-t-lg border border-b-0 px-3 text-sm transition',
                tab.mode === 'list' ? 'min-w-14 max-w-14 justify-center' : 'min-w-32 max-w-56',
                active
                  ? 'border-slate-300 bg-white text-slate-950 shadow-sm'
                  : 'border-slate-300 bg-slate-200 text-slate-600 hover:bg-white',
              )}
            >
              <button
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={cx(
                  'min-w-0 flex-1 font-semibold',
                  tab.mode === 'list' ? 'flex items-center justify-center' : 'truncate text-left',
                )}
                title={tab.label}
              >
                {tab.mode === 'list' ? <ListTree className="h-5 w-5" /> : tab.label}
              </button>
              {tab.closable ? (
                <button
                  type="button"
                  onClick={() => onCloseTab(tab)}
                  className={cx(
                    'rounded-full p-0.5 transition',
                    active ? 'hover:bg-slate-100' : 'hover:bg-slate-300',
                  )}
                  aria-label={`Close ${tab.label}`}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          );
        })}
        <button
          type="button"
          onClick={onAddTab}
          className="mb-1 flex h-9 min-w-10 items-center justify-center rounded-t-lg bg-[var(--erp-lime)] px-3 text-sm font-bold text-slate-950 shadow-sm hover:brightness-95"
          aria-label="Open new form tab"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
