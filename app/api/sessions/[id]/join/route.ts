import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { jsonDbError } from "@/lib/route-db-error";
import { requireRole } from "@/lib/server-access";

export const runtime = "nodejs";
export const maxDuration = 10;

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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, ["admin", "member"]);
  if (!auth.ok) return auth.response;

  const normalizedEmail = auth.email?.toLowerCase();
  if (!normalizedEmail) {
    return NextResponse.json({ error: "User email is required" }, { status: 400 });
  }

  const params = await context.params;
  const sessionId = Number(params.id);
  if (!Number.isInteger(sessionId) || sessionId < 1) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  try {
    await ensureSessionRegistrationsTable();

    const insertResult = await dbQuery(
      `INSERT INTO session_registrations (session_id, user_email)
       SELECT s.id, $2
       FROM sessions s
       WHERE s.id = $1
         AND LOWER(s.status) = 'open'
         AND s.session_time > NOW()
         AND (
           SELECT COUNT(*)::INT
           FROM session_registrations r
           WHERE r.session_id = s.id
         ) < s.capacity
         AND NOT EXISTS (
           SELECT 1
           FROM session_registrations r2
           WHERE r2.session_id = s.id AND r2.user_email = $2
         )`,
      [sessionId, normalizedEmail]
    );

    if (insertResult.rowCount === 1) {
      return NextResponse.json({ ok: true, message: "Joined session successfully" });
    }

    const sessionResult = await dbQuery<{
      status: string;
      session_time: string;
      capacity: number;
      registration_count: number;
      already_joined: boolean;
    }>(
      `SELECT
         LOWER(s.status) AS status,
         s.session_time,
         s.capacity,
         (
           SELECT COUNT(*)::INT
           FROM session_registrations r
           WHERE r.session_id = s.id
         ) AS registration_count,
         EXISTS (
           SELECT 1
           FROM session_registrations r
           WHERE r.session_id = s.id AND r.user_email = $2
         ) AS already_joined
       FROM sessions s
       WHERE s.id = $1`,
      [sessionId, normalizedEmail]
    );

    if (sessionResult.rowCount === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessionResult.rows[0];
    if (session.already_joined) {
      return NextResponse.json({ ok: true, message: "Already joined this session" });
    }
    if (session.status !== "open") {
      return NextResponse.json({ error: "Session is not open for joining" }, { status: 409 });
    }
    if (new Date(session.session_time).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Session has already started" }, { status: 409 });
    }
    if (session.registration_count >= session.capacity) {
      return NextResponse.json({ error: "Session is full" }, { status: 409 });
    }

    return NextResponse.json({ error: "Unable to join session" }, { status: 409 });
  } catch (err) {
    return jsonDbError("POST /api/sessions/[id]/join", err, "Failed to join session");
  }
}
