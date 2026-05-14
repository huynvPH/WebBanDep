import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";
import { ShoppingBag, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/product/$id")({ component: ProductDetail });

function ProductDetail() {
  const { id } = Route.useParams();
  const { add } = useCart();
  const navigate = useNavigate();
  const { data: p, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:8081/api/products/${id}`);
      if (!res.ok) throw new Error("Product not found");
      return await res.json();
    },
  });

  if (isLoading) return <div className="p-10 text-center">Đang tải…</div>;
  if (!p) return <div className="p-10 text-center">Không tìm thấy sản phẩm</div>;

  const img = p.images?.[0] ?? "";
  const inStock = (p.stockOnline ?? p.stock_online ?? 0) + (p.stockStore ?? p.stock_store ?? 0);

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/shop" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /> Quay lại cửa hàng</Link>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-muted">
            <img src={img} alt={p.name} className="aspect-square w-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">{p.category === "clog" ? "Dép Crocs" : p.category === "charm" ? "Sticker Jibbitz" : p.category}</span>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">{p.name}</h1>
            <p className="mt-3 font-display text-3xl font-bold">{Number(p.price).toLocaleString("vi-VN")} ₫</p>
            <p className="mt-5 text-muted-foreground">{p.description}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-muted-foreground">Mã SKU</dt><dd className="font-medium">{p.sku}</dd></div>
              <div><dt className="text-muted-foreground">Màu sắc</dt><dd className="font-medium">{p.color}</dd></div>
              <div><dt className="text-muted-foreground">Kích cỡ</dt><dd className="font-medium">{p.size}</dd></div>
              <div><dt className="text-muted-foreground">Tồn kho</dt><dd className="font-medium">{inStock}</dd></div>
            </dl>
            <div className="mt-8 flex gap-3">
              <Button
                size="lg"
                className="flex-1 rounded-full"
                disabled={inStock === 0}
                onClick={() => {
                  add({ id: p.id, name: p.name, price: Number(p.price), image: img });
                  toast.success("Đã thêm vào giỏ hàng");
                }}
              >
                <ShoppingBag className="mr-2 h-4 w-4" /> Thêm vào giỏ
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  add({ id: p.id, name: p.name, price: Number(p.price), image: img });
                  navigate({ to: "/cart" });
                }}
              >Mua ngay</Button>
            </div>
          </div>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
