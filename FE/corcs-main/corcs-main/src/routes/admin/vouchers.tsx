import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/admin/vouchers")({ component: Vouchers });

function Vouchers() {
  const qc = useQueryClient();
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", discount_type: "percent", discount_value: "10", min_order: "0", usage_limit: "" });

  const { data: vouchers = [] } = useQuery({
    queryKey: ["vouchers"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8081/api/vouchers");
      if (!res.ok) throw new Error("Failed to fetch vouchers");
      const data = await res.json();
      return data.sort((a: any, b: any) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime());
    },
  });

  const create = async () => {
    try {
      const payload = {
        code: form.code.toUpperCase(),
        discountType: form.discount_type,
        discountValue: Number(form.discount_value),
        minOrder: Number(form.min_order),
        usageLimit: form.usage_limit ? Number(form.usage_limit) : null,
        active: true,
        usedCount: 0,
      };
      const res = await fetch("http://localhost:8081/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create voucher");
      toast.success("Đã tạo mã giảm giá");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["vouchers"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggle = async (id: string, active: boolean) => {
    try {
      const existingRes = await fetch(`http://localhost:8081/api/vouchers/${id}`);
      if (!existingRes.ok) throw new Error("Voucher not found");
      const voucher = await existingRes.json();
      const updated = { ...voucher, active };

      const res = await fetch(`http://localhost:8081/api/vouchers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Failed to update voucher");
      qc.invalidateQueries({ queryKey: ["vouchers"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Mã giảm giá</h1>
          <p className="text-sm text-muted-foreground">Mã khuyến mãi và ưu đãi.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="rounded-full">+ Thêm mã</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Mã giảm giá mới</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Mã code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Loại giảm</Label>
                    <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                      <option value="percent">Theo %</option><option value="fixed">Số tiền cố định</option>
                    </select>
                  </div>
                  <div><Label>Giá trị</Label><Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Đơn tối thiểu</Label><Input type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} /></div>
                  <div><Label>Số lượt dùng</Label><Input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter><Button onClick={create}>Tạo mới</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vouchers.map((v: any) => (
          <div key={v.id} className="rounded-2xl border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-lg font-bold">{v.code}</div>
                <div className="text-sm text-muted-foreground">
                  {v.discount_type === "percent" ? `Giảm ${v.discount_value}%` : `Giảm ${Number(v.discount_value).toLocaleString("vi-VN")} ₫`}
                  {Number(v.min_order) > 0 && ` · đơn tối thiểu ${Number(v.min_order).toLocaleString("vi-VN")} ₫`}
                </div>
              </div>
              {isAdmin && <Switch checked={v.active} onCheckedChange={(c) => toggle(v.id, c)} />}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Đã dùng {v.usedCount ?? v.used_count ?? 0}{v.usageLimit || v.usage_limit ? ` / ${v.usageLimit || v.usage_limit}` : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
