'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getSubmenuIcon } from '@/components/layout/navigation';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGuard } from '@/components/ui/PermissionGuard';
import { listMasterData } from '@/features/accounting/master-data/api';
import { approveStockAdjustment, createStockAdjustment, createStockOpname, finalizeStockOpname, generateStockOpnameLines, getInventoryValuation, getProductStockDetail, getStockAdjustmentDetail, getStockAdjustments, getStockCard, getStockList, getStockMovementDetail, getStockMovements, getStockOpnameDetail, getStockOpnameList, getWarehouseStock, postStockAdjustment, updateStockAdjustment, updateStockOpnameLine, voidStockAdjustment } from '@/features/inventory/api/inventoryApi';
import { InventoryPageGate } from '@/features/inventory/InventoryPageGate';
import { INVENTORY_NAV_ITEMS } from '@/features/inventory/navigation';
import { InventoryStatusBadge, StockMovementTypeBadge, StockQuantityDisplay, StockValueDisplay } from '@/features/inventory/components/InventoryPrimitives';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getStoredPermissions, hasPermission } from '@/lib/permissions';
import type { InventoryProductStock, StockAdjustment, StockMovement, StockOpname } from '@/types/inventory';

type Row = Record<string, unknown> & { id?: number };
type SelectRecord = Record<string, unknown> & { id: number };

export function InventoryWorkspace({ segments = [] }: { segments?: string[] }) {
  const [module, action, id, tail] = segments;
  if (!module) return <InventoryLanding />;
  if (module === 'stocks') return action ? <StockDetail productId={action} /> : <StockList />;
  if (module === 'warehouses' && action && id === 'stocks') return <WarehouseStockPage warehouseId={action} />;
  if (module === 'movements') return action ? <MovementDetail id={action} /> : <MovementList />;
  if (module === 'adjustments') return action === 'create' ? <AdjustmentForm /> : tail === 'edit' && action ? <AdjustmentForm id={action} /> : action ? <AdjustmentDetail id={action} /> : <AdjustmentList />;
  if (module === 'opname') return action === 'create' ? <OpnameForm /> : action ? <OpnameDetail id={action} /> : <OpnameList />;
  if (module === 'valuation') return <InventoryReport type="valuation" />;
  if (module === 'stock-card') return <InventoryReport type="stock-card" />;
  return <InventoryLanding />;
}

function InventoryLanding() {
  const permissions = getStoredPermissions();
  const visible = INVENTORY_NAV_ITEMS.filter((item) => hasPermission(permissions, item.permission));
  return (
    <AppShell>
      <InventoryPageGate permission={INVENTORY_NAV_ITEMS.map((item) => item.permission)}>
        <PageHeader title="Inventory" description="Inventory Frontend MVP for stocks, movements, adjustments, opname, valuation, and stock card." />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => {
            const ItemIcon = getSubmenuIcon(item.href, item.label);

            return (
              <Link key={item.href} href={item.href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--erp-emerald-soft)] text-[var(--erp-emerald-dark)]">
                    <ItemIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-950">{item.label}</h2>
                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </InventoryPageGate>
    </AppShell>
  );
}

function StockList() {
  const [rows, setRows] = useState<InventoryProductStock[]>([]);
  const [filters, setFilters] = useState({ search: '', warehouse_id: '', product_id: '', include_zero_stock: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setLoading(true); setRows((await getStockList(filters)).data ?? []); } catch (event) { setError(getApiErrorMessage(event)); } finally { setLoading(false); } }, [filters]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  const visible = useMemo(() => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(filters.search.toLowerCase())), [filters.search, rows]);
  return <AppShell><InventoryPageGate permission="inventory.stock.view"><PageHeader title="Product Stock" description="Stock balance by product. Low stock and negative quantity are highlighted when present." /><div className="mt-6 space-y-4"><InventoryFilter filters={filters} onChange={setFilters} onApply={load} />{loading ? <LoadingState title="Loading product stock" /> : null}{error ? <ErrorState message={error} /> : null}{!loading && !error && visible.length === 0 ? <EmptyState title="No stock rows" description="No stock balance matched the current filters." /> : null}{visible.length > 0 ? <StockTable rows={visible} /> : null}</div></InventoryPageGate></AppShell>;
}

