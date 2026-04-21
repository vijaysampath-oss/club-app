import {
  Pool,
  neonConfig,
  type QueryResultRow,
} from "@neondatabase/serverless";

declare global {
  var __clubDbPool: Pool | undefined;
}

neonConfig.poolQueryViaFetch = true;

function normalizeDatabaseUrl(url: string): string {
  const normalized = url
    .replace(/^postgresql\+psycopg(\[[^\]]*\])?:\/\//i, "postgresql://")
    .replace(/^postgresql\+asyncpg:\/\//i, "postgresql://");

  try {
    const u = new URL(
      normalized.replace(/^postgres:\/\//i, "postgresql://")
    );
    u.searchParams.delete("channel_binding");
    return u.toString();
  } catch {
    return normalized
      .replace(/([?&])channel_binding=[^&]*&?/gi, "$1")
      .replace(/\?&/, "?")
      .replace(/[?&]$/, "");
  }
}

function getPool() {
  if (global.__clubDbPool) {
    return global.__clubDbPool;
  }

  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const connectionString = normalizeDatabaseUrl(raw.trim());

  const pool = new Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 15_000,
    idleTimeoutMillis: 10_000,
  });

  global.__clubDbPool = pool;
  return pool;
}

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  queryText: string,
  params: unknown[] = []
) {
  return getPool().query<T>(queryText, params);
}
