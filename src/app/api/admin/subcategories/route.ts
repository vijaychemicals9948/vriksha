import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { createSubcategory } from "@/lib/admin/catalog";

const subcategorySchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  categorySlug: z.string().min(1),
  thumb: z.string().min(1),
  banner: z.string().min(1),
  mobileBanner: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  isPublished: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const payload = subcategorySchema.parse(await req.json());
    const result = await createSubcategory(payload);
    return NextResponse.json({ subcategory: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Subcategory save failed";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
