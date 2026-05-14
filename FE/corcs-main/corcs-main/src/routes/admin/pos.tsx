import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Trash2, Search, Sparkles, Printer } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pos")({ component: POS });

type Line = { id: string; name: string; sku: string; price: number; quantity: number; stock_store: number };

function printInvoice(opts: {
  orderId: string;
  customer: string;
  lines: Line[];
  total: number;
  cashier: string;
}) {
  const { orderId, customer, lines, total, cashier } = opts;
  const w = window.open("", "_blank", "width=420,height=640");
  if (!w) return toast.error("Trình duyệt đang chặn pop-up — hãy cho phép để in hóa đơn");
  const rows = lines
    .map(
      (l) => `<tr>
        <td>${l.name}<div style="font-size:10px;color:#777">${l.sku}</div></td>
        <td style="text-align:center">${l.quantity}</td>
        <td style="text-align:right">${(l.price * l.quantity).toLocaleString("vi-VN")} ₫</td>
      </tr>`,
    )
    .join("");
  w.document.write(`<!doctype html><html><head><title>Hóa đơn ${orderId.slice(0, 8)}</title>
<style>
  body{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;padding:24px;color:#111;max-width:360px;margin:0 auto}
  h1{font-size:18px;margin:0 0 4px} .muted{color:#666;font-size:12px}
  table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
  th,td{padding:6px 4px;border-bottom:1px dashed #ddd;text-align:left}
  tfoot td{font-weight:700;border-top:2px solid #111;border-bottom:none;padding-top:10px}
  .center{text-align:center}.right{text-align:right}
</style></head><body>
  <div class="center">
    <h1>Sole &amp; Charm</h1>
    <div class="muted">Hóa đơn bán hàng tại quầy</div>
  </div>
  <div style="margin-top:14px;font-size:12px">
    <div><b>Mã đơn:</b> ${orderId.slice(0, 8).toUpperCase()}</div>
    <div><b>Ngày:</b> ${new Date().toLocaleString("vi-VN")}</div>
    <div><b>Khách hàng:</b> ${customer || "Khách lẻ"}</div>
    <div><b>Thu ngân:</b> ${cashier}</div>
  </div>
  <table>
    <thead><tr><th>Sản phẩm</th><th class="center">SL</th><th class="right">Thành tiền</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td colspan="2">TỔNG CỘNG</td><td class="right">${total.toLocaleString("vi-VN")} ₫</td></tr></tfoot>
  </table>
  <p class="center muted" style="margin-top:24px">Cảm ơn quý khách đã mua sắm!</p>
  <script>window.onload=()=>{window.print();}</script>
</body></html>`);
  w.document.close();
}

