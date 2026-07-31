import { NextResponse } from "next/server";
import { BUILD_ID } from "@/lib/version";

export const runtime = "nodejs";
/** Jamais mise en cache : c'est précisément la réponse qui doit être fraîche. */
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { buildId: BUILD_ID },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}