function StockTable({ rows }: { rows: InventoryProductStock[] }) {
  return <DataTable columns={['Product', 'Warehouse', 'On Hand', 'Available', 'Average Cost', 'Stock Value', 'Warning', 'Action']}>{rows.map((row, index) => <tr key={`${row.product_id ?? row.id ?? index}-${row.warehouse_id ?? 'all'}`}><td className="px-4 py-3 font-medium">{text(row, 'product_code', 'product_id')} - {text(row, 'product_name', 'name')}</td><td className="px-4 py-3">{text(row, 'warehouse_code', 'warehouse_name', 'warehouse_id')}</td><td className="px-4 py-3 text-right"><StockQuantityDisplay value={value(row, 'quantity_on_hand', 'quantity', 'stock_quantity')} /></td><td className="px-4 py-3 text-right"><StockQuantityDisplay value={value(row, 'available_quantity', 'available_stock')} /></td><td className="px-4 py-3 text-right"><StockValueDisplay value={value(row, 'average_cost', 'unit_cost')} /></td><td className="px-4 py-3 text-right font-semibold"><StockValueDisplay value={value(row, 'stock_value', 'inventory_value')} /></td><td className="px-4 py-3">{Number(value(row, 'quantity_on_hand', 'quantity') ?? 0) < 0 ? <span className="text-red-700">Negative</span> : Number(value(row, 'is_low_stock') ?? 0) ? <span className="text-amber-700">Low stock</span> : '-'}</td><td className="px-4 py-3">{row.product_id ? <Link className="underline" href={`/inventory/stocks/${row.product_id}`}>Detail</Link> : '-'}</td></tr>)}</DataTable>;
}

function StockDetail({ productId }: { productId: string }) {
  return <RowsPage title="Product Stock Detail" permission="inventory.stock.view" loader={() => getProductStockDetail(productId)} render={(rows) => <StockTable rows={rows as InventoryProductStock[]} />} />;
}

function WarehouseStockPage({ warehouseId }: { warehouseId: string }) {
  return <RowsPage title="Warehouse Stock" permission="inventory.stock.view" loader={() => getWarehouseStock(warehouseId)} render={(rows) => <StockTable rows={rows as InventoryProductStock[]} />} />;
}

function MovementList() {
  return <RowsPage title="Stock Movements" permission="inventory.movements.view" loader={() => getStockMovements()} render={(rows) => <DataTable columns={['Date', 'Movement', 'Type', 'Warehouse', 'Status', 'Qty In', 'Qty Out', 'Action']}>{(rows as StockMovement[]).map((row) => <tr key={row.id}><td className="px-4 py-3">{formatDate(String(value(row, 'movement_date', 'transaction_date') ?? ''))}</td><td className="px-4 py-3 font-medium">{text(row, 'movement_number', 'document_number', 'id')}</td><td className="px-4 py-3"><StockMovementTypeBadge type={String(value(row, 'movement_type', 'type') ?? '')} /></td><td className="px-4 py-3">{text(row, 'warehouse_name', 'warehouse_id')}</td><td className="px-4 py-3"><InventoryStatusBadge status={row.status} /></td><td className="px-4 py-3 text-right"><StockQuantityDisplay value={value(row, 'quantity_in', 'total_quantity_in')} /></td><td className="px-4 py-3 text-right"><StockQuantityDisplay value={value(row, 'quantity_out', 'total_quantity_out')} /></td><td className="px-4 py-3"><Link className="underline" href={`/inventory/movements/${row.id}`}>Detail</Link></td></tr>)}</DataTable>} />;
}

function MovementDetail({ id }: { id: string }) {
  return <ObjectPage title="Stock Movement Detail" permission="inventory.movements.view" loader={() => getStockMovementDetail(id)} linesKey="lines" />;
}

function AdjustmentList() {
  return <RowsPage title="Stock Adjustments" permission="inventory.adjustments.view" loader={() => getStockAdjustments()} action={<PermissionGuard permission="inventory.adjustments.create"><Link href="/inventory/adjustments/create" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Create Adjustment</Link></PermissionGuard>} render={(rows) => <DataTable columns={['Date', 'Adjustment', 'Warehouse', 'Reason', 'Status', 'Lines', 'Action']}>{(rows as StockAdjustment[]).map((row) => <tr key={row.id}><td className="px-4 py-3">{formatDate(String(row.adjustment_date ?? ''))}</td><td className="px-4 py-3 font-medium">{text(row, 'adjustment_number', 'document_number', 'id')}</td><td className="px-4 py-3">{text(row, 'warehouse_name', 'warehouse_id')}</td><td className="px-4 py-3">{text(row, 'reason')}</td><td className="px-4 py-3"><InventoryStatusBadge status={row.status} /></td><td className="px-4 py-3">{Array.isArray(row.lines) ? row.lines.length : '-'}</td><td className="px-4 py-3"><Link className="underline" href={`/inventory/adjustments/${row.id}`}>Detail</Link></td></tr>)}</DataTable>} />;
}

