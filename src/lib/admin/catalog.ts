import {
  FieldValue,
  type DocumentData,
  type Query,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { slugify } from "@/lib/slugify";
import { PRODUCT_CATEGORIES } from "@/data/productsData";
import type {
  CatalogSnapshot,
  Category,
  Product,
  SubCategory,
} from "@/types/catalog";

const COLLECTIONS = {
  categories: "categories",
  subcategories: "subcategories",
  products: "products",
  inquiries: "inquiries",
} as const;

const categoryMeta: Record<string, { title: string; cardImage?: string }> = {
  "brass-idols-on-silk": {
    title: "Brass Idols on Silk",
    cardImage: "/homepage/categories/brass-idols-on-silk-vertical.webp",
  },
  "brass-idols-on-gold-metal-art": {
    title: "Brass Idols on Gold Metal Art",
    cardImage: "/homepage/categories/brass-idols-on-gold-metal-vertical.webp",
  },
  "brass-on-solid-wood": {
    title: "Brass on Solid Wood",
    cardImage: "/homepage/categories/brass-on-solid-wood-vertical.webp",
  },
  "pooja-room-series": {
    title: "Pooja Room Series",
    cardImage: "/homepage/categories/pooja-room-series-vertical.webp",
  },
  "gold-metal-art": {
    title: "Gold Metal Art",
    cardImage: "/homepage/categories/gold-metalart-vertical.webp",
  },
  "indian-art-on-prabhavali": {
    title: "Indian Art on Prabhavali",
    cardImage: "/homepage/categories/indian-art-on-prabhavali-vertical.webp",
  },
  "serving-trays": {
    title: "Serving Trays",
    cardImage: "/homepage/categories/serving-trays-vertical.webp",
  },
  mementos: {
    title: "Mementos",
    cardImage: "/homepage/categories/mementos-vertical.webp",
  },
};

function sortByOrder<T extends { sortOrder: number; title?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return (a.title ?? "").localeCompare(b.title ?? "");
  });
}

function cleanOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function hasOwn(object: object, key: string) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function cleanUpdateInput(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );
}

