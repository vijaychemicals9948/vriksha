import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getCatalogSnapshot } from "@/lib/admin/catalog";

export async function GET() {
  try {
    await requireAdmin();
    const catalog = await getCatalogSnapshot();
    return NextResponse.json({ catalog });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load catalog";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
