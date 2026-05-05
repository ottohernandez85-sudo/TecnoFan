/** Hex CSS válido desde atributos de producto (admin / seed). */
export function resolveProductColorHex(attrs) {
  if (!attrs || typeof attrs !== 'object') return null;
  const raw = attrs.colorHex ?? attrs.hexColor ?? attrs.color;
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (/^#[0-9A-Fa-f]{3,8}$/.test(s)) return s;
  return null;
}

export function favoriteProductSnapshot(product) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    imageUrl: product.imageUrl ?? null,
  };
}
