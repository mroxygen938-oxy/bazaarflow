import { db } from "@/lib/db";
import { GroupShopping } from "@/components/groups/group-shopping";

export const dynamic = "force-dynamic";
export const metadata = { title: "Group Shopping" };

export default async function GroupsPage() {
  const [groupBuys, products] = await Promise.all([
    db.groupBuy.findMany({ orderBy: { endsAt: "asc" } }),
    db.product.findMany({
      take: 16,
      orderBy: { price: "asc" },
      include: { category: { select: { name: true } } },
    }),
  ]);

  return (
    <GroupShopping
      campaigns={groupBuys.map((g) => ({
        slug: g.slug,
        title: g.title,
        description: g.description,
        productImage: g.productImage,
        targetMembers: g.targetMembers,
        members: g.members,
        price: g.price,
        oldPrice: g.oldPrice,
      }))}
      products={products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        image: p.image,
        categoryName: p.category.name,
      }))}
    />
  );
}
