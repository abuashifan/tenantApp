'use client';

import { Building2, ChevronDown, ChevronRight, Menu } from 'lucide-react';
import { getSubmenuIcon } from './navigation';
import type { ModuleNavGroup, ModuleNavItem, StoredActiveCompany } from './types';

type SidebarMode = 'full' | 'minimal';

type SidebarProps = {
  mode: SidebarMode;
  groups: ModuleNavGroup[];
  activeModuleId: string;
  activeItemId: string | null;
  activeCompany: StoredActiveCompany | null;
  expandedModuleId: string | null;
  onModeChange: (mode: SidebarMode) => void;
  onExpandedModuleChange: (moduleId: string | null) => void;
  onDashboardSelect: () => void;
  onModuleSelect: (group: ModuleNavGroup) => void;
  onItemSelect: (group: ModuleNavGroup, item: ModuleNavItem) => void;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function Sidebar({
  mode,
  groups,
  activeModuleId,
  activeItemId,
  activeCompany,
  expandedModuleId,
  onModeChange,
  onExpandedModuleChange,
  onDashboardSelect,
  onModuleSelect,
  onItemSelect,
}: SidebarProps) {
  const isMinimal = mode === 'minimal';

  return (
    <aside
      className={cx(
        'fixed left-0 top-0 z-50 h-screen border-r border-white/10 text-white transition-all duration-300',
        isMinimal ? 'w-20' : 'w-80',
      )}
      style={{
        background:
          'linear-gradient(180deg, var(--erp-sidebar-dark), var(--erp-sidebar-dark-soft))',
      }}
    >
      <div className="flex h-full flex-col">
        <div
          className={cx(
            'flex items-center border-b border-white/10 py-5',
            isMinimal ? 'justify-center px-3' : 'justify-between px-6',
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--erp-lime),var(--erp-teal))] shadow-lg">
              <Building2 className="h-6 w-6 text-slate-950" />
            </div>
            {!isMinimal ? (
              <div>
                <p className="text-lg font-bold tracking-tight">Tenant ERP</p>
                <p className="text-xs text-slate-300">Accounting workspace</p>
              </div>
            ) : null}
          </div>
        </div>

        {!isMinimal ? (
          <div className="px-4 py-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-300">Active Company</p>
              <p className="mt-2 truncate text-sm font-semibold">
                {activeCompany?.name ?? 'Not selected'}
              </p>
              <p className="truncate text-xs text-slate-400">
                {activeCompany?.user_role ?? activeCompany?.code ?? 'Company context'}
              </p>
            </div>
          </div>
        ) : null}

        <div className="px-3 py-3">
          <button
            type="button"
            onClick={() => onModeChange(isMinimal ? 'full' : 'minimal')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Menu className="h-4 w-4" />
            {!isMinimal ? <span>Minimal Sidebar</span> : null}
          </button>
        </div>

        <nav className={cx('flex-1 space-y-2 overflow-y-auto pb-4', isMinimal ? 'px-3' : 'px-4')}>
          {groups.map((group) => {
            const Icon = group.icon;
            const isActive = activeModuleId === group.id;
            const hasItems = group.items.length > 0;
            const isExpanded = expandedModuleId === group.id;

            return (
              <div key={group.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (group.id === 'dashboard') {
                      onDashboardSelect();
                      onExpandedModuleChange(null);
                      return;
                    }

                    onModuleSelect(group);
                    if (!isMinimal && hasItems) {
                      onExpandedModuleChange(isExpanded ? null : group.id);
                    }
                  }}
                  className={cx(
                    'group flex w-full items-center justify-between rounded-2xl py-3 text-sm font-semibold transition',
                    isMinimal ? 'justify-center px-0' : 'px-4',
                    isActive
                      ? 'bg-[linear-gradient(135deg,var(--erp-lime-soft),var(--erp-ocean-soft))] text-slate-950 shadow-lg'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white',
                  )}
                  title={group.label}
                >
                  <span className={cx('flex items-center', isMinimal ? 'justify-center' : 'gap-3')}>
                    <Icon className="h-5 w-5" />
                    {!isMinimal ? group.label : null}
                  </span>
                  {!isMinimal && hasItems ? (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )
                  ) : null}
                </button>

                {!isMinimal && hasItems && isExpanded ? (
                  <div className="mt-1 space-y-1 pl-4">
                    {group.items.map((item) => {
                      const ItemIcon = getSubmenuIcon(item.key, item.label);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onItemSelect(group, item)}
                          className={cx(
                            'flex w-full items-center gap-2 rounded-xl px-4 py-2 text-left text-xs transition',
                            activeItemId === item.id
                              ? 'bg-white/15 text-white'
                              : 'text-slate-400 hover:bg-white/10 hover:text-white',
                          )}
                        >
                          <ItemIcon
                            className={cx(
                              'h-4 w-4 shrink-0',
                              activeItemId === item.id ? 'text-lime-300' : 'text-slate-500',
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
