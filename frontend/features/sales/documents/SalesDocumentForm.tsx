'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  AddressBlock,
  CheckboxInput,
  DateInput,
  ErrorSummary,
  FormActionBar,
  FormSection,
  FormWorkspace,
  LineItemsTable,
  MoneyInput,
  NumberInput,
  SearchableSelect,
  SelectInput,
  SummaryPanel,
  TextInput,
  TextareaInput,
  extractFieldErrors,
  type FieldErrorMap,
  type FormOption,
  type LineItemsColumn,
} from '@/components/form';
import { LoadingState } from '@/components/ui/LoadingState';
import { listChartOfAccounts } from '@/features/accounting/chart-of-accounts/api';
import { listMasterData } from '@/features/accounting/master-data/api';
import { ApiRequestError, getApiErrorMessage } from '@/lib/api';
import { formatAccountingStatus, formatCurrency } from '@/lib/formatters';
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

const discountOptions: FormOption[] = [
  { value: 'percent', label: 'Percent' },
  { value: 'fixed_amount', label: 'Fixed Amount' },
];

const currencyOptions: FormOption[] = [{ value: 'IDR', label: 'IDR' }];

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
  const [customerId, setCustomerId] = useState(
    String(initial?.customer_id ?? sourceQuotation?.customer_id ?? ''),
  );
  const [documentDate, setDocumentDate] = useState(
    initialDate(initial, sourceQuotation, type, today),
  );
  const [validUntil, setValidUntil] = useState(
    String((initial as SalesQuotation | undefined)?.valid_until ?? ''),
  );
  const [dueDate, setDueDate] = useState(String(initial?.due_date ?? ''));
  const [customerReference, setCustomerReference] = useState(
    String(initial?.customer_po_number ?? ''),
  );
  const [contractNumber, setContractNumber] = useState(String(initial?.contract_number ?? ''));
  const [salespersonId, setSalespersonId] = useState(String(initial?.salesperson_id ?? ''));
  const [defaultWarehouseId, setDefaultWarehouseId] = useState('');
  const [currencyCode, setCurrencyCode] = useState(String(initial?.currency_code ?? 'IDR'));
  const [exchangeRate, setExchangeRate] = useState(String(initial?.exchange_rate ?? '1'));
  const [customerAddress, setCustomerAddress] = useState(
    String(initial?.customer_address ?? sourceQuotation?.customer_address ?? ''),
  );
  const [shippingAddress, setShippingAddress] = useState(String(initial?.shipping_address ?? ''));
  const [notes, setNotes] = useState(String(initial?.notes ?? sourceQuotation?.notes ?? ''));
  const [internalNotes, setInternalNotes] = useState(String(initial?.internal_notes ?? ''));
  const [headerDiscountType, setHeaderDiscountType] = useState(
    String(initial?.header_discount_type ?? sourceQuotation?.header_discount_type ?? ''),
  );
  const [headerDiscountValue, setHeaderDiscountValue] = useState(
    String(initial?.header_discount_value ?? sourceQuotation?.header_discount_value ?? ''),
  );
  const [isTaxable, setIsTaxable] = useState(
    Boolean(initial?.is_taxable ?? sourceQuotation?.is_taxable ?? false),
  );
  const [taxIncluded, setTaxIncluded] = useState(
    Boolean(initial?.tax_included ?? sourceQuotation?.tax_included ?? false),
  );
  const [hasDownPayment, setHasDownPayment] = useState(
    Boolean((initial as SalesOrder | undefined)?.has_down_payment ?? false),
  );
  const [downPaymentAmount, setDownPaymentAmount] = useState('');
  const [downPaymentDate, setDownPaymentDate] = useState(today);
  const [downPaymentAccountId, setDownPaymentAccountId] = useState('');
  const [downPaymentNotes, setDownPaymentNotes] = useState('');
  const [appliedDownPaymentAmount, setAppliedDownPaymentAmount] = useState(
    String(initial?.applied_down_payment_amount ?? ''),
  );
  const [lines, setLines] = useState<DraftLine[]>(() => initialLines(initial, sourceQuotation));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [dirty, setDirty] = useState(false);

  async function loadSelectors() {
    try {
      setLoading(true);
      setError(null);
      const [contactRes, productRes, unitRes, warehouseRes, departmentRes, projectRes, cashRes] =
        await Promise.all([
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
      setDepartments(projectSafeArray<Department>(departmentRes.data));
      setProjects(projectSafeArray<Project>(projectRes.data));
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

  const contactOptions = useMemo<FormOption[]>(
    () =>
      contacts.map((contact) => ({
        value: String(contact.id),
        label: `${String(contact.contact_code ?? contact.id)} - ${String(contact.name ?? 'Unnamed')}`,
        description: contact.email ? String(contact.email) : undefined,
      })),
    [contacts],
  );
  const productOptions = useMemo<FormOption[]>(
    () =>
      products.map((product) => ({
        value: String(product.id),
        label: `${String(product.product_code ?? product.id)} - ${String(product.product_name ?? 'Product')}`,
        description: product.description ? String(product.description) : undefined,
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
  const cashAccountOptions = useMemo<FormOption[]>(
    () =>
      cashAccounts.map((account) => ({
        value: String(account.id),
        label: `${account.account_code} - ${account.account_name}`,
      })),
    [cashAccounts],
  );

  const calculatedLines = useMemo(() => lines.map(draftToLine).map(calculateSalesLine), [lines]);
  const totals = useMemo(
    () => calculateSalesTotals(calculatedLines, headerDiscountType, headerDiscountValue),
    [calculatedLines, headerDiscountType, headerDiscountValue],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateForm(
      customerId,
      lines,
      type,
      hasDownPayment,
      downPaymentAmount,
      downPaymentAccountId,
    );
    if (validation) {
      setError(validation);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setFieldErrors({});
      const result = await onSubmit(buildPayload());
      const routes = {
        quotation: '/sales/quotations',
        order: '/sales/orders',
        proforma: '/sales/proformas',
        invoice: '/sales/invoices',
      };
      router.push(`${routes[type]}/${result.id}`);
    } catch (eventError) {
      setError(getApiErrorMessage(eventError));
      setFieldErrors(extractFieldErrors(eventError));
      if (!(eventError instanceof ApiRequestError)) {
        setFieldErrors({});
      }
    } finally {
      setSaving(false);
    }
  }

  function buildPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      customer_id: Number(customerId),
      customer_address: customerAddress || null,
      currency_code: currencyCode || 'IDR',
      exchange_rate: Number(exchangeRate || 1),
      is_taxable: isTaxable,
      tax_included: taxIncluded,
      header_discount_type: headerDiscountType || null,
      header_discount_value: Number(headerDiscountValue || 0),
      notes: notes || null,
      internal_notes: internalNotes || null,
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
      payload.shipping_address = shippingAddress || null;
      payload.customer_po_number = customerReference || null;
      payload.contract_number = contractNumber || null;
      payload.salesperson_id = salespersonId ? Number(salespersonId) : null;
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

    return payload;
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

  function addLine() {
    setLines((current) => [...current, blankLine(defaultWarehouseId)]);
    setDirty(true);
  }

  function duplicateLine(index: number) {
    setLines((current) => {
      const target = current[index] ?? blankLine(defaultWarehouseId);
      return [...current.slice(0, index + 1), { ...target }, ...current.slice(index + 1)];
    });
    setDirty(true);
  }

  function removeLine(index: number) {
    setLines((current) => (current.length <= 1 ? current : current.filter((_, i) => i !== index)));
    setDirty(true);
  }

  const lineColumns = useMemo<LineItemsColumn<DraftLine>[]>(
    () => [
      {
        key: 'product',
        label: 'Product',
        widthClassName: 'min-w-60',
        render: (line, index) => (
          <SearchableSelect
            value={line.product_id}
            options={productOptions}
            onSelect={(value) => {
              const product = products.find((item) => String(item.id) === value);
              setLines((current) =>
                current.map((currentLine, currentIndex) =>
                  currentIndex === index
                    ? {
                        ...currentLine,
                        product_id: value,
                        product_code: String(product?.product_code ?? currentLine.product_code ?? ''),
                        description: currentLine.description || String(product?.product_name ?? ''),
                        unit_id: currentLine.unit_id || String(product?.unit_id ?? ''),
                      }
                    : currentLine,
                ),
              );
              setDirty(true);
            }}
            onClear={() => {
              updateLine(index, 'product_id', '');
              updateLine(index, 'product_code', '');
            }}
            placeholder="Select product"
            error={getFieldError(fieldErrors, `lines.${index}.product_id`)}
          />
        ),
      },
      {
        key: 'sku',
        label: 'SKU',
        widthClassName: 'min-w-32',
        render: (line) => (
          <TextInput value={line.product_code} onChange={() => undefined} readOnly />
        ),
      },
      {
        key: 'description',
        label: 'Description',
        widthClassName: 'min-w-64',
        render: (line, index) => (
          <TextInput
            value={line.description}
            onChange={(value) => updateLine(index, 'description', value)}
            error={getFieldError(fieldErrors, `lines.${index}.description`)}
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
            error={getFieldError(fieldErrors, `lines.${index}.quantity`)}
          />
        ),
      },
      {
        key: 'unit',
        label: 'Unit',
        widthClassName: 'min-w-32',
        render: (line, index) => (
          <SelectInput
            value={line.unit_id}
            options={unitOptions}
            onChange={(value) => updateLine(index, 'unit_id', value)}
            placeholder="-"
          />
        ),
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
            currencyCode={currencyCode}
            onChange={(value) => updateLine(index, 'unit_price', value)}
            error={getFieldError(fieldErrors, `lines.${index}.unit_price`)}
          />
        ),
      },
      {
        key: 'discount',
        label: 'Discount',
        widthClassName: 'min-w-52',
        render: (line, index) => (
          <div className="grid grid-cols-[6rem_1fr] gap-2">
            <SelectInput
              value={line.discount_type}
              options={discountOptions}
              placeholder="-"
              onChange={(value) => updateLine(index, 'discount_type', value)}
            />
            <NumberInput
              value={line.discount_value}
              min="0"
              onChange={(value) => updateLine(index, 'discount_value', value)}
            />
          </div>
        ),
      },
      {
        key: 'tax',
        label: 'Tax %',
        align: 'right',
        widthClassName: 'min-w-28',
        render: (line, index) => (
          <NumberInput
            value={line.tax_rate}
            min="0"
            onChange={(value) => updateLine(index, 'tax_rate', value)}
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
      {
        key: 'total',
        label: 'Line Total',
        align: 'right',
        widthClassName: 'min-w-36',
        render: (line) => (
          <span className="font-semibold text-slate-900">
            {formatCurrency(Number(calculateSalesLine(draftToLine(line)).line_total ?? 0), currencyCode)}
          </span>
        ),
      },
    ],
    [
      currencyCode,
      departmentOptions,
      fieldErrors,
      productOptions,
      products,
      projectOptions,
      unitOptions,
      warehouseOptions,
    ],
  );

  if (loading) return <LoadingState title="Loading sales form data" />;

  const documentNumber = documentNumberValue(initial, type);
  const status = String(initial?.status ?? 'draft');
  const isOrder = type === 'order';

  return (
    <form onSubmit={submit}>
      <FormWorkspace
        title={workspaceTitle(type, documentNumber)}
        subtitle="Backend recalculates all document totals on save. Frontend totals are a preview."
        status={formatAccountingStatus(status)}
        statusTone={statusTone(status)}
        dirty={dirty}
        loading={saving}
        actions={[
          {
            key: 'cancel',
            label: 'Cancel',
            variant: 'secondary',
            onClick: () => router.back(),
          },
          {
            key: 'save',
            label: saving ? 'Saving...' : submitLabel,
            type: 'submit',
            variant: 'primary',
            loading: saving,
          },
        ]}
      >
        <div className="space-y-5">
          <ErrorSummary message={error} fieldErrors={fieldErrors} />

          <FormSection title={isOrder ? 'Order Information' : 'Document Information'}>
            <TextInput
              label={isOrder ? 'Sales Order No.' : 'Document No.'}
              value={documentNumber}
              onChange={() => undefined}
              readOnly
              helperText={documentNumber ? undefined : 'Generated by backend when saved.'}
            />
            <SearchableSelect
              label="Customer"
              value={customerId}
              options={contactOptions}
              onSelect={(value) => updateValue(setCustomerId, value)}
              onClear={() => updateValue(setCustomerId, '')}
              required
              placeholder="Select customer"
              error={getFieldError(fieldErrors, 'customer_id')}
            />
            <DateInput
              label={documentDateLabel(type)}
              value={documentDate}
              onChange={(value) => updateValue(setDocumentDate, value)}
              required
              error={getFieldError(fieldErrors, isOrder ? 'order_date' : `${type}_date`)}
            />
            {isOrder ? (
              <>
                <TextInput
                  label="Customer Reference"
                  value={customerReference}
                  onChange={(value) => updateValue(setCustomerReference, value)}
                  error={getFieldError(fieldErrors, 'customer_po_number')}
                />
                <TextInput
                  label="Source Quotation"
                  value={sourceQuotation?.quotation_number ?? String((initial as SalesOrder | undefined)?.quotation_number ?? '')}
                  onChange={() => undefined}
                  readOnly
                  helperText="Filled when this order is converted from quotation."
                />
                <TextInput
                  label="Status"
                  value={formatAccountingStatus(status)}
                  onChange={() => undefined}
                  readOnly
                />
                <DateInput
                  label="Expected Delivery Date"
                  value=""
                  onChange={() => undefined}
                  disabled
                  helperText="TODO: waiting for backend field support."
                />
                <TextInput
                  label="Payment Term"
                  value=""
                  onChange={() => undefined}
                  disabled
                  helperText="TODO: waiting for backend field support."
                />
                <NumberInput
                  label="Sales Person"
                  value={salespersonId}
                  min="1"
                  step="1"
                  onChange={(value) => updateValue(setSalespersonId, value)}
                  helperText="Backend currently stores salesperson_id."
                  error={getFieldError(fieldErrors, 'salesperson_id')}
                />
                <SelectInput
                  label="Default Warehouse"
                  value={defaultWarehouseId}
                  options={warehouseOptions}
                  onChange={(value) => updateValue(setDefaultWarehouseId, value)}
                  placeholder="Select warehouse"
                  helperText="Applied to new line items."
                />
              </>
            ) : null}
            {type === 'quotation' || type === 'proforma' ? (
              <DateInput
                label="Valid Until"
                value={validUntil}
                onChange={(value) => updateValue(setValidUntil, value)}
                error={getFieldError(fieldErrors, 'valid_until')}
              />
            ) : null}
            {type === 'invoice' ? (
              <DateInput
                label="Due Date"
                value={dueDate}
                onChange={(value) => updateValue(setDueDate, value)}
                error={getFieldError(fieldErrors, 'due_date')}
              />
            ) : null}
          </FormSection>

          <FormSection title="Pricing & Tax" columns={4}>
            <SelectInput
              label="Currency"
              value={currencyCode}
              options={currencyOptions}
              onChange={(value) => updateValue(setCurrencyCode, value)}
              error={getFieldError(fieldErrors, 'currency_code')}
            />
            <NumberInput
              label="Exchange Rate"
              value={exchangeRate}
              min="0"
              onChange={(value) => updateValue(setExchangeRate, value)}
              error={getFieldError(fieldErrors, 'exchange_rate')}
            />
            <SelectInput
              label="Header Discount Type"
              value={headerDiscountType}
              options={discountOptions}
              placeholder="None"
              onChange={(value) => updateValue(setHeaderDiscountType, value)}
              error={getFieldError(fieldErrors, 'header_discount_type')}
            />
            <NumberInput
              label="Header Discount Value"
              value={headerDiscountValue}
              min="0"
              onChange={(value) => updateValue(setHeaderDiscountValue, value)}
              error={getFieldError(fieldErrors, 'header_discount_value')}
            />
            <CheckboxInput
              label="Taxable"
              checked={isTaxable}
              onChange={(checked) => {
                setIsTaxable(checked);
                setDirty(true);
              }}
            />
            <CheckboxInput
              label="Tax included"
              checked={taxIncluded}
              onChange={(checked) => {
                setTaxIncluded(checked);
                setDirty(true);
              }}
            />
          </FormSection>

          {isOrder ? (
            <FormSection
              title="Address & Notes"
              description="Billing and shipping addresses are stored on the sales order header."
              columns={2}
            >
              <AddressBlock
                label="Billing Address"
                value={customerAddress}
                onChange={(value) => updateValue(setCustomerAddress, value)}
                error={getFieldError(fieldErrors, 'customer_address')}
              />
              <AddressBlock
                label="Shipping Address"
                value={shippingAddress}
                onChange={(value) => updateValue(setShippingAddress, value)}
                copyActionLabel="Copy billing"
                onCopy={() => updateValue(setShippingAddress, customerAddress)}
                error={getFieldError(fieldErrors, 'shipping_address')}
              />
              <TextareaInput
                label="Notes"
                value={notes}
                onChange={(value) => updateValue(setNotes, value)}
                error={getFieldError(fieldErrors, 'notes')}
              />
              <TextareaInput
                label="Terms & Conditions"
                value={contractNumber}
                onChange={(value) => updateValue(setContractNumber, value)}
                helperText="Stored as contract number until a dedicated terms field is added."
                error={getFieldError(fieldErrors, 'contract_number')}
              />
            </FormSection>
          ) : (
            <FormSection title="Address & Notes" columns={2}>
              <AddressBlock
                label="Customer Address"
                value={customerAddress}
                onChange={(value) => updateValue(setCustomerAddress, value)}
                error={getFieldError(fieldErrors, 'customer_address')}
              />
              <TextareaInput
                label="Notes"
                value={notes}
                onChange={(value) => updateValue(setNotes, value)}
                error={getFieldError(fieldErrors, 'notes')}
              />
            </FormSection>
          )}

          {isOrder ? (
            <FormSection
              title="Down Payment"
              description="Down payment is stored as Customer Deposit, not as a Sales Order balance field."
              columns={4}
            >
              <CheckboxInput
                label="Has down payment"
                checked={hasDownPayment}
                onChange={(checked) => {
                  setHasDownPayment(checked);
                  setDirty(true);
                }}
              />
              {hasDownPayment ? (
                <>
                  <DateInput
                    label="Deposit Date"
                    value={downPaymentDate}
                    onChange={(value) => updateValue(setDownPaymentDate, value)}
                    error={getFieldError(fieldErrors, 'down_payment.deposit_date')}
                  />
                  <SelectInput
                    label="Cash/Bank Account"
                    value={downPaymentAccountId}
                    options={cashAccountOptions}
                    onChange={(value) => updateValue(setDownPaymentAccountId, value)}
                    error={getFieldError(fieldErrors, 'down_payment.cash_bank_account_id')}
                  />
                  <MoneyInput
                    label="Amount"
                    value={downPaymentAmount}
                    min="0"
                    currencyCode={currencyCode}
                    onChange={(value) => updateValue(setDownPaymentAmount, value)}
                    error={getFieldError(fieldErrors, 'down_payment.amount')}
                  />
                  <TextInput
                    label="Notes"
                    value={downPaymentNotes}
                    onChange={(value) => updateValue(setDownPaymentNotes, value)}
                    error={getFieldError(fieldErrors, 'down_payment.notes')}
                  />
                </>
              ) : null}
            </FormSection>
          ) : null}

          {type === 'invoice' ? (
            <FormSection
              title="Customer Deposit Application"
              description="Apply available Customer Deposit only. This invoice UI does not create a new down payment."
              columns={2}
            >
              <MoneyInput
                label="Applied Deposit Amount"
                value={appliedDownPaymentAmount}
                min="0"
                currencyCode={currencyCode}
                onChange={(value) => updateValue(setAppliedDownPaymentAmount, value)}
                error={getFieldError(fieldErrors, 'applied_down_payment_amount')}
              />
            </FormSection>
          ) : null}

          <LineItemsTable
            rows={lines}
            columns={lineColumns}
            onAdd={addLine}
            onDuplicate={duplicateLine}
            onRemove={removeLine}
            getRowError={(index) => getFirstLineError(fieldErrors, index)}
          />

          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <TextareaInput
              label="Internal Notes"
              value={internalNotes}
              onChange={(value) => updateValue(setInternalNotes, value)}
              error={getFieldError(fieldErrors, 'internal_notes')}
            />
            <SummaryPanel
              title="Preview Totals"
              currencyCode={currencyCode}
              rows={[
                { key: 'subtotal', label: 'Subtotal', value: totals.subtotal_before_discount },
                { key: 'line_discount', label: 'Line Discount', value: totals.line_discount_total },
                {
                  key: 'header_discount',
                  label: 'Header Discount',
                  value: totals.header_discount_amount,
                },
                { key: 'tax', label: 'Tax', value: totals.tax_total },
                { key: 'grand_total', label: 'Grand Total', value: totals.grand_total ?? 0, emphasized: true },
              ]}
              note="Frontend preview is non-authoritative; backend recalculates on save."
            />
          </div>

          <div className="flex justify-end">
            <FormActionBar
              loading={saving}
              actions={[
                {
                  key: 'save',
                  label: saving ? 'Saving...' : submitLabel,
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
  );
}

function initialDate(
  initial: SalesDocument | undefined | null,
  source: SalesQuotation | undefined | null,
  type: SalesDocumentFormProps['type'],
  fallback: string,
): string {
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

function blankLine(defaultWarehouseId = ''): DraftLine {
  return {
    product_id: '',
    product_code: '',
    description: '',
    quantity: '1',
    unit_id: '',
    unit_price: '0',
    discount_type: '',
    discount_value: '0',
    tax_rate: '0',
    warehouse_id: defaultWarehouseId,
    department_id: '',
    project_id: '',
  };
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

function validateForm(
  customerId: string,
  lines: DraftLine[],
  type: string,
  hasDp: boolean,
  dpAmount: string,
  dpAccountId: string,
): string | null {
  if (!customerId) return 'Customer is required.';
  if (lines.length === 0) return 'At least one line is required.';
  for (const [index, line] of lines.entries()) {
    if (!line.description.trim()) return `Line ${index + 1}: description is required.`;
    if (Number(line.quantity) <= 0) return `Line ${index + 1}: quantity must be greater than zero.`;
    if (Number(line.unit_price) < 0) return `Line ${index + 1}: unit price cannot be negative.`;
  }
  if (type === 'order' && hasDp && (!dpAccountId || Number(dpAmount) <= 0)) {
    return 'Down payment requires cash/bank account and amount.';
  }
  return null;
}

function documentDateLabel(type: SalesDocumentFormProps['type']): string {
  if (type === 'quotation') return 'Quotation Date';
  if (type === 'order') return 'Order Date';
  if (type === 'proforma') return 'Proforma Date';
  return 'Invoice Date';
}

function workspaceTitle(type: SalesDocumentFormProps['type'], documentNumber: string): string {
  const label = {
    quotation: 'Sales Quotation',
    order: 'Sales Order',
    proforma: 'Proforma Invoice',
    invoice: 'Sales Invoice',
  }[type];
  return documentNumber ? `${label} ${documentNumber}` : `New ${label}`;
}

function documentNumberValue(
  initial: SalesDocument | null | undefined,
  type: SalesDocumentFormProps['type'],
): string {
  if (!initial) return '';
  if (type === 'quotation') return String((initial as SalesQuotation).quotation_number ?? '');
  if (type === 'order') return String((initial as SalesOrder).order_number ?? '');
  if (type === 'proforma') return String(initial.proforma_number ?? '');
  return String(initial.invoice_number ?? '');
}

function statusTone(status: string): 'default' | 'success' | 'warning' | 'danger' | 'muted' {
  if (['approved', 'confirmed', 'posted', 'paid', 'delivered'].includes(status)) return 'success';
  if (['cancelled', 'void', 'rejected'].includes(status)) return 'danger';
  if (['draft', 'sent', 'partial', 'partially_paid'].includes(status)) return 'warning';
  return 'default';
}

function getFieldError(errors: FieldErrorMap, key: string): string | string[] | undefined {
  return errors[key];
}

function getFirstLineError(errors: FieldErrorMap, index: number): string | undefined {
  const prefix = `lines.${index}.`;
  const match = Object.entries(errors).find(([key]) => key.startsWith(prefix));
  const value = match?.[1];
  if (!value) return undefined;
  return Array.isArray(value) ? value.join(' ') : value;
}

function projectSafeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
