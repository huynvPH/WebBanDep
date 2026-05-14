import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { computeDiscount, type Voucher } from "@/lib/voucher";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
  voucher: Voucher | null;
  discount: number;
  total: number;
  applyVoucher: (v: Voucher) => void;
  clearVoucher: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "crocs_cart_v1";
const VKEY = "crocs_voucher_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [voucher, setVoucher] = useState<Voucher | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
      const v = localStorage.getItem(VKEY);
      if (v) setVoucher(JSON.parse(v));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (voucher) localStorage.setItem(VKEY, JSON.stringify(voucher));
    else localStorage.removeItem(VKEY);
  }, [voucher]);

  const add: CartCtx["add"] = (item, qty = 1) =>
    setItems((p) => {
      const found = p.find((x) => x.id === item.id);
      if (found) return p.map((x) => (x.id === item.id ? { ...x, quantity: x.quantity + qty } : x));
      return [...p, { ...item, quantity: qty }];
    });
  const remove: CartCtx["remove"] = (id) => setItems((p) => p.filter((x) => x.id !== id));
  const setQty: CartCtx["setQty"] = (id, qty) =>
    setItems((p) => p.map((x) => (x.id === id ? { ...x, quantity: Math.max(1, qty) } : x)));
  const clear = () => {
    setItems([]);
    setVoucher(null);
  };

  const subtotal = items.reduce((s, x) => s + x.price * x.quantity, 0);
  const count = items.reduce((s, x) => s + x.quantity, 0);

  // Auto-detach voucher if cart no longer meets min_order
  useEffect(() => {
    if (voucher && subtotal < Number(voucher.min_order)) setVoucher(null);
  }, [subtotal, voucher]);

  const { discount, total } = useMemo(() => {
    const d = voucher ? computeDiscount(voucher, subtotal) : 0;
    return { discount: d, total: Math.max(0, subtotal - d) };
  }, [voucher, subtotal]);

  return (
    <Ctx.Provider
      value={{
        items, add, remove, setQty, clear, subtotal, count,
        voucher, discount, total,
        applyVoucher: setVoucher,
        clearVoucher: () => setVoucher(null),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
