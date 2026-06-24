"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  GripVertical,
  ImagePlus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import type { Category, Product, SubCategory } from "@/types/catalog";
import styles from "../admin.module.css";

type JsonResponse = {
  error?: string;
};

const uploadPresets = {
  media: {
    label: "Optimized media",
    helper: "No fixed crop. Website uses auto WebP/AVIF and quality compression.",
    width: null,
    height: null,
  },
  product: {
    label: "Product image",
    helper:
      "Use 1200 x 1380 px. Image is resized, cropped, and auto-compressed.",
    width: 1200,
    height: 1380,
  },
  grid: {
    label: "Grid thumbnail",
    helper:
      "Use 1200 x 1380 px. Image is resized, cropped, and auto-compressed.",
    width: 1200,
    height: 1380,
  },
  categoryCard: {
    label: "Category card image",
    helper:
      "Use 1200 x 1776 px. Image is resized, cropped, and auto-compressed.",
    width: 1200,
    height: 1776,
  },
  desktopBanner: {
    label: "Desktop banner",
    helper:
      "Use 1592 x 640 px. Image is resized, cropped, and auto-compressed.",
    width: 1592,
    height: 640,
  },
  mobileBanner: {
    label: "Mobile banner",
    helper:
      "Use 583 x 1182 px. Image is resized, cropped, and auto-compressed.",
    width: 583,
    height: 1182,
  },
} as const;

type UploadPreset = keyof typeof uploadPresets;

async function requestJson<T extends JsonResponse>(
  url: string,
  options: RequestInit,
) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as T;
  if (!response.ok) throw new Error(payload.error || "Request failed");
  return payload;
}

function confirmAction(message: string) {
  return window.confirm(message);
}

function reorderIds(ids: string[], sourceId: string, targetId: string) {
  const sourceIndex = ids.indexOf(sourceId);
  const targetIndex = ids.indexOf(targetId);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return ids;
  }

  const nextIds = [...ids];
  const [movedId] = nextIds.splice(sourceIndex, 1);
  nextIds.splice(targetIndex, 0, movedId);
  return nextIds;
}

function mergeSubsetOrder(
  allIds: string[],
  subsetIds: string[],
  nextSubsetIds: string[],
) {
  const subset = new Set(subsetIds);
  const queuedIds = [...nextSubsetIds];

  return allIds.map((id) => {
    if (!subset.has(id)) return id;
    return queuedIds.shift() ?? id;
  });
}

async function uploadImageFile({
  file,
  folder,
  preset,
}: {
  file: File;
  folder: string;
  preset: UploadPreset;
}) {
  const data = new FormData();
  data.append("file", file);
  data.append("folder", folder);
  data.append("preset", preset);

  const response = await fetch("/api/admin/media/upload", {
    method: "POST",
    body: data,
  });
  const payload = (await response.json()) as {
    image?: {
      optimized_delivery_warmed?: boolean;
      secure_url: string;
    };
    error?: string;
  };

  if (!response.ok || !payload.image) {
    throw new Error(payload.error || "Upload failed");
  }

  return payload.image.secure_url;
}

