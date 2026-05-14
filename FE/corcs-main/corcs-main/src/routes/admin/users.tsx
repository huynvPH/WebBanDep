import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: Users });

const ALL_ROLES = ["admin", "staff", "warehouse", "customer"] as const;

const ROLE_LABEL: Record<string, string> = {
  admin: "Quản trị",
  staff: "Nhân viên",
  warehouse: "Kho",
  customer: "Khách hàng",
};

function Users() {
  const qc = useQueryClient();
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const { data = { profiles: [], roles: [] } } = useQuery({
    queryKey: ["users-roles"],
    queryFn: async () => {
      const [pRes, rRes] = await Promise.all([
        fetch("https://webbandep-2.onrender.com/api/profiles"),
        fetch("https://webbandep-2.onrender.com/api/user-roles"),
      ]);
      const [p, r] = await Promise.all([
        pRes.ok ? pRes.json() : [],
        rRes.ok ? rRes.json() : [],
      ]);
      return { profiles: p, roles: r };
    },
  });

  const rolesFor = (uid: string) => data.roles.filter((r: any) => r.userId === uid || r.user_id === uid).map((r: any) => r.role);

  const toggleRole = async (uid: string, role: string, has: boolean) => {
    if (!isAdmin) return;
    try {
      if (has) {
        // Need to find the role ID first to delete
        const r = data.roles.find((r: any) => (r.userId === uid || r.user_id === uid) && r.role === role);
        if (r && r.id) {
          const res = await fetch(`https://webbandep-2.onrender.com/api/user-roles/${r.id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to delete role");
        }
      } else {
        const res = await fetch("https://webbandep-2.onrender.com/api/user-roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: uid, role }),
        });
        if (!res.ok) throw new Error("Failed to add role");
      }
      qc.invalidateQueries({ queryKey: ["users-roles"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Người dùng &amp; vai trò</h1>
        <p className="text-sm text-muted-foreground">{isAdmin ? "Bấm vào nhãn vai trò để bật/tắt." : "Chỉ quản trị viên mới có thể thay đổi vai trò."}</p>
      </div>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Họ tên</th><th>Email</th><th>Vai trò</th></tr>
          </thead>
          <tbody className="divide-y">
            {data.profiles.map((p: any) => {
              const rs = rolesFor(p.id);
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.fullName || p.full_name || p.username || "—"}</td>
                  <td className="text-muted-foreground">{p.email || p.username}</td>
                  <td>
                    <div className="flex flex-wrap gap-1.5 py-2">
                      {ALL_ROLES.map((r) => {
                        const has = rs.includes(r);
                        return (
                          <Button
                            key={r}
                            size="sm"
                            variant={has ? "default" : "outline"}
                            disabled={!isAdmin}
                            className="h-7 rounded-full px-3 text-[11px]"
                            onClick={() => toggleRole(p.id, r, has)}
                          >{ROLE_LABEL[r]}</Button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
