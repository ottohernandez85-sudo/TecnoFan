/** Claves en inglés (API / BD); etiquetas para UI. */
export const ORDER_STATUS_LABELS = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
};

export function orderStatusLabel(status) {
  if (!status) return '—';
  return ORDER_STATUS_LABELS[status] || status;
}
