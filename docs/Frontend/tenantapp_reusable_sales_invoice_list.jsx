import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit3,
  Send,
  FileText,
  CalendarDays,
  Building2,
  ChevronDown,
  X,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Ban,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

/**
 * TenantApp — Reusable ERP Document List Workspace
 * --------------------------------------------------
 * Frontend target: Next.js + React + TailwindCSS + TypeScript
 * Backend target: Laravel API
 *
 * This Canvas component intentionally uses mock data only.
 * In the real app, keep DocumentListPage reusable and replace mockInvoices
 * with Laravel API data from /api/sales/invoices or the matching endpoint.
 */

type InvoiceStatus = "draft" | "approved" | "sent" | "paid" | "partial" | "overdue" | "void";

type SalesInvoice = {
  id: string;
  invoiceNo: string;
  customer: string;
  customerCode: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentStatus: "unpaid" | "partial" | "paid" | "overdue";
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  salesPerson: string;
  source: string;
  branch: string;
  updatedAt: string;
};

type StatusConfig = {
  label: string;
  className: string;
  icon?: React.ReactNode;
};

type ColumnConfig<T> = {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
};

type FilterOption = {
  label: string;
  value: string;
};

type SummaryCard = {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
};

type DocumentListPageProps<T extends { id: string }> = {
  documentLabel: string;
  newButtonLabel: string;
  rows: T[];
  columns: ColumnConfig<T>[];
  statusOptions: FilterOption[];
  partyFilterLabel: string;
  getSearchText: (row: T) => string;
  getStatus: (row: T) => string;
  getDate: (row: T) => string;
  getPartyName: (row: T) => string;
};

const mockInvoices: SalesInvoice[] = [
  {
    id: "1",
    invoiceNo: "INV.2026.0001",
    customer: "PT Sinar Pangan Nusantara",
    customerCode: "CUS-001",
    invoiceDate: "2026-05-03",
    dueDate: "2026-05-20",
    status: "paid",
    paymentStatus: "paid",
    subtotal: 18500000,
    tax: 2035000,
    total: 20535000,
    paidAmount: 20535000,
    balanceDue: 0,
    salesPerson: "Rani Pratama",
    source: "Sales Order SO.2026.0012",
    branch: "Main Office",
    updatedAt: "2 jam lalu",
  },
  {
    id: "2",
    invoiceNo: "INV.2026.0002",
    customer: "CV Berkah Distribusi",
    customerCode: "CUS-008",
    invoiceDate: "2026-05-05",
    dueDate: "2026-05-25",
    status: "sent",
    paymentStatus: "unpaid",
    subtotal: 12400000,
    tax: 1364000,
    total: 13764000,
    paidAmount: 0,
    balanceDue: 13764000,
    salesPerson: "Fajar Hidayat",
    source: "Delivery Order DO.2026.0009",
    branch: "Jakarta",
    updatedAt: "Kemarin",
  },
  {
    id: "3",
    invoiceNo: "INV.2026.0003",
    customer: "Toko Laris Jaya",
    customerCode: "CUS-014",
    invoiceDate: "2026-05-08",
    dueDate: "2026-05-18",
    status: "partial",
    paymentStatus: "partial",
    subtotal: 9100000,
    tax: 1001000,
    total: 10101000,
    paidAmount: 4500000,
    balanceDue: 5601000,
    salesPerson: "Rani Pratama",
    source: "Manual Invoice",
    branch: "Bandung",
    updatedAt: "3 hari lalu",
  },
  {
    id: "4",
    invoiceNo: "INV.2026.0004",
    customer: "PT Lautan Retailindo",
    customerCode: "CUS-021",
    invoiceDate: "2026-05-10",
    dueDate: "2026-05-17",
    status: "overdue",
    paymentStatus: "overdue",
    subtotal: 33750000,
    tax: 3712500,
    total: 37462500,
    paidAmount: 0,
    balanceDue: 37462500,
    salesPerson: "Maya Anggraini",
    source: "Sales Order SO.2026.0017",
    branch: "Surabaya",
    updatedAt: "Hari ini",
  },
  {
    id: "5",
    invoiceNo: "INV.2026.0005",
    customer: "UD Makmur Sentosa",
    customerCode: "CUS-030",
    invoiceDate: "2026-05-12",
    dueDate: "2026-06-01",
    status: "draft",
    paymentStatus: "unpaid",
    subtotal: 6800000,
    tax: 748000,
    total: 7548000,
    paidAmount: 0,
    balanceDue: 7548000,
    salesPerson: "Fajar Hidayat",
    source: "Draft from Quotation",
    branch: "Main Office",
    updatedAt: "Baru saja",
  },
  {
    id: "6",
    invoiceNo: "INV.2026.0006",
    customer: "PT Mandiri Kopi Indonesia",
    customerCode: "CUS-034",
    invoiceDate: "2026-05-15",
    dueDate: "2026-05-30",
    status: "approved",
    paymentStatus: "unpaid",
    subtotal: 15850000,
    tax: 1743500,
    total: 17593500,
    paidAmount: 0,
    balanceDue: 17593500,
    salesPerson: "Maya Anggraini",
    source: "Sales Order SO.2026.0022",
    branch: "Jakarta",
    updatedAt: "5 jam lalu",
  },
];

