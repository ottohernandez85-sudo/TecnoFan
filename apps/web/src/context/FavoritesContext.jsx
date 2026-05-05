import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { favoriteProductSnapshot } from '../utils/productDisplay.js';

const STORAGE_KEY = 'lula_favorites_session';

function readStored() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStored(list) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setFavorites(readStored());
    setHydrated(true);
  }, []);

  const isFavorite = useCallback(
    (productId) => favorites.some((f) => f.id === productId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (product) => {
      const id = product.id;
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === id);
        const next = exists ? prev.filter((f) => f.id !== id) : [...prev, favoriteProductSnapshot(product)];
        writeStored(next);
        return next;
      });
    },
    [],
  );

  const removeFavorite = useCallback((productId) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== productId);
      writeStored(next);
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((o) => !o);
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      hydrated,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
    }),
    [favorites, hydrated, isFavorite, toggleFavorite, removeFavorite, sidebarOpen, toggleSidebar],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  return ctx;
}
