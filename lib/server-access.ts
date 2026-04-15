import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getUserAccess } from "@/lib/access";

export type AppRole = "admin" | "member" | "not_approved";

function roleFromEmail(email?: string | null): AppRole {
  const access = getUserAccess(email);
  if (access === "admin") return "admin";
  if (access === "approved") return "member";
  return "not_approved";
}

function roleFromToken(
  email: string | null | undefined,
  tokenRole: unknown
): AppRole {
  if (tokenRole === "admin" || tokenRole === "member" || tokenRole === "not_approved") {
    return tokenRole;
  }
  return roleFromEmail(email);
}

export async function requireRole(request: NextRequest, allowedRoles: AppRole[]) {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      ),
    };
  }

  const token = await getToken({
    req: request,
    secret,
  });

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    };
  }

  const email = token.email as string | undefined;
  const role = roleFromToken(email, token.role);

  if (!allowedRoles.includes(role)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true as const, role, email };
}
