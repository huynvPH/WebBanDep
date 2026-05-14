import { useEffect, useState } from "react";
import { Check, Loader2, Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { key: "searching_driver", label: "Đang tìm tài xế", icon: Loader2 },
  { key: "picking_up", label: "Tài xế đang lấy hàng", icon: Package },
  { key: "on_the_way", label: "Đang giao tới bạn", icon: Truck },
  { key: "delivered", label: "Đã giao thành công", icon: Check },
] as const;

export function GrabTracker({ trackingId, autoAdvance = true }: { trackingId: string; autoAdvance?: boolean }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!autoAdvance) return;
    if (stage >= STAGES.length - 1) return;
    const t = setTimeout(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 2500);
    return () => clearTimeout(t);
  }, [stage, autoAdvance]);

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Grab Express</div>
          <div className="font-mono text-sm font-medium">{trackingId}</div>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {STAGES[stage].label}
        </span>
      </div>
      <ol className="mt-5 space-y-3">
        {STAGES.map((s, i) => {
          const active = i === stage;
          const done = i < stage;
          const Icon = s.icon;
          return (
            <li key={s.key} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-primary/10 text-primary",
                  !done && !active && "border-muted text-muted-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4", active && s.key === "searching_driver" && "animate-spin")} />
              </span>
              <span className={cn("text-sm", active ? "font-medium" : "text-muted-foreground")}>{s.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
