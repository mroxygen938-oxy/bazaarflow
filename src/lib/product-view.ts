import type { ProductCardData } from "@/components/product/product-card";

type ProductWithRelations = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  price: number;
  oldPrice: number | null;
  image: string;
  rating: number;
  reviewCount: number;
  stock: number;
  badge: string | null;
  shop?: { name: string } | null;
  category?: { name: string } | null;
};

export function toCard(p: ProductWithRelations): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    price: p.price,
    oldPrice: p.oldPrice,
    image: p.image,
    rating: p.rating,
    reviewCount: p.reviewCount,
    stock: p.stock,
    badge: p.badge,
    shopName: p.shop?.name,
    category: p.category?.name,
  };
}

export const productInclude = {
  shop: { select: { name: true } },
  category: { select: { name: true } },
} as const;
