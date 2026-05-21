type NumericInput = number | string | null | undefined;

export function formatCurrency(value: NumericInput, currency = 'IDR'): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatNumber(value: NumericInput): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDebitCredit(
  debit: NumericInput,
  credit: NumericInput,
): string {
  const debitAmount = Number(debit ?? 0);
  const creditAmount = Number(credit ?? 0);

  if (debitAmount > 0) return `Dr ${formatNumber(debitAmount)}`;
  if (creditAmount > 0) return `Cr ${formatNumber(creditAmount)}`;
  return '-';
}

export function formatAccountingStatus(status: string | null | undefined): string {
  if (!status) return '-';

  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