function AdjustmentDetail({ id }: { id: string }) {
  const [data, setData] = useState<StockAdjustment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setData((await getStockAdjustmentDetail(id)).data); } catch (event) { setError(getApiErrorMessage(event)); } }, [id]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  async function run(action: 'approve' | 'post' | 'void') { try { if (action === 'approve') await approveStockAdjustment(id); if (action === 'post') await postStockAdjustment(id); if (action === 'void') await voidStockAdjustment(id, window.prompt('Void reason') ?? 'Voided from UI'); await load(); } catch (event) { setError(getApiErrorMessage(event)); } }
  return <AppShell><InventoryPageGate permission="inventory.adjustments.view">{data ? <PageHeader title={text(data, 'adjustment_number', 'id')} description="Stock adjustment detail and status actions." actions={<><PermissionGuard permission="inventory.adjustments.edit"><Link href={`/inventory/adjustments/${id}/edit`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Edit</Link></PermissionGuard><PermissionGuard permission="inventory.adjustments.approve"><button onClick={() => run('approve')} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Approve</button></PermissionGuard><PermissionGuard permission="inventory.adjustments.post"><button onClick={() => run('post')} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Post</button></PermissionGuard><PermissionGuard permission="inventory.adjustments.void"><button onClick={() => run('void')} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700">Void</button></PermissionGuard></>} /> : null}<div className="mt-6 space-y-4">{error ? <ErrorState message={error} /> : null}{data ? <><SummaryGrid data={data} /><GenericLines rows={(data.lines ?? []) as Row[]} /></> : <LoadingState title="Loading adjustment" />}</div></InventoryPageGate></AppShell>;
}

function AdjustmentForm({ id }: { id?: string }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [products, setProducts] = useState<SelectRecord[]>([]);
  const [warehouses, setWarehouses] = useState<SelectRecord[]>([]);
  const [date, setDate] = useState(today);
  const [warehouseId, setWarehouseId] = useState('');
  const [reason, setReason] = useState('');
  const [line, setLine] = useState({ product_id: '', adjustment_type: 'increase', quantity: '1', unit_cost: '0' });
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { queueMicrotask(async () => { try { const [productRes, warehouseRes, current] = await Promise.all([listMasterData('/master-data/products'), listMasterData('/master-data/warehouses'), id ? getStockAdjustmentDetail(id) : Promise.resolve({ data: null })]); setProducts(productRes.data ?? []); setWarehouses(warehouseRes.data ?? []); if (current.data) { setDate(String(current.data.adjustment_date ?? today).slice(0, 10)); setWarehouseId(String(current.data.warehouse_id ?? '')); setReason(String(current.data.reason ?? '')); } } catch (event) { setError(getApiErrorMessage(event)); } }); }, [id, today]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!line.product_id || !warehouseId || Number(line.quantity) <= 0) { setError('Warehouse, product, and positive quantity are required.'); return; } try { const payload = { adjustment_date: date, warehouse_id: Number(warehouseId), reason, lines: [{ product_id: Number(line.product_id), warehouse_id: Number(warehouseId), adjustment_type: line.adjustment_type, quantity: Number(line.quantity), unit_cost: Number(line.unit_cost || 0), reason }] }; const response = id ? await updateStockAdjustment(id, payload) : await createStockAdjustment(payload); router.push(`/inventory/adjustments/${response.data.id}`); } catch (eventError) { setError(getApiErrorMessage(eventError)); } }
  return <AppShell><InventoryPageGate permission={id ? 'inventory.adjustments.edit' : 'inventory.adjustments.create'}><PageHeader title={id ? 'Edit Stock Adjustment' : 'Create Stock Adjustment'} description="Manual stock correction UI. Backend handles period locks, valuation, and posting." /><form onSubmit={submit} className="mt-6 space-y-6">{error ? <ErrorState message={error} /> : null}<div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4"><Input label="Adjustment Date *" type="date" value={date} onChange={setDate} /><Select label="Warehouse *" value={warehouseId} onChange={setWarehouseId} options={warehouses} optionLabel={(row) => text(row, 'code', 'warehouse_code', 'name')} /><Input label="Reason" value={reason} onChange={setReason} /></div><div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5"><Select label="Product *" value={line.product_id} onChange={(value) => setLine({ ...line, product_id: value })} options={products} optionLabel={(row) => `${text(row, 'product_code', 'id')} - ${text(row, 'product_name', 'name')}`} /><Select label="Type" value={line.adjustment_type} onChange={(value) => setLine({ ...line, adjustment_type: value })} options={[{ id: 1, name: 'increase' }, { id: 2, name: 'decrease' }]} optionLabel={(row) => String(row.name)} /><Input label="Quantity *" type="number" value={line.quantity} onChange={(value) => setLine({ ...line, quantity: value })} /><Input label="Unit Cost" type="number" value={line.unit_cost} onChange={(value) => setLine({ ...line, unit_cost: value })} /><div className="self-end text-sm text-slate-600">Value preview: {formatCurrency(Number(line.quantity || 0) * Number(line.unit_cost || 0))}</div></div><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Save</button></form></InventoryPageGate></AppShell>;
}

