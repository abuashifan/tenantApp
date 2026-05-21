'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { listChartOfAccounts } from '@/features/accounting/chart-of-accounts/api';
import { listMasterData } from '@/features/accounting/master-data/api';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';
import type { ChartOfAccount, Department, MasterDataRecord, Project } from '@/types/accounting';
import { calculateSalesLine, calculateSalesTotals } from './calculations';
import { normalizeSalesLines } from './documentHelpers';
import type { SalesDocument, SalesLineItem, SalesOrder, SalesQuotation } from '@/features/sales/types';

type SalesDocumentFormProps = {
  type: 'quotation' | 'order' | 'proforma' | 'invoice';
  initial?: SalesDocument | null;
  sourceQuotation?: SalesQuotation | null;
  submitLabel: string;
  onSubmit: (payload: Record<string, unknown>) => Promise<{ id: number }>;
};

type DraftLine = {
  product_id: string;
  product_code: string;
  description: string;
  quantity: string;
  unit_id: string;
  unit_price: string;
  discount_type: string;
  discount_value: string;
  tax_rate: string;
  warehouse_id: string;
  department_id: string;
  project_id: string;
  quotation_line_id?: number | null;
  sales_order_line_id?: number | null;
  delivery_order_line_id?: number | null;
  proforma_invoice_line_id?: number | null;
};

