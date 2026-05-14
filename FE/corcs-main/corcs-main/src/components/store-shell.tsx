import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, User, LogOut, LayoutDashboard, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CartDrawer } from "@/components/cart-drawer";
import { useState } from "react";

export function StoreHeader() {
  const { user, isStaffish, signOut } = useAuth();
  const { count } = useCart();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [cartOpen, setCartOpen] = useState(false);

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm font-medium uppercase tracking-wide transition-colors hover:text-primary ${
        path === to ? "text-foreground" : "text-foreground/70"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary font-display text-lg font-black text-primary-foreground">
              C
            </div>
            <span className="font-display text-xl font-black tracking-tight">crocs</span>
          </Link>

          <div className="relative hidden flex-1 max-w-xl md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm dép, sticker, màu sắc…"
              className="h-10 rounded-full border-muted bg-muted/50 pl-9"
            />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {!user && (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button asChild size="sm" className="hidden rounded-full font-semibold sm:inline-flex">
                  <Link to="/login">Đăng ký</Link>
                </Button>
              </>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
              aria-label="Mở giỏ hàng"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </button>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="truncate px-2 py-1.5 text-xs text-muted-foreground">{user.email}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account">Đơn hàng của tôi</Link>
                  </DropdownMenuItem>
                  {isStaffish && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Quản trị
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <nav className="mx-auto hidden h-11 max-w-7xl items-center gap-7 border-t border-border/60 px-4 sm:px-6 md:flex lg:px-8">
          {navLink("/", "Trang chủ")}
          {navLink("/shop", "Cửa hàng")}
          {navLink("/shop/clogs", "Dép Crocs")}
          {navLink("/shop/charms", "Sticker Jibbitz")}
          <span className="text-sm font-medium uppercase tracking-wide text-foreground/70">Khuyến mãi</span>
          <span className="text-sm font-medium uppercase tracking-wide text-foreground/70">Hệ thống cửa hàng</span>
        </nav>
      </header>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}

export function StoreFooter() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-foreground py-12 text-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary font-display text-lg font-black text-primary-foreground">
              C
            </div>
            <span className="font-display text-xl font-black tracking-tight">crocs</span>
          </div>
          <p className="mt-3 text-sm text-background/60">Êm ái theo từng bước chân. Thể hiện phong cách riêng cùng dép Crocs và sticker Jibbitz.</p>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase">Mua sắm</h4>
          <ul className="mt-3 space-y-1.5 text-sm text-background/70">
            <li><Link to="/shop/clogs">Dép Crocs</Link></li>
            <li><Link to="/shop/charms">Sticker Jibbitz</Link></li>
            <li><Link to="/shop">Tất cả sản phẩm</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase">Hỗ trợ</h4>
          <ul className="mt-3 space-y-1.5 text-sm text-background/70">
            <li>Vận chuyển &amp; nhận tại cửa hàng</li>
            <li>Đổi trả</li>
            <li>Liên hệ</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase">Về chúng tôi</h4>
          <ul className="mt-3 space-y-1.5 text-sm text-background/70">
            <li>Giới thiệu</li>
            <li>Hệ thống cửa hàng</li>
            <li>Báo chí</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-background/10 px-4 pt-6 text-xs text-background/50 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Sole &amp; Charm. Crocs và Jibbitz, đa kênh bán hàng.
      </div>
    </footer>
  );
}