const demoInvoices: SalesInvoice[] = Array.from({ length: 5 }).flatMap((_, batchIndex) =>
  mockInvoices.map((invoice, invoiceIndex) => {
    const sequence = batchIndex * mockInvoices.length + invoiceIndex + 1;
    const date = new Date(invoice.invoiceDate);
    const dueDate = new Date(invoice.dueDate);

    date.setDate(date.getDate() + batchIndex * 6);
    dueDate.setDate(dueDate.getDate() + batchIndex * 6);

    return {
      ...invoice,
      id: String(sequence),
      invoiceNo: `INV.2026.${String(sequence).padStart(4, "0")}`,
      invoiceDate: date.toISOString().slice(0, 10),
      dueDate: dueDate.toISOString().slice(0, 10),
      total: invoice.total + batchIndex * 125000,
      balanceDue: invoice.balanceDue === 0 ? 0 : invoice.balanceDue + batchIndex * 75000,
    };
  }),
);

const statusMap: Record<InvoiceStatus, StatusConfig> = {
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
    icon: <Edit3 className="h-3 w-3" />,
  },
  approved: {
    label: "Approved",
    className: "bg-blue-50 text-blue-700 ring-blue-100",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  sent: {
    label: "Sent",
    className: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    icon: <Send className="h-3 w-3" />,
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  partial: {
    label: "Partial",
    className: "bg-lime-50 text-lime-700 ring-lime-100",
    icon: <Clock3 className="h-3 w-3" />,
  },
  overdue: {
    label: "Overdue",
    className: "bg-rose-50 text-rose-700 ring-rose-100",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  void: {
    label: "Void",
    className: "bg-zinc-100 text-zinc-500 ring-zinc-200",
    icon: <X className="h-3 w-3" />,
  },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const isDateInRange = (dateValue: string, dateFrom: string, dateTo: string) => {
  const value = new Date(dateValue).getTime();
  const from = dateFrom ? new Date(dateFrom).getTime() : Number.NEGATIVE_INFINITY;
  const to = dateTo ? new Date(dateTo).getTime() : Number.POSITIVE_INFINITY;

  return value >= from && value <= to;
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const config = statusMap[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function DocumentListPage<T extends { id: string }>({
  documentLabel,
  newButtonLabel,
  rows,
  columns,
  statusOptions,
  partyFilterLabel,
  getSearchText,
  getStatus,
  getDate,
  getPartyName,
}: DocumentListPageProps<T>) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [party, setParty] = useState("all");
  const [partySearch, setPartySearch] = useState("");
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const partyDropdownRef = useRef<HTMLDivElement | null>(null);
  const actionMenuRef = useRef<HTMLTableCellElement | null>(null);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);

  const partyOptions = useMemo(() => {
    const names = rows.map((row) => getPartyName(row));
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [rows, getPartyName]);

  const filteredPartyOptions = useMemo(() => {
    return partyOptions.filter((partyName) => partyName.toLowerCase().includes(partySearch.toLowerCase()));
  }, [partyOptions, partySearch]);

  const selectedPartyLabel = party === "all" ? `All ${partyFilterLabel}` : party;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (partyDropdownRef.current && !partyDropdownRef.current.contains(target)) {
        setIsPartyDropdownOpen(false);
      }

      if (actionMenuRef.current && !actionMenuRef.current.contains(target)) {
        setOpenActionId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  const filteredRows = useMemo(() => {
    const result = rows.filter((row) => {
      const matchesQuery = getSearchText(row).toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || getStatus(row) === status;
      const matchesParty = party === "all" || getPartyName(row) === party;
      const matchesDateRange = isDateInRange(getDate(row), dateFrom, dateTo);
      return matchesQuery && matchesStatus && matchesParty && matchesDateRange;
    });

    if (!sortKey) return result;

    const activeColumn = columns.find((column) => column.key === sortKey);
    if (!activeColumn?.sortValue) return result;

    return [...result].sort((a, b) => {
      const aValue = activeColumn.sortValue?.(a);
      const bValue = activeColumn.sortValue?.(b);

      if (aValue === undefined || bValue === undefined) return 0;

      const comparison = typeof aValue === "number" && typeof bValue === "number"
        ? aValue - bValue
        : String(aValue).localeCompare(String(bValue));

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [rows, columns, query, status, party, dateFrom, dateTo, sortKey, sortDirection, getSearchText, getStatus, getDate, getPartyName]);

  const visibleRows = filteredRows.slice(0, visibleCount);
  const hasMoreRows = visibleRows.length < filteredRows.length;

  useEffect(() => {
    setVisibleCount(12);
    tableScrollRef.current?.scrollTo({ top: 0 });
  }, [query, status, party, dateFrom, dateTo, sortKey, sortDirection]);

  const loadMoreRows = () => {
    setVisibleCount((currentCount) => Math.min(currentCount + 12, filteredRows.length));
  };

  const handleTableScroll = () => {
    const element = tableScrollRef.current;
    if (!element || !hasMoreRows) return;

    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    if (distanceFromBottom < 96) {
      loadMoreRows();
    }
  };

  const allSelected = visibleRows.length > 0 && visibleRows.every((row) => selectedIds.includes(row.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((currentIds) => currentIds.filter((id) => !visibleRows.some((row) => row.id === id)));
      return;
    }

    setSelectedIds((currentIds) => Array.from(new Set([...currentIds, ...visibleRows.map((row) => row.id)])));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((currentIds) =>
      currentIds.includes(id) ? currentIds.filter((selectedId) => selectedId !== id) : [...currentIds, id],
    );
  };

  const toggleSort = (column: ColumnConfig<T>) => {
    if (!column.sortable) return;

    if (sortKey === column.key) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(column.key);
    setSortDirection("asc");
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f7fbe9]/50 p-4 text-slate-900 md:p-6 lg:p-8">
      <section className="mx-auto flex h-full max-w-[1500px] flex-col">
        <div className="flex min-h-0 flex-1 flex-col rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 lg:p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
                <div className="relative min-w-0 flex-1 md:max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cari nomor invoice, customer, branch, atau sales..."
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:bg-white focus:ring-4 focus:ring-[#e9f6fb]"
                  />
                </div>

                <button
                  onClick={() => setShowFilters((value) => !value)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                  <ChevronDown className={`h-4 w-4 transition ${showFilters ? "rotate-180" : ""}`} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedIds.length > 0 && (
                  <span className="rounded-full bg-[#edf8f1] px-3 py-1.5 text-xs font-semibold text-[#2c6d43]">
                    {selectedIds.length} selected
                  </span>
                )}
                <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#06131e] px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#091c2a]">
                  <Plus className="h-4 w-4" />
                  {newButtonLabel}
                </button>
                <button
                  disabled={selectedIds.length === 0}
                  className={`inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition ${
                    selectedIds.length > 0
                      ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                      : "cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-300"
                  }`}
                >
                  <Ban className="h-4 w-4" />
                  Void
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 grid gap-3 rounded-3xl bg-slate-50 p-3 md:grid-cols-4">
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</span>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div ref={partyDropdownRef} className="relative space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{partyFilterLabel}</span>
                  <button
                    type="button"
                    onClick={() => setIsPartyDropdownOpen((value) => !value)}
                    className="flex h-10 w-full items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-left text-sm outline-none transition hover:bg-slate-50 focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
                  >
                    <span className={party === "all" ? "text-slate-400" : "truncate text-slate-700"}>{selectedPartyLabel}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${isPartyDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isPartyDropdownOpen && (
                    <div className="absolute left-0 right-0 top-[68px] z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                      <div className="border-b border-slate-100 p-2">
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            value={partySearch}
                            onChange={(event) => setPartySearch(event.target.value)}
                            placeholder={`Search ${partyFilterLabel.toLowerCase()}...`}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:bg-white focus:ring-4 focus:ring-[#e9f6fb]"
                          />
                        </div>
                      </div>

                      <div className="max-h-56 overflow-y-auto p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setParty("all");
                            setPartySearch("");
                            setIsPartyDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                            party === "all" ? "bg-[#f0f8d3] font-semibold text-[#2c6d43]" : "text-slate-700"
                          }`}
                        >
                          All {partyFilterLabel}
                          {party === "all" && <CheckCircle2 className="h-4 w-4" />}
                        </button>

                        {filteredPartyOptions.map((partyName) => (
                          <button
                            key={partyName}
                            type="button"
                            onClick={() => {
                              setParty(partyName);
                              setPartySearch("");
                              setIsPartyDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                              party === partyName ? "bg-[#f0f8d3] font-semibold text-[#2c6d43]" : "text-slate-700"
                            }`}
                          >
                            <span className="truncate">{partyName}</span>
                            {party === partyName && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                          </button>
                        ))}

                        {filteredPartyOptions.length === 0 && (
                          <div className="px-3 py-6 text-center text-xs text-slate-400">No {partyFilterLabel.toLowerCase()} found.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tanggal Awal</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tanggal Akhir</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
                  />
                </label>
              </div>
            )}
          </div>

          <div ref={tableScrollRef} onScroll={handleTableScroll} className="min-h-0 flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                <tr>
                  <th className="w-12 px-5 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-slate-300 text-[#24a1db] focus:ring-[#24a1db]"
                    />
                  </th>
                  {columns.map((column) => {
                    const isActiveSort = sortKey === column.key;
                    const SortIcon = !isActiveSort ? ArrowUpDown : sortDirection === "asc" ? ArrowUp : ArrowDown;

                    return (
                      <th
                        key={column.key}
                        className={`px-4 py-4 text-${column.align ?? "left"} text-xs font-bold uppercase tracking-wider text-slate-400 ${
                          column.width ?? ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(column)}
                          disabled={!column.sortable}
                          className={`inline-flex items-center gap-1.5 rounded-lg transition ${
                            column.align === "right" ? "justify-end" : "justify-start"
                          } ${column.sortable ? "hover:text-slate-700" : "cursor-default"}`}
                        >
                          <span>{column.label}</span>
                          {column.sortable && <SortIcon className="h-3.5 w-3.5" />}
                        </button>
                      </th>
                    );
                  })}
                  <th className="w-14 px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {visibleRows.map((row) => (
                  <tr key={row.id} className="group transition hover:bg-[#f7fbe9]/55">
                    <td className="px-5 py-4 align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleOne(row.id)}
                        className="h-4 w-4 rounded border-slate-300 text-[#24a1db] focus:ring-[#24a1db]"
                      />
                    </td>
                    {columns.map((column) => (
                      <td key={column.key} className={`px-4 py-4 align-top text-${column.align ?? "left"}`}>
                        {column.render(row)}
                      </td>
                    ))}
                    <td
                      ref={openActionId === row.id ? actionMenuRef : null}
                      className="relative px-5 py-4 text-right align-top"
                    >
                      <button
                        onClick={() => setOpenActionId(openActionId === row.id ? null : row.id)}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {openActionId === row.id && (
                        <div className="absolute right-5 top-12 z-10 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 text-left shadow-xl shadow-slate-900/10">
                          <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            <Eye className="h-4 w-4 text-slate-400" /> View Detail
                          </button>
                          <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            <Edit3 className="h-4 w-4 text-slate-400" /> Edit
                          </button>
                          <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            <Send className="h-4 w-4 text-slate-400" /> Send Invoice
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRows.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Tidak ada data ditemukan</h3>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                Coba ubah kata kunci pencarian atau filter status untuk melihat data lain.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>
              Menampilkan <span className="font-semibold text-slate-900">{visibleRows.length}</span> dari{" "}
              <span className="font-semibold text-slate-900">{filteredRows.length}</span> hasil filter
              <span className="text-slate-300"> / </span>
              total <span className="font-semibold text-slate-900">{rows.length}</span> {documentLabel.toLowerCase()}.
            </p>
            <div className="flex items-center gap-2">
              {hasMoreRows ? (
                <button
                  onClick={loadMoreRows}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Load more
                </button>
              ) : (
                <span className="rounded-xl bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Semua data sudah tampil
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function runDocumentListSmokeTests() {
  const paidInvoices = mockInvoices.filter((invoice) => invoice.status === "paid");
  const searchResult = mockInvoices.filter((invoice) =>
    [invoice.invoiceNo, invoice.customer, invoice.customerCode, invoice.branch, invoice.salesPerson, invoice.source, invoice.status]
      .join(" ")
      .toLowerCase()
      .includes("mandiri"),
  );
  const totalInvoice = mockInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalPaid = mockInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const totalDue = mockInvoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0);

  console.assert(paidInvoices.length === 1, "Expected exactly one paid invoice in mock data.");
  console.assert(searchResult.length === 1, "Expected search keyword 'mandiri' to find one invoice.");
  console.assert(totalInvoice === totalPaid + totalDue, "Expected total invoice to equal paid amount plus balance due.");
}

runDocumentListSmokeTests();

export default function SalesInvoiceListCanvas() {
  const columns: ColumnConfig<SalesInvoice>[] = [
    {
      key: "date",
      label: "Date",
      width: "min-w-[140px]",
      sortable: true,
      sortValue: (invoice) => invoice.invoiceDate,
      render: (invoice) => (
        <div>
          <p className="font-semibold text-slate-800">{formatDate(invoice.invoiceDate)}</p>
          <p className="mt-1 text-xs text-slate-400">Invoice Date</p>
        </div>
      ),
    },
    {
      key: "invoice",
      label: "Invoice",
      width: "min-w-[190px]",
      sortable: true,
      sortValue: (invoice) => invoice.invoiceNo,
      render: (invoice) => (
        <div>
          <button className="font-bold text-slate-950 transition hover:text-[#24a1db]">{invoice.invoiceNo}</button>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" />
            Due {formatDate(invoice.dueDate)}
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      width: "min-w-[260px]",
      sortable: true,
      sortValue: (invoice) => invoice.customer,
      render: (invoice) => (
        <div>
          <p className="font-semibold text-slate-800">{invoice.customer}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <Building2 className="h-3.5 w-3.5" />
            {invoice.customerCode} • {invoice.branch}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "min-w-[140px]",
      sortable: true,
      sortValue: (invoice) => invoice.status,
      render: (invoice) => <StatusBadge status={invoice.status} />,
    },
    {
      key: "source",
      label: "Source",
      width: "min-w-[190px]",
      sortable: true,
      sortValue: (invoice) => invoice.source,
      render: (invoice) => (
        <div>
          <p className="font-medium text-slate-700">{invoice.source}</p>
          <p className="mt-1 text-xs text-slate-400">Updated {invoice.updatedAt}</p>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      width: "min-w-[150px]",
      sortable: true,
      sortValue: (invoice) => invoice.total,
      render: (invoice) => (
        <div>
          <p className="font-bold text-slate-950">{formatCurrency(invoice.total)}</p>
          <p className="mt-1 text-xs text-slate-400">Tax {formatCurrency(invoice.tax)}</p>
        </div>
      ),
    },
    {
      key: "balance",
      label: "Balance Due",
      align: "right",
      width: "min-w-[160px]",
      sortable: true,
      sortValue: (invoice) => invoice.balanceDue,
      render: (invoice) => (
        <div>
          <p className={invoice.balanceDue > 0 ? "font-bold text-rose-600" : "font-bold text-emerald-600"}>
            {formatCurrency(invoice.balanceDue)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Paid {formatCurrency(invoice.paidAmount)}</p>
        </div>
      ),
    },
  ];

  return (
    <DocumentListPage<SalesInvoice>
      documentLabel="Sales Invoice"
      newButtonLabel="New Invoice"
      rows={demoInvoices}
      columns={columns}
      statusOptions={[
        { label: "All Status", value: "all" },
        { label: "Draft", value: "draft" },
        { label: "Approved", value: "approved" },
        { label: "Sent", value: "sent" },
        { label: "Paid", value: "paid" },
        { label: "Partial", value: "partial" },
        { label: "Overdue", value: "overdue" },
      ]}
      partyFilterLabel="Customer"
      getSearchText={(invoice) =>
        [
          invoice.invoiceNo,
          invoice.customer,
          invoice.customerCode,
          invoice.branch,
          invoice.salesPerson,
          invoice.source,
          invoice.status,
        ].join(" ")
      }
      getStatus={(invoice) => invoice.status}
      getDate={(invoice) => invoice.invoiceDate}
      getPartyName={(invoice) => invoice.customer}
    />
  );
}
