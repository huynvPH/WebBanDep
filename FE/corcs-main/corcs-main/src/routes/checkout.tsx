import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/integrations/supabase/client";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GrabTracker } from "@/components/grab-tracker";
import { PayQrDialog } from "@/components/pay-qr-dialog";
import { VoucherInput } from "@/components/voucher-input";
import { Truck, QrCode, Banknote } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: Checkout });

function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, voucher, discount, total, clear } = useCart();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<"pickup" | "home">("home");
  const [shipMethod, setShipMethod] = useState<"grab" | "standard">("grab");
  const [payMethod, setPayMethod] = useState<"qr" | "cod">("qr");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ id: string; tracking: string | null } | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  const placeOrder = async () => {
    if (!user) {
      toast.message("Vui lòng đăng nhập để tiếp tục");
      navigate({ to: "/login", search: { redirect: "/checkout" } });
      return;
    }
    if (items.length === 0) return;
    setBusy(true);
    const trackingId = delivery === "home" && shipMethod === "grab"
      ? `GRAB-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
      : null;
    const payload = {
      userId: user.id,
      type: "online",
      status: "pending",
      deliveryMethod: delivery,
      totalAmount: total,
      voucher: voucher ? { id: voucher.id } : null,
      customerName: name,
      customerPhone: phone,
      shippingAddress: delivery === "home" ? address : null,
      grabTrackingId: trackingId,
      grabStatus: trackingId ? "searching_driver" : null,
      paymentMethod: payMethod === "qr" ? "payos_qr" : "cod",
      paymentStatus: "unpaid",
    };
    try {
      const res = await fetch("https://webbandep-2.onrender.com/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Đặt hàng thất bại");
      const order = await res.json();

      await Promise.all(
        items.map((it) =>
          fetch("https://webbandep-2.onrender.com/api/order-items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order: { id: order.id },
              product: { id: it.id },
              productName: it.name,
              quantity: it.quantity,
              unitPrice: it.price,
            }),
          })
        )
      );

      setPlacedOrder({ id: order.id, tracking: trackingId });
      toast.success("Đặt hàng thành công!");
      if (payMethod === "qr") setQrOpen(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const onPaid = async () => {
    if (!placedOrder) return;
    try {
      const existingRes = await fetch(`https://webbandep-2.onrender.com/api/orders/${placedOrder.id}`);
      if (existingRes.ok) {
        const order = await existingRes.json();
        await fetch(`https://webbandep-2.onrender.com/api/orders/${placedOrder.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...order, paymentStatus: "paid", status: "shipped" }),
        });
      }
      toast.success("Thanh toán thành công — đơn hàng đã được ghi nhận", { description: `#${placedOrder.id.slice(0, 8)}` });
    } catch (e) {
      console.error(e);
    }
  };

  const finish = () => {
    clear();
    navigate({ to: "/account" });
  };

  if (placedOrder) {
    return (
      <div className="flex min-h-screen flex-col">
        <StoreHeader />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold tracking-tight">Xác nhận đơn hàng 🎉</h1>
          <p className="mt-2 text-muted-foreground">Đơn #{placedOrder.id.slice(0, 8)} · {total.toLocaleString("vi-VN")} ₫</p>

          {placedOrder.tracking && (
            <div className="mt-6">
              <GrabTracker trackingId={placedOrder.tracking} />
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {payMethod === "qr" && (
              <Button variant="outline" className="rounded-full" onClick={() => setQrOpen(true)}>
                <QrCode className="h-4 w-4" /> Mở lại mã QR
              </Button>
            )}
            <Button className="rounded-full" onClick={finish}>Xem đơn hàng của tôi</Button>
          </div>
        </main>
        <PayQrDialog
          open={qrOpen}
          onOpenChange={setQrOpen}
          amount={total}
          orderRef={placedOrder.id.slice(0, 8).toUpperCase()}
          onPaid={onPaid}
        />
        <StoreFooter />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <StoreHeader />
        <main className="mx-auto max-w-xl flex-1 p-10 text-center">
          <p className="text-muted-foreground">Giỏ hàng của bạn đang trống.</p>
          <Button asChild className="mt-4 rounded-full"><Link to="/shop">Khám phá sản phẩm</Link></Button>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Thanh toán</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6 rounded-2xl border bg-card p-6">
            <div>
              <Label>Họ và tên</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Số điện thoại</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Hình thức nhận hàng</Label>
              <RadioGroup value={delivery} onValueChange={(v) => setDelivery(v as "pickup" | "home")} className="mt-2 grid grid-cols-2 gap-2">
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${delivery === "home" ? "border-primary bg-accent/50" : ""}`}>
                  <RadioGroupItem value="home" />
                  <span><div className="text-sm font-medium">Giao tận nơi</div><div className="text-xs text-muted-foreground">qua Grab</div></span>
                </label>
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${delivery === "pickup" ? "border-primary bg-accent/50" : ""}`}>
                  <RadioGroupItem value="pickup" />
                  <span><div className="text-sm font-medium">Nhận tại cửa hàng</div><div className="text-xs text-muted-foreground">Sẵn sàng sau 1 giờ</div></span>
                </label>
              </RadioGroup>
            </div>
            {delivery === "home" && (
              <>
                <div>
                  <Label>Địa chỉ giao hàng</Label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Đơn vị vận chuyển</Label>
                  <RadioGroup value={shipMethod} onValueChange={(v) => setShipMethod(v as "grab" | "standard")} className="mt-2 grid gap-2 sm:grid-cols-2">
                    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${shipMethod === "grab" ? "border-primary bg-accent/50" : ""}`}>
                      <RadioGroupItem value="grab" />
                      <span className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        <span><div className="text-sm font-medium">Giao qua Grab</div><div className="text-xs text-muted-foreground">~30–45 phút</div></span>
                      </span>
                    </label>
                    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${shipMethod === "standard" ? "border-primary bg-accent/50" : ""}`}>
                      <RadioGroupItem value="standard" />
                      <span><div className="text-sm font-medium">Tiêu chuẩn</div><div className="text-xs text-muted-foreground">2–3 ngày</div></span>
                    </label>
                  </RadioGroup>
                </div>
              </>
            )}

            <div>
              <Label>Phương thức thanh toán</Label>
              <RadioGroup value={payMethod} onValueChange={(v) => setPayMethod(v as "qr" | "cod")} className="mt-2 grid gap-2 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${payMethod === "qr" ? "border-primary bg-accent/50" : ""}`}>
                  <RadioGroupItem value="qr" />
                  <span className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-primary" />
                    <span><div className="text-sm font-medium">Thanh toán bằng QR</div><div className="text-xs text-muted-foreground">PayOS</div></span>
                  </span>
                </label>
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${payMethod === "cod" ? "border-primary bg-accent/50" : ""}`}>
                  <RadioGroupItem value="cod" />
                  <span className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    <span><div className="text-sm font-medium">Thanh toán khi nhận hàng</div><div className="text-xs text-muted-foreground">Trả tiền mặt khi nhận</div></span>
                  </span>
                </label>
              </RadioGroup>
            </div>
          </div>

          <aside className="h-fit space-y-4 rounded-2xl border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Tóm tắt đơn hàng</h2>
            <ul className="space-y-2 text-sm">
              {items.map((it) => (
                <li key={it.id} className="flex justify-between gap-3">
                  <span className="truncate">{it.quantity}× {it.name}</span>
                  <span>{(it.price * it.quantity).toLocaleString("vi-VN")} ₫</span>
                </li>
              ))}
            </ul>
            <VoucherInput />
            <dl className="space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between"><dt>Tạm tính</dt><dd>{subtotal.toLocaleString("vi-VN")} ₫</dd></div>
              {voucher && <div className="flex justify-between text-primary"><dt>Giảm giá ({voucher.code})</dt><dd>−{discount.toLocaleString("vi-VN")} ₫</dd></div>}
              <div className="flex justify-between font-display text-base font-bold"><dt>Tổng cộng</dt><dd>{total.toLocaleString("vi-VN")} ₫</dd></div>
            </dl>
            <Button size="lg" className="w-full rounded-full" onClick={placeOrder} disabled={busy}>
              {busy ? "Đang xử lý…" : payMethod === "qr" ? "Đặt hàng & thanh toán QR" : "Đặt hàng"}
            </Button>
          </aside>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
