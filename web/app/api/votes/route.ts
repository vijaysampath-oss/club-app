import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { jsonDbError } from "@/lib/route-db-error";
import { requireRole } from "@/lib/server-access";

export const runtime = "nodejs";
export const maxDuration = 10;

type VotePayload = {
  session_id?: number;
  player_id?: number;
  vote?: string;
};

const ALLOWED_VOTES = new Set(["yes", "no", "maybe"]);

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, ["admin", "member"]);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as VotePayload;
    const sessionId = Number(body.session_id);
    const playerId = Number(body.player_id);
    const vote = (body.vote ?? "yes").toLowerCase().trim();

    if (!Number.isInteger(sessionId) || !Number.isInteger(playerId)) {
      return NextResponse.json(
        { error: "session_id and player_id are required integers" },
        { status: 400 }
      );
    }

    if (!ALLOWED_VOTES.has(vote)) {
      return NextResponse.json(
        { error: "vote must be yes, no, or maybe" },
        { status: 400 }
      );
    }

    const sessionResult = await dbQuery("SELECT 1 FROM sessions WHERE id = $1", [
      sessionId,
    ]);
    if (sessionResult.rowCount === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const playerResult = await dbQuery("SELECT 1 FROM players WHERE id = $1", [
      playerId,
    ]);
    if (playerResult.rowCount === 0) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const result = await dbQuery(
      `INSERT INTO session_votes (session_id, player_id, vote)
       VALUES ($1, $2, $3)
       ON CONFLICT (session_id, player_id)
       DO UPDATE SET vote = EXCLUDED.vote
       RETURNING session_id, player_id, vote, created_at`,
      [sessionId, playerId, vote]
    );

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (err) {
    return jsonDbError("POST /api/votes", err, "Failed to submit vote");
  }
}
