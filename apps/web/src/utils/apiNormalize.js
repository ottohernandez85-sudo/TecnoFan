/** Respuesta de lista del API: nunca devolver no-array (HTML/error como objeto). */
export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

/** Ajusta settings del sitio para que menuItems / heroSlides no rompan el UI. */
export function sanitizeSiteSettings(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const o = { ...data };
  if (o.menuItems != null && !Array.isArray(o.menuItems)) delete o.menuItems;
  if (o.heroSlides != null && !Array.isArray(o.heroSlides)) delete o.heroSlides;
  return o;
}
