import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-store";
import { AlertTriangle, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/inventory")({ component: Inventory });

const LOW = 5;

const CATEGORY_LABEL: Record<string, string> = {
  clog: "Dép Crocs",
  charm: "Sticker Jibbitz",
};

function Inventory() {
  const qc = useQueryClient();
  const { hasRole } = useAuth();
  const canCreate = hasRole("admin");
  const canEdit = hasRole("admin") || hasRole("warehouse");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", category: "clog", price: "", color: "", size: "", image: "" });

  const { data: products = [] } = useQuery({
    queryKey: ["inv"],
    queryFn: async () => {
      const res = await fetch("https://webbandep-2.onrender.com/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      return data.sort((a: any, b: any) => a.name.localeCompare(b.name));
    },
  });

  const filtered = useMemo(() => {
    return products.filter((p: any) => {
      const stockOnline = p.stockOnline ?? p.stock_online ?? 0;
      const stockStore = p.stockStore ?? p.stock_store ?? 0;
      if (lowOnly && !(stockOnline < LOW || stockStore < LOW)) return false;
      if (!search) return true;
      const s = search.toLowerCase();
      return p.name.toLowerCase().includes(s) || (p.sku && p.sku.toLowerCase().includes(s));
    });
  }, [products, search, lowOnly]);

  const lowCount = useMemo(
    () => products.filter((p: any) => {
      const stockOnline = p.stockOnline ?? p.stock_online ?? 0;
      const stockStore = p.stockStore ?? p.stock_store ?? 0;
      return stockOnline < LOW || stockStore < LOW;
    }).length,
    [products],
  );

  const updateStock = async (id: string, patch: Partial<{ stockOnline: number; stockStore: number }>) => {
    try {
      const existingRes = await fetch(`https://webbandep-2.onrender.com/api/products/${id}`);
      if (!existingRes.ok) throw new Error("Product not found");
      const product = await existingRes.json();
      const updated = { ...product, ...patch };

      const res = await fetch(`https://webbandep-2.onrender.com/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Update failed");
      qc.invalidateQueries({ queryKey: ["inv"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const syncRow = async (p: any) => {
    const total = Number(p.stockOnline ?? p.stock_online ?? 0) + Number(p.stockStore ?? p.stock_store ?? 0);
    const half = Math.floor(total / 2);
    await updateStock(p.id, { stockOnline: half, stockStore: total - half });
    toast.success(`Đã cân bằng kho ${p.name} (${half} / ${total - half})`);
  };

  const create = async () => {
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        category: form.category,
        price: Number(form.price),
        color: form.color,
        size: form.size,
        images: form.image ? [form.image] : [],
        stockOnline: 0,
        stockStore: 0,
        active: true,
      };
      const res = await fetch("https://webbandep-2.onrender.com/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create product");
      toast.success("Đã tạo sản phẩm mới");
      setOpen(false);
      setForm({ name: "", sku: "", category: "clog", price: "", color: "", size: "", image: "" });
      qc.invalidateQueries({ queryKey: ["inv"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Quản lý kho</h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi tồn kho online và tại cửa hàng. {lowCount > 0 && (
              <span className="font-medium text-destructive">{lowCount} sản phẩm còn dưới {LOW} đơn vị.</span>
            )}
          </p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="rounded-full">+ Thêm sản phẩm</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Sản phẩm mới</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Tên sản phẩm</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Mã SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
                  <div><Label>Danh mục</Label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                      <option value="clog">Dép Crocs</option><option value="charm">Sticker Jibbitz</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Giá</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                  <div><Label>Màu sắc</Label><Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
                  <div><Label>Kích cỡ</Label><Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} /></div>
                </div>
                <div><Label>URL ảnh</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={create}>Tạo mới</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm theo tên hoặc SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button
          variant={lowOnly ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setLowOnly((v) => !v)}
        >
          <AlertTriangle className="mr-1 h-4 w-4" />
          Chỉ hiện sắp hết
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Sản phẩm</th>
              <th>SKU</th><th>Danh mục</th><th>Giá</th>
              <th>Tồn online</th><th>Tồn cửa hàng</th>
              {canEdit && <th className="pr-4 text-right">Cân bằng</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p: any) => {
              const stockOnline = p.stockOnline ?? p.stock_online ?? 0;
              const stockStore = p.stockStore ?? p.stock_store ?? 0;
              const lowOnline = stockOnline < LOW;
              const lowStore = stockStore < LOW;
              const rowLow = lowOnline || lowStore;
              return (
                <tr key={p.id} className={cn("hover:bg-muted/30", rowLow && "bg-destructive/5")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]} alt="" className="h-10 w-10 rounded-md object-cover" />
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {p.name}
                          {rowLow && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                        </div>
                        <div className="text-xs text-muted-foreground">{p.color} · {p.size}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs">{p.sku}</td>
                  <td>{CATEGORY_LABEL[p.category] ?? p.category}</td>
                  <td>{Number(p.price).toLocaleString("vi-VN")} ₫</td>
                  <td>
                    <Input
                      type="number"
                      defaultValue={stockOnline}
                      disabled={!canEdit}
                      className={cn("h-8 w-20", lowOnline && "border-destructive text-destructive font-semibold")}
                      onBlur={(e) => updateStock(p.id, { stockOnline: Number(e.target.value) })}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      defaultValue={stockStore}
                      disabled={!canEdit}
                      className={cn("h-8 w-20", lowStore && "border-destructive text-destructive font-semibold")}
                      onBlur={(e) => updateStock(p.id, { stockStore: Number(e.target.value) })}
                    />
                  </td>
                  {canEdit && (
                    <td className="pr-4 text-right">
                      <Button size="sm" variant="ghost" onClick={() => syncRow(p)} title="Cân bằng tồn kho online và cửa hàng">
                        <ArrowLeftRight className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">Không có sản phẩm phù hợp.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
