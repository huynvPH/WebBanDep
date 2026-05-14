import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, RefreshCw, Truck, CreditCard } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

const CATEGORY_META: Record<string, { name: string; to: string }> = {
  clog: { name: "Dép Crocs", to: "/shop/clogs" },
  charm: { name: "Sticker Jibbitz", to: "/shop/charms" },
};

function Home() {
  const { data: products = [] } = useQuery({
    queryKey: ["featured"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8081/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      return data
        .filter((p: any) => p.active)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8);
    },
  });

  const heroImg = products[0]?.images?.[0];

  const categories = (() => {
    const seen = new Map<string, { name: string; to: string; img: string }>();
    for (const p of products) {
      const meta = CATEGORY_META[p.category as string];
      if (!meta || seen.has(p.category)) continue;
      seen.set(p.category, { ...meta, img: p.images?.[0] ?? "" });
    }
    return Array.from(seen.values());
  })();

  return (
    <div className="flex min-h-screen flex-col bg-background" suppressHydrationWarning>
      <StoreHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-[oklch(0.94_0.10_145)] shadow-sm">
            <div className="grid items-center gap-6 p-8 md:grid-cols-2 md:p-12 lg:p-16">
              <div className="relative z-10">
                <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl">
                  Thể Hiện<br />Phong Cách
                </h1>
                <p className="mt-4 max-w-md text-base text-foreground/70">
                  Dép Crocs cá tính cùng sticker Jibbitz™. Để mỗi bước chân là một dấu ấn riêng.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-full bg-foreground px-7 font-semibold text-background hover:bg-foreground/90">
                    <Link to="/shop">Mua ngay <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full border-foreground/20 bg-background/60 px-7 font-semibold backdrop-blur">
                    <Link to="/shop/charms">Khám phá sticker</Link>
                  </Button>
                </div>
              </div>
              <div className="relative aspect-square w-full max-w-md justify-self-center md:justify-self-end">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[oklch(0.85_0.18_145)] to-[oklch(0.78_0.19_145)]" />
                {heroImg && (
                  <img
                    src={heroImg}
                    alt={products[0]?.name ?? "Sản phẩm nổi bật"}
                    className="relative h-full w-full -rotate-6 object-contain p-6 drop-shadow-2xl"
                  />
                )}
                <div className="absolute -left-2 top-12 h-10 w-10 rounded-full bg-yellow-300 shadow-lg" />
                <div className="absolute right-2 top-4 h-8 w-8 rounded-full bg-pink-300 shadow-lg" />
                <div className="absolute -right-1 bottom-16 h-12 w-12 rounded-full bg-orange-300 shadow-lg" />
                <div className="absolute bottom-2 left-8 h-9 w-9 rounded-full bg-sky-300 shadow-lg" />
              </div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:grid-cols-4">
            {[
              { icon: ShieldCheck, t: "100% Chính hãng", s: "Phân phối ủy quyền tại Việt Nam" },
              { icon: RefreshCw, t: "Đổi trả dễ dàng", s: "Trong vòng 7 ngày" },
              { icon: Truck, t: "Giao hàng nhanh", s: "Toàn quốc qua Grab" },
              { icon: CreditCard, t: "Thanh toán an toàn", s: "Đa dạng phương thức" },
            ].map((b) => (
              <div key={b.t} className="flex items-center gap-3 px-2">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground">
                  <b.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{b.t}</div>
                  <div className="truncate text-xs text-muted-foreground">{b.s}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Categories */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold tracking-tight">Danh mục nổi bật</h2>
            <Link to="/shop" className="text-sm font-medium text-primary hover:underline">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.name}
                to={c.to}
                className="group flex flex-col items-center gap-3 rounded-xl p-3 text-center transition hover:bg-muted/40"
              >
                <div className="aspect-square w-full overflow-hidden rounded-full border bg-muted shadow-sm transition group-hover:shadow-md">
                  <img src={c.img} alt={c.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-xs text-primary">Mua ngay →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Sản phẩm mới về</h2>
              <p className="mt-1 text-sm text-muted-foreground">Những mẫu dép và sticker được đội ngũ tuyển chọn.</p>
            </div>
            <Link to="/shop" className="hidden text-sm font-medium text-primary hover:underline sm:block">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p: any) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
