const LABELS = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
};

export function orderStatusLabelEs(status) {
  if (!status) return '—';
  return LABELS[status] || status;
}
