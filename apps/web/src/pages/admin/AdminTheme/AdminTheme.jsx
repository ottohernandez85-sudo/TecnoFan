import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Input from '../../../components/common/Input/Input.jsx';
import Textarea from '../../../components/common/Textarea/Textarea.jsx';
import Button from '../../../components/common/Button/Button.jsx';
import Select from '../../../components/common/Select/Select.jsx';
import { useTheme } from '../../../context/ThemeContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { uploadLogo, uploadFooterLogo, uploadHeroSlide, deleteHeroSlide } from '../../../api/settings.js';
import { mediaUrl } from '../../../utils/mediaUrl.js';
import styles from './AdminTheme.module.css';

const DEFAULT_MENU = [
  { label: 'Smart Fans', path: '/catalog?category=smart-fans', icon: 'fan' },
  { label: 'Ceiling Fans', path: '/catalog?category=ceiling-fans', icon: 'wind' },
  { label: 'Industrial', path: '/catalog?category=industrial', icon: 'building' },
  { label: 'Accesorios', path: '/catalog?category=accesorios', icon: 'package' },
  { label: 'Soporte', path: '/support', icon: 'headset' },
];

const MENU_ICON_OPTIONS = [
  { value: 'fan', label: 'Ventilador' },
  { value: 'wind', label: 'Aire' },
  { value: 'building', label: 'Edificio' },
  { value: 'package', label: 'Paquete' },
  { value: 'headset', label: 'Soporte' },
  { value: 'home', label: 'Inicio' },
  { value: 'cart', label: 'Carrito' },
  { value: 'circle', label: 'Simple' },
];

