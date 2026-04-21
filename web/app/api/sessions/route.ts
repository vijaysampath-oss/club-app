import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { jsonDbError } from "@/lib/route-db-error";
import { requireRole } from "@/lib/server-access";

export const runtime = "nodejs";
export const maxDuration = 10;

type SessionPayload = {
  title?: string;
  session_time?: string;
  venue?: string | null;
  capacity?: number;
  status?: string;
};

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ["admin", "member"]);
  if (!auth.ok) return auth.response;

  try {
    const result = await dbQuery(
      `SELECT id, title, session_time, venue, capacity, status, created_at
       FROM sessions
       ORDER BY session_time DESC, id DESC`
    );

    return NextResponse.json({ sessions: result.rows });
  } catch (err) {
    return jsonDbError("GET /api/sessions", err, "Failed to load sessions");
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as SessionPayload;
    const title = body.title?.trim();
    const sessionTime = body.session_time?.trim();
    const venue = body.venue?.trim() || null;
    const capacity = Number(body.capacity ?? 16);
    const status = body.status?.trim() || "open";
    const parsedSessionDate = new Date(sessionTime ?? "");
    const allowedStatuses = new Set(["open", "closed", "cancelled"]);

    if (!title || !sessionTime) {
      return NextResponse.json(
        { error: "title and session_time are required" },
        { status: 400 }
      );
    }

    if (title.length > 120) {
      return NextResponse.json(
        { error: "title must be 120 characters or fewer" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(parsedSessionDate.getTime())) {
      return NextResponse.json(
        { error: "session_time must be a valid date/time" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(capacity) || capacity < 1) {
      return NextResponse.json(
        { error: "capacity must be a positive number" },
        { status: 400 }
      );
    }

    if (!allowedStatuses.has(status.toLowerCase())) {
      return NextResponse.json(
        { error: "status must be one of: open, closed, cancelled" },
        { status: 400 }
      );
    }

    const result = await dbQuery(
      `INSERT INTO sessions (title, session_time, venue, capacity, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, session_time, venue, capacity, status, created_at`,
      [title, sessionTime, venue, capacity, status.toLowerCase()]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    return jsonDbError("POST /api/sessions", err, "Failed to create session");
  }
}
