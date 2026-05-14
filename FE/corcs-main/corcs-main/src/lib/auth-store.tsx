import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "staff" | "warehouse" | "customer";

type AuthCtx = {
  user: any;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (r: AppRole) => boolean;
  isStaffish: boolean;
  setUser: (user: any) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserState(parsed);
        if (parsed.role) {
          setRoles([parsed.role as AppRole]);
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    setLoading(false);
  }, []);

  const setUser = (newUser: any) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      if (newUser.role) {
        setRoles([newUser.role as AppRole]);
      } else {
        setRoles(["customer"]);
      }
    } else {
      localStorage.removeItem("user");
      setRoles([]);
    }
  };

  const hasRole = (r: AppRole) => roles.includes(r);
  const isStaffish = roles.some((r) => r === "admin" || r === "staff" || r === "warehouse");

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        roles,
        loading,
        signOut: async () => {
          setUser(null);
          localStorage.removeItem("user");
        },
        hasRole,
        isStaffish,
        setUser,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
