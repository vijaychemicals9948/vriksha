import { PRODUCT_CATEGORIES } from "@/data/productsData";
import { getCatalogSnapshot, isFirebaseCatalogEmpty } from "@/lib/admin/catalog";
import type { Category, Product, SubCategory } from "@/types/catalog";

const categoryTitles: Record<string, string> = {
  "brass-idols-on-silk": "Brass Idols on Silk",
  "brass-idols-on-gold-metal-art": "Brass Idols on Gold Metal Art",
  "brass-on-solid-wood": "Brass on Solid Wood",
  "gold-metal-art": "Gold Metal Art",
  mementos: "Mementos",
  "pooja-room-series": "Pooja Room Series",
  "indian-art-on-prabhavali": "Indian Art on Prabhavali",
  "serving-trays": "Serving Trays",
};

function normalizeStaticProduct(
  product: { id: number; title: string; img: string },
  categorySlug: string,
  subcategorySlug: string | null,
  sortOrder: number,
): Product {
  return {
    id: `${categorySlug}__${subcategorySlug ?? "direct"}__${product.id}`,
    title: product.title,
    img: product.img,
    categorySlug,
    subcategorySlug,
    sortOrder,
    isPublished: true,
  };
}

function normalizeStaticCategory(slug: string): Category | null {
  const category = PRODUCT_CATEGORIES[slug];
  if (!category) return null;

  const subcategories: SubCategory[] | undefined = category.subcategories?.map(
    (subcategory, index) => ({
      id: `${slug}__${subcategory.slug}`,
      slug: subcategory.slug,
      title: subcategory.title,
      thumb: subcategory.thumb,
      banner: subcategory.banner,
      mobileBanner: subcategory.mobileBanner,
      categorySlug: slug,
      sortOrder: index,
      isPublished: true,
      products: subcategory.products.map((product, productIndex) =>
        normalizeStaticProduct(product, slug, subcategory.slug, productIndex),
      ),
    }),
  );

  const products = category.products?.map((product, index) =>
    normalizeStaticProduct(product, slug, null, index),
  );

  return {
    id: slug,
    slug,
    title: categoryTitles[slug] ?? slug,
    banner: category.banner,
    mobileBanner: category.mobileBanner,
    sortOrder: 0,
    isPublished: true,
    products,
    subcategories,
  };
}

function getStaticCategories() {
  return Object.keys(PRODUCT_CATEGORIES)
    .map(normalizeStaticCategory)
    .filter((category): category is Category => Boolean(category))
    .map((category, index) => ({ ...category, sortOrder: index }));
}

function attachFirebaseChildren(
  category: Category,
  subcategories: SubCategory[],
  products: Product[],
): Category {
  const categorySubcategories = subcategories
    .filter((subcategory) => subcategory.categorySlug === category.slug)
    .map((subcategory) => ({
      ...subcategory,
      products: products.filter(
        (product) =>
          product.categorySlug === category.slug &&
          product.subcategorySlug === subcategory.slug,
      ),
    }));

  if (categorySubcategories.length > 0) {
    return { ...category, subcategories: categorySubcategories };
  }

  return {
    ...category,
    products: products.filter(
      (product) =>
        product.categorySlug === category.slug && !product.subcategorySlug,
    ),
  };
}

export async function getPublicCategory(slug: string) {
  try {
    const empty = await isFirebaseCatalogEmpty();
    if (!empty) {
      const snapshot = await getCatalogSnapshot({ publishedOnly: true });
      const category = snapshot.categories.find((item) => item.slug === slug);
      if (!category) return null;

      return attachFirebaseChildren(
        category,
        snapshot.subcategories,
        snapshot.products,
      );
    }
  } catch (error) {
    console.error("Failed to load Firebase catalog, using static fallback", error);
  }

  return normalizeStaticCategory(slug);
}

export async function getPublicCategories() {
  try {
    const empty = await isFirebaseCatalogEmpty();
    if (!empty) {
      const snapshot = await getCatalogSnapshot({ publishedOnly: true });
      return snapshot.categories.map((category) =>
        attachFirebaseChildren(
          category,
          snapshot.subcategories,
          snapshot.products,
        ),
      );
    }
  } catch (error) {
    console.error("Failed to load Firebase catalog menu, using static fallback", error);
  }

  return getStaticCategories();
}
