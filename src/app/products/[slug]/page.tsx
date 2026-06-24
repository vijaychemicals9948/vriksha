//src/app/products/[slug]/page.tsx
import { notFound } from "next/navigation";
import HeroCover from "@/app/components/products/HeroCover";
import ProductGallery from "@/app/components/products/ProductGallery";
import SubCategoryGrid from "@/app/components/products/SubCategoryGrid";
import { getPublicCategory } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getPublicCategory(slug);

  if (!category) return notFound();

  if (category.subcategories?.length) {
    return (
      <>
        <HeroCover
          desktopSrc={category.banner}
          mobileSrc={category.mobileBanner}
        />
        <SubCategoryGrid
          baseSlug={slug}
          subcategories={category.subcategories}
        />
      </>
    );
  }

  if (!category.products?.length) return notFound();

  return (
    <>
      <HeroCover desktopSrc={category.banner} mobileSrc={category.mobileBanner} />
      <ProductGallery products={category.products} />
    </>
  );
}
