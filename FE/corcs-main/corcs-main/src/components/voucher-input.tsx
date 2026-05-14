import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketPercent, X, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { validateVoucher } from "@/lib/voucher";
import { toast } from "sonner";

export function VoucherInput({ compact = false }: { compact?: boolean }) {
  const { subtotal, voucher, discount, applyVoucher, clearVoucher } = useCart();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const onApply = async () => {
    if (!code.trim()) return;
    setBusy(true);
    const res = await validateVoucher(code, subtotal);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    applyVoucher(res.voucher);
    setCode("");
    toast.success(`Đã áp dụng mã ${res.voucher.code} — tiết kiệm ${res.discount.toLocaleString("vi-VN")} ₫`);
  };

  if (voucher) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
        <div className="flex items-center gap-2 text-sm">
          <TicketPercent className="h-4 w-4 text-primary" />
          <Badge variant="secondary" className="font-mono">{voucher.code}</Badge>
          <span className="text-muted-foreground">−{discount.toLocaleString("vi-VN")} ₫</span>
        </div>
        <button onClick={clearVoucher} aria-label="Bỏ mã giảm giá" className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Mã giảm giá"
        value={code}
        maxLength={40}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onApply()}
        className={compact ? "h-9" : ""}
      />
      <Button variant="outline" onClick={onApply} disabled={busy || !code.trim()} size={compact ? "sm" : "default"}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Áp dụng"}
      </Button>
    </div>
  );
}
