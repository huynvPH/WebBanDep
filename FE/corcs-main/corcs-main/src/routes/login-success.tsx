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
    const fetchUser = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://webbandep-2.onrender.com";
        const res = await fetch(`${apiUrl}/api/auth/me`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          // Rất quan trọng: cho phép gửi session cookie giữa các cổng
          //@ts-ignore
          credentials: "include" 
        });

        if (res.ok) {
          const userData = await res.json();
          console.log("User data received:", userData);
          setUser(userData);
          toast.success("Đăng nhập Google thành công!");
          navigate({ to: "/" });
        } else {
          console.error("Auth me failed with status:", res.status);
          throw new Error("Xác thực thất bại: " + res.status);
        }
      } catch (error) {
        console.error("Fetch error details:", error);
        toast.error("Không thể lấy thông tin người dùng: " + (error as Error).message);
        navigate({ to: "/login" });
      }
    };

    fetchUser();
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
