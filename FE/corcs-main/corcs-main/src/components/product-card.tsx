import type { Tables } from "@/integrations/supabase/types";
import { Link } from "@tanstack/react-router";

type P = Tables<"products">;

const CATEGORY_LABEL: Record<string, string> = {
  clog: "Dép Crocs",
  charm: "Sticker Jibbitz",
};

export function ProductCard({ p }: { p: P }) {
  const img = p.images?.[0];
  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        {img ? (
          <img src={img} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">Chưa có hình</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{CATEGORY_LABEL[p.category as string] ?? p.category}</span>
        <h3 className="font-display text-base font-semibold leading-tight">{p.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-lg font-bold">{Number(p.price).toLocaleString("vi-VN")} ₫</span>
          <span className="text-xs text-muted-foreground">{p.color}</span>
        </div>
      </div>
    </Link>
  );
}
