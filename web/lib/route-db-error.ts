import { NextResponse } from "next/server";

export function jsonDbError(
  route: string,
  err: unknown,
  userMessage: string
): NextResponse {
  console.error(`[${route}]`, err);

  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("DATABASE_URL") && msg.includes("not configured")) {
    return NextResponse.json(
      {
        error:
          "DATABASE_URL is not set for Production. In Vercel: Project → Settings → Environment Variables → add DATABASE_URL (your Neon connection string), apply to Production, then Redeploy.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ error: userMessage }, { status: 500 });
}
