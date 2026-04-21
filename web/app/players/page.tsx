"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import LoggedOutCard from "@/components/LoggedOutCard";
import React, { useEffect, useMemo, useState } from "react";
import { clubJson } from "@/lib/api";
import { roleFromSessionFallback } from "@/lib/access";
import AppShell, {
  AppRole,
  cardStyle,
  inputStyle,
  labelStyle,
  primaryButtonStyle,
  sectionTitleStyle,
  secondaryTextStyle,
} from "@/components/AppShell";

type Player = {
  id: number;
  name: string;
  phone: string | null;
  skill_level: number | null;
  status: string;
  created_at: string;
};

type AuthSession = {
  user?: {
    role?: string;
    email?: string | null;
  } | null;
} | null;

function getUserRole(session: AuthSession): AppRole {
  return roleFromSessionFallback(session?.user?.role, session?.user?.email);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function PlayersPage() {
  const { data: session, status } = useSession();
  const role = getUserRole(session);

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [skillLevel, setSkillLevel] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function loadPlayers() {
    setLoading(true);
    setError(null);

    try {
      const data = await clubJson<{ players?: Player[] } | Player[]>("/players");
      const list = Array.isArray(data) ? data : data.players || [];
      setPlayers(list);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to load players"));
    } finally {
      setLoading(false);
    }
  }

  async function createPlayer(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      await clubJson("/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || null,
          skill_level: skillLevel === "" ? null : Number(skillLevel),
        }),
      });

      setName("");
      setPhone("");
      setSkillLevel("");
      await loadPlayers();
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error, "Failed to create player"));
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && role === "admin") {
      loadPlayers();
    }
  }, [status, role]);

  const activePlayers = useMemo(
    () => players.filter((p) => (p.status || "").toLowerCase() !== "inactive"),
    [players]
  );

  if (status === "loading") {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!session) {
    return <LoggedOutCard />;
  }

  if (role === "not_approved") {
    return (
      <AppShell role={role} title="Hi-Sport Badminton Club — Players">
        <div style={{ ...cardStyle, marginTop: 20 }}>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Approval required</h2>
          <p style={{ margin: 0, color: "#374151", lineHeight: 1.6 }}>
            The Players page is available only to approved users. Your account is
            still pending approval.
          </p>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#111827",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              View Sessions
            </Link>

            <Link
              href="/roadmap"
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#111827",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              View Road Map
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  if (role !== "admin") {
    return (
      <AppShell role={role} title="Hi-Sport Badminton Club — Players">
        <div style={cardStyle}>Only admin can access the Players page.</div>
      </AppShell>
    );
  }

  return (
    <AppShell role={role} title="Hi-Sport Badminton Club — Players">
      <div style={{ ...cardStyle, marginTop: 20 }}>
        <h2 style={sectionTitleStyle}>Add Player</h2>

        <form onSubmit={createPlayer}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              alignItems: "end",
            }}
          >
            <div>
              <label style={labelStyle}>Player Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter player name"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional phone"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Skill Level</label>
              <input
                type="number"
                min={1}
                max={10}
                value={skillLevel}
                onChange={(e) =>
                  setSkillLevel(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="1 to 10"
                style={inputStyle}
              />
            </div>

            <div>
              <button type="submit" style={{ ...primaryButtonStyle, width: "100%" }}>
                {submitting ? "Saving..." : "Add Player"}
              </button>
            </div>
          </div>

          {submitError && (
            <p style={{ color: "#b91c1c", marginTop: 12, marginBottom: 0 }}>
              {submitError}
            </p>
          )}
        </form>
      </div>

      <div style={{ marginTop: 20 }}>
        <h2 style={sectionTitleStyle}>Players</h2>

        {loading && <div style={cardStyle}>Loading players...</div>}
        {!loading && error && <div style={{ ...cardStyle, color: "#b91c1c" }}>{error}</div>}
        {!loading && !error && activePlayers.length === 0 && (
          <div style={cardStyle}>No players found.</div>
        )}

        {!loading &&
          !error &&
          activePlayers.map((p) => (
            <div key={p.id} style={{ ...cardStyle, marginBottom: 12, padding: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                    {p.name}
                  </div>
                  <div style={secondaryTextStyle}>
                    Phone: {p.phone || "Not provided"}
                  </div>
                  <div style={{ ...secondaryTextStyle, marginTop: 4 }}>
                    Status: {p.status || "active"}
                  </div>
                </div>

                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  Skill: {p.skill_level ?? "-"}
                </div>
              </div>
            </div>
          ))}
      </div>
    </AppShell>
  );
}