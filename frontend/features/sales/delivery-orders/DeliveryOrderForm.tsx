'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AddressBlock,
  DateInput,
  ErrorSummary,
  FormActionBar,
  FormSection,
  FormWorkspace,
  LineItemsTable,
  NumberInput,
  SearchableSelect,
  SelectInput,
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
  const [customerId, setCustomerId] = useState(
    String(deliveryOrder?.customer_id ?? sourceOrder?.customer_id ?? ''),
  );
  const [deliveryDate, setDeliveryDate] = useState(
    String(deliveryOrder?.delivery_date ?? today).slice(0, 10),
  );
  const [shippingAddress, setShippingAddress] = useState(
    String(deliveryOrder?.shipping_address ?? sourceOrder?.shipping_address ?? ''),
  );
  const [notes, setNotes] = useState(String(deliveryOrder?.notes ?? ''));
  const [lines, setLines] = useState<DraftLine[]>(() =>
    initialLines(deliveryOrder?.lines ?? sourceOrder?.lines),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const [contactRes, productRes, unitRes, warehouseRes, departmentRes, projectRes] =
          await Promise.all([
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
        setDepartments(toArray<Department>(departmentRes.data));
        setProjects(toArray<Project>(projectRes.data));
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
  const productOptions = useMemo<FormOption[]>(
    () =>
      products.map((product) => ({
        value: String(product.id),
        label: `${String(product.product_code ?? product.id)} - ${String(product.product_name ?? 'Product')}`,
      })),
    [products],
  );
  const unitOptions = useMemo<FormOption[]>(
    () => units.map((unit) => ({ value: String(unit.id), label: String(unit.code ?? unit.name ?? unit.id) })),
    [units],
  );
  const warehouseOptions = useMemo<FormOption[]>(
    () =>
      warehouses.map((warehouse) => ({
        value: String(warehouse.id),
        label: `${String(warehouse.code ?? warehouse.id)} - ${String(warehouse.name ?? 'Warehouse')}`,
      })),
    [warehouses],
  );
  const departmentOptions = useMemo<FormOption[]>(
    () => departments.map((department) => ({ value: String(department.id), label: `${department.code} - ${department.name}` })),
    [departments],
  );
  const projectOptions = useMemo<FormOption[]>(
    () => projects.map((project) => ({ value: String(project.id), label: `${project.code} - ${project.name}` })),
    [projects],
  );

  const permission = mode === 'edit' ? 'sales.delivery_orders.edit' : 'sales.delivery_orders.create';
  const title =
    mode === 'edit'
      ? `Edit ${deliveryOrder?.delivery_number ?? 'Delivery Order'}`
      : mode === 'from-order'
        ? 'Create Delivery Order from Sales Order'
        : 'New Delivery Order';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateDelivery(customerId, lines);
    if (validation) {
      setError(validation);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setFieldErrors({});
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
      const response =
        mode === 'edit'
          ? await updateDeliveryOrder(deliveryOrder?.id ?? '', payload)
          : mode === 'from-order' && sourceOrder
            ? await createDeliveryOrderFromSalesOrder(sourceOrder.id, payload)
            : await createDeliveryOrder(payload);
      router.push(`/sales/delivery-orders/${response.data.id}`);
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
      current.map((line, i) => (i === index ? { ...line, [key]: value } : line)),
    );
    setDirty(true);
  }

  function selectProduct(index: number, value: string) {
    const product = products.find((item) => String(item.id) === value);
    setLines((current) =>
      current.map((line, i) =>
        i === index
          ? {
              ...line,
              product_id: value,
              product_code: String(product?.product_code ?? line.product_code ?? ''),
              description: line.description || String(product?.product_name ?? ''),
              unit_id: line.unit_id || String(product?.unit_id ?? ''),
            }
          : line,
      ),
    );
    setDirty(true);
  }

  const lineColumns: LineItemsColumn<DraftLine>[] = [
    {
      key: 'product',
      label: 'Product',
      widthClassName: 'min-w-60',
      render: (line, index) => (
        <SearchableSelect
          value={line.product_id}
          options={productOptions}
          onSelect={(value) => selectProduct(index, value)}
          onClear={() => selectProduct(index, '')}
          placeholder="Select product"
          error={fieldErrors[`lines.${index}.product_id`]}
        />
      ),
    },
    {
      key: 'sku',
      label: 'SKU',
      widthClassName: 'min-w-32',
      render: (line) => <TextInput value={line.product_code} onChange={() => undefined} readOnly />,
    },
    {
      key: 'description',
      label: 'Description',
      widthClassName: 'min-w-64',
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
      key: 'remaining',
      label: 'Remaining',
      align: 'right',
      widthClassName: 'min-w-24',
      render: (line) => <span className="text-slate-600">{line.max_quantity ?? '-'}</span>,
    },
    {
      key: 'unit',
      label: 'Unit',
      widthClassName: 'min-w-32',
      render: (line, index) => (
        <SelectInput
          value={line.unit_id}
          options={unitOptions}
          placeholder="-"
          onChange={(value) => updateLine(index, 'unit_id', value)}
        />
      ),
    },
    {
      key: 'warehouse',
      label: 'Warehouse',
      widthClassName: 'min-w-44',
      render: (line, index) => (
        <SelectInput
          value={line.warehouse_id}
          options={warehouseOptions}
          placeholder="-"
          onChange={(value) => updateLine(index, 'warehouse_id', value)}
        />
      ),
    },
    {
      key: 'dimension',
      label: 'Department / Project',
      widthClassName: 'min-w-56',
      render: (line, index) => (
        <div className="space-y-2">
          <SelectInput
            value={line.department_id}
            options={departmentOptions}
            placeholder="Department"
            onChange={(value) => updateLine(index, 'department_id', value)}
          />
          <SelectInput
            value={line.project_id}
            options={projectOptions}
            placeholder="Project"
            onChange={(value) => updateLine(index, 'project_id', value)}
          />
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <AppShell>
        <LoadingState title="Loading delivery form data" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SalesPageGate permission={permission}>
        <PageHeader
          title={title}
          description="Create direct or source-linked delivery documents with basic remaining quantity checks."
        />
        <form onSubmit={submit} className="mt-6">
          <FormWorkspace
            title={deliveryOrder?.delivery_number ?? title}
            subtitle="Inventory stock movement UI remains in the inventory module; this form stores the delivery document."
            status={formatAccountingStatus(String(deliveryOrder?.status ?? 'draft'))}
            statusTone={statusTone(String(deliveryOrder?.status ?? 'draft'))}
            dirty={dirty}
            loading={saving}
            actions={[
              { key: 'cancel', label: 'Cancel', onClick: () => router.back() },
              {
                key: 'save',
                label: saving ? 'Saving...' : 'Save Delivery Order',
                type: 'submit',
                variant: 'primary',
                loading: saving,
              },
            ]}
          >
            <div className="space-y-5">
              <ErrorSummary message={error} fieldErrors={fieldErrors} />
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                This UI creates the delivery document only. Inventory stock movement UI remains out of this form.
              </div>

              <FormSection title="Delivery Information">
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
                  label="Delivery Date"
                  value={deliveryDate}
                  onChange={(value) => updateValue(setDeliveryDate, value)}
                  required
                  error={fieldErrors.delivery_date}
                />
                <TextInput
                  label="Source Sales Order"
                  value={sourceOrder?.order_number ?? String(deliveryOrder?.source_number ?? '')}
                  onChange={() => undefined}
                  readOnly
                  helperText="Filled when this delivery is created from Sales Order."
                />
              </FormSection>

              <FormSection title="Shipping Address" columns={1}>
                <AddressBlock
                  label="Shipping Address"
                  value={shippingAddress}
                  onChange={(value) => updateValue(setShippingAddress, value)}
                  error={fieldErrors.shipping_address}
                />
              </FormSection>

              <LineItemsTable
                title="Delivery Lines"
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

              <TextareaInput
                label="Notes"
                value={notes}
                onChange={(value) => updateValue(setNotes, value)}
                error={fieldErrors.notes}
              />

              <div className="flex justify-end">
                <FormActionBar
                  loading={saving}
                  actions={[
                    {
                      key: 'save',
                      label: saving ? 'Saving...' : 'Save Delivery Order',
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
  return {
    product_id: '',
    product_code: '',
    description: '',
    quantity: '1',
    max_quantity: null,
    unit_id: '',
    warehouse_id: '',
    department_id: '',
    project_id: '',
  };
}

function validateDelivery(customerId: string, lines: DraftLine[]): string | null {
  if (!customerId) return 'Customer is required.';
  for (const [index, line] of lines.entries()) {
    if (!line.description.trim() || Number(line.quantity) <= 0) {
      return `Line ${index + 1}: description and positive quantity are required.`;
    }
    if (line.max_quantity !== null && Number(line.quantity) > line.max_quantity) {
      return `Line ${index + 1}: delivery quantity exceeds remaining quantity.`;
    }
  }
  return null;
}

function statusTone(status: string): 'default' | 'success' | 'warning' | 'danger' | 'muted' {
  if (['delivered', 'ready', 'approved', 'posted'].includes(status)) return 'success';
  if (['cancelled', 'void', 'rejected'].includes(status)) return 'danger';
  if (['draft', 'partial', 'partially_delivered'].includes(status)) return 'warning';
  return 'default';
}

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
