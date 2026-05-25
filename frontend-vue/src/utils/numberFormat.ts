export function formatIntegerNumber(value: number | string | null | undefined): string {
  const numberValue = typeof value === 'string' ? parseFormattedInteger(value) : Number(value ?? 0)
  const safe = Number.isFinite(numberValue) ? numberValue : 0

  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safe)
}

export function parseFormattedInteger(value: string): number {
  const normalized = value.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.-]/g, '')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : 0
}
