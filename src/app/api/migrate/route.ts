import { NextRequest, NextResponse } from "next/server";
import { migrateFromWordPress } from "@/lib/wordpress/migrate";

export async function POST(request: NextRequest) {
  // Simple auth check - require a secret header
  const authHeader = request.headers.get("x-migration-key");
  if (authHeader !== process.env.MIGRATION_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const maxPages = Math.min(body.maxPages || 1, 50);
    const dryRun = body.dryRun ?? false;

    const results = await migrateFromWordPress({ maxPages, dryRun });

    return NextResponse.json({
      success: true,
      dryRun,
      ...results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Migration failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
