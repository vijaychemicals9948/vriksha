export type Product = {
  id: string;
  title: string;
  img: string;
  zoomImg?: string;
  categorySlug: string;
  subcategorySlug?: string | null;
  sortOrder: number;
  isPublished: boolean;
};

export type SubCategory = {
  id: string;
  slug: string;
  title: string;
  thumb: string;
  banner: string;
  mobileBanner?: string;
  categorySlug: string;
  sortOrder: number;
  isPublished: boolean;
  products?: Product[];
};

export type Category = {
  id: string;
  slug: string;
  title: string;
  banner: string;
  mobileBanner?: string;
  cardImage?: string;
  sortOrder: number;
  isPublished: boolean;
  products?: Product[];
  subcategories?: SubCategory[];
};

export type CatalogSnapshot = {
  categories: Category[];
  subcategories: SubCategory[];
  products: Product[];
};
