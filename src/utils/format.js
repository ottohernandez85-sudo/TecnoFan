export function formatMoney(amount, currency = 'GTQ') {
  const n = Number(amount);
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}
