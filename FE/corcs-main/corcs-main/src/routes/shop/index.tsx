import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/shop/")({
  component: () => <ShopPage />,
});

export function ShopPage({ category }: { category?: "clog" | "charm" }) {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", category ?? "all"],
    queryFn: async () => {
      const res = await fetch("https://webbandep-2.onrender.com/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      let data = await res.json();
      data = data.filter((p: any) => p.active);
      if (category) data = data.filter((p: any) => p.category === category);
      data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return data;
    },
  });

  const title = category === "clog" ? "Dép Crocs" : category === "charm" ? "Sticker Jibbitz" : "Tất cả sản phẩm";

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{products.length} sản phẩm</p>
        {isLoading ? (
          <div className="mt-10 text-center text-muted-foreground">Đang tải…</div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p: any) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}
