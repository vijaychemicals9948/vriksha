//src/app/products/[slug]/[subcategory]/page.tsx
import { notFound } from "next/navigation";
import HeroCover from "@/app/components/products/HeroCover";
import ProductGallery from "@/app/components/products/ProductGallery";
import { getPublicCategory } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; subcategory: string }>;
};

export default async function SubCategoryPage({ params }: PageProps) {
  const { slug, subcategory: subSlug } = await params;
  const category = await getPublicCategory(slug);

  if (!category?.subcategories?.length) return notFound();

  const subcategory = category.subcategories.find((item) => item.slug === subSlug);
  if (!subcategory?.products?.length) return notFound();

  return (
    <>
      <HeroCover
        desktopSrc={subcategory.banner}
        mobileSrc={subcategory.mobileBanner}
      />
      <ProductGallery products={subcategory.products} />
    </>
  );
}
