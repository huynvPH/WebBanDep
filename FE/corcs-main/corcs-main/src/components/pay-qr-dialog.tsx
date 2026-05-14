import { useEffect, useMemo, useState } from "react";
import { Loader2, QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function PayQrDialog({
  open,
  onOpenChange,
  amount,
  orderRef,
  onPaid,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  amount: number;
  orderRef: string;
  onPaid: () => void | Promise<void>;
}) {
  const [status, setStatus] = useState<"creating" | "awaiting" | "confirming">("creating");

  const qrUrl = useMemo(() => {
    const payload = `PAYOS|${orderRef}|${Math.round(amount)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(payload)}`;
  }, [orderRef, amount]);

  useEffect(() => {
    if (!open) return;
    setStatus("creating");
    const t1 = setTimeout(() => setStatus("awaiting"), 800);
    return () => clearTimeout(t1);
  }, [open]);

  const simulatePaid = async () => {
    setStatus("confirming");
    await new Promise((r) => setTimeout(r, 700));
    await onPaid();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" /> Thanh toán bằng QR
          </DialogTitle>
          <DialogDescription>Quét mã QR bằng ứng dụng ngân hàng hỗ trợ PayOS.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 py-2">
          {status === "creating" ? (
            <div className="flex h-[240px] w-[240px] items-center justify-center rounded-xl border bg-muted/40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <img src={qrUrl} alt="Mã QR PayOS" className="rounded-xl border bg-white p-2" />
          )}
          <div className="text-center">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Số tiền</div>
            <div className="font-display text-2xl font-bold">{amount.toLocaleString("vi-VN")} ₫</div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">Mã đơn: {orderRef}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={simulatePaid} disabled={status !== "awaiting"} className="rounded-full">
            {status === "confirming" ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Đang xác nhận…</>
            ) : (
              "Tôi đã thanh toán"
            )}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
