import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: LoginPage,
});

function LoginPage() {
  const { user, isStaffish, loading, setUser } = useAuth();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: search.redirect ?? (isStaffish ? "/admin" : "/") });
  }, [user, loading, isStaffish, navigate, search.redirect]);

  const signIn = async () => {
    setBusy(true);
    try {
      const res = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Login failed");
      }
      const data = await res.json();
      setUser(data);
      toast.success("Chào mừng quay trở lại");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };
  const signUp = async () => {
    if (!name || !username || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("http://localhost:8081/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, username, password })
      });
      if (!res.ok) {
        throw new Error("Tạo tài khoản thất bại");
      }
      toast.success("Tạo tài khoản thành công! Vui lòng đăng nhập.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden bg-primary md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="font-display text-xl font-bold">Sole &amp; Charm</Link>
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">Bước vào. <br />Tỏa sáng.</h2>
            <p className="mt-3 max-w-sm opacity-80">Đăng nhập để đồng bộ giỏ hàng, theo dõi đơn hàng và nhận ưu đãi thành viên.</p>
          </div>
          <div className="text-xs opacity-70">© Sole &amp; Charm</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-6 inline-block font-display text-lg font-bold md:hidden">Sole &amp; Charm</Link>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Đăng nhập</TabsTrigger>
              <TabsTrigger value="signup">Tạo tài khoản</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6 space-y-4">
              <div><Label>Tài khoản</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1" /></div>
              <div><Label>Mật khẩu</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" /></div>
              <Button className="w-full rounded-full" onClick={signIn} disabled={busy}>{busy ? "Đang đăng nhập…" : "Đăng nhập"}</Button>
            </TabsContent>
            <TabsContent value="signup" className="mt-6 space-y-4">
              <div><Label>Họ và tên</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
              <div><Label>Tài khoản</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1" /></div>
              <div><Label>Mật khẩu</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" /></div>
              <Button className="w-full rounded-full" onClick={signUp} disabled={busy}>{busy ? "Đang tạo…" : "Tạo tài khoản"}</Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

