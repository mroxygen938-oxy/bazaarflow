/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, ProductLite, Toast, ToastKind } from "@/lib/types";

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    loaded.current = true;
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);

  return [value, setValue] as const;
}

/* ----------------------------- Theme ----------------------------- */
type ThemeCtx = { theme: "dark" | "light"; toggleTheme: () => void };
const ThemeContext = createContext<ThemeCtx | null>(null);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem("bf_theme");
    const next = stored === "light" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("light", next === "light");
      window.localStorage.setItem("bf_theme", next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within Providers");
  return ctx;
}

/* ----------------------------- Toasts ----------------------------- */
type ToastCtx = { toasts: Toast[]; toast: (message: string, kind?: ToastKind) => void };
const ToastContext = createContext<ToastCtx | null>(null);

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-24 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2 lg:bottom-6 lg:right-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-line bg-elevated/95 px-4 py-3 text-sm text-ink shadow-lift backdrop-blur"
          >
            <span
              className={`material-symbols-outlined text-lg ${
                t.kind === "error"
                  ? "text-danger"
                  : t.kind === "info"
                    ? "text-secondary"
                    : "text-primary-soft"
              }`}
            >
              {t.kind === "error" ? "error" : t.kind === "info" ? "info" : "check_circle"}
            </span>
            <span className="font-medium">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within Providers");
  return ctx;
}

/* ----------------------------- Cart ----------------------------- */
type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: ProductLite, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};
const CartContext = createContext<CartCtx | null>(null);

function CartProvider({ userId, children }: { userId?: string; children: ReactNode }) {
  const [items, setItems] = useStoredState<CartItem[]>(`bf_cart:${userId ?? "guest"}`, []);
  const { toast } = useToast();

  const addItem = useCallback(
    (product: ProductLite, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
          );
        }
        return [...prev, { ...product, quantity }];
      });
      toast(`${product.name} added to bag`);
    },
    [setItems, toast],
  );

  const removeItem = useCallback(
    (id: string) => setItems((prev) => prev.filter((i) => i.id !== id)),
    [setItems],
  );

  const setQuantity = useCallback(
    (id: string, quantity: number) =>
      setItems((prev) =>
        prev
          .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))
          .filter((i) => i.quantity > 0),
      ),
    [setItems],
  );

  const clearCart = useCallback(() => setItems([]), [setItems]);

  const count = items.reduce((a, b) => a + b.quantity, 0);
  const subtotal = items.reduce((a, b) => a + b.price * b.quantity, 0);

  const value = useMemo(
    () => ({ items, count, subtotal, addItem, removeItem, setQuantity, clearCart }),
    [items, count, subtotal, addItem, removeItem, setQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within Providers");
  return ctx;
}

/* ----------------------------- Wishlist ----------------------------- */
type WishlistCtx = {
  items: ProductLite[];
  has: (id: string) => boolean;
  toggle: (product: ProductLite) => void;
  remove: (id: string) => void;
  count: number;
};
const WishlistContext = createContext<WishlistCtx | null>(null);

function WishlistProvider({ userId, children }: { userId?: string; children: ReactNode }) {
  const [items, setItems] = useStoredState<ProductLite[]>(`bf_wishlist:${userId ?? "guest"}`, []);
  const { toast } = useToast();

  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const toggle = useCallback(
    (product: ProductLite) => {
      setItems((prev) => {
        if (prev.some((i) => i.id === product.id)) {
          toast(`${product.name} removed from wishlist`, "info");
          return prev.filter((i) => i.id !== product.id);
        }
        toast(`${product.name} saved to wishlist`);
        return [...prev, product];
      });
    },
    [setItems, toast],
  );

  const remove = useCallback(
    (id: string) => setItems((prev) => prev.filter((i) => i.id !== id)),
    [setItems],
  );

  const value = useMemo(
    () => ({ items, has, toggle, remove, count: items.length }),
    [items, has, toggle, remove],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within Providers");
  return ctx;
}

/* ----------------------------- Compare ----------------------------- */
type CompareCtx = {
  items: ProductLite[];
  has: (id: string) => boolean;
  toggle: (product: ProductLite) => void;
  remove: (id: string) => void;
  clear: () => void;
  max: number;
};
const CompareContext = createContext<CompareCtx | null>(null);
const COMPARE_MAX = 4;

function CompareProvider({ userId, children }: { userId?: string; children: ReactNode }) {
  const [items, setItems] = useStoredState<ProductLite[]>(`bf_compare:${userId ?? "guest"}`, []);
  const { toast } = useToast();

  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const toggle = useCallback(
    (product: ProductLite) => {
      setItems((prev) => {
        if (prev.some((i) => i.id === product.id)) {
          return prev.filter((i) => i.id !== product.id);
        }
        if (prev.length >= COMPARE_MAX) {
          toast(`Compare is full (max ${COMPARE_MAX}). Remove one first.`, "error");
          return prev;
        }
        toast(`${product.name} added to compare`, "info");
        return [...prev, product];
      });
    },
    [setItems, toast],
  );

  const remove = useCallback(
    (id: string) => setItems((prev) => prev.filter((i) => i.id !== id)),
    [setItems],
  );
  const clear = useCallback(() => setItems([]), [setItems]);

  const value = useMemo(
    () => ({ items, has, toggle, remove, clear, max: COMPARE_MAX }),
    [items, has, toggle, remove, clear],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within Providers");
  return ctx;
}

export function Providers({ userId, children }: { userId?: string; children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <CartProvider key={userId ?? "guest"} userId={userId}>
          <WishlistProvider userId={userId}>
            <CompareProvider userId={userId}>{children}</CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
