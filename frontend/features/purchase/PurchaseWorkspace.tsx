'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { getSubmenuIcon } from '@/components/layout/navigation';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGuard } from '@/components/ui/PermissionGuard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  DocumentListWorkspace,
  type WorkspaceColumn,
  type WorkspaceFilterState,
  type WorkspaceRowAction,
} from '@/components/workspace';
import { listChartOfAccounts } from '@/features/accounting/chart-of-accounts/api';
import { listMasterData } from '@/features/accounting/master-data/api';
import { purchaseGet, purchasePatch, purchasePost } from '@/features/purchase/api/purchaseApi';
import { PURCHASE_NAV_ITEMS } from '@/features/purchase/navigation';
import { PurchasePageGate } from '@/features/purchase/PurchasePageGate';
import type { PurchaseDocument, PurchaseEndpointConfig, PurchaseLineItem } from '@/features/purchase/types';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getStoredPermissions, hasPermission } from '@/lib/permissions';

type PurchaseWorkspaceProps = {
  segments?: string[];
};

type SelectRecord = Record<string, unknown> & { id: number };

type DraftLine = {
  product_id: string;
  product_code: string;
  description: string;
  quantity: string;
  unit_id: string;
  unit_price: string;
  estimated_unit_price: string;
  discount_amount: string;
  tax_amount: string;
  warehouse_id: string;
  department_id: string;
  project_id: string;
  expense_account_id: string;
  purchase_request_line_id?: number | null;
  purchase_order_line_id?: number | null;
  goods_receipt_line_id?: number | null;
  vendor_bill_line_id?: number | null;
};

const DOCUMENTS: Record<string, PurchaseEndpointConfig> = {
  requests: {
    key: 'requests',
    label: 'Purchase Requests',
    singular: 'Purchase Request',
    href: '/purchase/requests',
    apiPath: '/requests',
    permissionPrefix: 'purchase.requests',
    numberKeys: ['request_number', 'purchase_request_number', 'document_number'],
    dateKeys: ['request_date', 'document_date'],
  },
  orders: {
    key: 'orders',
    label: 'Purchase Orders',
    singular: 'Purchase Order',
    href: '/purchase/orders',
    apiPath: '/orders',
    permissionPrefix: 'purchase.orders',
    numberKeys: ['order_number', 'purchase_order_number', 'document_number'],
    dateKeys: ['order_date', 'document_date'],
    sourceCreate: {
      segment: 'from-request',
      path: (id) => `/orders/from-request/${id}`,
      sourceLabel: 'Purchase Request ID',
    },
  },
  'goods-receipts': {
    key: 'goods-receipts',
    label: 'Goods Receipts',
    singular: 'Goods Receipt',
    href: '/purchase/goods-receipts',
    apiPath: '/goods-receipts',
    permissionPrefix: 'purchase.goods_receipts',
    numberKeys: ['receipt_number', 'goods_receipt_number', 'document_number'],
    dateKeys: ['receipt_date', 'document_date'],
    sourceCreate: {
      segment: 'from-purchase-order',
      path: (id) => `/goods-receipts/from-purchase-order/${id}`,
      sourceLabel: 'Purchase Order ID',
    },
  },
  'vendor-bills': {
    key: 'vendor-bills',
    label: 'Vendor Bills',
    singular: 'Vendor Bill',
    href: '/purchase/vendor-bills',
    apiPath: '/bills',
    permissionPrefix: 'purchase.bills',
    numberKeys: ['bill_number', 'vendor_bill_number', 'document_number'],
    dateKeys: ['bill_date', 'document_date'],
  },
  returns: {
    key: 'returns',
    label: 'Purchase Returns',
    singular: 'Purchase Return',
    href: '/purchase/returns',
    apiPath: '/returns',
    permissionPrefix: 'purchase.returns',
    numberKeys: ['return_number', 'purchase_return_number', 'document_number'],
    dateKeys: ['return_date', 'document_date'],
  },
};

const ACTIONS: Record<string, Array<{ key: string; label: string; permission: string; danger?: boolean; body?: () => Record<string, unknown> }>> = {
  requests: [
    { key: 'submit', label: 'Submit', permission: 'purchase.requests.edit' },
    { key: 'approve', label: 'Approve', permission: 'purchase.requests.approve' },
    { key: 'reject', label: 'Reject', permission: 'purchase.requests.cancel', danger: true, body: () => ({ rejection_reason: window.prompt('Reject reason') ?? 'Rejected from UI' }) },
    { key: 'cancel', label: 'Cancel', permission: 'purchase.requests.cancel', danger: true, body: () => ({ cancel_reason: window.prompt('Cancel reason') ?? 'Cancelled from UI' }) },
  ],
  orders: [
    { key: 'approve', label: 'Approve', permission: 'purchase.orders.approve' },
    { key: 'confirm', label: 'Confirm', permission: 'purchase.orders.confirm' },
    { key: 'close', label: 'Close', permission: 'purchase.orders.confirm' },
    { key: 'cancel', label: 'Cancel', permission: 'purchase.orders.cancel', danger: true, body: () => ({ cancel_reason: window.prompt('Cancel reason') ?? 'Cancelled from UI' }) },
  ],
  'goods-receipts': [
    { key: 'receive', label: 'Receive', permission: 'purchase.goods_receipts.receive' },
    { key: 'cancel', label: 'Cancel', permission: 'purchase.goods_receipts.cancel', danger: true },
    { key: 'void', label: 'Void', permission: 'purchase.goods_receipts.void', danger: true, body: () => ({ void_reason: window.prompt('Void reason') ?? 'Voided from UI' }) },
  ],
  'vendor-bills': [
    { key: 'approve', label: 'Approve', permission: 'purchase.bills.approve' },
    { key: 'post', label: 'Post', permission: 'purchase.bills.post' },
    { key: 'void', label: 'Void', permission: 'purchase.bills.void', danger: true, body: () => ({ void_reason: window.prompt('Void reason') ?? 'Voided from UI' }) },
  ],
  'vendor-deposits': [
    { key: 'post', label: 'Post', permission: 'purchase.deposits.post' },
    { key: 'refund', label: 'Refund', permission: 'purchase.deposits.post' },
    { key: 'void', label: 'Void', permission: 'purchase.deposits.void', danger: true, body: () => ({ void_reason: window.prompt('Void reason') ?? 'Voided from UI' }) },
  ],
  'vendor-payments': [
    { key: 'post', label: 'Post', permission: 'purchase.payments.post' },
    { key: 'void', label: 'Void', permission: 'purchase.payments.void', danger: true, body: () => ({ void_reason: window.prompt('Void reason') ?? 'Voided from UI' }) },
  ],
  returns: [
    { key: 'approve', label: 'Approve', permission: 'purchase.returns.approve' },
    { key: 'post', label: 'Post', permission: 'purchase.returns.post' },
    { key: 'void', label: 'Void', permission: 'purchase.returns.void', danger: true, body: () => ({ void_reason: window.prompt('Void reason') ?? 'Voided from UI' }) },
  ],
};

const purchaseStatusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Open', value: 'open' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Received', value: 'received' },
  { label: 'Posted', value: 'posted' },
  { label: 'Paid', value: 'paid' },
  { label: 'Closed', value: 'closed' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Void', value: 'void' },
];

export function PurchaseWorkspace({ segments = [] }: PurchaseWorkspaceProps) {
  const [module, action, id] = segments;

  if (!module) return <PurchaseLanding />;
  if (module === 'ap-ledger') return action === 'vendors' && id ? <APObjectPage title="Vendor AP Ledger" loader={() => purchaseGet<Record<string, unknown>>(`/ap/vendors/${id}/ledger`)} /> : action === 'bills' && id ? <APObjectPage title="Vendor Bill Ledger" loader={() => purchaseGet<Record<string, unknown>>(`/ap/bills/${id}/ledger`)} /> : <APLedgerSummary />;
  if (module === 'ap-aging') return <APObjectPage title="AP Aging" loader={() => purchaseGet<Record<string, unknown>>('/ap/aging')} />;
  if (module === 'open-bills') return <OpenBillsPage />;
  if (module === 'ap-reconciliation') return <APObjectPage title="AP Reconciliation" permission="purchase.ap.reconcile" loader={() => purchaseGet<Record<string, unknown>>('/ap/reconciliation')} />;
  if (module === 'vendor-deposits') return action === 'new' ? <PaymentForm type="vendor-deposits" /> : action ? <PaymentDetail type="vendor-deposits" id={action} /> : <PaymentList type="vendor-deposits" />;
  if (module === 'vendor-payments') return action === 'new' ? <PaymentForm type="vendor-payments" sourceBillId={id} /> : action === 'from-bill' && id ? <PaymentForm type="vendor-payments" sourceBillId={id} /> : action ? <PaymentDetail type="vendor-payments" id={action} /> : <PaymentList type="vendor-payments" />;
  if (DOCUMENTS[module]) {
    const config = DOCUMENTS[module];
    if (action === 'new') return <DocumentForm config={config} mode="create" />;
    if (config.sourceCreate && action === config.sourceCreate.segment && id) return <DocumentForm config={config} mode="create" sourceId={id} />;
    if ((action === 'from-purchase-order' || action === 'from-goods-receipt' || action === 'from-bill') && id) return <DocumentForm config={config} mode="create" sourceId={id} sourceSegment={action} />;
    if (id === 'edit' && action) return <DocumentForm config={config} mode="edit" id={action} />;
    if (action) return <DocumentDetail config={config} id={action} />;
    return <DocumentList config={config} />;
  }

  return <PurchaseLanding />;
}

function PurchaseLanding() {
  const permissions = getStoredPermissions();
  const visibleItems = PURCHASE_NAV_ITEMS.filter((item) => hasPermission(permissions, item.permission));

  return (
    <AppShell>
      <PurchasePageGate permission={PURCHASE_NAV_ITEMS.map((item) => item.permission)}>
        <PageHeader title="Purchase" description="Purchase Frontend MVP workspace for requests, orders, receipts, vendor bills, payments, returns, and AP reports." />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => {
            const ItemIcon = getSubmenuIcon(item.href, item.label);

            return (
              <Link key={item.href} href={item.href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--erp-lime-pale)] text-[var(--erp-emerald-dark)]">
                      <ItemIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-950">{item.label}</h2>
                      <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                  <StatusBadge status="MVP" tone="default" />
                </div>
              </Link>
            );
          })}
        </div>
      </PurchasePageGate>
    </AppShell>
  );
}

function DocumentList({ config }: { config: PurchaseEndpointConfig }) {
  const router = useRouter();
  const [rows, setRows] = useState<PurchaseDocument[]>([]);
  const [filters, setFilters] = useState<WorkspaceFilterState>({ search: '', status: 'all', party: 'all', dateFrom: '', dateTo: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canCreate = hasPermission(getStoredPermissions(), `${config.permissionPrefix}.create`);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRows((await purchaseGet<PurchaseDocument[]>(config.apiPath, { status: filters.status === 'all' ? undefined : filters.status })).data ?? []);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }, [config.apiPath, filters.status]);

  useEffect(() => { queueMicrotask(() => void load()); }, [load]);

  const columns = useMemo<WorkspaceColumn<PurchaseDocument>[]>(() => purchaseColumns(config), [config]);
  const rowActions = useMemo<WorkspaceRowAction<PurchaseDocument>[]>(() => [{ key: 'view', label: 'View Detail', href: (row) => `${config.href}/${row.id}` }], [config.href]);

  return (
    <AppShell>
      <PurchasePageGate permission={`${config.permissionPrefix}.view`}>
        <PageHeader
          title={config.label}
          description={`${config.singular} list with backend status actions and tenant-aware company context.`}
        />
        <div className="mt-6">
          <DocumentListWorkspace
            documentLabel={config.singular}
            newButtonLabel={canCreate ? `New ${config.singular}` : undefined}
            rows={rows}
            columns={columns}
            filters={filters}
            statusOptions={purchaseStatusOptions}
            loading={loading}
            error={error}
            emptyTitle={`No ${config.label.toLowerCase()} found`}
            emptyDescription="Create a document or adjust the filters."
            searchPlaceholder={`Cari ${config.singular.toLowerCase()}, vendor, source, atau status...`}
            partyFilterLabel="Vendor"
            rowActions={rowActions}
            getSearchText={(row) => JSON.stringify(row)}
            getStatus={(row) => String(row.status ?? 'draft')}
            getDate={(row) => documentDate(row, config)}
            getPartyName={vendorName}
            onCreate={canCreate ? () => router.push(`${config.href}/new`) : undefined}
            onApplyFilters={load}
            onFilterChange={setFilters}
          />
        </div>
      </PurchasePageGate>
    </AppShell>
  );
}

