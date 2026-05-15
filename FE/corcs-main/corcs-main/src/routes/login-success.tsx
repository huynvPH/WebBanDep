import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/login-success")({
  component: LoginSuccessPage,
});

function LoginSuccessPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const username = urlParams.get("username");
    const fullName = urlParams.get("fullName");
    const role = urlParams.get("role");

    if (id && username) {
      const userData = { id, username, fullName, role };
      setUser(userData);
      toast.success("Đăng nhập Google thành công!");
      navigate({ to: "/" });
    } else {
      toast.error("Đăng nhập thất bại, vui lòng thử lại.");
      navigate({ to: "/login" });
    }
  }, [navigate, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Đang xử lý đăng nhập...</h2>
        <p className="text-muted-foreground">Vui lòng đợi trong giây lát.</p>
      </div>
    </div>
  );
}
