import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchSettings, updateSettings } from '../api/settings.js';

const ThemeContext = createContext(null);

const DEFAULT_MENU = [
  { label: 'Smart Fans', path: '/catalog?category=smart-fans', icon: 'fan' },
  { label: 'Ceiling Fans', path: '/catalog?category=ceiling-fans', icon: 'wind' },
  { label: 'Industrial', path: '/catalog?category=industrial', icon: 'building' },
  { label: 'Accesorios', path: '/catalog?category=accesorios', icon: 'package' },
  { label: 'Soporte', path: '/support', icon: 'headset' },
];

function normalizeMenuItems(items) {
  if (!Array.isArray(items) || !items.length) return DEFAULT_MENU;
  return items.map((item, i) => ({
    ...item,
    icon: item.icon || DEFAULT_MENU[i]?.icon || 'circle',
  }));
}

function applyCssVars(settings) {
  const root = document.documentElement;
  if (!settings) return;
  root.style.setProperty('--color-primary', settings.colorPrimary);
  root.style.setProperty('--color-accent', settings.colorAccent);
  root.style.setProperty('--color-bg', settings.colorBg);
  root.style.setProperty('--color-surface', settings.colorSurface);
  root.style.setProperty('--color-text', settings.colorText);
}

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await fetchSettings();
      if (!s) throw new Error('Respuesta de settings vacía o inválida');
      const menuItems = normalizeMenuItems(s.menuItems);
      const heroSlides = Array.isArray(s.heroSlides)
        ? [...s.heroSlides, null, null, null].slice(0, 3).map((x) => (typeof x === 'string' && x.trim() ? x.trim() : null))
        : [null, null, null];
      const merged = {
        ...s,
        menuItems: Array.isArray(menuItems) ? menuItems : DEFAULT_MENU,
        heroSlides,
      };
      setSettings(merged);
      applyCssVars(merged);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
      const fallback = {
        brandName: 'Tecnofan',
        logoUrl: null,
        footerLogoUrl: null,
        colorPrimary: '#0F2A47',
        colorAccent: '#1E5BA8',
        colorBg: '#F2F4F7',
        colorSurface: '#FFFFFF',
        colorText: '#0F2A47',
        menuItems: DEFAULT_MENU,
        productTemplate: 'standard',
        companyLegalName: 'Tecnofan Guatemala S.A.',
        companyAddress: 'Zona 10, Ciudad de Guatemala',
        companyPhone: '+502 3000-0000',
        companyEmail: 'ventas@tecnofan.demo',
        companyTaxId: 'NIT 1234567-8',
        heroBadge: 'Nueva colección 2024',
        heroTitle: 'Equilibrio ideal: entre aire y diseño',
        heroSubtitle: 'Tonos claros, velocidades suaves y silencio de ingeniería para tu espacio.',
        heroSlides: [null, null, null],
      };
      setSettings(fallback);
      applyCssVars(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patchSettings = useCallback(
    async (patch) => {
      const updated = await updateSettings(patch);
      if (!updated) throw new Error('Respuesta de settings vacía o inválida');
      const menuItems = normalizeMenuItems(updated.menuItems);
      const heroSlides = Array.isArray(updated.heroSlides)
        ? [...updated.heroSlides, null, null, null]
            .slice(0, 3)
            .map((x) => (typeof x === 'string' && x.trim() ? x.trim() : null))
        : [null, null, null];
      const merged = {
        ...updated,
        menuItems: Array.isArray(menuItems) ? menuItems : DEFAULT_MENU,
        heroSlides,
      };
      setSettings(merged);
      applyCssVars(merged);
      return merged;
    },
    [setSettings],
  );

  const value = useMemo(
    () => ({
      settings,
      loading,
      error,
      reloadSettings: load,
      updateTheme: patchSettings,
    }),
    [settings, loading, error, load, patchSettings],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
}