function DocumentDetail({ config, id }: { config: PurchaseEndpointConfig; id: string }) {
  const router = useRouter();
  const [document, setDocument] = useState<PurchaseDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDocument((await purchaseGet<PurchaseDocument>(`${config.apiPath}/${id}`)).data);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }, [config.apiPath, id]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);

  async function runAction(key: string, body?: Record<string, unknown>) {
    try {
      setError(null);
      await purchasePatch(`${config.apiPath}/${id}/${key}`, body);
      router.refresh();
      await load();
    } catch (event) {
      setError(getApiErrorMessage(event));
    }
  }

  return (
    <AppShell>
      <PurchasePageGate permission={`${config.permissionPrefix}.view`}>
        {loading ? <LoadingState title={`Loading ${config.singular}`} /> : null}
        {error ? <ErrorState message={error} /> : null}
        {document ? (
          <>
            <PageHeader
              title={documentNumber(document, config)}
              description={`${config.singular} detail, backend workflow actions, source chain, and line information.`}
              actions={<DetailActions config={config} document={document} onRun={runAction} />}
            />
            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Vendor / Source</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">{vendorName(document)}</p>
                    <p className="mt-1 text-sm text-slate-600">Date: {formatDate(documentDate(document, config))}</p>
                    {document.source_number ? <p className="text-sm text-slate-600">Source: {String(document.source_type ?? 'source')} / {String(document.source_number)}</p> : null}
                  </div>
                  <PurchaseStatusBadge status={String(document.status ?? 'draft')} />
                </div>
              </div>
              <TotalsCard document={document} />
            </div>
            <div className="mt-6"><LineItemsTable lines={document.lines ?? []} /></div>
          </>
        ) : null}
      </PurchasePageGate>
    </AppShell>
  );
}

