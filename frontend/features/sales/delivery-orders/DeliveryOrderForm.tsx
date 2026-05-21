'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { listMasterData } from '@/features/accounting/master-data/api';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { getApiErrorMessage } from '@/lib/api';
import type { DeliveryOrder, SalesLineItem, SalesOrder } from '@/features/sales/types';
import type { Department, MasterDataRecord, Project } from '@/types/accounting';
import { createDeliveryOrder, createDeliveryOrderFromSalesOrder, updateDeliveryOrder } from './api';

type DeliveryOrderFormProps = {
  mode: 'create' | 'edit' | 'from-order';
  deliveryOrder?: DeliveryOrder | null;
  sourceOrder?: SalesOrder | null;
};

type DraftLine = {
  sales_order_line_id?: number | null;
  product_id: string;
  product_code: string;
  description: string;
  quantity: string;
  max_quantity: number | null;
  unit_id: string;
  warehouse_id: string;
  department_id: string;
  project_id: string;
};

export function DeliveryOrderForm({ mode, deliveryOrder, sourceOrder }: DeliveryOrderFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [contacts, setContacts] = useState<MasterDataRecord[]>([]);
  const [products, setProducts] = useState<MasterDataRecord[]>([]);
  const [units, setUnits] = useState<MasterDataRecord[]>([]);
  const [warehouses, setWarehouses] = useState<MasterDataRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [customerId, setCustomerId] = useState(String(deliveryOrder?.customer_id ?? sourceOrder?.customer_id ?? ''));
  const [deliveryDate, setDeliveryDate] = useState(String(deliveryOrder?.delivery_date ?? today).slice(0, 10));
  const [shippingAddress, setShippingAddress] = useState(String(deliveryOrder?.shipping_address ?? sourceOrder?.shipping_address ?? ''));
  const [notes, setNotes] = useState(String(deliveryOrder?.notes ?? ''));
  const [lines, setLines] = useState<DraftLine[]>(() => initialLines(deliveryOrder?.lines ?? sourceOrder?.lines));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const [contactRes, productRes, unitRes, warehouseRes, departmentRes, projectRes] = await Promise.all([
          listMasterData('/master-data/contacts'),
          listMasterData('/master-data/products'),
          listMasterData('/master-data/units'),
          listMasterData('/master-data/warehouses'),
          listMasterData('/master-data/departments'),
          listMasterData('/master-data/projects'),
        ]);
        setContacts(contactRes.data ?? []);
        setProducts(productRes.data ?? []);
        setUnits(unitRes.data ?? []);
        setWarehouses(warehouseRes.data ?? []);
        setDepartments(departmentRes.data as Department[]);
        setProjects(projectRes.data as Project[]);
      } catch (event) {
        setError(getApiErrorMessage(event));
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const permission = mode === 'edit' ? 'sales.delivery_orders.edit' : 'sales.delivery_orders.create';
  const title = mode === 'edit' ? `Edit ${deliveryOrder?.delivery_number ?? 'Delivery Order'}` : mode === 'from-order' ? 'Create Delivery Order from Sales Order' : 'New Delivery Order';
  const stockNote = useMemo(() => 'This UI creates the delivery document only. Inventory stock movement UI remains out of Phase 14 scope.', []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId) {
      setError('Customer is required.');
      return;
    }
    for (const [index, line] of lines.entries()) {
      if (!line.description.trim() || Number(line.quantity) <= 0) {
        setError(`Line ${index + 1}: description and positive quantity are required.`);
        return;
      }
      if (line.max_quantity !== null && Number(line.quantity) > line.max_quantity) {
        setError(`Line ${index + 1}: delivery quantity exceeds remaining quantity.`);
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);
      const payload = {
        customer_id: Number(customerId),
        delivery_date: deliveryDate,
        sales_order_id: sourceOrder?.id ?? deliveryOrder?.sales_order_id ?? null,
        shipping_address: shippingAddress || null,
        notes: notes || null,
        lines: lines.map((line, index) => ({
          sales_order_line_id: line.sales_order_line_id ?? null,
          product_id: line.product_id ? Number(line.product_id) : null,
          product_code: line.product_code || null,
          description: line.description,
          quantity: Number(line.quantity || 0),
          unit_id: line.unit_id ? Number(line.unit_id) : null,
          warehouse_id: line.warehouse_id ? Number(line.warehouse_id) : null,
          department_id: line.department_id ? Number(line.department_id) : null,
          project_id: line.project_id ? Number(line.project_id) : null,
          sort_order: index + 1,
        })),
      };
      const response = mode === 'edit'
        ? await updateDeliveryOrder(deliveryOrder?.id ?? '', payload)
        : mode === 'from-order' && sourceOrder
          ? await createDeliveryOrderFromSalesOrder(sourceOrder.id, payload)
          : await createDeliveryOrder(payload);
      router.push(`/sales/delivery-orders/${response.data.id}`);
    } catch (eventError) {
      setError(getApiErrorMessage(eventError));
    } finally {
      setSaving(false);
    }
  }

  function updateLine(index: number, key: keyof DraftLine, value: string) {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, [key]: value } : line)));
  }

  if (loading) return <AppShell><LoadingState title="Loading delivery form data" /></AppShell>;

  return (
    <AppShell>
      <SalesPageGate permission={permission}>
        <PageHeader title={title} description="Create direct or source-linked delivery documents with basic remaining quantity checks." />
        <form onSubmit={submit} className="mt-6 space-y-6">
          {error ? <ErrorState message={error} /> : null}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{stockNote}</div>
          <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
            <label><span className="text-xs font-medium text-slate-500">Customer *</span><select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="">Select customer</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{String(contact.name ?? contact.id)}</option>)}</select></label>
            <label><span className="text-xs font-medium text-slate-500">Delivery Date *</span><input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
            <label className="md:col-span-3"><span className="text-xs font-medium text-slate-500">Shipping Address</span><input value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-slate-950">Delivery Lines</h2><button type="button" onClick={() => setLines((current) => [...current, blankLine()])} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">Add Line</button></div>
            <DataTable columns={['Product', 'Description', 'Qty', 'Remaining', 'Unit', 'Warehouse', 'Dimension', '']}>
              {lines.map((line, index) => (
                <tr key={index} className="align-top">
                  <td className="min-w-48 px-2 py-3"><select value={line.product_id} onChange={(e) => updateLine(index, 'product_id', e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"><option value="">-</option>{products.map((product) => <option key={product.id} value={product.id}>{String(product.product_code ?? product.id)} - {String(product.product_name ?? 'Product')}</option>)}</select></td>
                  <td className="min-w-52 px-2 py-3"><input value={line.description} onChange={(e) => updateLine(index, 'description', e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" /></td>
                  <td className="min-w-24 px-2 py-3"><input type="number" min="0" step="0.01" value={line.quantity} onChange={(e) => updateLine(index, 'quantity', e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-right text-sm" /></td>
                  <td className="px-2 py-3 text-right text-sm text-slate-600">{line.max_quantity ?? '-'}</td>
                  <td className="min-w-32 px-2 py-3"><select value={line.unit_id} onChange={(e) => updateLine(index, 'unit_id', e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"><option value="">-</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{String(unit.code ?? unit.id)}</option>)}</select></td>
                  <td className="min-w-36 px-2 py-3"><select value={line.warehouse_id} onChange={(e) => updateLine(index, 'warehouse_id', e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"><option value="">-</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{String(w.code ?? w.id)}</option>)}</select></td>
                  <td className="min-w-44 px-2 py-3"><select value={line.department_id} onChange={(e) => updateLine(index, 'department_id', e.target.value)} className="mb-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"><option value="">Dept</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.code}</option>)}</select><select value={line.project_id} onChange={(e) => updateLine(index, 'project_id', e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"><option value="">Project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}</select></td>
                  <td className="px-2 py-3"><button type="button" disabled={lines.length <= 1} onClick={() => setLines((current) => current.filter((_, i) => i !== index))} className="rounded-lg border border-slate-200 px-2 py-1 text-xs disabled:opacity-40">Remove</button></td>
                </tr>
              ))}
            </DataTable>
          </div>
          <label className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><span className="text-xs font-medium text-slate-500">Notes</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
          <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">{saving ? 'Saving...' : 'Save Delivery Order'}</button>
        </form>
      </SalesPageGate>
    </AppShell>
  );
}

function initialLines(lines?: SalesLineItem[]): DraftLine[] {
  const mapped = (lines ?? []).map((line) => {
    const ordered = Number(line.quantity ?? 0);
    const delivered = Number(line.delivered_quantity ?? 0);
    const remaining = Math.max(0, ordered - delivered);
    return {
      sales_order_line_id: line.sales_order_line_id ?? line.id ?? null,
      product_id: line.product_id ? String(line.product_id) : '',
      product_code: line.product_code ?? '',
      description: line.description ?? '',
      quantity: String(remaining || ordered || 1),
      max_quantity: remaining || null,
      unit_id: line.unit_id ? String(line.unit_id) : '',
      warehouse_id: line.warehouse_id ? String(line.warehouse_id) : '',
      department_id: line.department_id ? String(line.department_id) : '',
      project_id: line.project_id ? String(line.project_id) : '',
    };
  });
  return mapped.length ? mapped : [blankLine()];
}

function blankLine(): DraftLine {
  return { product_id: '', product_code: '', description: '', quantity: '1', max_quantity: null, unit_id: '', warehouse_id: '', department_id: '', project_id: '' };
}
