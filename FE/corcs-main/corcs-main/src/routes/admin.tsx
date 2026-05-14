import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-store";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarHeader,
} from "@/components/ui/sidebar";
import { LayoutDashboard, ShoppingCart, Package, Receipt, Tag, Users, LogOut, Store } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

const items = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { to: "/admin/pos", label: "Bán tại quầy", icon: ShoppingCart },
  { to: "/admin/inventory", label: "Quản lý kho", icon: Package },
  { to: "/admin/orders", label: "Đơn hàng", icon: Receipt },
  { to: "/admin/vouchers", label: "Mã giảm giá", icon: Tag },
  { to: "/admin/users", label: "Người dùng & vai trò", icon: Users },
];

function AdminLayout() {
  const { user, isStaffish, loading, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading) {
      if (!user) navigate({ to: "/login", search: { redirect: "/admin" } });
      else if (!isStaffish) navigate({ to: "/" });
    }
  }, [user, isStaffish, loading, navigate]);

  if (loading || !user || !isStaffish) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Đang tải…</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Link to="/admin" className="flex items-center gap-2 px-2 py-1">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-display font-bold">S</div>
              <div className="flex flex-col">
                <span className="font-display text-sm font-bold leading-tight">Sole &amp; Charm</span>
                <span className="text-[10px] text-muted-foreground">Bảng điều hành</span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Khu vực làm việc</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((it) => {
                    const active = it.exact ? path === it.to : path.startsWith(it.to);
                    return (
                      <SidebarMenuItem key={it.to}>
                        <SidebarMenuButton asChild isActive={active}>
                          <Link to={it.to}><it.icon /><span>{it.label}</span></Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Tài khoản</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/"><Store /><span>Xem cửa hàng</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => signOut()}>
                      <LogOut /><span>Đăng xuất</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center justify-between gap-3 border-b bg-background px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground">Đang đăng nhập: <span className="text-foreground">{user.email}</span></span>
            </div>
            <div className="flex items-center gap-2">
              {roles.map((r) => (
                <span key={r} className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold capitalize text-accent-foreground">{r}</span>
              ))}
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-muted/30 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
