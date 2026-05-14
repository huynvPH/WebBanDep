import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/integrations/supabase/client";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: "/account" } });
  }, [user, loading, navigate]);

  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("http://localhost:8081/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      return data
        .filter((o: any) => o.userId === user!.id || o.user_id === user!.id)
        .sort((a: any, b: any) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime());
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Đơn hàng của tôi</h1>
        {orders.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Bạn chưa có đơn hàng nào. <Link to="/shop" className="text-primary hover:underline">Bắt đầu mua sắm</Link></p>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((o: any) => (
              <div key={o.id} className="rounded-2xl border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</div>
                    <div className="text-sm">{new Date(o.createdAt || o.created_at).toLocaleString("vi-VN")}</div>
                  </div>
                  <Badge variant={o.status === "completed" ? "default" : "secondary"}>{o.status}</Badge>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {(o.orderItems || o.order_items || []).map((it: any) => <li key={it.id}>{it.quantity}× {it.productName || it.product_name}</li>)}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
                  <span className="text-muted-foreground">{(o.deliveryMethod || o.delivery_method) === "pickup" ? "Nhận tại cửa hàng" : `Giao hàng · ${o.grabTrackingId || o.grab_tracking_id || ""}`}</span>
                  <span className="font-display text-base font-bold">{Number(o.totalAmount || o.total_amount).toLocaleString("vi-VN")} ₫</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}
