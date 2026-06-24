import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteCategory, updateCategory } from "@/lib/admin/catalog";

const updateCategorySchema = z.object({
  title: z.string().min(1).optional(),
  banner: z.string().min(1).optional(),
  mobileBanner: z.string().optional(),
  cardImage: z.string().optional(),
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
    const payload = updateCategorySchema.parse(await req.json());
    await updateCategory(id, payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Category update failed";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteCategory(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Category delete failed";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