function DetailActions({ config, document, onRun }: { config: PurchaseEndpointConfig; document: PurchaseDocument; onRun: (key: string, body?: Record<string, unknown>) => void }) {
  const isEditable = ['draft', 'open'].includes(String(document.status ?? 'draft'));
  return (
    <>
      {isEditable ? <PermissionGuard permission={`${config.permissionPrefix}.edit`}><Link href={`${config.href}/${document.id}/edit`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</Link></PermissionGuard> : null}
      {config.key === 'requests' ? <PermissionGuard permission="purchase.orders.convert"><Link href={`/purchase/orders/from-request/${document.id}`} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Convert to PO</Link></PermissionGuard> : null}
      {config.key === 'orders' ? <><PermissionGuard permission="purchase.goods_receipts.create"><Link href={`/purchase/goods-receipts/from-purchase-order/${document.id}`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium">Receive</Link></PermissionGuard><PermissionGuard permission="purchase.bills.create"><Link href={`/purchase/vendor-bills/from-purchase-order/${document.id}`} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Create Bill</Link></PermissionGuard></> : null}
      {config.key === 'goods-receipts' ? <><PermissionGuard permission="purchase.bills.create"><Link href={`/purchase/vendor-bills/from-goods-receipt/${document.id}`} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Create Bill</Link></PermissionGuard><PermissionGuard permission="purchase.returns.create"><Link href={`/purchase/returns/from-goods-receipt/${document.id}`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium">Return</Link></PermissionGuard></> : null}
      {config.key === 'vendor-bills' ? <><PermissionGuard permission="purchase.payments.create"><Link href={`/purchase/vendor-payments/from-bill/${document.id}`} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Pay</Link></PermissionGuard><PermissionGuard permission="purchase.returns.create"><Link href={`/purchase/returns/from-bill/${document.id}`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium">Return</Link></PermissionGuard></> : null}
      {(ACTIONS[config.key] ?? []).map((action) => <PermissionGuard key={action.key} permission={action.permission}><button type="button" onClick={() => onRun(action.key, action.body?.())} className={`rounded-lg px-4 py-2 text-sm font-medium ${action.danger ? 'border border-red-200 text-red-700 hover:bg-red-50' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>{action.label}</button></PermissionGuard>)}
    </>
  );
}

function DocumentForm({ config, mode, id, sourceId, sourceSegment }: { config: PurchaseEndpointConfig; mode: 'create' | 'edit'; id?: string; sourceId?: string; sourceSegment?: string }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [selectors, setSelectors] = useState<{ contacts: SelectRecord[]; products: SelectRecord[]; units: SelectRecord[]; warehouses: SelectRecord[]; departments: SelectRecord[]; projects: SelectRecord[]; accounts: SelectRecord[]; cashAccounts: SelectRecord[] }>({ contacts: [], products: [], units: [], warehouses: [], departments: [], projects: [], accounts: [], cashAccounts: [] });
  const [vendorId, setVendorId] = useState('');
  const [documentDateValue, setDocumentDateValue] = useState(today);
  const [secondaryDate, setSecondaryDate] = useState('');
  const [cashAccountId, setCashAccountId] = useState('');
  const [downPaymentAmount, setDownPaymentAmount] = useState('');
  const [appliedDepositAmount, setAppliedDepositAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([blankLine()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hydrateForm = useCallback((document: PurchaseDocument) => {
    setVendorId(document.vendor_id ? String(document.vendor_id) : '');
    setDocumentDateValue(documentDate(document, config).slice(0, 10) || today);
    setSecondaryDate(String(document.needed_date ?? document.expected_date ?? document.due_date ?? '').slice(0, 10));
    setAppliedDepositAmount(String(document.applied_vendor_deposit_amount ?? ''));
    setNotes(String(document.notes ?? ''));
    const normalizedLines = readLines(document).map(lineToDraft);
    setLines(normalizedLines.length ? normalizedLines : [blankLine()]);
  }, [config, today]);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        setLoading(true);
        const [contacts, products, units, warehouses, departments, projects, accounts, cashAccounts, current] = await Promise.all([
          listMasterData('/master-data/contacts'),
          listMasterData('/master-data/products'),
          listMasterData('/master-data/units'),
          listMasterData('/master-data/warehouses'),
          listMasterData('/master-data/departments'),
          listMasterData('/master-data/projects'),
          listChartOfAccounts({ is_active: '1' }),
          listChartOfAccounts({ is_cash_bank: '1', is_active: '1' }),
          mode === 'edit' && id ? purchaseGet<PurchaseDocument>(`${config.apiPath}/${id}`) : Promise.resolve({ data: null }),
        ]);
        setSelectors({ contacts: contacts.data ?? [], products: products.data ?? [], units: units.data ?? [], warehouses: warehouses.data ?? [], departments: departments.data as SelectRecord[], projects: projects.data as SelectRecord[], accounts: accounts.data ?? [], cashAccounts: cashAccounts.data ?? [] });
        if (current.data) hydrateForm(current.data);
      } catch (event) {
        setError(getApiErrorMessage(event));
      } finally {
        setLoading(false);
      }
    });
  }, [config.apiPath, hydrateForm, id, mode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateDocumentForm(config.key, vendorId, lines);
    if (validation) {
      setError(validation);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = buildDocumentPayload(config.key, {
        vendorId,
        documentDateValue,
        secondaryDate,
        sourceId,
        sourceSegment,
        cashAccountId,
        downPaymentAmount,
        appliedDepositAmount,
        notes,
        lines,
      });
      let response: { data: PurchaseDocument };
      if (mode === 'edit' && id) response = await purchasePatch<PurchaseDocument>(`${config.apiPath}/${id}`, payload);
      else if (sourceId && sourceSegment === 'from-bill') response = await purchasePost<PurchaseDocument>(`/returns/from-bill/${sourceId}`, payload);
      else if (sourceId && sourceSegment === 'from-goods-receipt') response = await purchasePost<PurchaseDocument>(`/returns/from-goods-receipt/${sourceId}`, payload);
      else if (sourceId && config.sourceCreate) response = await purchasePost<PurchaseDocument>(config.sourceCreate.path(sourceId), payload);
      else response = await purchasePost<PurchaseDocument>(config.apiPath, payload);
      router.push(`${config.href}/${response.data.id}`);
    } catch (eventError) {
      setError(getApiErrorMessage(eventError));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AppShell><LoadingState title={`Loading ${config.singular} form`} /></AppShell>;

  return (
    <AppShell>
      <PurchasePageGate permission={`${config.permissionPrefix}.${mode === 'edit' ? 'edit' : 'create'}`}>
        <PageHeader title={`${mode === 'edit' ? 'Edit' : 'New'} ${config.singular}`} description="Frontend preview is non-authoritative; backend remains the source of truth for totals, status, posting, and transaction effects." />
        <form onSubmit={submit} className="mt-6 space-y-6">
          {error ? <ErrorState message={error} /> : null}
          <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
            {config.key !== 'requests' ? <SelectField label="Vendor *" value={vendorId} onChange={setVendorId} options={selectors.contacts} optionLabel={contactLabel} /> : null}
            <InputField label={dateLabel(config.key)} type="date" value={documentDateValue} onChange={setDocumentDateValue} />
            {secondaryDateLabel(config.key) ? <InputField label={secondaryDateLabel(config.key)} type="date" value={secondaryDate} onChange={setSecondaryDate} /> : null}
            {sourceId ? <InputField label={sourceSegment?.replaceAll('-', ' ') ?? config.sourceCreate?.sourceLabel ?? 'Source ID'} value={sourceId} onChange={() => undefined} disabled /> : null}
            {config.key === 'orders' ? <><SelectField label="Vendor Deposit Cash/Bank" value={cashAccountId} onChange={setCashAccountId} options={selectors.cashAccounts} optionLabel={accountLabel} /><InputField label="Vendor Deposit Amount" type="number" value={downPaymentAmount} onChange={setDownPaymentAmount} /></> : null}
            {config.key === 'vendor-bills' ? <InputField label="Applied Vendor Deposit Amount" type="number" value={appliedDepositAmount} onChange={setAppliedDepositAmount} /> : null}
          </div>
          <LineEditor lines={lines} setLines={setLines} selectors={selectors} priceMode={config.key === 'requests' ? 'estimated' : 'actual'} simple={config.key === 'goods-receipts'} />
          <label className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Notes</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
        </form>
      </PurchasePageGate>
    </AppShell>
  );
}

function LineEditor({ lines, setLines, selectors, priceMode, simple }: { lines: DraftLine[]; setLines: (lines: DraftLine[]) => void; selectors: { products: SelectRecord[]; units: SelectRecord[]; warehouses: SelectRecord[]; departments: SelectRecord[]; projects: SelectRecord[]; accounts: SelectRecord[] }; priceMode: 'estimated' | 'actual'; simple?: boolean }) {
  function update(index: number, key: keyof DraftLine, value: string) {
    setLines(lines.map((line, lineIndex) => (lineIndex === index ? { ...line, [key]: value } : line)));
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-950">Line Items</h2>
          {simple ? <p className="mt-1 text-xs text-slate-500">Goods Receipt UI captures document receipt only; inventory stock movement UI remains Phase 17.</p> : null}
        </div>
        <button type="button" onClick={() => setLines([...lines, blankLine()])} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">Add Line</button>
      </div>
      <DataTable columns={['Product', 'Description', 'Qty', 'Unit', priceMode === 'estimated' ? 'Est. Price' : 'Price', 'Discount', 'Tax', 'Warehouse', 'Dimension', 'Expense', 'Total', '']}>
        {lines.map((line, index) => (
          <tr key={index} className="align-top">
            <td className="min-w-44 px-2 py-3"><SelectBox value={line.product_id} onChange={(value) => update(index, 'product_id', value)} options={selectors.products} optionLabel={(item) => `${text(item, 'product_code', 'id')} - ${text(item, 'product_name', 'name')}`} /></td>
            <td className="min-w-52 px-2 py-3"><input value={line.description} onChange={(event) => update(index, 'description', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" /></td>
            <td className="min-w-24 px-2 py-3"><input type="number" min="0" step="0.01" value={line.quantity} onChange={(event) => update(index, 'quantity', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-right text-sm" /></td>
            <td className="min-w-28 px-2 py-3"><SelectBox value={line.unit_id} onChange={(value) => update(index, 'unit_id', value)} options={selectors.units} optionLabel={(item) => text(item, 'code', 'unit_code', 'name')} /></td>
            <td className="min-w-28 px-2 py-3"><input type="number" min="0" step="0.01" value={priceMode === 'estimated' ? line.estimated_unit_price : line.unit_price} onChange={(event) => update(index, priceMode === 'estimated' ? 'estimated_unit_price' : 'unit_price', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-right text-sm" /></td>
            <td className="min-w-28 px-2 py-3"><input type="number" min="0" step="0.01" value={line.discount_amount} onChange={(event) => update(index, 'discount_amount', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-right text-sm" /></td>
            <td className="min-w-28 px-2 py-3"><input type="number" min="0" step="0.01" value={line.tax_amount} onChange={(event) => update(index, 'tax_amount', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-right text-sm" /></td>
            <td className="min-w-32 px-2 py-3"><SelectBox value={line.warehouse_id} onChange={(value) => update(index, 'warehouse_id', value)} options={selectors.warehouses} optionLabel={(item) => text(item, 'code', 'warehouse_code', 'name')} /></td>
            <td className="min-w-44 px-2 py-3"><SelectBox value={line.department_id} onChange={(value) => update(index, 'department_id', value)} options={selectors.departments} optionLabel={(item) => text(item, 'code', 'name')} /><div className="mt-1"><SelectBox value={line.project_id} onChange={(value) => update(index, 'project_id', value)} options={selectors.projects} optionLabel={(item) => text(item, 'code', 'name')} /></div></td>
            <td className="min-w-40 px-2 py-3"><SelectBox value={line.expense_account_id} onChange={(value) => update(index, 'expense_account_id', value)} options={selectors.accounts} optionLabel={accountLabel} /></td>
            <td className="whitespace-nowrap px-2 py-3 text-right font-semibold">{formatCurrency(lineTotal(line, priceMode))}</td>
            <td className="px-2 py-3"><button type="button" disabled={lines.length <= 1} onClick={() => setLines(lines.filter((_, lineIndex) => lineIndex !== index))} className="rounded-lg border border-slate-200 px-2 py-1 text-xs disabled:opacity-40">Remove</button></td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}

function PaymentList({ type }: { type: 'vendor-deposits' | 'vendor-payments' }) {
  const router = useRouter();
  const config = paymentConfig(type);
  const path = type === 'vendor-deposits' ? '/vendor-deposits' : '/payments';
  const purchaseConfig = { ...DOCUMENTS.requests, numberKeys: config.numberKeys, dateKeys: config.dateKeys };
  const [rows, setRows] = useState<PurchaseDocument[]>([]);
  const [filters, setFilters] = useState<WorkspaceFilterState>({ search: '', status: 'all', party: 'all', dateFrom: '', dateTo: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canCreate = hasPermission(getStoredPermissions(), `${config.permissionPrefix}.create`);
  const status = filters.status;
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRows((await purchaseGet<PurchaseDocument[]>(path, { status: status === 'all' ? undefined : status })).data ?? []);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }, [path, status]);

  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  return <AppShell><PurchasePageGate permission={`${config.permissionPrefix}.view`}><PageHeader title={config.label} description={config.description} /><div className="mt-6"><DocumentListWorkspace documentLabel={config.singular} newButtonLabel={canCreate ? `New ${config.singular}` : undefined} rows={rows} columns={purchaseColumns(purchaseConfig)} filters={filters} statusOptions={purchaseStatusOptions} loading={loading} error={error} emptyTitle={`No ${config.label.toLowerCase()}`} emptyDescription="Create a new vendor cash document or adjust filters." searchPlaceholder={`Cari ${config.singular.toLowerCase()}, vendor, atau status...`} partyFilterLabel="Vendor" rowActions={[{ key: 'view', label: 'View Detail', href: (row) => `/purchase/${type}/${row.id}` }]} getSearchText={(row) => JSON.stringify(row)} getStatus={(row) => String(row.status ?? 'draft')} getDate={(row) => documentDate(row, purchaseConfig)} getPartyName={vendorName} onCreate={canCreate ? () => router.push(`/purchase/${type}/new`) : undefined} onApplyFilters={load} onFilterChange={setFilters} /></div></PurchasePageGate></AppShell>;
}

function PaymentDetail({ type, id }: { type: 'vendor-deposits' | 'vendor-payments'; id: string }) {
  const config = paymentConfig(type);
  const [row, setRow] = useState<PurchaseDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setRow((await purchaseGet<PurchaseDocument>(`${config.path}/${id}`)).data); } catch (event) { setError(getApiErrorMessage(event)); } }, [config.path, id]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  async function runAction(key: string, body?: Record<string, unknown>) {
    try { setError(null); await purchasePatch(`${config.path}/${id}/${key}`, body); await load(); } catch (event) { setError(getApiErrorMessage(event)); }
  }
  return <AppShell><PurchasePageGate permission={`${config.permissionPrefix}.view`}><PageHeader title={row ? documentNumber(row, { ...DOCUMENTS.requests, numberKeys: config.numberKeys, dateKeys: config.dateKeys }) : config.singular} description={config.description} actions={(ACTIONS[type] ?? []).map((action) => <PermissionGuard key={action.key} permission={action.permission}><button type="button" onClick={() => runAction(action.key, action.body?.())} className={`rounded-lg px-4 py-2 text-sm font-medium ${action.danger ? 'border border-red-200 text-red-700' : 'border border-slate-200 text-slate-700'}`}>{action.label}</button></PermissionGuard>)} />{error ? <div className="mt-6"><ErrorState message={error} /></div> : null}{row ? <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]"><div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-wide text-slate-500">Vendor</p><p className="mt-1 text-lg font-semibold">{vendorName(row)}</p><p className="mt-1 text-sm text-slate-600">Date: {formatDate(documentDate(row, { ...DOCUMENTS.requests, numberKeys: config.numberKeys, dateKeys: config.dateKeys }))}</p><PurchaseStatusBadge status={String(row.status ?? 'draft')} /></div><TotalsCard document={row} /></div> : <LoadingState title={`Loading ${config.singular}`} />}</PurchasePageGate></AppShell>;
}

function PaymentForm({ type, sourceBillId }: { type: 'vendor-deposits' | 'vendor-payments'; sourceBillId?: string }) {
  const router = useRouter();
  const config = paymentConfig(type);
  const today = new Date().toISOString().slice(0, 10);
  const [contacts, setContacts] = useState<SelectRecord[]>([]);
  const [cashAccounts, setCashAccounts] = useState<SelectRecord[]>([]);
  const [vendorId, setVendorId] = useState('');
  const [cashAccountId, setCashAccountId] = useState('');
  const [documentDateValue, setDocumentDateValue] = useState(today);
  const [amount, setAmount] = useState('');
  const [sourceId, setSourceId] = useState(sourceBillId ?? '');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { queueMicrotask(async () => { try { const [contactRes, cashRes] = await Promise.all([listMasterData('/master-data/contacts'), listChartOfAccounts({ is_cash_bank: '1', is_active: '1' })]); setContacts(contactRes.data ?? []); setCashAccounts(cashRes.data ?? []); } catch (event) { setError(getApiErrorMessage(event)); } }); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!vendorId || !cashAccountId || Number(amount) <= 0) { setError('Vendor, cash/bank account, and positive amount are required.'); return; }
    try {
      setSaving(true);
      const payload: Record<string, unknown> = { vendor_id: Number(vendorId), cash_bank_account_id: Number(cashAccountId), amount: Number(amount), notes: notes || null, currency_code: 'IDR', exchange_rate: 1 };
      if (type === 'vendor-deposits') { payload.deposit_date = documentDateValue; payload.purchase_order_id = sourceId ? Number(sourceId) : null; }
      else { payload.payment_date = documentDateValue; payload.vendor_bill_id = Number(sourceId); }
      const response = await purchasePost<PurchaseDocument>(config.path, payload);
      router.push(`/purchase/${type}/${response.data.id}`);
    } catch (eventError) { setError(getApiErrorMessage(eventError)); } finally { setSaving(false); }
  }
  return <AppShell><PurchasePageGate permission={`${config.permissionPrefix}.create`}><PageHeader title={`New ${config.singular}`} description={type === 'vendor-deposits' ? 'Create vendor deposit/advance. This is not a general Cash Bank UI.' : 'Create vendor payment for a vendor bill. Advanced allocation is out of scope.'} /><form onSubmit={submit} className="mt-6 space-y-6">{error ? <ErrorState message={error} /> : null}<div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3"><SelectField label="Vendor *" value={vendorId} onChange={setVendorId} options={contacts} optionLabel={contactLabel} /><InputField label={type === 'vendor-deposits' ? 'Deposit Date *' : 'Payment Date *'} type="date" value={documentDateValue} onChange={setDocumentDateValue} /><SelectField label="Cash/Bank Account *" value={cashAccountId} onChange={setCashAccountId} options={cashAccounts} optionLabel={accountLabel} /><InputField label="Amount *" type="number" value={amount} onChange={setAmount} /><InputField label={type === 'vendor-deposits' ? 'Purchase Order ID' : 'Vendor Bill ID *'} value={sourceId} onChange={setSourceId} /><label className="md:col-span-3"><span className="text-xs font-medium text-slate-500">Notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label></div><button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button></form></PurchasePageGate></AppShell>;
}

function APLedgerSummary() {
  return <APRowsPage title="AP Ledger" description="Read-only vendor accounts payable subsidiary ledger summary." loader={() => purchaseGet<unknown[]>('/ap/vendor-summary')} />;
}

function OpenBillsPage() {
  return <APRowsPage title="Open Vendor Bills" description="Read-only list of unpaid vendor bills with payment shortcuts." loader={() => purchaseGet<unknown[]>('/ap/open-bills')} paymentLinks />;
}

function APRowsPage({ title, description, loader, paymentLinks }: { title: string; description: string; loader: () => Promise<{ data: unknown[] }>; paymentLinks?: boolean }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setLoading(true); setError(null); setRows(((await loader()).data ?? []) as Record<string, unknown>[]); } catch (event) { setError(getApiErrorMessage(event)); } finally { setLoading(false); } }, [loader]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  const visible = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
  return <AppShell><PurchasePageGate permission="purchase.ap.view"><PageHeader title={title} description={description} /><div className="mt-6 space-y-4"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vendor or bill" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm md:max-w-md" />{loading ? <LoadingState title={`Loading ${title}`} /> : null}{error ? <ErrorState message={error} /> : null}{visible.length === 0 && !loading && !error ? <EmptyState title="No AP rows found" description="The backend returned no payable rows for this view." /> : null}{visible.length > 0 ? <DataTable columns={['Vendor/Bill', 'Opening', 'Debit', 'Credit', 'Balance', 'Action']}>{visible.map((row, index) => <tr key={index}><td className="px-4 py-3 font-medium">{text(row, 'vendor_name', 'bill_number', 'vendor_bill_number', 'name')}</td><td className="px-4 py-3 text-right">{formatCurrency(Number(value(row, 'opening_balance') ?? 0))}</td><td className="px-4 py-3 text-right">{formatCurrency(Number(value(row, 'debit') ?? 0))}</td><td className="px-4 py-3 text-right">{formatCurrency(Number(value(row, 'credit') ?? 0))}</td><td className="px-4 py-3 text-right font-semibold">{formatCurrency(Number(value(row, 'balance', 'balance_due', 'ending_balance') ?? 0))}</td><td className="px-4 py-3">{paymentLinks && (row.id || row.bill_id) ? <Link className="underline" href={`/purchase/vendor-payments/from-bill/${String(row.id ?? row.bill_id)}`}>Pay</Link> : row.vendor_id ? <Link className="underline" href={`/purchase/ap-ledger/vendors/${String(row.vendor_id)}`}>Detail</Link> : '-'}</td></tr>)}</DataTable> : null}</div></PurchasePageGate></AppShell>;
}

function APObjectPage({ title, loader, permission = 'purchase.ap.view' }: { title: string; loader: () => Promise<{ data: Record<string, unknown> }>; permission?: string }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setLoading(true); setError(null); setData((await loader()).data); } catch (event) { setError(getApiErrorMessage(event)); } finally { setLoading(false); } }, [loader]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  const rows = Array.isArray(data?.rows) ? data.rows as Record<string, unknown>[] : Array.isArray(data?.data) ? data.data as Record<string, unknown>[] : Array.isArray(data?.bills) ? data.bills as Record<string, unknown>[] : [];
  return <AppShell><PurchasePageGate permission={permission}><PageHeader title={title} description="Read-only AP report. Browser view only; PDF/Excel export is not part of Phase 15." /><div className="mt-6 space-y-4">{loading ? <LoadingState title={`Loading ${title}`} /> : null}{error ? <ErrorState message={error} /> : null}{data ? <SummaryCard data={data} /> : null}{rows.length > 0 ? <DataTable columns={Object.keys(rows[0]).slice(0, 6)}>{rows.map((row, index) => <tr key={index}>{Object.keys(rows[0]).slice(0, 6).map((key) => <td key={key} className="px-4 py-3">{String(row[key] ?? '-')}</td>)}</tr>)}</DataTable> : !loading && !error ? <EmptyState title="No report rows" description="The backend returned no tabular rows for this report." /> : null}</div></PurchasePageGate></AppShell>;
}

function PurchaseStatusBadge({ status }: { status: string }) {
  const tone = ['approved', 'confirmed', 'received', 'posted', 'paid', 'closed'].includes(status) ? 'success' : ['cancelled', 'void', 'rejected'].includes(status) ? 'danger' : ['draft', 'open'].includes(status) ? 'muted' : 'warning';
  return <StatusBadge status={status.replaceAll('_', ' ')} tone={tone} />;
}

function purchaseColumns(config: { numberKeys: string[]; dateKeys: string[] }): WorkspaceColumn<PurchaseDocument>[] {
  return [
    {
      key: 'document',
      label: 'Document',
      widthClassName: 'min-w-[190px]',
      sortable: true,
      sortValue: (row) => documentNumber(row, config),
      render: (row) => (
        <div>
          <p className="font-bold text-slate-950">{documentNumber(row, config)}</p>
          <p className="mt-1 text-xs text-slate-400">{String(row.source_number ?? row.source_type ?? 'Purchase document')}</p>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      widthClassName: 'min-w-[140px]',
      sortable: true,
      sortValue: (row) => documentDate(row, config),
      render: (row) => formatDate(documentDate(row, config)),
    },
    {
      key: 'vendor',
      label: 'Vendor / Source',
      widthClassName: 'min-w-[240px]',
      sortable: true,
      sortValue: vendorName,
      render: (row) => vendorName(row),
    },
    {
      key: 'status',
      label: 'Status',
      widthClassName: 'min-w-[150px]',
      sortable: true,
      sortValue: (row) => String(row.status ?? 'draft'),
      render: (row) => <PurchaseStatusBadge status={String(row.status ?? 'draft')} />,
    },
    {
      key: 'total',
      label: 'Total',
      align: 'right',
      widthClassName: 'min-w-[150px]',
      sortable: true,
      sortValue: documentTotal,
      render: (row) => <p className="font-bold text-slate-950">{formatCurrency(documentTotal(row))}</p>,
    },
  ];
}

function TotalsCard({ document }: { document: PurchaseDocument }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-sm font-semibold text-slate-950">Totals</h2><TotalRow label="Subtotal" value={value(document, 'subtotal_before_discount', 'subtotal', 'total_before_discount')} /><TotalRow label="Discount" value={value(document, 'line_discount_total', 'discount_total', 'header_discount_amount')} /><TotalRow label="Tax" value={value(document, 'tax_total')} /><TotalRow label="Grand Total" value={documentTotal(document)} strong /><TotalRow label="Balance Due" value={value(document, 'balance_due', 'remaining_amount')} /></div>;
}

function LineItemsTable({ lines }: { lines: PurchaseLineItem[] }) {
  return <DataTable columns={['Product', 'Description', 'Qty', 'Unit Price', 'Discount', 'Tax', 'Warehouse', 'Dimension', 'Total']}>{lines.map((line, index) => <tr key={line.id ?? index}><td className="px-4 py-3">{String(line.product_code ?? line.product_id ?? '-')}</td><td className="px-4 py-3">{String(line.description ?? '-')}</td><td className="px-4 py-3 text-right">{String(line.quantity ?? 0)}</td><td className="px-4 py-3 text-right">{formatCurrency(Number(line.unit_price ?? line.estimated_unit_price ?? 0))}</td><td className="px-4 py-3 text-right">{formatCurrency(Number(line.discount_amount ?? 0))}</td><td className="px-4 py-3 text-right">{formatCurrency(Number(line.tax_amount ?? 0))}</td><td className="px-4 py-3">{String(line.warehouse_id ?? '-')}</td><td className="px-4 py-3">{[line.department_id, line.project_id].filter(Boolean).join(' / ') || '-'}</td><td className="px-4 py-3 text-right font-semibold">{formatCurrency(Number(line.line_total ?? lineTotal(lineToDraft(line), line.estimated_unit_price !== undefined ? 'estimated' : 'actual')))}</td></tr>)}</DataTable>;
}

function SummaryCard({ data }: { data: Record<string, unknown> }) {
  return <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm md:grid-cols-4">{Object.entries(data).filter(([, item]) => !Array.isArray(item) && typeof item !== 'object').slice(0, 12).map(([key, item]) => <div key={key}><div className="text-xs uppercase text-slate-500">{key.replaceAll('_', ' ')}</div><div className="mt-1 font-semibold text-slate-950">{String(item ?? '-')}</div></div>)}</div>;
}

function TotalRow({ label, value: item, strong }: { label: string; value?: unknown; strong?: boolean }) {
  return <div className="mt-2 flex items-center justify-between gap-4 text-sm"><span className="text-slate-500">{label}</span><span className={strong ? 'font-semibold text-slate-950' : 'text-slate-700'}>{formatCurrency(Number(item ?? 0))}</span></div>;
}

function InputField({ label, value: item, onChange, type = 'text', disabled }: { label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean }) {
  return <label><span className="text-xs font-medium text-slate-500">{label}</span><input type={type} value={item} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50" /></label>;
}

function SelectField({ label, value: item, onChange, options, optionLabel }: { label: string; value: string; onChange: (value: string) => void; options: SelectRecord[]; optionLabel: (item: SelectRecord) => string }) {
  return <label><span className="text-xs font-medium text-slate-500">{label}</span><SelectBox value={item} onChange={onChange} options={options} optionLabel={optionLabel} /></label>;
}

function SelectBox({ value: item, onChange, options, optionLabel }: { value: string; onChange: (value: string) => void; options: SelectRecord[]; optionLabel: (item: SelectRecord) => string }) {
  return <select value={item} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"><option value="">-</option>{options.map((option) => <option key={option.id} value={option.id}>{optionLabel(option)}</option>)}</select>;
}

function buildDocumentPayload(key: string, state: { vendorId: string; documentDateValue: string; secondaryDate: string; sourceId?: string; sourceSegment?: string; cashAccountId: string; downPaymentAmount: string; appliedDepositAmount: string; notes: string; lines: DraftLine[] }) {
  const lines = state.lines.map((line, index) => ({
    purchase_request_line_id: line.purchase_request_line_id ?? null,
    purchase_order_line_id: line.purchase_order_line_id ?? null,
    goods_receipt_line_id: line.goods_receipt_line_id ?? null,
    vendor_bill_line_id: line.vendor_bill_line_id ?? null,
    product_id: line.product_id ? Number(line.product_id) : null,
    product_code: line.product_code || null,
    description: line.description,
    quantity: Number(line.quantity || 0),
    unit_id: line.unit_id ? Number(line.unit_id) : null,
    estimated_unit_price: Number(line.estimated_unit_price || line.unit_price || 0),
    unit_price: Number(line.unit_price || line.estimated_unit_price || 0),
    discount_amount: Number(line.discount_amount || 0),
    tax_amount: Number(line.tax_amount || 0),
    line_total: lineTotal(line, key === 'requests' ? 'estimated' : 'actual'),
    warehouse_id: line.warehouse_id ? Number(line.warehouse_id) : null,
    department_id: line.department_id ? Number(line.department_id) : null,
    project_id: line.project_id ? Number(line.project_id) : null,
    expense_account_id: line.expense_account_id ? Number(line.expense_account_id) : null,
    sort_order: index + 1,
  }));
  const payload: Record<string, unknown> = { notes: state.notes || null, currency_code: 'IDR', exchange_rate: 1, lines };
  if (key !== 'requests') payload.vendor_id = Number(state.vendorId);
  if (key === 'requests') { payload.request_date = state.documentDateValue; payload.needed_date = state.secondaryDate || null; }
  if (key === 'orders') { payload.order_date = state.documentDateValue; payload.expected_date = state.secondaryDate || null; payload.purchase_request_id = state.sourceId ? Number(state.sourceId) : null; if (state.downPaymentAmount && state.cashAccountId) payload.vendor_deposit = { deposit_date: state.documentDateValue, cash_bank_account_id: Number(state.cashAccountId), amount: Number(state.downPaymentAmount), notes: state.notes || null }; }
  if (key === 'goods-receipts') { payload.receipt_date = state.documentDateValue; payload.purchase_order_id = state.sourceId ? Number(state.sourceId) : null; }
  if (key === 'vendor-bills') { payload.bill_date = state.documentDateValue; payload.due_date = state.secondaryDate || null; payload.applied_vendor_deposit_amount = Number(state.appliedDepositAmount || 0); if (state.sourceSegment === 'from-goods-receipt') payload.goods_receipt_id = state.sourceId ? Number(state.sourceId) : null; else payload.purchase_order_id = state.sourceId ? Number(state.sourceId) : null; }
  if (key === 'returns') { payload.return_date = state.documentDateValue; if (state.sourceSegment === 'from-goods-receipt') payload.goods_receipt_id = state.sourceId ? Number(state.sourceId) : null; else payload.vendor_bill_id = state.sourceId ? Number(state.sourceId) : null; }
  return payload;
}

function validateDocumentForm(key: string, vendorId: string, lines: DraftLine[]) {
  if (key !== 'requests' && !vendorId) return 'Vendor is required.';
  if (lines.length === 0) return 'At least one line is required.';
  for (const [index, line] of lines.entries()) {
    if (!line.description.trim()) return `Line ${index + 1}: description is required.`;
    if (Number(line.quantity) <= 0) return `Line ${index + 1}: quantity must be greater than zero.`;
  }
  return null;
}

function paymentConfig(type: 'vendor-deposits' | 'vendor-payments') {
  return type === 'vendor-deposits'
    ? { path: '/vendor-deposits', label: 'Vendor Deposits', singular: 'Vendor Deposit', permissionPrefix: 'purchase.deposits', description: 'Track vendor advances and deposit posting/refund workflow.', numberKeys: ['deposit_number', 'vendor_deposit_number', 'document_number'], dateKeys: ['deposit_date', 'document_date'] }
    : { path: '/payments', label: 'Vendor Payments', singular: 'Vendor Payment', permissionPrefix: 'purchase.payments', description: 'Manage vendor bill payments. Advanced AP allocation remains backend-driven.', numberKeys: ['payment_number', 'vendor_payment_number', 'document_number'], dateKeys: ['payment_date', 'document_date'] };
}

function blankLine(): DraftLine {
  return { product_id: '', product_code: '', description: '', quantity: '1', unit_id: '', unit_price: '0', estimated_unit_price: '0', discount_amount: '0', tax_amount: '0', warehouse_id: '', department_id: '', project_id: '', expense_account_id: '' };
}

function lineToDraft(line: PurchaseLineItem): DraftLine {
  return { product_id: line.product_id ? String(line.product_id) : '', product_code: line.product_code ?? '', description: line.description ?? '', quantity: String(line.quantity ?? 1), unit_id: line.unit_id ? String(line.unit_id) : '', unit_price: String(line.unit_price ?? 0), estimated_unit_price: String(line.estimated_unit_price ?? line.unit_price ?? 0), discount_amount: String(line.discount_amount ?? 0), tax_amount: String(line.tax_amount ?? 0), warehouse_id: line.warehouse_id ? String(line.warehouse_id) : '', department_id: line.department_id ? String(line.department_id) : '', project_id: line.project_id ? String(line.project_id) : '', expense_account_id: line.expense_account_id ? String(line.expense_account_id) : '', purchase_request_line_id: line.id ?? line.purchase_request_line_id ?? null, purchase_order_line_id: line.id ?? line.purchase_order_line_id ?? null, goods_receipt_line_id: line.id ?? line.goods_receipt_line_id ?? null, vendor_bill_line_id: line.id ?? line.vendor_bill_line_id ?? null };
}

function readLines(document?: PurchaseDocument | null): PurchaseLineItem[] {
  return Array.isArray(document?.lines) ? document.lines : [];
}

function lineTotal(line: DraftLine, priceMode: 'estimated' | 'actual') {
  const price = Number((priceMode === 'estimated' ? line.estimated_unit_price : line.unit_price) || 0);
  return Math.max(0, Number(line.quantity || 0) * price - Number(line.discount_amount || 0) + Number(line.tax_amount || 0));
}

function documentNumber(document: PurchaseDocument, config: { numberKeys: string[]; dateKeys?: string[] }) {
  return String(value(document, ...config.numberKeys) ?? `#${document.id}`);
}

function documentDate(document: PurchaseDocument, config: { dateKeys: string[]; numberKeys?: string[] }) {
  return String(value(document, ...config.dateKeys) ?? '').slice(0, 10);
}

function documentTotal(document: PurchaseDocument) {
  return Number(value(document, 'grand_total', 'total_amount', 'amount', 'balance_due') ?? 0);
}

function vendorName(document: PurchaseDocument) {
  return String(document.vendor?.name ?? document.vendor_name ?? document.contact_name ?? document.source_number ?? document.vendor_id ?? '-');
}

function value(row: Record<string, unknown>, ...keys: string[]) {
  return keys.map((key) => row[key]).find((item) => item !== undefined && item !== null && item !== '');
}

function text(row: Record<string, unknown>, ...keys: string[]) {
  return String(value(row, ...keys) ?? '-');
}

function contactLabel(item: SelectRecord) {
  return `${text(item, 'contact_code', 'code', 'id')} - ${text(item, 'name', 'contact_name')}`;
}

function accountLabel(item: SelectRecord) {
  return `${text(item, 'account_code', 'code', 'id')} - ${text(item, 'account_name', 'name')}`;
}

function dateLabel(key: string) {
  if (key === 'requests') return 'Request Date *';
  if (key === 'orders') return 'Order Date *';
  if (key === 'goods-receipts') return 'Receipt Date *';
  if (key === 'vendor-bills') return 'Bill Date *';
  return 'Return Date *';
}

function secondaryDateLabel(key: string) {
  if (key === 'requests') return 'Needed Date';
  if (key === 'orders') return 'Expected Date';
  if (key === 'vendor-bills') return 'Due Date';
  return '';
}
