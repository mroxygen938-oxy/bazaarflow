export type ProductLite = {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  rating?: number;
  shopName?: string;
  category?: string;
};

export type CartItem = ProductLite & { quantity: number };

export type ToastKind = "success" | "info" | "error";
export type Toast = { id: number; message: string; kind: ToastKind };
