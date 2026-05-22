import React, { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  WalletCards,
  ReceiptText,
  ShoppingCart,
  Package,
  Landmark,
  BarChart3,
  Settings,
  Menu,
  ListTree,
  ChevronDown,
  ChevronRight,
  Plus,
  UserCircle,
  User,
  KeyRound,
  LogOut,
  X,
} from "lucide-react";

const colors = {
  lime50: "#f7fbe9",
  lime100: "#f0f8d3",
  lime500: "#b4db24",
  emerald700: "#2c6d43",
  ocean50: "#edf7f5",
  teal500: "#3dbdc2",
  yale900: "#091c2a",
  yale950: "#06131e",
};

const submenuThemes = [
  { bg: "#edf8f1", border: "#b6e2c5", icon: "#2c6d43" },
  { bg: "#f7fbe9", border: "#e1f1a7", icon: "#6c8415" },
  { bg: "#edf7f5", border: "#b7e1d5", icon: "#2d6c5a" },
  { bg: "#ecf8f9", border: "#b1e5e7", icon: "#257274" },
  { bg: "#e9f6fb", border: "#a7d9f1", icon: "#156184" },
  { bg: "#f0e9fb", border: "#d8c1f1", icon: "#6b21a8" },
  { bg: "#fff7ed", border: "#fed7aa", icon: "#c2410c" },
  { bg: "#fdf2f8", border: "#fbcfe8", icon: "#be185d" },
];