const DEFAULTS = {
  brandName: 'Tecnofan',
  colorPrimary: '#0F2A47',
  colorAccent: '#1E5BA8',
  colorBg: '#F2F4F7',
  colorSurface: '#FFFFFF',
  colorText: '#0F2A47',
  menuItems: DEFAULT_MENU,
  productTemplate: 'standard',
  logoUrl: null,
  footerLogoUrl: null,
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

export default function AdminTheme() {
  const { user } = useAuth();
  const { settings, updateTheme, reloadSettings } = useTheme();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [brand, setBrand] = useState('');
  const [menuDraft, setMenuDraft] = useState([]);
  const [company, setCompany] = useState({
    companyLegalName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyTaxId: '',
  });
  const [hero, setHero] = useState({
    heroBadge: '',
    heroTitle: '',
    heroSubtitle: '',
  });

  useEffect(() => {
    if (settings) {
      setBrand(settings.brandName || '');
      setMenuDraft(
        Array.isArray(settings.menuItems) && settings.menuItems.length
          ? settings.menuItems.map((row, i) => ({
              ...row,
              icon: row.icon || DEFAULT_MENU[i]?.icon || 'circle',
            }))
          : [...DEFAULT_MENU],
      );
      setCompany({
        companyLegalName: settings.companyLegalName || '',
        companyAddress: settings.companyAddress || '',
        companyPhone: settings.companyPhone || '',
        companyEmail: settings.companyEmail || '',
        companyTaxId: settings.companyTaxId || '',
      });
      setHero({
        heroBadge: settings.heroBadge || '',
        heroTitle: settings.heroTitle || '',
        heroSubtitle: settings.heroSubtitle || '',
      });
    }
  }, [settings]);

  if (user?.role === 'STAFF') {
    return <Navigate to="/admin/orders" replace />;
  }

  if (!settings) {
    return <p>Cargando configuración…</p>;
  }

  const patch = async (partial) => {
    setMsg(null);
    setSaving(true);
    try {
      await updateTheme(partial);
      setMsg('Guardado');
    } catch (e) {
      setMsg(e?.response?.data?.error || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const saveBrand = () => patch({ brandName: brand });

  const saveMenu = () => patch({ menuItems: menuDraft });

  const saveCompany = () => patch({ ...company });

  const saveHeroTexts = () =>
    patch({
      heroBadge: hero.heroBadge,
      heroTitle: hero.heroTitle,
      heroSubtitle: hero.heroSubtitle,
    });

  const onHeroSlide = async (slot, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(null);
    setSaving(true);
    try {
      await uploadHeroSlide(slot, file);
      await reloadSettings();
      setMsg(`Imagen ${slot + 1} actualizada`);
    } catch (err) {
      setMsg(err?.response?.data?.error || 'Error al subir imagen');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const clearHeroSlide = async (slot) => {
    setMsg(null);
    setSaving(true);
    try {
      await deleteHeroSlide(slot);
      await reloadSettings();
      setMsg('Imagen eliminada');
    } catch (err) {
      setMsg(err?.response?.data?.error || 'Error al quitar imagen');
    } finally {
      setSaving(false);
    }
  };

  const addMenuItem = () => {
    setMenuDraft((m) => [...m, { label: 'Nuevo', path: '/', icon: 'circle' }]);
  };

  const removeMenuItem = (index) => {
    setMenuDraft((m) => m.filter((_, i) => i !== index));
  };

  const moveMenu = (index, dir) => {
    setMenuDraft((m) => {
      const next = [...m];
      const j = index + dir;
      if (j < 0 || j >= next.length) return m;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const onLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(null);
    setSaving(true);
    try {
      await uploadLogo(file);
      await reloadSettings();
      setMsg('Logo navbar actualizado (WebP en servidor)');
    } catch (err) {
      setMsg(err?.response?.data?.error || 'Error al subir logo');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const onFooterLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(null);
    setSaving(true);
    try {
      await uploadFooterLogo(file);
      await reloadSettings();
      setMsg('Logo footer actualizado (WebP en servidor)');
    } catch (err) {
      setMsg(err?.response?.data?.error || 'Error al subir logo footer');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const clearFooterLogo = async () => {
    setMsg(null);
    setSaving(true);
    try {
      await updateTheme({ footerLogoUrl: null });
      await reloadSettings();
      setMsg('Logo footer quitado. El pie mostrará solo el nombre hasta que subas otro logo de pie.');
    } catch (err) {
      setMsg(err?.response?.data?.error || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const clearNavbarLogo = async () => {
    setMsg(null);
    setSaving(true);
    try {
      await updateTheme({ logoUrl: null });
      await reloadSettings();
      setMsg('Logo del navbar quitado. El encabezado mostrará el nombre de marca en texto.');
    } catch (err) {
      setMsg(err?.response?.data?.error || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const resetAll = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await updateTheme(DEFAULTS);
      setMsg('Valores por defecto restaurados');
    } catch (e) {
      setMsg(e?.response?.data?.error || 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Tema y menú</h1>
      <p className={styles.lead}>
        Colores globales (CSS variables), nombre de marca, logo, ítems del menú y plantilla de cards.
      </p>

      {msg && <p className={styles.msg}>{msg}</p>}

      <section className={styles.card}>
        <h2>Marca</h2>
        <div className={styles.row}>
          <Input label="Nombre comercial" value={brand} onChange={(e) => setBrand(e.target.value)} />
          <Button type="button" onClick={saveBrand} disabled={saving}>
            Guardar nombre
          </Button>
        </div>
        <p className={styles.hint} style={{ marginTop: '0.75rem' }}>
          Los dos logos son independientes: el del navbar no cambia al subir el del pie. Las subidas se guardan
          como <strong>WebP</strong> en el servidor (excepto SVG).
        </p>

        <div className={styles.brandLogoGrid}>
          <div className={styles.brandLogoPanel}>
            <h3 className={styles.brandLogoTitle}>Logo navbar</h3>
            <p className={styles.hint}>Solo barra superior (enlace a inicio). No se usa en el pie de página.</p>
            <div className={styles.logoPreviewSlot}>
              {settings.logoUrl ? (
                <img src={mediaUrl(settings.logoUrl)} alt="" className={styles.logoPreviewImg} />
              ) : (
                <span className={styles.logoPreviewEmpty}>Sin imagen — se muestra el nombre de marca en texto</span>
              )}
            </div>
            <p className={styles.webpNote}>Sube JPG, PNG, GIF o WebP → se convierte a WebP.</p>
            <div className={styles.footerLogoActions}>
              <input type="file" accept="image/*" onChange={onLogo} disabled={saving} />
              <Button type="button" variant="secondary" disabled={saving || !settings.logoUrl} onClick={clearNavbarLogo}>
                Quitar logo navbar
              </Button>
            </div>
          </div>

          <div className={styles.brandLogoPanel}>
            <h3 className={styles.brandLogoTitle}>Logo footer</h3>
            <p className={styles.hint}>Solo pie de página. El navbar sigue usando únicamente el logo de la izquierda.</p>
            <div className={styles.logoPreviewSlot}>
              {settings.footerLogoUrl ? (
                <img src={mediaUrl(settings.footerLogoUrl)} alt="" className={styles.logoPreviewImg} />
              ) : (
                <span className={styles.logoPreviewEmpty}>Sin imagen — el pie muestra el nombre en texto</span>
              )}
            </div>
            <p className={styles.webpNote}>Sube JPG, PNG, GIF o WebP → se convierte a WebP.</p>
            <div className={styles.footerLogoActions}>
              <input type="file" accept="image/*" onChange={onFooterLogo} disabled={saving} />
              <Button
                type="button"
                variant="secondary"
                disabled={saving || !settings.footerLogoUrl}
                onClick={clearFooterLogo}
              >
                Quitar logo footer
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2>Banner principal (inicio)</h2>
        <p className={styles.hint}>
          Textos del hero y hasta tres imágenes en carrusel (reemplazan el recuadro azul de la portada).
        </p>
        <Input
          label="Texto de la colección (badge)"
          value={hero.heroBadge}
          onChange={(e) => setHero((h) => ({ ...h, heroBadge: e.target.value }))}
        />
        <Input
          label="Título principal"
          value={hero.heroTitle}
          onChange={(e) => setHero((h) => ({ ...h, heroTitle: e.target.value }))}
        />
        <Textarea
          label="Subtítulo"
          rows={3}
          value={hero.heroSubtitle}
          onChange={(e) => setHero((h) => ({ ...h, heroSubtitle: e.target.value }))}
        />
        <Button type="button" onClick={saveHeroTexts} disabled={saving}>
          Guardar textos del banner
        </Button>

        <p className={styles.fieldLabel} style={{ marginTop: '1.25rem' }}>
          Imágenes del carrusel (máx. 3)
        </p>
        <div className={styles.heroSlots}>
          {[0, 1, 2].map((slot) => {
            const url = settings.heroSlides?.[slot];
            return (
              <div key={slot} className={styles.heroSlot}>
                <span className={styles.heroSlotLabel}>Imagen {slot + 1}</span>
                <div className={styles.heroThumb}>
                  {url ? (
                    <img src={mediaUrl(url)} alt="" />
                  ) : (
                    <span className={styles.heroEmpty}>Vacío</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  disabled={saving}
                  onChange={(e) => onHeroSlide(slot, e)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={saving || !url}
                  onClick={() => clearHeroSlide(slot)}
                >
                  Quitar
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.card}>
        <h2>Empresa (ticket PDF)</h2>
        <p className={styles.hint}>Aparecen en el comprobante PDF al finalizar la compra.</p>
        <Input
          label="Razón social"
          value={company.companyLegalName}
          onChange={(e) => setCompany((c) => ({ ...c, companyLegalName: e.target.value }))}
        />
        <Input
          label="Dirección"
          value={company.companyAddress}
          onChange={(e) => setCompany((c) => ({ ...c, companyAddress: e.target.value }))}
        />
        <div className={styles.row2}>
          <Input
            label="Teléfono"
            value={company.companyPhone}
            onChange={(e) => setCompany((c) => ({ ...c, companyPhone: e.target.value }))}
          />
          <Input
            label="Correo"
            value={company.companyEmail}
            onChange={(e) => setCompany((c) => ({ ...c, companyEmail: e.target.value }))}
          />
        </div>
        <Input
          label="NIT / ID fiscal"
          value={company.companyTaxId}
          onChange={(e) => setCompany((c) => ({ ...c, companyTaxId: e.target.value }))}
        />
        <Button type="button" onClick={saveCompany} disabled={saving}>
          Guardar datos empresa
        </Button>
      </section>

      <section className={styles.card}>
        <h2>Colores</h2>
        <div className={styles.colors}>
          {[
            ['colorPrimary', 'Principal'],
            ['colorAccent', 'Acento'],
            ['colorBg', 'Fondo página'],
            ['colorSurface', 'Superficie / cards'],
            ['colorText', 'Texto principal'],
          ].map(([key, label]) => (
            <label key={key} className={styles.colorRow}>
              <span>{label}</span>
              <input
                type="color"
                value={(settings[key] || '#000000').toString().slice(0, 7)}
                onChange={(e) => patch({ [key]: e.target.value })}
              />
              <code>{settings[key]}</code>
            </label>
          ))}
        </div>
      </section>

      <section className={styles.card}>
        <h2>Plantilla de tarjeta de producto</h2>
        <Select
          label="Template"
          value={settings.productTemplate}
          onChange={(e) => patch({ productTemplate: e.target.value })}
        >
          <option value="standard">Standard (imagen + specs)</option>
          <option value="compact">Compact (horizontal)</option>
          <option value="detailed">Detailed (+ categoría)</option>
        </Select>
        <p className={styles.hint}>Afecta el catálogo y listados que usan ProductCard.</p>
      </section>

      <section className={styles.card}>
        <div className={styles.menuHead}>
          <h2>Menú principal</h2>
          <div className={styles.menuHeadBtns}>
            <Button type="button" variant="secondary" onClick={addMenuItem}>
              + Ítem
            </Button>
            <Button type="button" onClick={saveMenu} disabled={saving}>
              Guardar menú
            </Button>
          </div>
        </div>
        <ul className={styles.menuList}>
          {menuDraft.map((item, i) => (
            <li key={i} className={styles.menuItem}>
              <Select
                label="Icono"
                value={item.icon || 'circle'}
                onChange={(e) => {
                  const v = e.target.value;
                  setMenuDraft((m) => m.map((row, j) => (j === i ? { ...row, icon: v } : row)));
                }}
              >
                {MENU_ICON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <Input
                label="Etiqueta"
                value={item.label}
                onChange={(e) => {
                  const v = e.target.value;
                  setMenuDraft((m) => m.map((row, j) => (j === i ? { ...row, label: v } : row)));
                }}
              />
              <Input
                label="Ruta"
                value={item.path}
                onChange={(e) => {
                  const v = e.target.value;
                  setMenuDraft((m) => m.map((row, j) => (j === i ? { ...row, path: v } : row)));
                }}
              />
              <div className={styles.menuBtns}>
                <Button type="button" variant="secondary" onClick={() => moveMenu(i, -1)}>
                  ↑
                </Button>
                <Button type="button" variant="secondary" onClick={() => moveMenu(i, 1)}>
                  ↓
                </Button>
                <Button type="button" variant="danger" onClick={() => removeMenuItem(i)}>
                  ✕
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Button type="button" variant="secondary" onClick={resetAll} disabled={saving}>
        Restaurar valores por defecto
      </Button>
    </div>
  );
}
