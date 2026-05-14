import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp, TrendingDown, Target, ShoppingCart } from "lucide-react";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/")({ component: Overview });

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  pending: { label: "Chờ xử lý", variant: "secondary", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  paid: { label: "Đã thanh toán", variant: "default", className: "bg-blue-100 text-blue-700 border-blue-200" },
  shipped: { label: "Đang giao", variant: "outline", className: "bg-purple-100 text-purple-700 border-purple-200" },
  completed: { label: "Hoàn tất", variant: "default", className: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Đã hủy", variant: "destructive", className: "" },
};

const TYPE_LABEL: Record<string, string> = {
  online: "Online",
  pos: "Tại quầy",
};

function Overview() {
  const { data } = useQuery({
    queryKey: ["overview"],
    queryFn: async () => {
      const [ordersRes, productsRes, rolesRes] = await Promise.all([
        fetch("http://localhost:8081/api/orders"),
        fetch("http://localhost:8081/api/products"),
        fetch("http://localhost:8081/api/user-roles"),
      ]);
      const [orders, products, roles] = await Promise.all([
        ordersRes.ok ? ordersRes.json() : [],
        productsRes.ok ? productsRes.json() : [],
        rolesRes.ok ? rolesRes.json() : [],
      ]);
      return {
        orders: orders,
        products: products,
        customers: roles.filter((r: any) => r.role === "customer"),
      };
    },
  });

  const orders = data?.orders ?? [];
  const products = data?.products ?? [];
  const customers = data?.customers ?? [];

  const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.totalAmount || o.total_amount || 0), 0);
  
  const today = new Date().toDateString();
  const todayRevenue = orders
    .filter((o: any) => new Date(o.createdAt || o.created_at).toDateString() === today)
    .reduce((s: number, o: any) => s + Number(o.totalAmount || o.total_amount || 0), 0);

  const lowStock = products.filter((p: any) => (p.stock ?? p.stockStore ?? p.stock_store ?? 0) < 5).length;

  const revenueByType = useMemo(() => {
    const types = { online: 0, pos: 0 };
    orders.forEach((o: any) => {
      if (o.type === "pos") types.pos += Number(o.totalAmount || o.total_amount || 0);
      else types.online += Number(o.totalAmount || o.total_amount || 0);
    });
    return [
      { name: "Tại quầy", value: types.pos, color: "oklch(0.65 0.20 145)" },
      { name: "Online", value: types.online, color: "oklch(0.78 0.19 145)" },
    ];
  }, [orders]);

  const monthly = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; revenue: number; orders: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      buckets.push({
        key,
        label: `T${d.getMonth() + 1}`,
        revenue: 0,
        orders: 0,
      });
    }
    orders.forEach((o: any) => {
      const d = new Date(o.createdAt || o.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const b = buckets.find((x) => x.key === key);
      if (b) {
        b.revenue += Number(o.totalAmount || o.total_amount || 0);
        b.orders += 1;
      }
    });
    return buckets;
  }, [orders]);

  const aov = orders.length > 0 ? totalRevenue / orders.length : 0;

  const stats = [
    { 
      label: "Tổng doanh thu", 
      value: `${totalRevenue.toLocaleString("vi-VN")} ₫`, 
      sub: `Hôm nay: +${todayRevenue.toLocaleString("vi-VN")} ₫`,
      icon: DollarSign, 
      accent: "bg-primary/10 text-primary",
      trend: todayRevenue > 0 ? "up" : "neutral"
    },
    { 
      label: "Tổng đơn hàng", 
      value: orders.length, 
      sub: "Trong 30 ngày qua",
      icon: ShoppingCart, 
      accent: "bg-blue-100 text-blue-700",
      trend: "up"
    },
    { 
      label: "Khách hàng", 
      value: customers.length, 
      sub: "Người dùng đăng ký",
      icon: Users, 
      accent: "bg-purple-100 text-purple-700",
      trend: "up"
    },
    { 
      label: "Giá trị TB đơn", 
      value: `${Math.round(aov).toLocaleString("vi-VN")} ₫`, 
      sub: "Average Order Value",
      icon: Target, 
      accent: "bg-orange-100 text-orange-700",
      trend: "neutral"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Thống kê tổng quan</h1>
        <p className="text-muted-foreground">Phân tích hiệu suất kinh doanh trên mọi kênh bán hàng.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="group relative overflow-hidden rounded-3xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
            <div className="flex items-center justify-between">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${s.accent} transition-transform group-hover:scale-110`}>
                <s.icon className="h-6 w-6" />
              </div>
              {s.trend === "up" && <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full"><TrendingUp className="h-3 w-3 mr-1" /> Tăng</div>}
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <h3 className="font-display text-2xl font-bold tracking-tight">{s.value}</h3>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">Biểu đồ doanh thu</h2>
              <p className="text-sm text-muted-foreground">Thống kê theo từng tháng</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-primary" /> Doanh thu</div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.20 145)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="oklch(0.65 0.20 145)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0 0)" vertical={false} />
                <XAxis dataKey="label" stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v >= 1000000 ? `${(v / 1000000).toFixed(0)}tr` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  cursor={{ stroke: "oklch(0.65 0.20 145)", strokeWidth: 1 }}
                  contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: 12 }}
                  formatter={(v: number) => [`${v.toLocaleString("vi-VN")} ₫`, "Doanh thu"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.65 0.20 145)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-1">Kênh bán hàng</h2>
          <p className="text-sm text-muted-foreground mb-6">Tỷ trọng doanh thu</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByType} layout="vertical" margin={{ left: 10, right: 40 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                   cursor={{ fill: 'transparent' }}
                   contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                   formatter={(v: number) => [`${v.toLocaleString("vi-VN")} ₫`, ""]}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={32}>
                  {revenueByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {revenueByType.map((t) => (
              <div key={t.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-sm font-medium">{t.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{((t.value / (totalRevenue || 1)) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border bg-card overflow-hidden shadow-sm">
        <div className="p-6 border-b bg-muted/30 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Giao dịch gần đây</h2>
          <Badge variant="outline" className="rounded-full">{orders.length} tổng số đơn</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/20">
              <tr>
                <th className="px-6 py-4 font-semibold">Thời gian</th>
                <th className="px-6 py-4 font-semibold">Kênh</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders
                .slice()
                .sort((a: any, b: any) => +new Date(b.createdAt || b.created_at) - +new Date(a.createdAt || a.created_at))
                .slice(0, 10)
                .map((o: any, i: number) => {
                  const status = STATUS_CONFIG[o.status] || { label: o.status, variant: "outline", className: "" };
                  return (
                    <tr key={i} className="transition-colors hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{new Date(o.createdAt || o.created_at).toLocaleDateString("vi-VN")}</span>
                          <span className="text-xs text-muted-foreground">{new Date(o.createdAt || o.created_at).toLocaleTimeString("vi-VN")}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                           {TYPE_LABEL[o.type] ?? o.type}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant} className={`rounded-full px-3 ${status.className}`}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-base">
                        {Number(o.totalAmount || o.total_amount || 0).toLocaleString("vi-VN")} ₫
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

