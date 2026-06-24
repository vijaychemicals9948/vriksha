import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { createProduct } from "@/lib/admin/catalog";

const productSchema = z.object({
  title: z.string().min(1),
  categorySlug: z.string().min(1),
  subcategorySlug: z.string().nullable().optional(),
  img: z.string().min(1),
  zoomImg: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  isPublished: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const payload = productSchema.parse(await req.json());
    const result = await createProduct(payload);
    return NextResponse.json({ product: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Product save failed";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