function OpnameList() {
  return <RowsPage title="Stock Opname" permission="inventory.opname.view" loader={() => getStockOpnameList()} action={<PermissionGuard permission="inventory.opname.create"><Link href="/inventory/opname/create" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Create Opname</Link></PermissionGuard>} render={(rows) => <DataTable columns={['Date', 'Session', 'Warehouse', 'Status', 'Lines', 'Action']}>{(rows as StockOpname[]).map((row) => <tr key={row.id}><td className="px-4 py-3">{formatDate(String(row.opname_date ?? ''))}</td><td className="px-4 py-3 font-medium">{text(row, 'opname_number', 'document_number', 'id')}</td><td className="px-4 py-3">{text(row, 'warehouse_name', 'warehouse_id')}</td><td className="px-4 py-3"><InventoryStatusBadge status={row.status} /></td><td className="px-4 py-3">{Array.isArray(row.lines) ? row.lines.length : '-'}</td><td className="px-4 py-3"><Link className="underline" href={`/inventory/opname/${row.id}`}>Detail</Link></td></tr>)}</DataTable>} />;
}

function OpnameForm() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [warehouses, setWarehouses] = useState<SelectRecord[]>([]);
  const [date, setDate] = useState(today);
  const [warehouseId, setWarehouseId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { queueMicrotask(async () => { try { setWarehouses((await listMasterData('/master-data/warehouses')).data ?? []); } catch (event) { setError(getApiErrorMessage(event)); } }); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!warehouseId) { setError('Warehouse is required.'); return; } try { const response = await createStockOpname({ opname_date: date, warehouse_id: Number(warehouseId), notes }); router.push(`/inventory/opname/${response.data.id}`); } catch (eventError) { setError(getApiErrorMessage(eventError)); } }
  return <AppShell><InventoryPageGate permission="inventory.opname.create"><PageHeader title="Create Stock Opname" description="Create a basic physical count session. Barcode/import is out of scope." /><form onSubmit={submit} className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">{error ? <div className="md:col-span-3"><ErrorState message={error} /></div> : null}<Input label="Opname Date *" type="date" value={date} onChange={setDate} /><Select label="Warehouse *" value={warehouseId} onChange={setWarehouseId} options={warehouses} optionLabel={(row) => text(row, 'code', 'warehouse_code', 'name')} /><label className="md:col-span-3"><span className="text-xs font-medium text-slate-500">Notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Save</button></form></InventoryPageGate></AppShell>;
}

