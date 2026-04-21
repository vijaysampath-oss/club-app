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

async function ensureSessionRegistrationsTable() {
  await dbQuery(
    `CREATE TABLE IF NOT EXISTS session_registrations (
      id SERIAL PRIMARY KEY,
      session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      user_email TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (session_id, user_email)
    )`
  );
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ["admin", "member"]);
  if (!auth.ok) return auth.response;

  try {
    await ensureSessionRegistrationsTable();
    const normalizedEmail = (auth.email ?? "").toLowerCase();
    const result = await dbQuery(
      `SELECT
         s.id,
         s.title,
         s.session_time,
         s.venue,
         s.capacity,
         s.status,
         s.created_at,
         COUNT(sr.session_id)::INT AS registration_count,
         COALESCE(BOOL_OR(sr.user_email = $1), false) AS user_joined
       FROM sessions s
       LEFT JOIN session_registrations sr ON sr.session_id = s.id
       GROUP BY s.id, s.title, s.session_time, s.venue, s.capacity, s.status, s.created_at
       ORDER BY s.session_time DESC, s.id DESC`,
      [normalizedEmail]
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
    await ensureSessionRegistrationsTable();
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
