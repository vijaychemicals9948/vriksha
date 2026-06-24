import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteSubcategory, updateSubcategory } from "@/lib/admin/catalog";

const updateSubcategorySchema = z.object({
  title: z.string().min(1).optional(),
  categorySlug: z.string().min(1).optional(),
  thumb: z.string().min(1).optional(),
  banner: z.string().min(1).optional(),
  mobileBanner: z.string().optional(),
  sortOrder: z.coerce.number().optional(),
  isPublished: z.boolean().optional(),
});

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const payload = updateSubcategorySchema.parse(await req.json());
    await updateSubcategory(id, payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Subcategory update failed";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteSubcategory(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Subcategory delete failed";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
