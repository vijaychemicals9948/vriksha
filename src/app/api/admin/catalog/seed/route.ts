import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { seedCatalogFromStaticData } from "@/lib/admin/catalog";

export async function POST() {
  try {
    await requireAdmin();

    if (process.env.ENABLE_CATALOG_SEED !== "true") {
      return NextResponse.json(
        { error: "Catalog seeding is disabled" },
        { status: 403 },
      );
    }

    const result = await seedCatalogFromStaticData();
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Seed failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
