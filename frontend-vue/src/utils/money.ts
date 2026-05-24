export function toMoney(value: number, locale = 'id-ID') {
  const safe = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(safe)
}