const modules = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, items: [] },
  {
    key: "accounting",
    label: "Accounting",
    icon: ReceiptText,
    items: [
      { key: "journal-entries", label: "Journal Entries", endpoint: "/api/journal-entries" },
      { key: "fiscal-year-status", label: "Fiscal Year Status", endpoint: "/api/accounting/fiscal-year/status" },
      { key: "closing-wizard", label: "Closing Wizard", endpoint: "/api/accounting/fiscal-years/{id}/closing-checklist" },
      { key: "period-locks", label: "Period Locks", endpoint: "/api/accounting/period-locks/status" },
    ],
  },
  {
    key: "master-data",
    label: "Master Data",
    icon: Building2,
    items: [
      { key: "chart-of-accounts", label: "Chart of Accounts", endpoint: "/api/master-data/chart-of-accounts" },
      { key: "contacts", label: "Contacts", endpoint: "/api/master-data/contacts" },
      { key: "products", label: "Products", endpoint: "/api/master-data/products" },
      { key: "warehouses", label: "Warehouses", endpoint: "/api/master-data/warehouses" },
      { key: "departments", label: "Departments", endpoint: "/api/master-data/departments" },
      { key: "projects", label: "Projects", endpoint: "/api/master-data/projects" },
    ],
  },
  {
    key: "sales-ar",
    label: "Sales & AR",
    icon: WalletCards,
    items: [
      { key: "sales-quotations", label: "Sales Quotations", endpoint: "/api/sales/quotations" },
      { key: "sales-orders", label: "Sales Orders", endpoint: "/api/sales/orders" },
      { key: "sales-invoices", label: "Sales Invoices", endpoint: "/api/sales/invoices" },
      { key: "sales-receipts", label: "Sales Receipts", endpoint: "/api/sales/receipts" },
      { key: "ar-aging", label: "AR Aging", endpoint: "/api/sales/ar/aging" },
    ],
  },
  {
    key: "purchase-ap",
    label: "Purchase & AP",
    icon: ShoppingCart,
    items: [
      { key: "purchase-requests", label: "Purchase Requests", endpoint: "/api/purchase/requests" },
      { key: "purchase-orders", label: "Purchase Orders", endpoint: "/api/purchase/orders" },
      { key: "vendor-bills", label: "Vendor Bills", endpoint: "/api/purchase/vendor-bills" },
      { key: "vendor-payments", label: "Vendor Payments", endpoint: "/api/purchase/vendor-payments" },
      { key: "ap-aging", label: "AP Aging", endpoint: "/api/purchase/ap/aging" },
    ],
  },
  {
    key: "cash-bank",
    label: "Cash & Bank",
    icon: Landmark,
    items: [
      { key: "cash-bank-accounts", label: "Cash Bank Accounts", endpoint: "/api/cash-bank/accounts" },
      { key: "cash-receipts", label: "Cash Receipts", endpoint: "/api/cash-bank/cash-receipts" },
      { key: "cash-payments", label: "Cash Payments", endpoint: "/api/cash-bank/cash-payments" },
      { key: "bank-transfers", label: "Bank Transfers", endpoint: "/api/cash-bank/bank-transfers" },
    ],
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: Package,
    items: [
      { key: "stock-balances", label: "Stock Balances", endpoint: "/api/inventory/stock-balances" },
      { key: "stock-movements", label: "Stock Movements", endpoint: "/api/inventory/stock-movements" },
      { key: "stock-adjustments", label: "Stock Adjustments", endpoint: "/api/inventory/stock-adjustments" },
      { key: "stock-opnames", label: "Stock Opnames", endpoint: "/api/inventory/stock-opnames" },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    icon: BarChart3,
    items: [
      { key: "financial-summary", label: "Financial Summary", endpoint: "/api/reports/financial-summary" },
      { key: "general-ledger", label: "General Ledger", endpoint: "/api/reports/general-ledger" },
      { key: "trial-balance", label: "Trial Balance", endpoint: "/api/reports/trial-balance" },
      { key: "profit-loss", label: "Profit & Loss", endpoint: "/api/reports/profit-loss" },
      { key: "balance-sheet", label: "Balance Sheet", endpoint: "/api/reports/balance-sheet" },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    items: [
      { key: "company-settings", label: "Company Settings", endpoint: "/api/settings/company" },
      { key: "module-settings", label: "Module Settings", endpoint: "/api/settings/company/modules" },
      { key: "permissions", label: "Permissions", endpoint: "/api/auth/permissions" },
    ],
  },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function findModule(activeModule) {
  return modules.find((module) => module.key === activeModule) ?? modules[0];
}

function findNodeByKey(key) {
  for (const module of modules) {
    if (module.key === key) {
      return { moduleKey: module.key, itemKey: null, label: module.label };
    }
    const item = module.items.find((entry) => entry.key === key);
    if (item) {
      return { moduleKey: module.key, itemKey: item.key, label: item.label };
    }
  }
  return { moduleKey: "dashboard", itemKey: null, label: "Dashboard" };
}

function getActiveTabLabel(activeModule, activeItem) {
  if (!activeItem) return findModule(activeModule).label;
  const module = findModule(activeModule);
  return module.items.find((item) => item.key === activeItem)?.label ?? module.label;
}

function getListTabLabel(pageLabel) {
  const lower = pageLabel.toLowerCase();
  if (lower.includes("journal")) return "Daftar Jurnal";
  if (lower.includes("invoice")) return "Daftar Invoice";
  if (lower.includes("quotation")) return "Daftar Quotation";
  if (lower.includes("order")) return "Daftar Order";
  if (lower.includes("payment")) return "Daftar Pembayaran";
  if (lower.includes("receipt")) return "Daftar Penerimaan";
  if (lower.includes("account")) return "Daftar Akun";
  if (lower.includes("product")) return "Daftar Produk";
  if (lower.includes("warehouse")) return "Daftar Gudang";
  if (lower.includes("balance")) return "Daftar Saldo";
  return `Daftar ${pageLabel}`;
}

function Sidebar({ mode, setMode, activeModule, setActiveModule, activeItem, setActiveItem, setFlyoutOpen }) {
  const isMinimal = mode === "minimal";
  const [expanded, setExpanded] = useState({ accounting: true });

  return (
    <aside
      className={cx(
        "fixed left-0 top-0 z-40 h-screen border-r border-white/10 text-white transition-all duration-300",
        isMinimal ? "w-20" : "w-80"
      )}
      style={{ background: `linear-gradient(180deg, ${colors.yale950}, ${colors.yale900})` }}
    >
      <div className="flex h-full flex-col">
        <div className={cx("flex items-center border-b border-white/10 py-5", isMinimal ? "justify-center px-3" : "justify-between px-6")}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg" style={{ background: `linear-gradient(135deg, ${colors.lime500}, ${colors.teal500})` }}>
              <Building2 className="h-6 w-6 text-slate-950" />
            </div>
            {!isMinimal && (
              <div>
                <p className="text-lg font-bold tracking-tight">AkuntansiKu</p>
                <p className="text-xs text-slate-300">Sidebar Design Lab</p>
              </div>
            )}
          </div>
        </div>

        {!isMinimal && (
          <div className="px-4 py-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-300">Active Company</p>
              <p className="mt-2 text-sm font-semibold">PT Maju Jaya</p>
              <p className="text-xs text-slate-400">Owner · June 2026</p>
            </div>
          </div>
        )}

        <div className="px-3 py-3">
          <button
            onClick={() => {
              setFlyoutOpen(false);
              setMode(isMinimal ? "full" : "minimal");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Menu className="h-4 w-4" />
            {!isMinimal && <span>Minimal Sidebar</span>}
          </button>
        </div>

        <nav className={cx("flex-1 space-y-2 overflow-y-auto pb-4", isMinimal ? "px-3" : "px-4")}>
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.key;
            const hasItems = module.items.length > 0;
            const isExpanded = expanded[module.key];

            return (
              <div key={module.key}>
                <button
                  onClick={() => {
                    setActiveModule(module.key);
                    if (module.key === "dashboard") {
                      setActiveItem(null);
                    }
                    if (isMinimal && hasItems) {
                      setFlyoutOpen(true);
                    } else {
                      setFlyoutOpen(false);
                    }
                    if (!isMinimal && hasItems) {
                      setExpanded((prev) => {
                        const nextIsOpen = !prev[module.key];
                        return nextIsOpen ? { [module.key]: true } : {};
                      });
                    }
                  }}
                  className={cx(
                    "group flex w-full items-center justify-between rounded-2xl py-3 text-sm font-semibold transition",
                    isMinimal ? "justify-center px-0" : "px-4",
                    isActive ? "text-slate-950 shadow-lg" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                  style={isActive ? { background: `linear-gradient(135deg, ${colors.lime100}, ${colors.ocean50})` } : {}}
                  title={module.label}
                >
                  <span className={cx("flex items-center", isMinimal ? "justify-center" : "gap-3")}>
                    <Icon className="h-5 w-5" />
                    {!isMinimal && module.label}
                  </span>
                  {!isMinimal && hasItems && (isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
                </button>

                {!isMinimal && hasItems && isExpanded && (
                  <div className="mt-1 space-y-1 pl-4">
                    {module.items.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => {
                          setActiveModule(module.key);
                          setActiveItem(item.key);
                        }}
                        className={cx(
                          "flex w-full items-center gap-2 rounded-xl px-4 py-2 text-left text-xs transition",
                          activeItem === item.key ? "bg-white/15 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <span className={cx("h-1.5 w-1.5 rounded-full", activeItem === item.key ? "bg-lime-300" : "bg-slate-600")} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function FloatingSubmenuPanel({ mode, module, activeItem, setActiveItem, open, setOpen }) {
  if (mode === "full" || !open || !module.items.length) return null;

  const ModuleIcon = module.icon;
  const leftOffset = "5.75rem";

  return (
    <>
      <button
        aria-label="Close submenu panel"
        className="fixed inset-0 z-30 cursor-default bg-transparent"
        onClick={() => setOpen(false)}
      />
      <section
        className="fixed top-24 z-50 w-[min(44rem,calc(100vw-7rem))] rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20"
        style={{ left: leftOffset }}
      >
        <div className="flex items-center justify-between border-b border-rose-500/80 pb-4">
          <div>
            <h2 className="text-2xl font-light text-slate-700">{module.label}</h2>
            <p className="mt-1 text-xs text-slate-400">Pilih submenu untuk membuka halaman.</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {module.items.map((item, index) => {
            const theme = submenuThemes[index % submenuThemes.length];
            const isActive = activeItem === item.key;

            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveItem(item.key);
                  setOpen(false);
                }}
                className={cx(
                  "group flex min-h-28 flex-col items-center justify-center rounded-lg border p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                  isActive && "ring-2 ring-slate-900/10"
                )}
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
                  <ModuleIcon className="h-7 w-7" style={{ color: theme.icon }} />
                </div>
                <p className="mt-3 text-sm font-semibold leading-tight text-slate-700">{item.label}</p>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}

function PreviewHeader({ tabs, activeTabId, onSelectTab, onCloseTab, onCloseAllTabs }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!userMenuOpen) return;

    const handlePointerDown = (event) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [userMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex min-h-20 items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto pt-3">
          {tabs.map((tab) => {
            const active = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                className={cx(
                  "group flex h-11 min-w-36 max-w-60 items-center gap-2 rounded-t-xl border border-b-0 px-3 text-sm transition",
                  active ? "border-rose-400 bg-rose-500 text-white shadow-sm" : "border-slate-300 bg-slate-200 text-slate-700 hover:bg-white"
                )}
              >
                <button onClick={() => onSelectTab(tab.id)} className="min-w-0 flex-1 truncate text-left font-semibold">
                  {tab.label}
                </button>
                {tab.id !== "dashboard" && (
                  <button
                    onClick={() => onCloseTab(tab.id)}
                    className={cx("rounded-full p-0.5 transition", active ? "hover:bg-white/20" : "hover:bg-slate-300")}
                    aria-label={`Close ${tab.label}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2 pb-2">
          <button
            onClick={onCloseAllTabs}
            className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 md:block"
          >
            Close All
          </button>

          <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen((value) => !value)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm transition hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: colors.lime100 }}>
              <UserCircle className="h-5 w-5" style={{ color: colors.emerald700 }} />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-slate-950">Alif</p>
              <p className="text-[11px] text-slate-500">Owner</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-14 z-[80] w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/15">
                <button onClick={() => setUserMenuOpen(false)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <User className="h-4 w-4" /> Edit Profile
                </button>
                <button onClick={() => setUserMenuOpen(false)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <KeyRound className="h-4 w-4" /> Edit Password
                </button>
                <div className="my-2 border-t border-slate-100" />
                <button onClick={() => setUserMenuOpen(false)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4" /> Log Out
                </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </header>
  );
}

function SecondaryVirtualTabs({ parentTab, childTabs, activeChildId, onSelectChild, onCloseChild, onAddChild }) {
  if (!parentTab || parentTab.id === "dashboard") return null;

  return (
    <div className="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex min-h-11 items-end gap-1 overflow-x-auto pt-1">
        {childTabs.map((tab) => {
          const active = tab.id === activeChildId;
          return (
            <div
              key={tab.id}
              className={cx(
                "group flex h-10 items-center gap-2 rounded-t-lg border border-b-0 px-3 text-sm transition",
                tab.isList ? "min-w-14 max-w-14 justify-center" : "min-w-32 max-w-56",
                active ? "border-slate-300 bg-white text-slate-950 shadow-sm" : "border-slate-300 bg-slate-200 text-slate-600 hover:bg-white"
              )}
            >
              <button
                onClick={() => onSelectChild(tab.id)}
                className={cx(
                  "min-w-0 flex-1 font-semibold",
                  tab.isList ? "flex items-center justify-center" : "truncate text-left"
                )}
                title={tab.label}
              >
                {tab.isList ? <ListTree className="h-5 w-5" /> : tab.label}
              </button>
              {!tab.isList && (
                <button
                  onClick={() => onCloseChild(tab.id)}
                  className={cx("rounded-full p-0.5 transition", active ? "hover:bg-slate-100" : "hover:bg-slate-300")}
                  aria-label={`Close ${tab.label}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
        {parentTab.id !== "dashboard" && (
          <button
            onClick={onAddChild}
            className="mb-1 flex h-9 min-w-10 items-center justify-center rounded-t-lg bg-lime-500 px-3 text-sm font-bold text-white shadow-sm hover:bg-lime-600"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AccountingSidebarOnlyPrototype() {
  const [mode, setMode] = useState("full");
  const [activeModule, setActiveModule] = useState("dashboard");
  const [activeItem, setActiveItem] = useState(null);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [tabs, setTabs] = useState([{ id: "dashboard", label: "Dashboard" }]);
  const [activeTabId, setActiveTabId] = useState("dashboard");
  const [childTabsByParent, setChildTabsByParent] = useState({
    dashboard: [{ id: "dashboard-overview", label: "Dashboard", isList: true }],
  });
  const [activeChildByParent, setActiveChildByParent] = useState({ dashboard: "dashboard-overview" });
  const [closeAllQueue, setCloseAllQueue] = useState([]);
  const [closeAllIndex, setCloseAllIndex] = useState(0);
  const [closeAllPrompt, setCloseAllPrompt] = useState(null);
  const selectedModule = findModule(activeModule);
  const activeParentTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const currentChildTabs = childTabsByParent[activeTabId] ?? [];
  const activeChildId = activeChildByParent[activeTabId] ?? currentChildTabs[0]?.id;
  const activeChildTab = currentChildTabs.find((tab) => tab.id === activeChildId) ?? currentChildTabs[0];
  const isSidebarMinimal = mode === "minimal";
  const shouldShowFlyout = isSidebarMinimal && flyoutOpen && selectedModule.items.length > 0;

  const isTabDirty = (tabId) => {
    return ["journal-entries", "sales-quotations", "sales-invoices", "purchase-orders", "cash-payments", "stock-adjustments"].includes(tabId);
  };

  const activateTabAfterClose = (remainingTabs) => {
    const fallbackTab = remainingTabs[remainingTabs.length - 1] ?? { id: "dashboard", label: "Dashboard" };
    const node = findNodeByKey(fallbackTab.id);
    setActiveTabId(fallbackTab.id);
    setActiveModule(node.moduleKey);
    setActiveItem(node.itemKey);
  };

  const closeTabsByIds = (idsToClose) => {
    setTabs((currentTabs) => {
      const remainingTabs = currentTabs.filter((tab) => !idsToClose.includes(tab.id));
      if (idsToClose.includes(activeTabId)) {
        activateTabAfterClose(remainingTabs);
      }
      return remainingTabs.length ? remainingTabs : [{ id: "dashboard", label: "Dashboard" }];
    });
  };

  const continueCloseAll = (queue, nextIndex) => {
    const nextTab = queue[nextIndex];
    if (!nextTab) {
      setCloseAllQueue([]);
      setCloseAllIndex(0);
      setCloseAllPrompt(null);
      return;
    }

    if (isTabDirty(nextTab.id)) {
      setCloseAllQueue(queue);
      setCloseAllIndex(nextIndex);
      setCloseAllPrompt(nextTab);
      return;
    }

    closeTabsByIds([nextTab.id]);
    continueCloseAll(queue, nextIndex + 1);
  };

  const handleCloseAllTabs = () => {
    const closableTabs = tabs.filter((tab) => tab.id !== "dashboard");
    if (!closableTabs.length) return;
    continueCloseAll(closableTabs, 0);
  };

  const resolveCloseAllPrompt = (action) => {
    if (action === "cancel") {
      setCloseAllQueue([]);
      setCloseAllIndex(0);
      setCloseAllPrompt(null);
      return;
    }

    // Prototype only: "save" and "discard" both close the current tab.
    // Production implementation should call each form's save handler before closing when action === "save".
    closeTabsByIds([closeAllPrompt.id]);
    setCloseAllPrompt(null);
    continueCloseAll(closeAllQueue, closeAllIndex + 1);
  };

  useEffect(() => {
    if (!isSidebarMinimal) {
      setFlyoutOpen(false);
    }
  }, [isSidebarMinimal]);

  useEffect(() => {
    if (activeModule === "dashboard" && !activeItem) {
      setActiveTabId("dashboard");
      return;
    }

    if (!activeItem) return;

    const label = getActiveTabLabel(activeModule, activeItem);
    setActiveTabId(activeItem);
    setTabs((currentTabs) => {
      if (currentTabs.some((tab) => tab.id === activeItem)) return currentTabs;
      return [...currentTabs, { id: activeItem, label }];
    });
    setChildTabsByParent((current) => {
      if (current[activeItem]) return current;
      return {
        ...current,
        [activeItem]: [{ id: `${activeItem}-list`, label: getListTabLabel(label), isList: true }],
      };
    });
    setActiveChildByParent((current) => ({
      ...current,
      [activeItem]: current[activeItem] ?? `${activeItem}-list`,
    }));
  }, [activeModule, activeItem]);

  const selectTab = (tabId) => {
    const node = findNodeByKey(tabId);
    setActiveTabId(tabId);
    setActiveModule(node.moduleKey);
    setActiveItem(node.itemKey);
    setActiveChildByParent((current) => ({
      ...current,
      [tabId]: current[tabId] ?? childTabsByParent[tabId]?.[0]?.id,
    }));
    setFlyoutOpen(false);
  };

  const closeTab = (tabId) => {
    setTabs((currentTabs) => {
      const nextTabs = currentTabs.filter((tab) => tab.id !== tabId);
      setChildTabsByParent((current) => {
        const next = { ...current };
        delete next[tabId];
        return next;
      });
      setActiveChildByParent((current) => {
        const next = { ...current };
        delete next[tabId];
        return next;
      });
      if (activeTabId === tabId) {
        const fallbackTab = nextTabs[nextTabs.length - 1] ?? { id: "dashboard", label: "Dashboard" };
        const node = findNodeByKey(fallbackTab.id);
        setActiveTabId(fallbackTab.id);
        setActiveModule(node.moduleKey);
        setActiveItem(node.itemKey);
      }
      return nextTabs.length ? nextTabs : [{ id: "dashboard", label: "Dashboard" }];
    });
  };

  const selectChildTab = (childId) => {
    setActiveChildByParent((current) => ({ ...current, [activeTabId]: childId }));
  };

  const closeChildTab = (childId) => {
    setChildTabsByParent((current) => {
      const children = current[activeTabId] ?? [];
      const nextChildren = children.filter((tab) => tab.id !== childId || tab.isList);
      return { ...current, [activeTabId]: nextChildren };
    });

    if (activeChildId === childId) {
      const fallback = (childTabsByParent[activeTabId] ?? []).find((tab) => tab.isList);
      setActiveChildByParent((current) => ({ ...current, [activeTabId]: fallback?.id ?? `${activeTabId}-list` }));
    }
  };

  const addChildTab = () => {
    if (activeTabId === "dashboard") return;
    const count = (childTabsByParent[activeTabId] ?? []).filter((tab) => !tab.isList).length + 1;
    const newChild = {
      id: `${activeTabId}-form-${Date.now()}`,
      label: count === 1 ? "Data Baru" : `Data Baru ${count}`,
      isList: false,
    };
    setChildTabsByParent((current) => ({
      ...current,
      [activeTabId]: [...(current[activeTabId] ?? []), newChild],
    }));
    setActiveChildByParent((current) => ({ ...current, [activeTabId]: newChild.id }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar
        mode={mode}
        setMode={setMode}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        setFlyoutOpen={setFlyoutOpen}
      />

      <div className={cx("transition-all duration-300", isSidebarMinimal ? "pl-20" : "pl-80")}>
        <PreviewHeader
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={selectTab}
          onCloseTab={closeTab}
          onCloseAllTabs={handleCloseAllTabs}
        />
        <SecondaryVirtualTabs
          parentTab={activeParentTab}
          childTabs={currentChildTabs}
          activeChildId={activeChildId}
          onSelectChild={selectChildTab}
          onCloseChild={closeChildTab}
          onAddChild={addChildTab}
        />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Preview Area</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{activeChildTab?.label ?? (activeTabId === "dashboard" ? "Dashboard" : getActiveTabLabel(activeModule, activeItem))}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Virtual tabs utama berisi halaman kerja. Baris kedua berisi daftar/form yang sedang terbuka di dalam halaman aktif, dimulai dari tab daftar.
            </p>
          </div>
        </main>

        {shouldShowFlyout ? (
          <FloatingSubmenuPanel
            key={`${mode}-${selectedModule.key}`}
            mode={mode}
            module={selectedModule}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            open={shouldShowFlyout}
            setOpen={setFlyoutOpen}
          />
        ) : null}

        {closeAllPrompt && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/25">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Unsaved Form</p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">{closeAllPrompt.label}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Form ini terdeteksi belum disimpan. Pilih apakah perubahan ingin disimpan sebelum tab ditutup.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => resolveCloseAllPrompt("cancel")}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => resolveCloseAllPrompt("discard")}
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
                >
                  Jangan Simpan
                </button>
                <button
                  onClick={() => resolveCloseAllPrompt("save")}
                  className="rounded-2xl px-4 py-3 text-sm font-black text-slate-950 shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${colors.lime500}, ${colors.teal500})` }}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
