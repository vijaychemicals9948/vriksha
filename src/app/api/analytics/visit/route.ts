import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { trackAnalyticsEvent } from "@/lib/admin/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const analyticsEventSchema = z.object({
  visitorId: z
    .string()
    .min(12)
    .max(80)
    .regex(/^[A-Za-z0-9_-]+$/),
  event: z.enum(["pageview", "heartbeat"]),
  path: z.string().min(1).max(500),
});

export async function POST(req: NextRequest) {
  try {
    const payload = analyticsEventSchema.parse(await req.json());
    await trackAnalyticsEvent(payload);

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const status = error instanceof z.ZodError ? 400 : 500;

    return NextResponse.json(
      { ok: false, error: "Analytics tracking failed" },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
