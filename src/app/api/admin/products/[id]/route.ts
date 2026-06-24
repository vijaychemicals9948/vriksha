import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteProduct, updateProduct } from "@/lib/admin/catalog";

const updateProductSchema = z.object({
  title: z.string().min(1).optional(),
  categorySlug: z.string().min(1).optional(),
  subcategorySlug: z.string().nullable().optional(),
  img: z.string().min(1).optional(),
  zoomImg: z.string().optional(),
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
    const payload = updateProductSchema.parse(await req.json());
    await updateProduct(id, payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Product update failed";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Product delete failed";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
