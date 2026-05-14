import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { VoucherInput } from "@/components/voucher-input";

export function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { items, setQty, remove, subtotal, count, discount, total, voucher } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="flex items-center gap-2 font-bold">
            <ShoppingBag className="h-5 w-5" />
            Giỏ hàng {count > 0 && <span className="text-muted-foreground">({count})</span>}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Giỏ hàng của bạn đang trống.</p>
            <Button asChild className="mt-2 rounded-full" onClick={() => onOpenChange(false)}>
              <Link to="/shop">Bắt đầu mua sắm</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-6">
              {items.map((it) => (
                <li key={it.id} className="flex gap-3 py-4">
                  <img
                    src={it.image}
                    alt={it.name}
                    className="h-20 w-20 flex-none rounded-xl object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-snug">{it.name}</h3>
                      <button
                        onClick={() => remove(it.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold">{(it.price * it.quantity).toLocaleString("vi-VN")} ₫</span>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded-full border bg-background">
                        <button
                          onClick={() => setQty(it.id, it.quantity - 1)}
                          className="grid h-8 w-8 place-items-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{it.quantity}</span>
                        <button
                          onClick={() => setQty(it.id, it.quantity + 1)}
                          className="grid h-8 w-8 place-items-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-xs text-muted-foreground">{it.price.toLocaleString("vi-VN")} ₫/sp</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t bg-muted/30 px-6 py-5 space-y-3">
              <VoucherInput compact />
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Tạm tính</dt><dd>{subtotal.toLocaleString("vi-VN")} ₫</dd></div>
                {voucher && (
                  <div className="flex justify-between text-primary"><dt>Giảm giá ({voucher.code})</dt><dd>−{discount.toLocaleString("vi-VN")} ₫</dd></div>
                )}
                <div className="flex justify-between text-base font-semibold pt-1 border-t"><dt>Tổng cộng</dt><dd>{total.toLocaleString("vi-VN")} ₫</dd></div>
              </dl>
              <p className="text-xs text-muted-foreground">Phí vận chuyển sẽ tính ở bước thanh toán.</p>
              <Button
                asChild
                size="lg"
                className="mt-4 w-full rounded-full font-semibold"
                onClick={() => onOpenChange(false)}
              >
                <Link to="/checkout">Tiến hành thanh toán</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="mt-1 w-full"
                onClick={() => onOpenChange(false)}
              >
                <Link to="/cart">Xem giỏ hàng đầy đủ</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
