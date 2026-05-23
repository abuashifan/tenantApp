'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  DateInput,
  ErrorSummary,
  FormActionBar,
  FormSection,
  FormWorkspace,
  LineItemsTable,
  MoneyInput,
  NumberInput,
  SearchableSelect,
  SummaryPanel,
  TextInput,
  TextareaInput,
  extractFieldErrors,
  type FieldErrorMap,
  type FormOption,
  type LineItemsColumn,
} from '@/components/form';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { listMasterData } from '@/features/accounting/master-data/api';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { ApiRequestError, getApiErrorMessage } from '@/lib/api';
import { formatAccountingStatus } from '@/lib/formatters';
import type { MasterDataRecord } from '@/types/accounting';
import type { DeliveryOrder, SalesInvoice, SalesLineItem, SalesReturn } from '@/features/sales/types';
import {
  createSalesReturn,
  createSalesReturnFromDeliveryOrder,
  createSalesReturnFromInvoice,
  updateSalesReturn,
} from './api';

type SalesReturnFormProps = {
  mode: 'create' | 'edit' | 'from-invoice' | 'from-delivery';
  salesReturn?: SalesReturn | null;
  sourceInvoice?: SalesInvoice | null;
  sourceDelivery?: DeliveryOrder | null;
};

type DraftLine = {
  sales_invoice_line_id?: number | null;
  delivery_order_line_id?: number | null;
  description: string;
  quantity: string;
  max_quantity: number | null;
  unit_price: string;
  discount_amount: string;
  tax_amount: string;
  line_total: string;
};