export function SalesDocumentForm({
  type,
  initial,
  sourceQuotation,
  submitLabel,
  onSubmit,
}: SalesDocumentFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [contacts, setContacts] = useState<MasterDataRecord[]>([]);
  const [products, setProducts] = useState<MasterDataRecord[]>([]);
  const [units, setUnits] = useState<MasterDataRecord[]>([]);
  const [warehouses, setWarehouses] = useState<MasterDataRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [cashAccounts, setCashAccounts] = useState<ChartOfAccount[]>([]);
  const [customerId, setCustomerId] = useState(String(initial?.customer_id ?? sourceQuotation?.customer_id ?? ''));
  const [documentDate, setDocumentDate] = useState(initialDate(initial, sourceQuotation, type, today));
  const [validUntil, setValidUntil] = useState(String((initial as SalesQuotation | undefined)?.valid_until ?? ''));
  const [dueDate, setDueDate] = useState(String(initial?.due_date ?? ''));
  const [customerAddress, setCustomerAddress] = useState(String(initial?.customer_address ?? sourceQuotation?.customer_address ?? ''));
  const [notes, setNotes] = useState(String(initial?.notes ?? sourceQuotation?.notes ?? ''));
  const [headerDiscountType, setHeaderDiscountType] = useState(String(initial?.header_discount_type ?? sourceQuotation?.header_discount_type ?? ''));
  const [headerDiscountValue, setHeaderDiscountValue] = useState(String(initial?.header_discount_value ?? sourceQuotation?.header_discount_value ?? ''));
  const [isTaxable, setIsTaxable] = useState(Boolean(initial?.is_taxable ?? sourceQuotation?.is_taxable ?? false));
  const [taxIncluded, setTaxIncluded] = useState(Boolean(initial?.tax_included ?? sourceQuotation?.tax_included ?? false));
  const [hasDownPayment, setHasDownPayment] = useState(Boolean((initial as SalesOrder | undefined)?.has_down_payment ?? false));
  const [downPaymentAmount, setDownPaymentAmount] = useState('');
  const [downPaymentDate, setDownPaymentDate] = useState(today);
  const [downPaymentAccountId, setDownPaymentAccountId] = useState('');
  const [downPaymentNotes, setDownPaymentNotes] = useState('');
  const [appliedDownPaymentAmount, setAppliedDownPaymentAmount] = useState(String(initial?.applied_down_payment_amount ?? ''));
  const [lines, setLines] = useState<DraftLine[]>(() => initialLines(initial, sourceQuotation));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSelectors() {
    try {
      setLoading(true);
      setError(null);
      const [contactRes, productRes, unitRes, warehouseRes, departmentRes, projectRes, cashRes] = await Promise.all([
        listMasterData('/master-data/contacts'),
        listMasterData('/master-data/products'),
        listMasterData('/master-data/units'),
        listMasterData('/master-data/warehouses'),
        listMasterData('/master-data/departments'),
        listMasterData('/master-data/projects'),
        listChartOfAccounts({ is_cash_bank: '1', is_active: '1' }),
      ]);
      setContacts(contactRes.data ?? []);
      setProducts(productRes.data ?? []);
      setUnits(unitRes.data ?? []);
      setWarehouses(warehouseRes.data ?? []);
      setDepartments(departmentRes.data as Department[]);
      setProjects(projectRes.data as Project[]);
      setCashAccounts(cashRes.data ?? []);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadSelectors();
    });
  }, []);

  const calculatedLines = useMemo(() => lines.map(draftToLine).map(calculateSalesLine), [lines]);
  const totals = useMemo(
    () => calculateSalesTotals(calculatedLines, headerDiscountType, headerDiscountValue),
    [calculatedLines, headerDiscountType, headerDiscountValue],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateForm(customerId, lines, type, hasDownPayment, downPaymentAmount, downPaymentAccountId);
    if (validation) {
      setError(validation);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload: Record<string, unknown> = {
        customer_id: Number(customerId),
        customer_address: customerAddress || null,
        currency_code: 'IDR',
        exchange_rate: 1,
        is_taxable: isTaxable,
        tax_included: taxIncluded,
        header_discount_type: headerDiscountType || null,
        header_discount_value: Number(headerDiscountValue || 0),
        notes: notes || null,
        lines: lines.map((line, index) => ({
          quotation_line_id: line.quotation_line_id ?? null,
          sales_order_line_id: line.sales_order_line_id ?? null,
          delivery_order_line_id: line.delivery_order_line_id ?? null,
          proforma_invoice_line_id: line.proforma_invoice_line_id ?? null,
          product_id: line.product_id ? Number(line.product_id) : null,
          product_code: line.product_code || null,
          description: line.description,
          quantity: Number(line.quantity || 0),
          unit_id: line.unit_id ? Number(line.unit_id) : null,
          unit_price: Number(line.unit_price || 0),
          discount_type: line.discount_type || null,
          discount_value: Number(line.discount_value || 0),
          tax_rate: Number(line.tax_rate || 0),
          warehouse_id: line.warehouse_id ? Number(line.warehouse_id) : null,
          department_id: line.department_id ? Number(line.department_id) : null,
          project_id: line.project_id ? Number(line.project_id) : null,
          sort_order: index + 1,
        })),
      };

      if (type === 'quotation') {
        payload.quotation_date = documentDate;
        payload.valid_until = validUntil || null;
      } else if (type === 'order') {
        payload.order_date = documentDate;
        payload.quotation_id = sourceQuotation?.id ?? (initial as SalesOrder | undefined)?.quotation_id ?? null;
        payload.has_down_payment = hasDownPayment;
        if (hasDownPayment) {
          payload.down_payment = {
            deposit_date: downPaymentDate,
            cash_bank_account_id: Number(downPaymentAccountId),
            amount: Number(downPaymentAmount),
            notes: downPaymentNotes || null,
          };
        }
      } else if (type === 'proforma') {
        payload.proforma_date = documentDate;
        payload.valid_until = validUntil || null;
      } else {
        payload.invoice_date = documentDate;
        payload.due_date = dueDate || null;
        payload.applied_down_payment_amount = Number(appliedDownPaymentAmount || 0);
      }

      const result = await onSubmit(payload);
      const routes = {
        quotation: '/sales/quotations',
        order: '/sales/orders',
        proforma: '/sales/proformas',
        invoice: '/sales/invoices',
      };
      router.push(`${routes[type]}/${result.id}`);
    } catch (eventError) {
      setError(getApiErrorMessage(eventError));
    } finally {
      setSaving(false);
    }
  }

  function updateLine(index: number, key: keyof DraftLine, value: string) {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, [key]: value } : line)));
  }

  if (loading) return <LoadingState title="Loading sales form data" />;

  return (
    <form onSubmit={submit} className="space-y-6">
      {error ? <ErrorState message={error} /> : null}

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <label>
          <span className="text-xs font-medium text-slate-500">Customer *</span>
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Select customer</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {String(contact.contact_code ?? contact.id)} - {String(contact.name ?? 'Unnamed')}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-xs font-medium text-slate-500">{documentDateLabel(type)} *</span>
          <input type="date" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        {type === 'quotation' || type === 'proforma' ? (
          <label>
            <span className="text-xs font-medium text-slate-500">Valid Until</span>
            <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
        ) : null}
        {type === 'invoice' ? (
          <label>
            <span className="text-xs font-medium text-slate-500">Due Date</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
        ) : null}
        <label className="md:col-span-3">
          <span className="text-xs font-medium text-slate-500">Customer Address</span>
          <input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-xs font-medium text-slate-500">Header Discount Type</span>
          <select value={headerDiscountType} onChange={(e) => setHeaderDiscountType(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">None</option>
            <option value="percent">Percent</option>
            <option value="fixed_amount">Fixed Amount</option>
          </select>
        </label>
        <label>
          <span className="text-xs font-medium text-slate-500">Header Discount Value</span>
          <input type="number" min="0" step="0.01" value={headerDiscountValue} onChange={(e) => setHeaderDiscountValue(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <div className="flex items-end gap-4 pb-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={isTaxable} onChange={(e) => setIsTaxable(e.target.checked)} />
            Taxable
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={taxIncluded} onChange={(e) => setTaxIncluded(e.target.checked)} />
            Tax included
          </label>
        </div>
      </div>

      {type === 'order' ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-medium text-amber-950">
            <input type="checkbox" checked={hasDownPayment} onChange={(e) => setHasDownPayment(e.target.checked)} />
            Has down payment
          </label>
          <p className="mt-1 text-xs text-amber-800">Down payment is stored as Customer Deposit, not as a Sales Order balance field.</p>
          {hasDownPayment ? (
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <input type="date" value={downPaymentDate} onChange={(e) => setDownPaymentDate(e.target.value)} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" />
              <select value={downPaymentAccountId} onChange={(e) => setDownPaymentAccountId(e.target.value)} className="rounded-lg border border-amber-200 px-3 py-2 text-sm">
                <option value="">Cash/Bank account</option>
                {cashAccounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.account_code} - {account.account_name}</option>
                ))}
              </select>
              <input type="number" min="0" step="0.01" placeholder="Amount" value={downPaymentAmount} onChange={(e) => setDownPaymentAmount(e.target.value)} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" />
              <input placeholder="Notes" value={downPaymentNotes} onChange={(e) => setDownPaymentNotes(e.target.value)} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" />
            </div>
          ) : null}
        </div>
      ) : null}

      {type === 'invoice' ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-blue-950">Customer Deposit Application</h2>
          <p className="mt-1 text-xs text-blue-800">Apply available Customer Deposit only. This invoice UI does not create a new down payment.</p>
          <label className="mt-3 block max-w-xs">
            <span className="text-xs font-medium text-blue-700">Applied Deposit Amount</span>
            <input type="number" min="0" step="0.01" value={appliedDownPaymentAmount} onChange={(e) => setAppliedDownPaymentAmount(e.target.value)} className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm" />
          </label>
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-950">Line Items</h2>
          <button type="button" onClick={() => setLines((current) => [...current, blankLine()])} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            Add Line
          </button>
        </div>
        <DataTable columns={['Product', 'Description', 'Qty', 'Unit', 'Price', 'Discount', 'Tax %', 'Warehouse', 'Dimension', 'Total', '']}>
          {lines.map((line, index) => {
            const calculated = calculateSalesLine(draftToLine(line));
            return (
              <tr key={index} className="align-top">
                <td className="min-w-48 px-2 py-3">
                  <select value={line.product_id} onChange={(e) => updateLine(index, 'product_id', e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm">
                    <option value="">-</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{String(product.product_code ?? product.id)} - {String(product.product_name ?? 'Product')}</option>
                    ))}
                  </select>
                </td>
                <td className="min-w-52 px-2 py-3"><input value={line.description} onChange={(e) => updateLine(index, 'description', e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" /></td>
                <td className="min-w-24 px-2 py-3"><input type="number" min="0" step="0.01" value={line.quantity} onChange={(e) => updateLine(index, 'quantity', e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-right text-sm" /></td>
                <td className="min-w-32 px-2 py-3">
                  <select value={line.unit_id} onChange={(e) => updateLine(index, 'unit_id', e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm">
                    <option value="">-</option>
                    {units.map((unit) => <option key={unit.id} value={unit.id}>{String(unit.code ?? unit.id)}</option>)}
                  </select>
                </td>
                <td className="min-w-28 px-2 py-3"><input type="number" min="0" step="0.01" value={line.unit_price} onChange={(e) => updateLine(index, 'unit_price', e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-right text-sm" /></td>
                <td className="min-w-44 px-2 py-3">
                  <div className="flex gap-1">
                    <select value={line.discount_type} onChange={(e) => updateLine(index, 'discount_type', e.target.value)} className="w-24 rounded-lg border border-slate-200 px-2 py-2 text-sm">
                      <option value="">-</option><option value="percent">%</option><option value="fixed_amount">Amt</option>
                    </select>
                    <input type="number" min="0" step="0.01" value={line.discount_value} onChange={(e) => updateLine(index, 'discount_value', e.target.value)} className="w-24 rounded-lg border border-slate-200 px-2 py-2 text-right text-sm" />
                  </div>
                </td>
                <td className="min-w-24 px-2 py-3"><input type="number" min="0" step="0.01" value={line.tax_rate} onChange={(e) => updateLine(index, 'tax_rate', e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-right text-sm" /></td>
                <td className="min-w-36 px-2 py-3"><select value={line.warehouse_id} onChange={(e) => updateLine(index, 'warehouse_id', e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"><option value="">-</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{String(w.code ?? w.id)}</option>)}</select></td>
                <td className="min-w-44 px-2 py-3"><select value={line.department_id} onChange={(e) => updateLine(index, 'department_id', e.target.value)} className="mb-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"><option value="">Dept</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.code}</option>)}</select><select value={line.project_id} onChange={(e) => updateLine(index, 'project_id', e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"><option value="">Project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}</select></td>
                <td className="whitespace-nowrap px-2 py-3 text-right font-semibold">{formatCurrency(Number(calculated.line_total ?? 0))}</td>
                <td className="px-2 py-3"><button type="button" disabled={lines.length <= 1} onClick={() => setLines((current) => current.filter((_, i) => i !== index))} className="rounded-lg border border-slate-200 px-2 py-1 text-xs disabled:opacity-40">Remove</button></td>
              </tr>
            );
          })}
        </DataTable>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <label className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-950">Preview Totals</h3>
          <TotalRow label="Subtotal" value={totals.subtotal_before_discount} />
          <TotalRow label="Line Discount" value={totals.line_discount_total} />
          <TotalRow label="Header Discount" value={totals.header_discount_amount} />
          <TotalRow label="Tax" value={totals.tax_total} />
          <TotalRow label="Grand Total" value={totals.grand_total} strong />
          <p className="mt-3 text-xs text-slate-500">Frontend preview is non-authoritative; backend recalculates on save.</p>
        </div>
      </div>

      <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">
        {saving ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}

function initialDate(initial: SalesDocument | undefined | null, source: SalesQuotation | undefined | null, type: SalesDocumentFormProps['type'], fallback: string): string {
  if (type === 'quotation') return String((initial as SalesQuotation | undefined)?.quotation_date ?? fallback).slice(0, 10);
  if (type === 'order') return String((initial as SalesOrder | undefined)?.order_date ?? source?.quotation_date ?? fallback).slice(0, 10);
  if (type === 'proforma') return String(initial?.proforma_date ?? fallback).slice(0, 10);
  return String(initial?.invoice_date ?? fallback).slice(0, 10);
}

function initialLines(initial?: SalesDocument | null, source?: SalesQuotation | null): DraftLine[] {
  const lines = normalizeSalesLines(readLines(initial) ?? source?.lines ?? []);
  return lines.length ? lines.map(lineToDraft) : [blankLine()];
}

function readLines(document?: SalesDocument | null): SalesLineItem[] {
  return Array.isArray(document?.lines) ? (document.lines as SalesLineItem[]) : [];
}

function blankLine(): DraftLine {
  return { product_id: '', product_code: '', description: '', quantity: '1', unit_id: '', unit_price: '0', discount_type: '', discount_value: '0', tax_rate: '0', warehouse_id: '', department_id: '', project_id: '' };
}

function lineToDraft(line: SalesLineItem): DraftLine {
  return {
    product_id: line.product_id ? String(line.product_id) : '',
    product_code: line.product_code ?? '',
    description: line.description ?? '',
    quantity: String(line.quantity ?? 1),
    unit_id: line.unit_id ? String(line.unit_id) : '',
    unit_price: String(line.unit_price ?? 0),
    discount_type: line.discount_type ?? '',
    discount_value: String(line.discount_value ?? 0),
    tax_rate: String(line.tax_rate ?? 0),
    warehouse_id: line.warehouse_id ? String(line.warehouse_id) : '',
    department_id: line.department_id ? String(line.department_id) : '',
    project_id: line.project_id ? String(line.project_id) : '',
    quotation_line_id: line.id ?? line.quotation_line_id ?? null,
    sales_order_line_id: line.sales_order_line_id ?? null,
    delivery_order_line_id: line.delivery_order_line_id ?? null,
    proforma_invoice_line_id: line.proforma_invoice_line_id ?? null,
  };
}

function draftToLine(line: DraftLine): SalesLineItem {
  return {
    product_id: line.product_id ? Number(line.product_id) : null,
    product_code: line.product_code || null,
    description: line.description,
    quantity: Number(line.quantity || 0),
    unit_id: line.unit_id ? Number(line.unit_id) : null,
    unit_price: Number(line.unit_price || 0),
    discount_type: line.discount_type || null,
    discount_value: Number(line.discount_value || 0),
    tax_rate: Number(line.tax_rate || 0),
    warehouse_id: line.warehouse_id ? Number(line.warehouse_id) : null,
    department_id: line.department_id ? Number(line.department_id) : null,
    project_id: line.project_id ? Number(line.project_id) : null,
    sales_order_line_id: line.sales_order_line_id ?? null,
    delivery_order_line_id: line.delivery_order_line_id ?? null,
    proforma_invoice_line_id: line.proforma_invoice_line_id ?? null,
  };
}

function validateForm(customerId: string, lines: DraftLine[], type: string, hasDp: boolean, dpAmount: string, dpAccountId: string): string | null {
  if (!customerId) return 'Customer is required.';
  if (lines.length === 0) return 'At least one line is required.';
  for (const [index, line] of lines.entries()) {
    if (!line.description.trim()) return `Line ${index + 1}: description is required.`;
    if (Number(line.quantity) <= 0) return `Line ${index + 1}: quantity must be greater than zero.`;
    if (Number(line.unit_price) < 0) return `Line ${index + 1}: unit price cannot be negative.`;
  }
  if (type === 'order' && hasDp && (!dpAccountId || Number(dpAmount) <= 0)) return 'Down payment requires cash/bank account and amount.';
  return null;
}

function TotalRow({ label, value, strong }: { label: string; value?: number | string; strong?: boolean }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? 'font-semibold text-slate-950' : 'text-slate-700'}>{formatCurrency(Number(value ?? 0))}</span>
    </div>
  );
}

function documentDateLabel(type: SalesDocumentFormProps['type']): string {
  if (type === 'quotation') return 'Quotation Date';
  if (type === 'order') return 'Order Date';
  if (type === 'proforma') return 'Proforma Date';
  return 'Invoice Date';
}