async function deleteQueryDocuments(
  query: Query<DocumentData>,
  shouldDelete?: (doc: QueryDocumentSnapshot<DocumentData>) => boolean,
) {
  const snapshot = await query.get();
  const docs = shouldDelete ? snapshot.docs.filter(shouldDelete) : snapshot.docs;

  for (let index = 0; index < docs.length; index += 450) {
    const batch = adminDb.batch();
    docs.slice(index, index + 450).forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  return docs.length;
}

function toCategory(
  doc: QueryDocumentSnapshot<DocumentData>,
): Category {
  const data = doc.data();
  return {
    id: doc.id,
    slug: String(data.slug ?? doc.id),
    title: String(data.title ?? doc.id),
    banner: String(data.banner ?? ""),
    mobileBanner: cleanOptionalString(data.mobileBanner),
    cardImage: cleanOptionalString(data.cardImage),
    sortOrder: Number(data.sortOrder ?? 0),
    isPublished: data.isPublished !== false,
  };
}

function toSubCategory(
  doc: QueryDocumentSnapshot<DocumentData>,
): SubCategory {
  const data = doc.data();
  return {
    id: doc.id,
    slug: String(data.slug ?? doc.id),
    title: String(data.title ?? doc.id),
    categorySlug: String(data.categorySlug ?? ""),
    thumb: String(data.thumb ?? ""),
    banner: String(data.banner ?? ""),
    mobileBanner: cleanOptionalString(data.mobileBanner),
    sortOrder: Number(data.sortOrder ?? 0),
    isPublished: data.isPublished !== false,
  };
}

function toProduct(
  doc: QueryDocumentSnapshot<DocumentData>,
): Product {
  const data = doc.data();
  const subcategorySlug = cleanOptionalString(data.subcategorySlug) ?? null;
  return {
    id: doc.id,
    title: String(data.title ?? "Untitled product"),
    img: String(data.img ?? ""),
    zoomImg: cleanOptionalString(data.zoomImg),
    categorySlug: String(data.categorySlug ?? ""),
    subcategorySlug,
    sortOrder: Number(data.sortOrder ?? 0),
    isPublished: data.isPublished !== false,
  };
}

export async function getCatalogSnapshot(options?: {
  publishedOnly?: boolean;
}): Promise<CatalogSnapshot> {
  const [categorySnap, subcategorySnap, productSnap] = await Promise.all([
    adminDb.collection(COLLECTIONS.categories).get(),
    adminDb.collection(COLLECTIONS.subcategories).get(),
    adminDb.collection(COLLECTIONS.products).get(),
  ]);

  const filterPublished = <T extends { isPublished: boolean }>(items: T[]) =>
    options?.publishedOnly ? items.filter((item) => item.isPublished) : items;

  const categories = sortByOrder(
    filterPublished(categorySnap.docs.map(toCategory)),
  );
  const subcategories = sortByOrder(
    filterPublished(subcategorySnap.docs.map(toSubCategory)),
  );
  const products = sortByOrder(filterPublished(productSnap.docs.map(toProduct)));

  return { categories, subcategories, products };
}

export function getEmptyCatalogSnapshot(): CatalogSnapshot {
  return {
    categories: [],
    subcategories: [],
    products: [],
  };
}

export async function getCatalogSnapshotSafe(options?: {
  publishedOnly?: boolean;
}) {
  try {
    return {
      catalog: await getCatalogSnapshot(options),
      error: null as string | null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load Firebase catalog";
    return {
      catalog: getEmptyCatalogSnapshot(),
      error: message,
    };
  }
}

export async function isFirebaseCatalogEmpty() {
  const snapshot = await adminDb.collection(COLLECTIONS.categories).limit(1).get();
  return snapshot.empty;
}

export async function createCategory(input: {
  title: string;
  slug?: string;
  banner: string;
  mobileBanner?: string;
  cardImage?: string;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  const slug = slugify(input.slug || input.title);
  if (!slug) throw new Error("Category slug is required");

  const ref = adminDb.collection(COLLECTIONS.categories).doc(slug);
  const existing = await ref.get();
  if (existing.exists) throw new Error("Category already exists");

  const now = FieldValue.serverTimestamp();
  await ref.set({
    slug,
    title: input.title.trim(),
    banner: input.banner.trim(),
    mobileBanner: input.mobileBanner?.trim() || null,
    cardImage: input.cardImage?.trim() || null,
    sortOrder: Number(input.sortOrder ?? 0),
    isPublished: input.isPublished !== false,
    createdAt: now,
    updatedAt: now,
  });

  return { id: slug, slug };
}

export async function updateCategory(
  id: string,
  input: Partial<Omit<Category, "id" | "slug" | "products" | "subcategories">>,
) {
  const update = cleanUpdateInput(input as Record<string, unknown>);
  if (hasOwn(input, "mobileBanner")) {
    update.mobileBanner = input.mobileBanner || null;
  }
  if (hasOwn(input, "cardImage")) {
    update.cardImage = input.cardImage || null;
  }

  await adminDb
    .collection(COLLECTIONS.categories)
    .doc(id)
    .update({
      ...update,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function deleteCategory(id: string) {
  await Promise.all([
    deleteQueryDocuments(
      adminDb
        .collection(COLLECTIONS.subcategories)
        .where("categorySlug", "==", id),
    ),
    deleteQueryDocuments(
      adminDb.collection(COLLECTIONS.products).where("categorySlug", "==", id),
    ),
  ]);

  await adminDb.collection(COLLECTIONS.categories).doc(id).delete();
}

export async function createSubcategory(input: {
  title: string;
  slug?: string;
  categorySlug: string;
  thumb: string;
  banner: string;
  mobileBanner?: string;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  const slug = slugify(input.slug || input.title);
  if (!slug) throw new Error("Subcategory slug is required");

  const id = `${input.categorySlug}__${slug}`;
  const ref = adminDb.collection(COLLECTIONS.subcategories).doc(id);
  const existing = await ref.get();
  if (existing.exists) throw new Error("Subcategory already exists");

  const now = FieldValue.serverTimestamp();
  await ref.set({
    slug,
    title: input.title.trim(),
    categorySlug: input.categorySlug,
    thumb: input.thumb.trim(),
    banner: input.banner.trim(),
    mobileBanner: input.mobileBanner?.trim() || null,
    sortOrder: Number(input.sortOrder ?? 0),
    isPublished: input.isPublished !== false,
    createdAt: now,
    updatedAt: now,
  });

  return { id, slug };
}

export async function updateSubcategory(
  id: string,
  input: Partial<Omit<SubCategory, "id" | "slug" | "products">>,
) {
  const update = cleanUpdateInput(input as Record<string, unknown>);
  if (hasOwn(input, "mobileBanner")) {
    update.mobileBanner = input.mobileBanner || null;
  }

  await adminDb
    .collection(COLLECTIONS.subcategories)
    .doc(id)
    .update({
      ...update,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function deleteSubcategory(id: string) {
  const subcategoryRef = adminDb.collection(COLLECTIONS.subcategories).doc(id);
  const snapshot = await subcategoryRef.get();
  const data = snapshot.data();
  const [categoryFromId, ...slugParts] = id.split("__");
  const categorySlug = String(data?.categorySlug ?? categoryFromId ?? "");
  const slug = String(data?.slug ?? slugParts.join("__"));

  if (slug) {
    await deleteQueryDocuments(
      adminDb.collection(COLLECTIONS.products).where("subcategorySlug", "==", slug),
      (doc) => !categorySlug || doc.data().categorySlug === categorySlug,
    );
  }

  await subcategoryRef.delete();
}

export async function createProduct(input: {
  title: string;
  categorySlug: string;
  subcategorySlug?: string | null;
  img: string;
  zoomImg?: string;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  const now = FieldValue.serverTimestamp();
  const ref = await adminDb.collection(COLLECTIONS.products).add({
    title: input.title.trim(),
    categorySlug: input.categorySlug,
    subcategorySlug: input.subcategorySlug || null,
    img: input.img.trim(),
    zoomImg: input.zoomImg?.trim() || null,
    sortOrder: Number(input.sortOrder ?? 0),
    isPublished: input.isPublished !== false,
    createdAt: now,
    updatedAt: now,
  });

  return { id: ref.id };
}

export async function updateProduct(
  id: string,
  input: Partial<Omit<Product, "id">>,
) {
  const update = cleanUpdateInput(input as Record<string, unknown>);
  if (hasOwn(input, "subcategorySlug")) {
    update.subcategorySlug = input.subcategorySlug || null;
  }
  if (hasOwn(input, "zoomImg")) {
    update.zoomImg = input.zoomImg || null;
  }

  await adminDb
    .collection(COLLECTIONS.products)
    .doc(id)
    .update({
      ...update,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function deleteProduct(id: string) {
  await adminDb.collection(COLLECTIONS.products).doc(id).delete();
}

export async function seedCatalogFromStaticData() {
  const batch = adminDb.batch();
  const now = FieldValue.serverTimestamp();
  let productCount = 0;
  let subcategoryCount = 0;

  Object.entries(PRODUCT_CATEGORIES).forEach(([categorySlug, category], index) => {
    const meta = categoryMeta[categorySlug] ?? {
      title: categorySlug
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    };
    const categoryRef = adminDb
      .collection(COLLECTIONS.categories)
      .doc(categorySlug);

    batch.set(
      categoryRef,
      {
        slug: categorySlug,
        title: meta.title,
        banner: category.banner,
        mobileBanner: category.mobileBanner || null,
        cardImage: meta.cardImage || null,
        sortOrder: index,
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );

    category.products?.forEach((product, productIndex) => {
      const id = `${categorySlug}__direct__${product.id}`;
      const productRef = adminDb.collection(COLLECTIONS.products).doc(id);
      productCount += 1;
      batch.set(
        productRef,
        {
          title: product.title,
          categorySlug,
          subcategorySlug: null,
          img: product.img,
          zoomImg: null,
          sortOrder: productIndex,
          isPublished: true,
          createdAt: now,
          updatedAt: now,
        },
        { merge: true },
      );
    });

    category.subcategories?.forEach((subcategory, subcategoryIndex) => {
      const subcategoryRef = adminDb
        .collection(COLLECTIONS.subcategories)
        .doc(`${categorySlug}__${subcategory.slug}`);
      subcategoryCount += 1;
      batch.set(
        subcategoryRef,
        {
          slug: subcategory.slug,
          title: subcategory.title,
          categorySlug,
          thumb: subcategory.thumb,
          banner: subcategory.banner,
          mobileBanner: subcategory.mobileBanner || null,
          sortOrder: subcategoryIndex,
          isPublished: true,
          createdAt: now,
          updatedAt: now,
        },
        { merge: true },
      );

      subcategory.products.forEach((product, productIndex) => {
        const id = `${categorySlug}__${subcategory.slug}__${product.id}`;
        const productRef = adminDb.collection(COLLECTIONS.products).doc(id);
        productCount += 1;
        batch.set(
          productRef,
          {
            title: product.title,
            categorySlug,
            subcategorySlug: subcategory.slug,
            img: product.img,
            zoomImg: null,
            sortOrder: productIndex,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
          },
          { merge: true },
        );
      });
    });
  });

  await batch.commit();

  return {
    categories: Object.keys(PRODUCT_CATEGORIES).length,
    subcategories: subcategoryCount,
    products: productCount,
  };
}

export async function listInquiries() {
  const snapshot = await adminDb
    .collection(COLLECTIONS.inquiries)
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      firstName: String(data.firstName ?? ""),
      lastName: String(data.lastName ?? ""),
      email: String(data.email ?? ""),
      phone: String(data.phone ?? ""),
      message: String(data.message ?? ""),
      status: String(data.status ?? "new"),
      createdAt:
        typeof data.createdAt?.toDate === "function"
          ? data.createdAt.toDate().toISOString()
          : null,
    };
  });
}
