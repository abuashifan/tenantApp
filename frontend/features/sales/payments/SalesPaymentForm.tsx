'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  DateInput,
  ErrorSummary,
  FormActionBar,
  FormSection,
  FormWorkspace,
  MoneyInput,
  NumberInput,
  SearchableSelect,
  SummaryPanel,
  TextareaInput,
  extractFieldErrors,
  type FieldErrorMap,
  type FormOption,
} from '@/components/form';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { listChartOfAccounts } from '@/features/accounting/chart-of-accounts/api';
import { listMasterData } from '@/features/accounting/master-data/api';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { ApiRequestError, getApiErrorMessage } from '@/lib/api';
import type { ChartOfAccount, MasterDataRecord } from '@/types/accounting';

type SalesPaymentFormProps = {
  type: 'deposit' | 'receipt';
  sourceInvoiceId?: string | number | null;
  onSubmit: (payload: Record<string, unknown>) => Promise<{ id: number }>;
};

export function SalesPaymentForm({ type, sourceInvoiceId, onSubmit }: SalesPaymentFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [contacts, setContacts] = useState<MasterDataRecord[]>([]);
  const [cashAccounts, setCashAccounts] = useState<ChartOfAccount[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [documentDate, setDocumentDate] = useState(today);
  const [cashAccountId, setCashAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceId, setSourceId] = useState(String(sourceInvoiceId ?? ''));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const [contactRes, cashRes] = await Promise.all([
          listMasterData('/master-data/contacts'),
          listChartOfAccounts({ is_cash_bank: '1', is_active: '1' }),
        ]);
        setContacts(contactRes.data ?? []);
        setCashAccounts(cashRes.data ?? []);
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
  const cashAccountOptions = useMemo<FormOption[]>(
    () =>
      cashAccounts.map((account) => ({
        value: String(account.id),
        label: `${account.account_code} - ${account.account_name}`,
      })),
    [cashAccounts],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId || !cashAccountId || Number(amount) <= 0) {
      setError('Customer, cash/bank account, and positive amount are required.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setFieldErrors({});
      const payload: Record<string, unknown> = {
        customer_id: Number(customerId),
        cash_bank_account_id: Number(cashAccountId),
        amount: Number(amount),
        notes: notes || null,
      };
      if (type === 'deposit') {
        payload.deposit_date = documentDate;
        payload.sales_order_id = sourceId ? Number(sourceId) : null;
      } else {
        payload.receipt_date = documentDate;
        payload.sales_invoice_id = sourceId ? Number(sourceId) : null;
      }
      const response = await onSubmit(payload);
      router.push(type === 'deposit' ? `/sales/deposits/${response.id}` : `/sales/receipts/${response.id}`);
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

  if (loading) {
    return (
      <AppShell>
        <LoadingState title="Loading payment form data" />
      </AppShell>
    );
  }

  const isDeposit = type === 'deposit';
  const title = isDeposit ? 'New Customer Deposit' : 'New Sales Receipt';

  return (
    <AppShell>
      <SalesPageGate permission={isDeposit ? 'sales.deposits.create' : 'sales.receipts.create'}>
        <PageHeader
          title={title}
          description={
            isDeposit
              ? 'Create customer down payment/deposit. This is not a general Cash Bank UI.'
              : 'Create customer receipt for posted sales invoice. Advanced multi-invoice allocation is out of scope.'
          }
        />
        <form onSubmit={submit} className="mt-6">
          <FormWorkspace
            title={title}
            subtitle="Payment impact is handled by the backend and accounting integration."
            status="Draft"
            statusTone="warning"
            dirty={dirty}
            loading={saving}
            actions={[
              { key: 'cancel', label: 'Cancel', onClick: () => router.back() },
              {
                key: 'save',
                label: saving ? 'Saving...' : 'Save',
                type: 'submit',
                variant: 'primary',
                loading: saving,
              },
            ]}
          >
            <div className="space-y-5">
              <ErrorSummary message={error} fieldErrors={fieldErrors} />
              <FormSection title={isDeposit ? 'Deposit Information' : 'Receipt Information'}>
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
                  label={isDeposit ? 'Deposit Date' : 'Receipt Date'}
                  value={documentDate}
                  onChange={(value) => updateValue(setDocumentDate, value)}
                  required
                  error={fieldErrors[isDeposit ? 'deposit_date' : 'receipt_date']}
                />
                <SearchableSelect
                  label="Cash/Bank Account"
                  value={cashAccountId}
                  options={cashAccountOptions}
                  onSelect={(value) => updateValue(setCashAccountId, value)}
                  onClear={() => updateValue(setCashAccountId, '')}
                  required
                  placeholder="Select account"
                  error={fieldErrors.cash_bank_account_id}
                />
                <MoneyInput
                  label="Amount"
                  value={amount}
                  min="0"
                  onChange={(value) => updateValue(setAmount, value)}
                  required
                  error={fieldErrors.amount}
                />
                <NumberInput
                  label={isDeposit ? 'Sales Order ID' : 'Sales Invoice ID'}
                  value={sourceId}
                  min="1"
                  step="1"
                  onChange={(value) => updateValue(setSourceId, value)}
                  error={fieldErrors[isDeposit ? 'sales_order_id' : 'sales_invoice_id']}
                />
              </FormSection>

              <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                <TextareaInput
                  label="Notes"
                  value={notes}
                  onChange={(value) => updateValue(setNotes, value)}
                  error={fieldErrors.notes}
                />
                <SummaryPanel
                  title={isDeposit ? 'Deposit Summary' : 'Receipt Summary'}
                  rows={[{ key: 'amount', label: 'Amount', value: Number(amount || 0), emphasized: true }]}
                />
              </div>

              <div className="flex justify-end">
                <FormActionBar
                  loading={saving}
                  actions={[
                    {
                      key: 'save',
                      label: saving ? 'Saving...' : 'Save',
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