function InlineUploadButton({
  folder,
  label = "Upload",
  onUploaded,
  preset,
}: {
  folder: string;
  label?: string;
  onUploaded: (url: string) => void;
  preset: UploadPreset;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(file: File | null) {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const url = await uploadImageFile({ file, folder, preset });
      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={styles.inlineUpload}>
      <input
        ref={inputRef}
        className={styles.hiddenFileInput}
        type="file"
        accept="image/*"
        onChange={(event) =>
          handleFileChange(event.target.files?.[0] ?? null)
        }
      />
      <button
        className={`${styles.ghostButton} ${styles.compactUploadButton}`}
        disabled={loading}
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={14} aria-hidden />
        {loading ? "Uploading..." : label}
      </button>
      {error && <span className={styles.inlineError}>{error}</span>}
    </div>
  );
}

function UploadField({
  folder,
  onUploaded,
  preset = "media",
}: {
  folder: string;
  onUploaded: (url: string) => void;
  preset?: UploadPreset;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const config = uploadPresets[preset];
  const recommendedAspect =
    config.width && config.height ? config.width / config.height : null;
  const selectedAspect =
    dimensions && dimensions.height > 0 ? dimensions.width / dimensions.height : null;
  const aspectMismatch =
    recommendedAspect && selectedAspect
      ? Math.abs(selectedAspect - recommendedAspect) / recommendedAspect > 0.08
      : false;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(nextFile: File | null) {
    setFile(nextFile);
    setDimensions(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }

    if (!nextFile) return;

    const objectUrl = URL.createObjectURL(nextFile);
    setPreviewUrl(objectUrl);

    const image = new window.Image();
    image.onload = () => {
      setDimensions({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.src = objectUrl;
  }

  async function upload() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const url = await uploadImageFile({ file, folder, preset });
      onUploaded(url);
      handleFileChange(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.uploadBox}>
      <div className={styles.uploadGuidance}>
        <strong>{config.label}</strong>
        <span>{config.helper}</span>
      </div>
      <div className={styles.toolbar}>
        <input
          type="file"
          accept="image/*"
          onChange={(event) =>
            handleFileChange(event.target.files?.[0] ?? null)
          }
        />
        <button
          className={styles.ghostButton}
          disabled={!file || loading}
          type="button"
          onClick={upload}
        >
          <Upload size={16} aria-hidden />
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
      {previewUrl && (
        <div className={styles.uploadPreviewRow}>
          <div
            className={styles.uploadPreviewFrame}
            style={{
              aspectRatio:
                config.width && config.height
                  ? `${config.width} / ${config.height}`
                  : "1 / 1",
            }}
          >
            <img src={previewUrl} alt="Selected upload preview" />
          </div>
          <div className={styles.uploadMeta}>
            {dimensions && (
              <span>
                Selected: {dimensions.width} x {dimensions.height} px
              </span>
            )}
            {config.width && config.height && (
              <span>
                Final upload: {config.width} x {config.height} px
              </span>
            )}
            <span>Delivery: auto WebP/AVIF + quality compression</span>
            {aspectMismatch && (
              <em>
                Aspect ratio alag hai, upload ke baad image crop hogi. Best
                result ke liye recommended size mein export karo.
              </em>
            )}
          </div>
        </div>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export function SeedCatalogButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function seedCatalog() {
    if (
      !confirmAction(
        "Seed current catalog? Existing matching catalog records may be overwritten.",
      )
    ) {
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");
    try {
      const payload = await requestJson<{
        result?: { categories: number; subcategories: number; products: number };
        error?: string;
      }>("/api/admin/catalog/seed", { method: "POST" });
      if (payload.result) {
        setMessage(
          `Seeded ${payload.result.categories} categories, ${payload.result.subcategories} subcategories, ${payload.result.products} products.`,
        );
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Seed failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.toolbar}>
      <button
        className={styles.button}
        disabled={loading}
        onClick={seedCatalog}
        type="button"
      >
        <RefreshCw size={16} aria-hidden />
        {loading ? "Seeding..." : "Seed Current Catalog"}
      </button>
      {message && <p className={styles.status}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export function MediaUploader() {
  const [url, setUrl] = useState("");

  return (
    <section className={styles.panel}>
      <h2>Upload Image</h2>
      <UploadField folder="media" preset="media" onUploaded={setUrl} />
      {url && (
        <label className={styles.field}>
          Cloudinary URL
          <input readOnly value={url} />
        </label>
      )}
    </section>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [createDraft, setCreateDraft] = useState({
    title: "",
    slug: "",
    banner: "",
    mobileBanner: "",
    cardImage: "",
    sortOrder: categories.length,
    isPublished: true,
  });
  const [drafts, setDrafts] = useState<Record<string, Category>>(
    Object.fromEntries(categories.map((category) => [category.id, category])),
  );
  const [orderedCategoryIds, setOrderedCategoryIds] = useState(
    categories.map((category) => category.id),
  );
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(
    null,
  );
  const [savingOrder, setSavingOrder] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDrafts(
      Object.fromEntries(categories.map((category) => [category.id, category])),
    );
    setOrderedCategoryIds(categories.map((category) => category.id));
  }, [categories]);

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const orderedCategories = useMemo(
    () =>
      orderedCategoryIds
        .map((id) => categoriesById.get(id))
        .filter((category): category is Category => Boolean(category)),
    [categoriesById, orderedCategoryIds],
  );

  function setDraft(id: string, patch: Partial<Category>) {
    setDrafts((current) => ({
      ...current,
      [id]: { ...current[id], ...patch },
    }));
  }

  function setUploadedCategoryImage(id: string, patch: Partial<Category>) {
    setDraft(id, patch);
    setError("");
    setStatus("Image uploaded. Save category to apply it.");
  }

  function applyCategoryOrder(nextIds: string[]) {
    setOrderedCategoryIds(nextIds);
    setDrafts((current) => {
      const nextDrafts = { ...current };
      nextIds.forEach((id, index) => {
        if (nextDrafts[id]) {
          nextDrafts[id] = { ...nextDrafts[id], sortOrder: index };
        }
      });
      return nextDrafts;
    });
    setError("");
    setStatus("Order changed. Save order to apply it.");
  }

  function moveCategory(sourceId: string, targetId: string) {
    const nextIds = reorderIds(orderedCategoryIds, sourceId, targetId);
    if (nextIds !== orderedCategoryIds) {
      applyCategoryOrder(nextIds);
    }
  }

  async function create() {
    setStatus("");
    setError("");
    try {
      await requestJson("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(createDraft),
      });
      setStatus("Category saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Category save failed");
    }
  }

  async function save(id: string) {
    const draft = drafts[id];
    setStatus("");
    setError("");
    try {
      await requestJson(`/api/admin/categories/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({
          title: draft.title,
          banner: draft.banner,
          mobileBanner: draft.mobileBanner || "",
          cardImage: draft.cardImage || "",
          sortOrder: draft.sortOrder,
          isPublished: draft.isPublished,
        }),
      });
      setStatus("Category updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Category update failed");
    }
  }

  async function saveOrder() {
    setStatus("");
    setError("");
    setSavingOrder(true);
    try {
      await Promise.all(
        orderedCategories.map((category, index) =>
          requestJson(`/api/admin/categories/${encodeURIComponent(category.id)}`, {
            method: "PUT",
            body: JSON.stringify({ sortOrder: index }),
          }),
        ),
      );
      setStatus("Category order saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order save failed");
    } finally {
      setSavingOrder(false);
    }
  }

  async function remove(id: string) {
    const category = drafts[id];
    if (
      !confirmAction(
        `Delete "${category?.title ?? id}"? Iske subcategories aur products bhi delete honge.`,
      )
    ) {
      return;
    }

    setStatus("");
    setError("");
    try {
      await requestJson(`/api/admin/categories/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setStatus("Category deleted.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Category delete failed");
    }
  }

  return (
    <div className={styles.gridTwo}>
      <section className={styles.panel}>
        <h2>Add Category</h2>
        <div className={styles.form}>
          <label className={styles.field}>
            Title
            <input
              value={createDraft.title}
              onChange={(event) =>
                setCreateDraft({ ...createDraft, title: event.target.value })
              }
            />
          </label>
          <label className={styles.field}>
            Slug
            <input
              value={createDraft.slug}
              onChange={(event) =>
                setCreateDraft({ ...createDraft, slug: event.target.value })
              }
            />
          </label>
          <label className={styles.field}>
            Banner
            <input
              value={createDraft.banner}
              onChange={(event) =>
                setCreateDraft({ ...createDraft, banner: event.target.value })
              }
            />
            <UploadField
              folder="categories/banners"
              preset="desktopBanner"
              onUploaded={(url) =>
                setCreateDraft({ ...createDraft, banner: url })
              }
            />
          </label>
          <label className={styles.field}>
            Mobile Banner
            <input
              value={createDraft.mobileBanner}
              onChange={(event) =>
                setCreateDraft({
                  ...createDraft,
                  mobileBanner: event.target.value,
                })
              }
            />
            <UploadField
              folder="categories/mobile-banners"
              preset="mobileBanner"
              onUploaded={(url) =>
                setCreateDraft({ ...createDraft, mobileBanner: url })
              }
            />
          </label>
          <label className={styles.field}>
            Card Image
            <input
              value={createDraft.cardImage}
              onChange={(event) =>
                setCreateDraft({ ...createDraft, cardImage: event.target.value })
              }
            />
            <UploadField
              folder="categories/cards"
              preset="categoryCard"
              onUploaded={(url) =>
                setCreateDraft({ ...createDraft, cardImage: url })
              }
            />
          </label>
          <button className={styles.button} onClick={create} type="button">
            <ImagePlus size={16} aria-hidden />
            Add Category
          </button>
          {status && <p className={styles.status}>{status}</p>}
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </section>

      <div className={styles.tablePanel}>
        <div className={styles.tableToolbar}>
          <p className={styles.dragHint}>
            Drag rows from the handle. Top item appears first.
          </p>
          <button
            className={styles.button}
            disabled={savingOrder}
            type="button"
            onClick={saveOrder}
          >
            <Save size={16} aria-hidden />
            {savingOrder ? "Saving order..." : "Save Order"}
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Move</th>
                <th>Image</th>
                <th>Title</th>
                <th>Slug</th>
                <th>Banner</th>
                <th>Mobile Banner</th>
                <th>Card Image</th>
                <th>Live</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderedCategories.map((category, index) => {
              const draft = drafts[category.id] ?? category;
              return (
                <tr
                  key={category.id}
                  className={`${styles.draggableRow} ${
                    draggedCategoryId === category.id ? styles.draggingRow : ""
                  } ${
                    dragOverCategoryId === category.id &&
                    draggedCategoryId !== category.id
                      ? styles.dropTargetRow
                      : ""
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverCategoryId(category.id);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const sourceId =
                      event.dataTransfer.getData("text/plain") ||
                      draggedCategoryId;
                    if (sourceId) moveCategory(sourceId, category.id);
                    setDraggedCategoryId(null);
                    setDragOverCategoryId(null);
                  }}
                >
                  <td className={styles.dragHandleCell}>
                    <span
                      className={styles.dragHandle}
                      draggable
                      title="Drag to reorder"
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", category.id);
                        setDraggedCategoryId(category.id);
                      }}
                      onDragEnd={() => {
                        setDraggedCategoryId(null);
                        setDragOverCategoryId(null);
                      }}
                    >
                      <GripVertical size={17} aria-hidden />
                      <span>{index + 1}</span>
                    </span>
                  </td>
                  <td>
                    {draft.cardImage || draft.banner ? (
                      <img
                        className={styles.imagePreview}
                        src={draft.cardImage || draft.banner}
                        alt=""
                      />
                    ) : null}
                  </td>
                  <td>
                    <input
                      value={draft.title}
                      onChange={(event) =>
                        setDraft(category.id, { title: event.target.value })
                      }
                    />
                  </td>
                  <td>{category.slug}</td>
                  <td>
                    <div className={styles.inlineMediaField}>
                      <input
                        value={draft.banner}
                        onChange={(event) =>
                          setDraft(category.id, { banner: event.target.value })
                        }
                      />
                      <InlineUploadButton
                        folder="categories/banners"
                        preset="desktopBanner"
                        onUploaded={(url) =>
                          setUploadedCategoryImage(category.id, {
                            banner: url,
                          })
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <div className={styles.inlineMediaField}>
                      <input
                        value={draft.mobileBanner ?? ""}
                        onChange={(event) =>
                          setDraft(category.id, {
                            mobileBanner: event.target.value,
                          })
                        }
                      />
                      <InlineUploadButton
                        folder="categories/mobile-banners"
                        preset="mobileBanner"
                        onUploaded={(url) =>
                          setUploadedCategoryImage(category.id, {
                            mobileBanner: url,
                          })
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <div className={styles.inlineMediaField}>
                      <input
                        value={draft.cardImage ?? ""}
                        onChange={(event) =>
                          setDraft(category.id, {
                            cardImage: event.target.value,
                          })
                        }
                      />
                      <InlineUploadButton
                        folder="categories/cards"
                        preset="categoryCard"
                        onUploaded={(url) =>
                          setUploadedCategoryImage(category.id, {
                            cardImage: url,
                          })
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <input
                      checked={draft.isPublished}
                      type="checkbox"
                      onChange={(event) =>
                        setDraft(category.id, {
                          isPublished: event.target.checked,
                        })
                      }
                    />
                  </td>
                  <td>
                    <div className={styles.toolbar}>
                      <button
                        className={styles.ghostButton}
                        onClick={() => save(category.id)}
                        type="button"
                      >
                        <Save size={15} aria-hidden />
                        Save
                      </button>
                      <button
                        className={styles.dangerButton}
                        onClick={() => remove(category.id)}
                        type="button"
                      >
                        <Trash2 size={15} aria-hidden />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SubcategoryManager({
  categories,
  subcategories,
}: {
  categories: Category[];
  subcategories: SubCategory[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState({
    title: "",
    slug: "",
    categorySlug: categories[0]?.slug ?? "",
    thumb: "",
    banner: "",
    mobileBanner: "",
    sortOrder: subcategories.length,
    isPublished: true,
  });
  const [rowDrafts, setRowDrafts] = useState<Record<string, SubCategory>>(
    Object.fromEntries(
      subcategories.map((subcategory) => [subcategory.id, subcategory]),
    ),
  );
  const [orderedSubcategoryIds, setOrderedSubcategoryIds] = useState(
    subcategories.map((subcategory) => subcategory.id),
  );
  const [draggedSubcategoryId, setDraggedSubcategoryId] = useState<
    string | null
  >(null);
  const [dragOverSubcategoryId, setDragOverSubcategoryId] = useState<
    string | null
  >(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setRowDrafts(
      Object.fromEntries(
        subcategories.map((subcategory) => [subcategory.id, subcategory]),
      ),
    );
    setOrderedSubcategoryIds(subcategories.map((subcategory) => subcategory.id));
  }, [subcategories]);

  const subcategoriesById = useMemo(
    () =>
      new Map(
        subcategories.map((subcategory) => [subcategory.id, subcategory]),
      ),
    [subcategories],
  );

  const orderedSubcategories = useMemo(
    () =>
      orderedSubcategoryIds
        .map((id) => subcategoriesById.get(id))
        .filter((subcategory): subcategory is SubCategory =>
          Boolean(subcategory),
        ),
    [orderedSubcategoryIds, subcategoriesById],
  );

  function setRowDraft(id: string, patch: Partial<SubCategory>) {
    setRowDrafts((current) => ({
      ...current,
      [id]: { ...current[id], ...patch },
    }));
  }

  function setUploadedSubcategoryImage(id: string, patch: Partial<SubCategory>) {
    setRowDraft(id, patch);
    setError("");
    setStatus("Image uploaded. Save subcategory to apply it.");
  }

  function applySubcategoryOrder(nextIds: string[]) {
    setOrderedSubcategoryIds(nextIds);
    setRowDrafts((current) => {
      const nextDrafts = { ...current };
      nextIds.forEach((id, index) => {
        if (nextDrafts[id]) {
          nextDrafts[id] = { ...nextDrafts[id], sortOrder: index };
        }
      });
      return nextDrafts;
    });
    setError("");
    setStatus("Order changed. Save order to apply it.");
  }

  function moveSubcategory(sourceId: string, targetId: string) {
    const nextIds = reorderIds(orderedSubcategoryIds, sourceId, targetId);
    if (nextIds !== orderedSubcategoryIds) {
      applySubcategoryOrder(nextIds);
    }
  }

  async function create() {
    setStatus("");
    setError("");
    try {
      await requestJson("/api/admin/subcategories", {
        method: "POST",
        body: JSON.stringify(draft),
      });
      setStatus("Subcategory saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subcategory save failed");
    }
  }

  async function remove(id: string) {
    const subcategory = rowDrafts[id];
    if (
      !confirmAction(
        `Delete "${subcategory?.title ?? id}"? Is subcategory ke products bhi delete honge.`,
      )
    ) {
      return;
    }

    setStatus("");
    setError("");
    try {
      await requestJson(`/api/admin/subcategories/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setStatus("Subcategory deleted.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subcategory delete failed");
    }
  }

  async function save(id: string) {
    const current = rowDrafts[id];
    setStatus("");
    setError("");
    try {
      await requestJson(`/api/admin/subcategories/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({
          title: current.title,
          categorySlug: current.categorySlug,
          thumb: current.thumb,
          banner: current.banner,
          mobileBanner: current.mobileBanner || "",
          sortOrder: current.sortOrder,
          isPublished: current.isPublished,
        }),
      });
      setStatus("Subcategory updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subcategory update failed");
    }
  }

  async function saveOrder() {
    setStatus("");
    setError("");
    setSavingOrder(true);
    try {
      await Promise.all(
        orderedSubcategories.map((subcategory, index) =>
          requestJson(
            `/api/admin/subcategories/${encodeURIComponent(subcategory.id)}`,
            {
              method: "PUT",
              body: JSON.stringify({ sortOrder: index }),
            },
          ),
        ),
      );
      setStatus("Subcategory order saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order save failed");
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <div className={styles.gridTwo}>
      <section className={styles.panel}>
        <h2>Add Subcategory</h2>
        <div className={styles.form}>
          <label className={styles.field}>
            Category
            <select
              value={draft.categorySlug}
              onChange={(event) =>
                setDraft({ ...draft, categorySlug: event.target.value })
              }
            >
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            Title
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </label>
          <label className={styles.field}>
            Slug
            <input
              value={draft.slug}
              onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
            />
          </label>
          <label className={styles.field}>
            Thumbnail
            <input
              value={draft.thumb}
              onChange={(event) => setDraft({ ...draft, thumb: event.target.value })}
            />
            <UploadField
              folder="subcategories/thumbs"
              preset="grid"
              onUploaded={(url) => setDraft({ ...draft, thumb: url })}
            />
          </label>
          <label className={styles.field}>
            Banner
            <input
              value={draft.banner}
              onChange={(event) =>
                setDraft({ ...draft, banner: event.target.value })
              }
            />
            <UploadField
              folder="subcategories/banners"
              preset="desktopBanner"
              onUploaded={(url) => setDraft({ ...draft, banner: url })}
            />
          </label>
          <label className={styles.field}>
            Mobile Banner
            <input
              value={draft.mobileBanner}
              onChange={(event) =>
                setDraft({ ...draft, mobileBanner: event.target.value })
              }
            />
            <UploadField
              folder="subcategories/mobile-banners"
              preset="mobileBanner"
              onUploaded={(url) => setDraft({ ...draft, mobileBanner: url })}
            />
          </label>
          <button className={styles.button} onClick={create} type="button">
            <ImagePlus size={16} aria-hidden />
            Add Subcategory
          </button>
          {status && <p className={styles.status}>{status}</p>}
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </section>

      <div className={styles.tablePanel}>
        <div className={styles.tableToolbar}>
          <p className={styles.dragHint}>
            Drag rows from the handle. Top item appears first.
          </p>
          <button
            className={styles.button}
            disabled={savingOrder}
            type="button"
            onClick={saveOrder}
          >
            <Save size={16} aria-hidden />
            {savingOrder ? "Saving order..." : "Save Order"}
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Move</th>
                <th>Thumb</th>
                <th>Title</th>
                <th>Category</th>
                <th>Slug</th>
                <th>Thumb URL</th>
                <th>Banner</th>
                <th>Mobile Banner</th>
                <th>Live</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderedSubcategories.map((subcategory, index) => {
              const current = rowDrafts[subcategory.id] ?? subcategory;

              return (
                <tr
                  key={subcategory.id}
                  className={`${styles.draggableRow} ${
                    draggedSubcategoryId === subcategory.id
                      ? styles.draggingRow
                      : ""
                  } ${
                    dragOverSubcategoryId === subcategory.id &&
                    draggedSubcategoryId !== subcategory.id
                      ? styles.dropTargetRow
                      : ""
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverSubcategoryId(subcategory.id);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const sourceId =
                      event.dataTransfer.getData("text/plain") ||
                      draggedSubcategoryId;
                    if (sourceId) moveSubcategory(sourceId, subcategory.id);
                    setDraggedSubcategoryId(null);
                    setDragOverSubcategoryId(null);
                  }}
                >
                  <td className={styles.dragHandleCell}>
                    <span
                      className={styles.dragHandle}
                      draggable
                      title="Drag to reorder"
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", subcategory.id);
                        setDraggedSubcategoryId(subcategory.id);
                      }}
                      onDragEnd={() => {
                        setDraggedSubcategoryId(null);
                        setDragOverSubcategoryId(null);
                      }}
                    >
                      <GripVertical size={17} aria-hidden />
                      <span>{index + 1}</span>
                    </span>
                  </td>
                  <td>
                    <img
                      className={styles.imagePreview}
                      src={current.thumb}
                      alt=""
                    />
                  </td>
                  <td>
                    <input
                      value={current.title}
                      onChange={(event) =>
                        setRowDraft(subcategory.id, {
                          title: event.target.value,
                        })
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={current.categorySlug}
                      onChange={(event) =>
                        setRowDraft(subcategory.id, {
                          categorySlug: event.target.value,
                        })
                      }
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{subcategory.slug}</td>
                  <td>
                    <div className={styles.inlineMediaField}>
                      <input
                        value={current.thumb}
                        onChange={(event) =>
                          setRowDraft(subcategory.id, {
                            thumb: event.target.value,
                          })
                        }
                      />
                      <InlineUploadButton
                        folder="subcategories/thumbs"
                        preset="grid"
                        onUploaded={(url) =>
                          setUploadedSubcategoryImage(subcategory.id, {
                            thumb: url,
                          })
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <div className={styles.inlineMediaField}>
                      <input
                        value={current.banner}
                        onChange={(event) =>
                          setRowDraft(subcategory.id, {
                            banner: event.target.value,
                          })
                        }
                      />
                      <InlineUploadButton
                        folder="subcategories/banners"
                        preset="desktopBanner"
                        onUploaded={(url) =>
                          setUploadedSubcategoryImage(subcategory.id, {
                            banner: url,
                          })
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <div className={styles.inlineMediaField}>
                      <input
                        value={current.mobileBanner ?? ""}
                        onChange={(event) =>
                          setRowDraft(subcategory.id, {
                            mobileBanner: event.target.value,
                          })
                        }
                      />
                      <InlineUploadButton
                        folder="subcategories/mobile-banners"
                        preset="mobileBanner"
                        onUploaded={(url) =>
                          setUploadedSubcategoryImage(subcategory.id, {
                            mobileBanner: url,
                          })
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <input
                      checked={current.isPublished}
                      type="checkbox"
                      onChange={(event) =>
                        setRowDraft(subcategory.id, {
                          isPublished: event.target.checked,
                        })
                      }
                    />
                  </td>
                  <td>
                    <div className={styles.toolbar}>
                      <button
                        className={styles.ghostButton}
                        onClick={() => save(subcategory.id)}
                        type="button"
                      >
                        <Save size={15} aria-hidden />
                        Save
                      </button>
                      <button
                        className={styles.dangerButton}
                        onClick={() => remove(subcategory.id)}
                        type="button"
                      >
                        <Trash2 size={15} aria-hidden />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ProductManager({
  categories,
  subcategories,
  products,
}: {
  categories: Category[];
  subcategories: SubCategory[];
  products: Product[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [draft, setDraft] = useState({
    title: "",
    categorySlug: categories[0]?.slug ?? "",
    subcategorySlug: "",
    img: "",
    zoomImg: "",
    sortOrder: products.length,
    isPublished: true,
  });
  const [rowDrafts, setRowDrafts] = useState<Record<string, Product>>(
    Object.fromEntries(products.map((product) => [product.id, product])),
  );
  const [orderedProductIds, setOrderedProductIds] = useState(
    products.map((product) => product.id),
  );
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [dragOverProductId, setDragOverProductId] = useState<string | null>(
    null,
  );
  const [savingOrder, setSavingOrder] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setRowDrafts(Object.fromEntries(products.map((product) => [product.id, product])));
    setOrderedProductIds(products.map((product) => product.id));
  }, [products]);

  const filteredSubcategories = subcategories.filter(
    (subcategory) => subcategory.categorySlug === draft.categorySlug,
  );

  const filterSubcategories = useMemo(() => {
    if (!categoryFilter) return subcategories;
    return subcategories.filter(
      (subcategory) => subcategory.categorySlug === categoryFilter,
    );
  }, [categoryFilter, subcategories]);

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const orderedProducts = useMemo(
    () =>
      orderedProductIds
        .map((id) => productsById.get(id))
        .filter((product): product is Product => Boolean(product)),
    [orderedProductIds, productsById],
  );

  const visibleProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orderedProducts.filter((product) => {
      if (categoryFilter && product.categorySlug !== categoryFilter) return false;
      if (subcategoryFilter) {
        if (subcategoryFilter === "__none") {
          if (product.subcategorySlug) return false;
        } else if (product.subcategorySlug !== subcategoryFilter) {
          return false;
        }
      }
      if (!needle) return true;
      return (
        product.title.toLowerCase().includes(needle) ||
        product.categorySlug.toLowerCase().includes(needle) ||
        (product.subcategorySlug ?? "").toLowerCase().includes(needle)
      );
    });
  }, [categoryFilter, orderedProducts, query, subcategoryFilter]);

  const canReorderProducts = query.trim().length === 0;

  useEffect(() => {
    setSubcategoryFilter("");
  }, [categoryFilter]);

  function setRowDraft(id: string, patch: Partial<Product>) {
    setRowDrafts((current) => ({
      ...current,
      [id]: { ...current[id], ...patch },
    }));
  }

  function setUploadedProductImage(id: string, patch: Partial<Product>) {
    setRowDraft(id, patch);
    setError("");
    setStatus("Image uploaded. Save product to apply it.");
  }

  function applyProductOrder(nextVisibleIds: string[]) {
    const visibleIds = visibleProducts.map((product) => product.id);
    setOrderedProductIds((current) =>
      mergeSubsetOrder(current, visibleIds, nextVisibleIds),
    );
    setRowDrafts((current) => {
      const nextDrafts = { ...current };
      nextVisibleIds.forEach((id, index) => {
        if (nextDrafts[id]) {
          nextDrafts[id] = { ...nextDrafts[id], sortOrder: index };
        }
      });
      return nextDrafts;
    });
    setError("");
    setStatus("Order changed. Save order to apply it.");
  }

  function moveProduct(sourceId: string, targetId: string) {
    if (!canReorderProducts) return;
    const visibleIds = visibleProducts.map((product) => product.id);
    const nextVisibleIds = reorderIds(visibleIds, sourceId, targetId);
    if (nextVisibleIds !== visibleIds) {
      applyProductOrder(nextVisibleIds);
    }
  }

  async function create() {
    setStatus("");
    setError("");
    try {
      await requestJson("/api/admin/products", {
        method: "POST",
        body: JSON.stringify({
          ...draft,
          subcategorySlug: draft.subcategorySlug || null,
        }),
      });
      setStatus("Product saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Product save failed");
    }
  }

  async function save(id: string) {
    const current = rowDrafts[id];
    setStatus("");
    setError("");
    try {
      await requestJson(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({
          title: current.title,
          categorySlug: current.categorySlug,
          subcategorySlug: current.subcategorySlug || null,
          img: current.img,
          zoomImg: current.zoomImg || "",
          sortOrder: current.sortOrder,
          isPublished: current.isPublished,
        }),
      });
      setStatus("Product updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Product update failed");
    }
  }

  async function saveOrder() {
    if (!canReorderProducts) return;

    setStatus("");
    setError("");
    setSavingOrder(true);
    try {
      await Promise.all(
        visibleProducts.map((product, index) =>
          requestJson(`/api/admin/products/${encodeURIComponent(product.id)}`, {
            method: "PUT",
            body: JSON.stringify({ sortOrder: index }),
          }),
        ),
      );
      setStatus("Product order saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order save failed");
    } finally {
      setSavingOrder(false);
    }
  }

  async function remove(id: string) {
    const product = rowDrafts[id];
    if (!confirmAction(`Delete "${product?.title ?? id}"?`)) {
      return;
    }

    setStatus("");
    setError("");
    try {
      await requestJson(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setStatus("Product deleted.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Product delete failed");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.gridTwo}>
        <section className={styles.panel}>
          <h2>Add Product</h2>
          <div className={styles.form}>
            <label className={styles.field}>
              Title
              <input
                value={draft.title}
                onChange={(event) =>
                  setDraft({ ...draft, title: event.target.value })
                }
              />
            </label>
            <div className={styles.row}>
              <label className={styles.field}>
                Category
                <select
                  value={draft.categorySlug}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      categorySlug: event.target.value,
                      subcategorySlug: "",
                    })
                  }
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                Subcategory
                <select
                  value={draft.subcategorySlug}
                  onChange={(event) =>
                    setDraft({ ...draft, subcategorySlug: event.target.value })
                  }
                >
                  <option value="">None</option>
                  {filteredSubcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.slug}>
                      {subcategory.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className={styles.field}>
              Image
              <input
                value={draft.img}
                onChange={(event) => setDraft({ ...draft, img: event.target.value })}
              />
              <UploadField
                folder="products"
                preset="product"
                onUploaded={(url) => setDraft({ ...draft, img: url })}
              />
            </label>
            <label className={styles.field}>
              Zoom Image
              <input
                value={draft.zoomImg}
                onChange={(event) =>
                  setDraft({ ...draft, zoomImg: event.target.value })
                }
              />
            </label>
            <label className={styles.checkbox}>
              <input
                checked={draft.isPublished}
                type="checkbox"
                onChange={(event) =>
                  setDraft({ ...draft, isPublished: event.target.checked })
                }
              />
              Published
            </label>
            <button className={styles.button} onClick={create} type="button">
              <Check size={16} aria-hidden />
              Add Product
            </button>
            {status && <p className={styles.status}>{status}</p>}
            {error && <p className={styles.error}>{error}</p>}
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Filters</h2>
          <div className={styles.row}>
            <input
              className={styles.search}
              placeholder="Search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select
              className={styles.search}
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.title}
                </option>
              ))}
            </select>
            <select
              className={styles.search}
              value={subcategoryFilter}
              onChange={(event) => setSubcategoryFilter(event.target.value)}
            >
              <option value="">All subcategories</option>
              <option value="__none">No subcategory</option>
              {filterSubcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.slug}>
                  {subcategory.title}
                </option>
              ))}
            </select>
          </div>
          <p className={styles.status}>{visibleProducts.length} products visible</p>
          {!canReorderProducts && (
            <p className={styles.dragHint}>Clear search to reorder products.</p>
          )}
        </section>
      </div>

      <div className={styles.tablePanel}>
        <div className={styles.tableToolbar}>
          <p className={styles.dragHint}>
            Drag visible rows from the handle. Top item appears first.
          </p>
          <button
            className={styles.button}
            disabled={savingOrder || !canReorderProducts || visibleProducts.length < 2}
            type="button"
            onClick={saveOrder}
          >
            <Save size={16} aria-hidden />
            {savingOrder ? "Saving order..." : "Save Order"}
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Move</th>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Image URL</th>
                <th>Zoom URL</th>
                <th>Live</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product, index) => {
              const current = rowDrafts[product.id] ?? product;
              const rowSubcategories = subcategories.filter(
                (subcategory) => subcategory.categorySlug === current.categorySlug,
              );

              return (
                <tr
                  key={product.id}
                  className={`${styles.draggableRow} ${
                    draggedProductId === product.id ? styles.draggingRow : ""
                  } ${
                    dragOverProductId === product.id &&
                    draggedProductId !== product.id
                      ? styles.dropTargetRow
                      : ""
                  }`}
                  onDragOver={(event) => {
                    if (!canReorderProducts) return;
                    event.preventDefault();
                    setDragOverProductId(product.id);
                  }}
                  onDrop={(event) => {
                    if (!canReorderProducts) return;
                    event.preventDefault();
                    const sourceId =
                      event.dataTransfer.getData("text/plain") ||
                      draggedProductId;
                    if (sourceId) moveProduct(sourceId, product.id);
                    setDraggedProductId(null);
                    setDragOverProductId(null);
                  }}
                >
                  <td className={styles.dragHandleCell}>
                    <span
                      className={`${styles.dragHandle} ${
                        !canReorderProducts ? styles.disabledDragHandle : ""
                      }`}
                      draggable={canReorderProducts}
                      title={
                        canReorderProducts
                          ? "Drag to reorder"
                          : "Clear search to reorder"
                      }
                      onDragStart={(event) => {
                        if (!canReorderProducts) {
                          event.preventDefault();
                          return;
                        }
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", product.id);
                        setDraggedProductId(product.id);
                      }}
                      onDragEnd={() => {
                        setDraggedProductId(null);
                        setDragOverProductId(null);
                      }}
                    >
                      <GripVertical size={17} aria-hidden />
                      <span>{index + 1}</span>
                    </span>
                  </td>
                  <td>
                    <img className={styles.imagePreview} src={current.img} alt="" />
                  </td>
                  <td>
                    <input
                      value={current.title}
                      onChange={(event) =>
                        setRowDraft(product.id, { title: event.target.value })
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={current.categorySlug}
                      onChange={(event) =>
                        setRowDraft(product.id, {
                          categorySlug: event.target.value,
                          subcategorySlug: null,
                        })
                      }
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={current.subcategorySlug ?? ""}
                      onChange={(event) =>
                        setRowDraft(product.id, {
                          subcategorySlug: event.target.value || null,
                        })
                      }
                    >
                      <option value="">None</option>
                      {rowSubcategories.map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.slug}>
                          {subcategory.title}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className={styles.inlineMediaField}>
                      <input
                        value={current.img}
                        onChange={(event) =>
                          setRowDraft(product.id, { img: event.target.value })
                        }
                      />
                      <InlineUploadButton
                        folder="products"
                        preset="product"
                        onUploaded={(url) =>
                          setUploadedProductImage(product.id, { img: url })
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <div className={styles.inlineMediaField}>
                      <input
                        value={current.zoomImg ?? ""}
                        onChange={(event) =>
                          setRowDraft(product.id, {
                            zoomImg: event.target.value,
                          })
                        }
                      />
                      <InlineUploadButton
                        folder="products/zoom"
                        preset="product"
                        onUploaded={(url) =>
                          setUploadedProductImage(product.id, { zoomImg: url })
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <input
                      checked={current.isPublished}
                      type="checkbox"
                      onChange={(event) =>
                        setRowDraft(product.id, {
                          isPublished: event.target.checked,
                        })
                      }
                    />
                  </td>
                  <td>
                    <div className={styles.toolbar}>
                      <button
                        className={styles.ghostButton}
                        onClick={() => save(product.id)}
                        type="button"
                      >
                        <Save size={15} aria-hidden />
                        Save
                      </button>
                      <button
                        className={styles.dangerButton}
                        onClick={() => remove(product.id)}
                        type="button"
                      >
                        <Trash2 size={15} aria-hidden />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