function POS() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [quickCharms, setQuickCharms] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [customer, setCustomer] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["pos-products", search, quickCharms],
    queryFn: async () => {
      const res = await fetch("http://localhost:8081/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      let data = await res.json();
      data = data.filter((p: any) => p.active);
      if (quickCharms) data = data.filter((p: any) => p.category === "charm");
      if (search) {
        const s = search.toLowerCase();
        data = data.filter((p: any) => p.name.toLowerCase().includes(s) || (p.sku && p.sku.toLowerCase().includes(s)));
      }
      return data.sort((a: any, b: any) => a.name.localeCompare(b.name)).slice(0, 48);
    },
  });

  const add = (p: any) =>
    setLines((prev) => {
      const f = prev.find((l) => l.id === p.id);
      const stock = Number(p.stock ?? p.stockStore ?? p.stock_store ?? 0);
      if (f) {
        if (f.quantity + 1 > stock) {
          toast.error(`Chỉ còn ${stock} sản phẩm "${p.name}"`);
          return prev;
        }
        return prev.map((l) => (l.id === p.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      if (stock < 1) {
        toast.error(`${p.name} đã hết hàng`);
        return prev;
      }
      return [...prev, { id: p.id, name: p.name, sku: p.sku, price: Number(p.price), quantity: 1, stock: stock }];
    });

  const inc = (id: string, d: number) =>
    setLines((p) =>
      p.flatMap((l) => {
        if (l.id !== id) return [l];
        const next = l.quantity + d;
        if (next <= 0) return [];
        if (next > l.stock_store) {
          toast.error(`Chỉ còn ${l.stock_store} sản phẩm trong kho`);
          return [l];
        }
        return [{ ...l, quantity: next }];
      }),
    );

  const total = useMemo(() => lines.reduce((s, l) => s + l.price * l.quantity, 0), [lines]);

  const checkout = async (alsoPrint: boolean) => {
    if (lines.length === 0) return;
    setBusy(true);
    try {
      const payload = {
        userId: user?.id || null,
        type: "pos",
        status: "completed",
        deliveryMethod: "pickup",
        totalAmount: total,
        customerName: customer || "Khách lẻ",
      };
      const res = await fetch("http://localhost:8081/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Tạo đơn thất bại");
      const order = await res.json();

      // Create order items
      await Promise.all(
        lines.map((l) =>
          fetch("http://localhost:8081/api/order-items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order: { id: order.id },
              product: { id: l.id },
              productName: l.name,
              quantity: l.quantity,
              unitPrice: l.price,
            }),
          })
        )
      );



      toast.success(`Đã hoàn tất đơn #${order.id.slice(0, 8)}`);
      if (alsoPrint) {
        printInvoice({
          orderId: order.id,
          customer,
          lines,
          total,
          cashier: user?.email ?? user?.username ?? "Nhân viên",
        });
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLines([]);
    setCustomer("");
    setBusy(false);
    qc.invalidateQueries({ queryKey: ["pos-products"] });
    qc.invalidateQueries({ queryKey: ["inv"] });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Bán hàng tại quầy</h1>
          <p className="text-sm text-muted-foreground">Chọn sản phẩm để lập đơn bán tại cửa hàng. Tồn kho cửa hàng sẽ trừ tự động khi thanh toán.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Tìm theo tên hoặc SKU…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button
            type="button"
            variant={quickCharms ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setQuickCharms((v) => !v)}
          >
            <Sparkles className="mr-1 h-4 w-4" />
            Sticker bán nhanh
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((p: any) => {
            const oos = Number(p.stock ?? p.stockStore ?? p.stock_store ?? 0) < 1;
            const currentStock = p.stock ?? p.stockStore ?? p.stock_store ?? 0;
            return (
              <button
                key={p.id}
                onClick={() => add(p)}
                disabled={oos}
                className="group overflow-hidden rounded-xl border bg-card text-left transition hover:border-primary disabled:opacity-50"
              >
                <div className="aspect-square bg-muted">
                  <img src={p.images?.[0]} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="p-2">
                  <div className="truncate text-xs font-medium">{p.name}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{Number(p.price).toLocaleString("vi-VN")} ₫</span>
                    <span className={Number(currentStock) < 5 ? "font-semibold text-destructive" : "text-muted-foreground"}>
                      Còn {currentStock}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="rounded-2xl border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Đơn hiện tại</h2>
        <Input placeholder="Tên khách hàng (không bắt buộc)" value={customer} onChange={(e) => setCustomer(e.target.value)} className="mt-3" />
        <ul className="mt-4 max-h-[40vh] space-y-2 overflow-auto">
          {lines.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">Chưa có sản phẩm</li>}
          {lines.map((l) => (
            <li key={l.id} className="flex items-center gap-2 rounded-lg border p-2">
              <div className="flex-1">
                <div className="text-sm font-medium">{l.name}</div>
                <div className="text-xs text-muted-foreground">{l.price.toLocaleString("vi-VN")} ₫ · {l.sku}</div>
              </div>
              <button onClick={() => inc(l.id, -1)} className="grid h-7 w-7 place-items-center rounded-md border"><Minus className="h-3 w-3" /></button>
              <span className="w-6 text-center text-sm">{l.quantity}</span>
              <button onClick={() => inc(l.id, 1)} className="grid h-7 w-7 place-items-center rounded-md border"><Plus className="h-3 w-3" /></button>
              <button onClick={() => setLines((p) => p.filter((x) => x.id !== l.id))} className="ml-1 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">Tổng cộng</span>
          <span className="font-display text-2xl font-bold">{total.toLocaleString("vi-VN")} ₫</span>
        </div>
        <div className="mt-4 grid gap-2">
          <Button className="w-full rounded-full font-semibold" size="lg" disabled={busy || lines.length === 0} onClick={() => checkout(false)}>
            {busy ? "Đang xử lý…" : "Xác nhận bán"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full"
            size="lg"
            disabled={busy || lines.length === 0}
            onClick={() => checkout(true)}
          >
            <Printer className="mr-1 h-4 w-4" />
            Thanh toán &amp; in hóa đơn
          </Button>
        </div>
      </aside>
    </div>
  );
}
