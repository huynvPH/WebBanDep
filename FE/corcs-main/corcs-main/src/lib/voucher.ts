import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export type Voucher = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order: number;
  usage_limit: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
};

const codeSchema = z
  .string()
  .trim()
  .min(2, { message: "Mã quá ngắn" })
  .max(40, { message: "Mã quá dài" })
  .regex(/^[A-Za-z0-9_-]+$/, { message: "Mã không hợp lệ" });

export type VoucherValidation =
  | { ok: true; voucher: Voucher; discount: number }
  | { ok: false; error: string };

export function computeDiscount(v: Pick<Voucher, "discount_type" | "discount_value">, subtotal: number) {
  const value = Number(v.discount_value);
  const raw = v.discount_type === "percent" ? (subtotal * value) / 100 : value;
  return Math.max(0, Math.min(subtotal, Math.round(raw)));
}

export async function validateVoucher(rawCode: string, subtotal: number): Promise<VoucherValidation> {
  const parsed = codeSchema.safeParse(rawCode);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const code = parsed.data.toUpperCase();

  const { data, error } = await supabase
    .from("vouchers")
    .select("id, code, discount_type, discount_value, min_order, usage_limit, used_count, active, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (error) return { ok: false, error: "Không thể kiểm tra mã giảm giá" };
  if (!data) return { ok: false, error: "Không tìm thấy mã giảm giá" };

  const v = data as Voucher;
  if (!v.active) return { ok: false, error: "Mã giảm giá đã ngừng hoạt động" };
  if (v.expires_at && new Date(v.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "Mã giảm giá đã hết hạn" };
  }
  if (v.usage_limit !== null && v.used_count >= v.usage_limit) {
    return { ok: false, error: "Mã giảm giá đã hết lượt sử dụng" };
  }
  if (subtotal < Number(v.min_order)) {
    return { ok: false, error: `Đơn hàng tối thiểu ${Number(v.min_order).toLocaleString("vi-VN")} ₫` };
  }

  return { ok: true, voucher: v, discount: computeDiscount(v, subtotal) };
}
