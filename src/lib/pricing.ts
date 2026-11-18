export type CouponDef = {
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minSpend: number;
  label: string;
};

export const COUPONS: CouponDef[] = [
  { code: "FLOW10", type: "PERCENT", value: 10, minSpend: 5000, label: "10% off orders over ৳ 5,000" },
  { code: "DHAKA500", type: "FLAT", value: 500, minSpend: 10000, label: "৳ 500 off orders over ৳ 10,000" },
  { code: "NEW20", type: "PERCENT", value: 20, minSpend: 15000, label: "20% off orders over ৳ 15,000" },
];

export const FREE_DELIVERY_THRESHOLD = 50000;
export const DELIVERY_FEE = 100;

export type Totals = {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
};

export function resolveCoupon(subtotal: number, code: string) {
  const clean = code.trim().toUpperCase();
  if (!clean) return { coupon: null as CouponDef | null, discount: 0, error: null as string | null };
  const coupon = COUPONS.find((c) => c.code === clean) ?? null;
  if (!coupon) return { coupon: null, discount: 0, error: "Invalid coupon code." };
  if (subtotal < coupon.minSpend) {
    return {
      coupon: null,
      discount: 0,
      error: `Minimum spend for ${coupon.code} is ৳ ${coupon.minSpend.toLocaleString("en-US")}.`,
    };
  }
  const discount =
    coupon.type === "PERCENT"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);
  return { coupon, discount, error: null };
}

export function computeTotals(subtotal: number, discount: number): Totals {
  const delivery =
    subtotal === 0 ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  return {
    subtotal,
    discount,
    delivery,
    total: Math.max(0, subtotal - discount) + delivery,
  };
}
