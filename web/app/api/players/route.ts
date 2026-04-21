import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { jsonDbError } from "@/lib/route-db-error";
import { requireRole } from "@/lib/server-access";

export const runtime = "nodejs";
export const maxDuration = 10;

type PlayerPayload = {
  name?: string;
  phone?: string | null;
  skill_level?: number | null;
  status?: string;
};

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ["admin", "member"]);
  if (!auth.ok) return auth.response;

  try {
    const result = await dbQuery(
      `SELECT id, name, phone, skill_level, status, created_at
       FROM players
       ORDER BY id`
    );

    return NextResponse.json({ players: result.rows });
  } catch (err) {
    return jsonDbError("GET /api/players", err, "Failed to load players");
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as PlayerPayload;
    const name = body.name?.trim();
    const phone = body.phone?.trim() || null;
    const skillLevel =
      body.skill_level === null || body.skill_level === undefined
        ? null
        : Number(body.skill_level);
    const status = body.status?.trim().toLowerCase() || "active";
    const allowedStatuses = new Set(["active", "inactive"]);

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    if (name.length > 120) {
      return NextResponse.json(
        { error: "name must be 120 characters or fewer" },
        { status: 400 }
      );
    }

    if (skillLevel !== null && !Number.isFinite(skillLevel)) {
      return NextResponse.json(
        { error: "skill_level must be a number or null" },
        { status: 400 }
      );
    }

    if (skillLevel !== null && (skillLevel < 1 || skillLevel > 10)) {
      return NextResponse.json(
        { error: "skill_level must be between 1 and 10" },
        { status: 400 }
      );
    }

    if (phone && phone.length > 30) {
      return NextResponse.json(
        { error: "phone must be 30 characters or fewer" },
        { status: 400 }
      );
    }

    if (!allowedStatuses.has(status)) {
      return NextResponse.json(
        { error: "status must be one of: active, inactive" },
        { status: 400 }
      );
    }

    const result = await dbQuery(
      `INSERT INTO players (name, phone, skill_level, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, phone, skill_level, status, created_at`,
      [name, phone, skillLevel, status]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    return jsonDbError("POST /api/players", err, "Failed to create player");
  }
}
