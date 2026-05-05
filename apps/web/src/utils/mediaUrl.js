/**
 * Resuelve URLs relativas del API (/uploads/...) para usar en <img src>.
 */
export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const base = import.meta.env.VITE_API_URL || '/api';
  const origin =
    typeof window !== 'undefined' ? window.location.origin : '';
  if (base.startsWith('http')) {
    const root = base.replace(/\/api\/?$/, '');
    return `${root}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path;
}