export function SalesReturnForm({
  mode,
  salesReturn,
  sourceInvoice,
  sourceDelivery,
}: SalesReturnFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [contacts, setContacts] = useState<MasterDataRecord[]>([]);
  const [customerId, setCustomerId] = useState(
    String(salesReturn?.customer_id ?? sourceInvoice?.customer_id ?? sourceDelivery?.customer_id ?? ''),
  );
  const [returnDate, setReturnDate] = useState(
    String(salesReturn?.return_date ?? today).slice(0, 10),
  );
  const [reason, setReason] = useState(String(salesReturn?.reason ?? ''));
  const [notes, setNotes] = useState(String(salesReturn?.notes ?? ''));
  const [lines, setLines] = useState<DraftLine[]>(() =>
    initialLines(salesReturn?.lines ?? sourceInvoice?.lines ?? sourceDelivery?.lines),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        setContacts((await listMasterData('/master-data/contacts')).data ?? []);
      } catch (event) {
        setError(getApiErrorMessage(event));
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const contactOptions = useMemo<FormOption[]>(
    () =>
      contacts.map((contact) => ({
        value: String(contact.id),
        label: `${String(contact.contact_code ?? contact.id)} - ${String(contact.name ?? 'Unnamed')}`,
      })),
    [contacts],
  );
  const total = useMemo(
    () => lines.reduce((sum, line) => sum + Number(line.line_total || 0), 0),
    [lines],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateReturn(customerId, lines);
    if (validation) {
      setError(validation);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setFieldErrors({});
      const payload = {
        return_date: returnDate,
        customer_id: Number(customerId),
        sales_invoice_id: sourceInvoice?.id ?? salesReturn?.sales_invoice_id ?? null,
        delivery_order_id: sourceDelivery?.id ?? salesReturn?.delivery_order_id ?? null,
        reason: reason || null,
        notes: notes || null,
        lines: lines.map((line) => ({
          sales_invoice_line_id: line.sales_invoice_line_id ?? null,
          delivery_order_line_id: line.delivery_order_line_id ?? null,
          description: line.description,
          quantity: Number(line.quantity),
          unit_price: Number(line.unit_price || 0),
          discount_amount: Number(line.discount_amount || 0),
          tax_amount: Number(line.tax_amount || 0),
          line_total: Number(line.line_total || 0),
        })),
      };
      const response =
        mode === 'edit'
          ? await updateSalesReturn(salesReturn?.id ?? '', payload)
          : mode === 'from-invoice' && sourceInvoice
            ? await createSalesReturnFromInvoice(sourceInvoice.id, payload)
            : mode === 'from-delivery' && sourceDelivery
              ? await createSalesReturnFromDeliveryOrder(sourceDelivery.id, payload)
              : await createSalesReturn(payload);
      router.push(`/sales/returns/${response.data.id}`);
    } catch (eventError) {
      setError(getApiErrorMessage(eventError));
      setFieldErrors(extractFieldErrors(eventError));
      if (!(eventError instanceof ApiRequestError)) setFieldErrors({});
    } finally {
      setSaving(false);
    }
  }

  function updateValue(setter: (value: string) => void, value: string) {
    setter(value);
    setDirty(true);
  }

  function updateLine(index: number, key: keyof DraftLine, value: string) {
    setLines((current) =>
      current.map((line, i) => {
        if (i !== index) return line;
        const next = { ...line, [key]: value };
        if (key === 'quantity' || key === 'unit_price' || key === 'discount_amount' || key === 'tax_amount') {
          next.line_total = String(
            Math.max(0, Number(next.quantity || 0) * Number(next.unit_price || 0) - Number(next.discount_amount || 0)) +
              Number(next.tax_amount || 0),
          );
        }
        return next;
      }),
    );
    setDirty(true);
  }

  const lineColumns: LineItemsColumn<DraftLine>[] = [
    {
      key: 'description',
      label: 'Description',
      widthClassName: 'min-w-72',
      render: (line, index) => (
        <TextInput
          value={line.description}
          onChange={(value) => updateLine(index, 'description', value)}
          error={fieldErrors[`lines.${index}.description`]}
        />
      ),
    },
    {
      key: 'quantity',
      label: 'Qty',
      align: 'right',
      widthClassName: 'min-w-28',
      render: (line, index) => (
        <NumberInput
          value={line.quantity}
          min="0"
          onChange={(value) => updateLine(index, 'quantity', value)}
          error={fieldErrors[`lines.${index}.quantity`]}
        />
      ),
    },
    {
      key: 'max',
      label: 'Max',
      align: 'right',
      widthClassName: 'min-w-24',
      render: (line) => <span className="text-slate-600">{line.max_quantity ?? '-'}</span>,
    },
    {
      key: 'unit_price',
      label: 'Unit Price',
      align: 'right',
      widthClassName: 'min-w-36',
      render: (line, index) => (
        <MoneyInput
          value={line.unit_price}
          min="0"
          onChange={(value) => updateLine(index, 'unit_price', value)}
        />
      ),
    },
    {
      key: 'discount',
      label: 'Discount',
      align: 'right',
      widthClassName: 'min-w-32',
      render: (line, index) => (
        <NumberInput
          value={line.discount_amount}
          min="0"
          onChange={(value) => updateLine(index, 'discount_amount', value)}
        />
      ),
    },
    {
      key: 'tax',
      label: 'Tax',
      align: 'right',
      widthClassName: 'min-w-32',
      render: (line, index) => (
        <NumberInput
          value={line.tax_amount}
          min="0"
          onChange={(value) => updateLine(index, 'tax_amount', value)}
        />
      ),
    },
    {
      key: 'line_total',
      label: 'Line Total',
      align: 'right',
      widthClassName: 'min-w-36',
      render: (line, index) => (
        <MoneyInput
          value={line.line_total}
          min="0"
          onChange={(value) => updateLine(index, 'line_total', value)}
          error={fieldErrors[`lines.${index}.line_total`]}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <AppShell>
        <LoadingState title="Loading sales return form" />
      </AppShell>
    );
  }

  const title =
    mode === 'edit'
      ? `Edit ${salesReturn?.return_number ?? 'Sales Return'}`
      : mode === 'from-invoice'
        ? 'Create Sales Return from Invoice'
        : mode === 'from-delivery'
          ? 'Create Sales Return from Delivery'
          : 'New Sales Return';

  return (
    <AppShell>
      <SalesPageGate permission={mode === 'edit' ? 'sales.returns.edit' : 'sales.returns.create'}>
        <PageHeader
          title={title}
          description="Create return document and AR impact summary without stock movement UI."
        />
        <form onSubmit={submit} className="mt-6">
          <FormWorkspace
            title={salesReturn?.return_number ?? title}
            subtitle="Inventory return movement belongs to the Inventory module; this form records the sales return."
            status={formatAccountingStatus(String(salesReturn?.status ?? 'draft'))}
            statusTone={statusTone(String(salesReturn?.status ?? 'draft'))}
            dirty={dirty}
            loading={saving}
            actions={[
              { key: 'cancel', label: 'Cancel', onClick: () => router.back() },
              {
                key: 'save',
                label: saving ? 'Saving...' : 'Save Sales Return',
                type: 'submit',
                variant: 'primary',
                loading: saving,
              },
            ]}
          >
            <div className="space-y-5">
              <ErrorSummary message={error} fieldErrors={fieldErrors} />
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                No stock return movement UI is rendered here. Inventory handling belongs to Inventory UI phases.
              </div>
              <FormSection title="Return Information">
                <SearchableSelect
                  label="Customer"
                  value={customerId}
                  options={contactOptions}
                  onSelect={(value) => updateValue(setCustomerId, value)}
                  onClear={() => updateValue(setCustomerId, '')}
                  required
                  placeholder="Select customer"
                  error={fieldErrors.customer_id}
                />
                <DateInput
                  label="Return Date"
                  value={returnDate}
                  onChange={(value) => updateValue(setReturnDate, value)}
                  required
                  error={fieldErrors.return_date}
                />
                <TextInput
                  label="Reason"
                  value={reason}
                  onChange={(value) => updateValue(setReason, value)}
                  error={fieldErrors.reason}
                />
              </FormSection>

              <LineItemsTable
                title="Return Lines"
                rows={lines}
                columns={lineColumns}
                onAdd={() => {
                  setLines((current) => [...current, blankLine()]);
                  setDirty(true);
                }}
                onDuplicate={(index) => {
                  setLines((current) => [
                    ...current.slice(0, index + 1),
                    { ...(current[index] ?? blankLine()) },
                    ...current.slice(index + 1),
                  ]);
                  setDirty(true);
                }}
                onRemove={(index) => {
                  setLines((current) =>
                    current.length <= 1 ? current : current.filter((_, i) => i !== index),
                  );
                  setDirty(true);
                }}
              />

              <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                <TextareaInput
                  label="Notes"
                  value={notes}
                  onChange={(value) => updateValue(setNotes, value)}
                  error={fieldErrors.notes}
                />
                <SummaryPanel
                  title="Return Summary"
                  rows={[{ key: 'total', label: 'Return Total', value: total, emphasized: true }]}
                />
              </div>

              <div className="flex justify-end">
                <FormActionBar
                  loading={saving}
                  actions={[
                    {
                      key: 'save',
                      label: saving ? 'Saving...' : 'Save Sales Return',
                      type: 'submit',
                      variant: 'primary',
                      loading: saving,
                    },
                  ]}
                />
              </div>
            </div>
          </FormWorkspace>
        </form>
      </SalesPageGate>
    </AppShell>
  );
}

function initialLines(lines?: SalesLineItem[]): DraftLine[] {
  const mapped = (lines ?? []).map((line) => {
    const quantity = Number(line.quantity ?? 1);
    const returned = Number(line.returned_quantity ?? 0);
    const remaining = Math.max(0, quantity - returned);
    const unitPrice = Number(line.unit_price ?? 0);
    return {
      sales_invoice_line_id: line.proforma_invoice_line_id ? null : line.id ?? line.sales_order_line_id ?? null,
      delivery_order_line_id: line.delivery_order_line_id ?? null,
      description: line.description ?? '',
      quantity: String(remaining || quantity || 1),
      max_quantity: remaining || quantity || null,
      unit_price: String(unitPrice),
      discount_amount: String(line.discount_amount ?? 0),
      tax_amount: String(line.tax_amount ?? 0),
      line_total: String(line.line_total ?? quantity * unitPrice),
    };
  });
  return mapped.length ? mapped : [blankLine()];
}

function blankLine(): DraftLine {
  return {
    description: '',
    quantity: '1',
    max_quantity: null,
    unit_price: '0',
    discount_amount: '0',
    tax_amount: '0',
    line_total: '0',
  };
}

function validateReturn(customerId: string, lines: DraftLine[]): string | null {
  if (!customerId) return 'Customer is required.';
  for (const [index, line] of lines.entries()) {
    if (!line.description || Number(line.quantity) <= 0) {
      return `Line ${index + 1}: description and positive quantity are required.`;
    }
    if (line.max_quantity !== null && Number(line.quantity) > line.max_quantity) {
      return `Line ${index + 1}: return quantity exceeds source quantity.`;
    }
  }
  return null;
}

function statusTone(status: string): 'default' | 'success' | 'warning' | 'danger' | 'muted' {
  if (['approved', 'posted', 'closed'].includes(status)) return 'success';
  if (['cancelled', 'void', 'rejected'].includes(status)) return 'danger';
  if (['draft', 'pending'].includes(status)) return 'warning';
  return 'default';
}