function OpnameDetail({ id }: { id: string }) {
  const [data, setData] = useState<StockOpname | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setData((await getStockOpnameDetail(id)).data); } catch (event) { setError(getApiErrorMessage(event)); } }, [id]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  async function generate() { try { await generateStockOpnameLines(id); await load(); } catch (event) { setError(getApiErrorMessage(event)); } }
  async function finalize() { try { if (window.confirm('Finalize this stock opname?')) { await finalizeStockOpname(id); await load(); } } catch (event) { setError(getApiErrorMessage(event)); } }
  return <AppShell><InventoryPageGate permission="inventory.opname.view">{data ? <PageHeader title={text(data, 'opname_number', 'id')} description="Physical count session with difference preview and finalize action." actions={<><PermissionGuard permission="inventory.opname.edit"><button onClick={generate} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Generate Lines</button></PermissionGuard><PermissionGuard permission="inventory.opname.finalize"><button onClick={finalize} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Finalize</button></PermissionGuard></>} /> : null}<div className="mt-6 space-y-4">{error ? <ErrorState message={error} /> : null}{data ? <><SummaryGrid data={data} /><DataTable columns={['Product', 'System Qty', 'Physical Qty', 'Difference', 'Reason', 'Action']}>{(data.lines ?? []).map((line, index) => <tr key={line.id ?? index}><td className="px-4 py-3">{text(line, 'product_code', 'product_id')}</td><td className="px-4 py-3 text-right"><StockQuantityDisplay value={line.system_quantity} /></td><td className="px-4 py-3 text-right"><StockQuantityDisplay value={line.physical_quantity} /></td><td className="px-4 py-3 text-right"><StockQuantityDisplay value={line.difference_quantity} /></td><td className="px-4 py-3">{text(line, 'reason')}</td><td className="px-4 py-3"><PermissionGuard permission="inventory.opname.edit"><button className="underline" onClick={() => line.id ? updateStockOpnameLine(id, line.id, { physical_quantity: Number(window.prompt('Physical quantity', String(line.physical_quantity ?? 0)) ?? line.physical_quantity ?? 0), reason: window.prompt('Reason') ?? null }).then(() => load()).catch((event) => setError(getApiErrorMessage(event))) : undefined}>Update</button></PermissionGuard></td></tr>)}</DataTable></> : <LoadingState title="Loading opname" />}</div></InventoryPageGate></AppShell>;
}

function InventoryReport({ type }: { type: 'valuation' | 'stock-card' }) {
  const [products, setProducts] = useState<SelectRecord[]>([]);
  const [warehouses, setWarehouses] = useState<SelectRecord[]>([]);
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [date, setDate] = useState('');
  const [data, setData] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { queueMicrotask(async () => { try { const [productRes, warehouseRes] = await Promise.all([listMasterData('/master-data/products'), listMasterData('/master-data/warehouses')]); setProducts(productRes.data ?? []); setWarehouses(warehouseRes.data ?? []); } catch (event) { setError(getApiErrorMessage(event)); } }); }, []);
  async function load() { try { setError(null); if (type === 'stock-card' && !productId) { setError('Product is required for stock card.'); return; } setData((await (type === 'valuation' ? getInventoryValuation({ product_id: productId, warehouse_id: warehouseId, as_of_date: date }) : getStockCard({ product_id: productId, warehouse_id: warehouseId, date_to: date }))).data as Row); } catch (event) { setError(getApiErrorMessage(event)); } }
  const rows = Array.isArray(data?.rows) ? data.rows as Row[] : Array.isArray(data?.data) ? data.data as Row[] : Array.isArray(data?.lines) ? data.lines as Row[] : [];
  return <AppShell><InventoryPageGate permission={type === 'valuation' ? 'inventory.valuation.view' : 'inventory.reports.view'}><PageHeader title={type === 'valuation' ? 'Inventory Valuation' : 'Stock Card'} description="Print-friendly browser report. PDF/Excel export is out of scope." /><div className="mt-6 space-y-4"><div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4 print:hidden"><Select label="Product" value={productId} onChange={setProductId} options={products} optionLabel={(row) => `${text(row, 'product_code', 'id')} - ${text(row, 'product_name', 'name')}`} /><Select label="Warehouse" value={warehouseId} onChange={setWarehouseId} options={warehouses} optionLabel={(row) => text(row, 'code', 'warehouse_code', 'name')} /><Input label={type === 'valuation' ? 'As Of Date' : 'Date To'} type="date" value={date} onChange={setDate} /><button onClick={load} className="self-end rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Run Report</button></div>{error ? <ErrorState message={error} /> : null}{data ? <SummaryGrid data={data} /> : null}{rows.length > 0 ? <DataTable columns={Object.keys(rows[0]).slice(0, 8)}>{rows.map((row, index) => <tr key={index}>{Object.keys(rows[0]).slice(0, 8).map((key) => <td key={key} className="px-4 py-3">{String(row[key] ?? '-')}</td>)}</tr>)}</DataTable> : data ? <EmptyState title="No report rows" description="The report returned no rows." /> : null}</div></InventoryPageGate></AppShell>;
}

