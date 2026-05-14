import { createFileRoute, Link } from "@tanstack/react-router";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Giỏ hàng của bạn</h1>
        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground">Giỏ hàng của bạn đang trống.</p>
            <Button asChild className="mt-4 rounded-full"><Link to="/shop">Bắt đầu mua sắm</Link></Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <ul className="divide-y divide-border rounded-2xl border bg-card">
              {items.map((it) => (
                <li key={it.id} className="flex gap-4 p-4">
                  <img src={it.image} alt={it.name} className="h-24 w-24 rounded-xl object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{it.name}</h3>
                      <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border">
                        <button onClick={() => setQty(it.id, it.quantity - 1)} className="grid h-8 w-8 place-items-center"><Minus className="h-3 w-3" /></button>
                        <span className="w-8 text-center text-sm">{it.quantity}</span>
                        <button onClick={() => setQty(it.id, it.quantity + 1)} className="grid h-8 w-8 place-items-center"><Plus className="h-3 w-3" /></button>
                      </div>
                      <span className="font-display font-semibold">{(it.price * it.quantity).toLocaleString("vi-VN")} ₫</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <aside className="h-fit rounded-2xl border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Tóm tắt đơn hàng</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Tạm tính</dt><dd>{subtotal.toLocaleString("vi-VN")} ₫</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Vận chuyển</dt><dd>Tính ở bước thanh toán</dd></div>
              </dl>
              <Button asChild size="lg" className="mt-6 w-full rounded-full"><Link to="/checkout">Thanh toán</Link></Button>
            </aside>
          </div>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}
