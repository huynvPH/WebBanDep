import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({ component: Orders });

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "shipped", label: "Đang giao" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã hủy" },
];

const TYPE_LABEL: Record<string, string> = {
  online: "Online",
  pos: "Tại quầy",
};

function Orders() {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8081/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      return data.sort((a: any, b: any) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime());
    },
  });

  const setStatus = async (id: string, status: string) => {
    try {
      const orderRes = await fetch(`http://localhost:8081/api/orders/${id}`);
      if (!orderRes.ok) throw new Error("Order not found");
      const order = await orderRes.json();
      const updated = { ...order, status };
      const res = await fetch(`http://localhost:8081/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Đã cập nhật trạng thái");
      qc.invalidateQueries({ queryKey: ["all-orders"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Đơn hàng</h1>
        <p className="text-sm text-muted-foreground">Tất cả kênh: online và tại cửa hàng.</p>
      </div>
      <div className="space-y-3">
        {orders.map((o: any) => (
          <div key={o.id} className="rounded-2xl border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</div>
                <div className="text-sm font-medium">{o.customerName || o.customer_name || "Khách lẻ"}</div>
                <div className="text-xs text-muted-foreground">{new Date(o.createdAt || o.created_at || Date.now()).toLocaleString("vi-VN")}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{TYPE_LABEL[o.type] ?? o.type}</Badge>
                <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs">
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <span className="font-display text-lg font-bold">{Number(o.totalAmount || o.total_amount || 0).toLocaleString("vi-VN")} ₫</span>
              </div>
            </div>
            <ul className="mt-3 space-y-1 border-t pt-3 text-sm text-muted-foreground">
              {(o.orderItems || o.order_items || []).map((it: any) => <li key={it.id}>{it.quantity}× {it.productName || it.product_name} <span className="text-xs">@ {Number(it.unitPrice || it.unit_price).toLocaleString("vi-VN")} ₫</span></li>)}
            </ul>
            {o.grab_tracking_id && <div className="mt-2 text-xs"><span className="text-muted-foreground">Mã theo dõi Grab:</span> <span className="font-mono">{o.grab_tracking_id}</span></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