function RowsPage({ title, permission, loader, render, action }: { title: string; permission: string; loader: () => Promise<{ data: unknown }>; render: (rows: unknown[]) => React.ReactNode; action?: React.ReactNode }) {
  const [rows, setRows] = useState<unknown[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setLoading(true); const response = await loader(); setRows(Array.isArray(response.data) ? response.data : Array.isArray((response.data as Row)?.rows) ? (response.data as Row).rows as unknown[] : []); } catch (event) { setError(getApiErrorMessage(event)); } finally { setLoading(false); } }, [loader]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  const visible = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
  return <AppShell><InventoryPageGate permission={permission}><PageHeader title={title} description={`${title} page with tenant-aware filters, loading, error, and empty states.`} actions={action} /><div className="mt-6 space-y-4"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm md:max-w-md" />{loading ? <LoadingState title={`Loading ${title}`} /> : null}{error ? <ErrorState message={error} /> : null}{visible.length === 0 && !loading && !error ? <EmptyState title={`No ${title.toLowerCase()} rows`} description="No data matched the current filter." /> : null}{visible.length > 0 ? render(visible) : null}</div></InventoryPageGate></AppShell>;
}

function ObjectPage({ title, permission, loader, linesKey }: { title: string; permission: string; loader: () => Promise<{ data: Row }>; linesKey: string }) {
  const [data, setData] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { queueMicrotask(async () => { try { setData((await loader()).data); } catch (event) { setError(getApiErrorMessage(event)); } }); }, [loader]);
  const lines = Array.isArray(data?.[linesKey]) ? data[linesKey] as Row[] : [];
  return <AppShell><InventoryPageGate permission={permission}><PageHeader title={title} description="Read-only detail from backend inventory engine." /><div className="mt-6 space-y-4">{error ? <ErrorState message={error} /> : null}{data ? <><SummaryGrid data={data} /><GenericLines rows={lines} /></> : <LoadingState title={`Loading ${title}`} />}</div></InventoryPageGate></AppShell>;
}

function GenericLines({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return <EmptyState title="No lines" description="Backend returned no line rows." />;
  return <DataTable columns={Object.keys(rows[0]).slice(0, 8)}>{rows.map((row, index) => <tr key={index}>{Object.keys(rows[0]).slice(0, 8).map((key) => <td key={key} className="px-4 py-3">{String(row[key] ?? '-')}</td>)}</tr>)}</DataTable>;
}

function InventoryFilter({ filters, onChange, onApply }: { filters: { search: string; warehouse_id: string; product_id: string; include_zero_stock: string }; onChange: (filters: { search: string; warehouse_id: string; product_id: string; include_zero_stock: string }) => void; onApply: () => void }) {
  return <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5"><Input label="Search" value={filters.search} onChange={(value) => onChange({ ...filters, search: value })} /><Input label="Warehouse ID" value={filters.warehouse_id} onChange={(value) => onChange({ ...filters, warehouse_id: value })} /><Input label="Product ID" value={filters.product_id} onChange={(value) => onChange({ ...filters, product_id: value })} /><Select label="Include Zero" value={filters.include_zero_stock} onChange={(value) => onChange({ ...filters, include_zero_stock: value })} options={[{ id: 1, name: '1' }, { id: 0, name: '0' }]} optionLabel={(row) => String(row.name)} /><button onClick={onApply} className="self-end rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Apply</button></div>;
}

function SummaryGrid({ data }: { data: Row }) {
  return <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm md:grid-cols-4">{Object.entries(data).filter(([, item]) => !Array.isArray(item) && typeof item !== 'object').slice(0, 12).map(([key, item]) => <div key={key}><div className="text-xs uppercase text-slate-500">{key.replaceAll('_', ' ')}</div><div className="mt-1 font-semibold text-slate-950">{String(item ?? '-')}</div></div>)}</div>;
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label><span className="text-xs font-medium text-slate-500">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>;
}

function Select({ label, value: selected, onChange, options, optionLabel }: { label: string; value: string; onChange: (value: string) => void; options: SelectRecord[]; optionLabel: (row: SelectRecord) => string }) {
  return <label><span className="text-xs font-medium text-slate-500">{label}</span><select value={selected} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="">-</option>{options.map((option) => <option key={option.id} value={option.id}>{optionLabel(option)}</option>)}</select></label>;
}

function value(row: Row, ...keys: string[]) {
  return keys.map((key) => row[key]).find((item) => item !== undefined && item !== null && item !== '');
}

function text(row: Row, ...keys: string[]) {
  return String(value(row, ...keys) ?? '-');
}
