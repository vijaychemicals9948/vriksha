import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { createCategory } from "@/lib/admin/catalog";

const categorySchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  banner: z.string().min(1),
  mobileBanner: z.string().optional(),
  cardImage: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  isPublished: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const payload = categorySchema.parse(await req.json());
    const result = await createCategory(payload);
    return NextResponse.json({ category: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Category save failed";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
