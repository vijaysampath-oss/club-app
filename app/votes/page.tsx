"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import LoggedOutCard from "@/components/LoggedOutCard";
import React, { useEffect, useMemo, useState } from "react";
import { API } from "@/lib/api";
import AppShell, {
  AppRole,
  cardStyle,
  inputStyle,
  labelStyle,
  primaryButtonStyle,
  sectionTitleStyle,
  secondaryTextStyle,
} from "@/components/AppShell";

type SessionItem = {
  id: number;
  title: string;
  session_time: string;
  venue: string | null;
  capacity: number;
  status: string;
  created_at: string;
};

type Player = {
  id: number;
  name: string;
  skill_level: number | null;
  status: string;
};

function getUserRole(session: any): AppRole {
  const role = session?.user?.role;
  if (role === "admin" || role === "member" || role === "not_approved") {
    return role;
  }

  const email = session?.user?.email?.toLowerCase();
  if (email === "vijaysampath@gmail.com") return "admin";

  return "not_approved";
}

function formatSessionTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function isUpcomingOpenSession(session: SessionItem) {
  const now = new Date();
  const sessionDate = new Date(session.session_time);
  return session.status?.toLowerCase() === "open" && sessionDate > now;
}

export default function VotesPage() {
  const { data: session, status } = useSession();
  const role = getUserRole(session);

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [sessionsRes, playersRes] = await Promise.all([
        fetch(`${API}/sessions/`, { cache: "no-store" }),
        fetch(`${API}/players/`, { cache: "no-store" }),
      ]);

      const sessionsData = await sessionsRes.json();
      const playersData = await playersRes.json();

      setSessions(sessionsData.sessions || []);
      setPlayers(playersData.players || playersData || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load voting data");
    } finally {
      setLoading(false);
    }
  }

  async function submitVote(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage(null);
    setSubmitError(null);

    try {
      const res = await fetch(`${API}/votes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: Number(selectedSessionId),
          player_id: Number(selectedPlayerId),
        }),
      });

      if (!res.ok) throw new Error("Vote failed");

      setSubmitMessage("Thank you. Your vote has been recorded.");
      setSelectedPlayerId("");
    } catch (e: any) {
      setSubmitError(e?.message || "Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && (role === "admin" || role === "member")) {
      loadData();
    }
  }, [status, role]);

  const visibleSessions = useMemo(
    () => sessions.filter(isUpcomingOpenSession),
    [sessions]
  );

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
      <AppShell role={role} title="Hi-Sport Badminton Club — Votes">
        <div style={{ ...cardStyle, marginTop: 20 }}>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Approval required</h2>
          <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.6 }}>
            Voting is available only to approved members. Your account is still
            pending approval.
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

  if (role !== "admin" && role !== "member") {
    return (
      <AppShell role={role} title="Hi-Sport Badminton Club — Votes">
        <div style={cardStyle}>You do not have access to the Votes page.</div>
      </AppShell>
    );
  }

  return (
    <AppShell role={role} title="Hi-Sport Badminton Club — Votes">
      <div style={{ ...cardStyle, marginTop: 20 }}>
        <h2 style={sectionTitleStyle}>Submit Vote</h2>

        <form onSubmit={submitVote}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              alignItems: "end",
            }}
          >
            <div>
              <label style={labelStyle}>Session</label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select a session</option>
                {visibleSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} — {formatSessionTime(s.session_time)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Player</label>
              <select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select a player</option>
                {activePlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.skill_level ? ` (Skill ${p.skill_level})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={!selectedSessionId || !selectedPlayerId || submitting}
                style={{
                  ...primaryButtonStyle,
                  width: "100%",
                  opacity:
                    !selectedSessionId || !selectedPlayerId || submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Submitting..." : "Vote"}
              </button>
            </div>
          </div>

          {submitMessage && (
            <p style={{ color: "#065f46", marginTop: 12, marginBottom: 0 }}>
              {submitMessage}
            </p>
          )}

          {submitError && (
            <p style={{ color: "#b91c1c", marginTop: 12, marginBottom: 0 }}>
              {submitError}
            </p>
          )}
        </form>
      </div>

      <div style={{ marginTop: 20 }}>
        <h2 style={sectionTitleStyle}>Active Sessions</h2>

        {loading && <div style={cardStyle}>Loading...</div>}
        {!loading && error && <div style={{ ...cardStyle, color: "#b91c1c" }}>{error}</div>}
        {!loading && !error && visibleSessions.length === 0 && (
          <div style={cardStyle}>No active sessions available for voting.</div>
        )}

        {!loading &&
          !error &&
          visibleSessions.map((s) => (
            <div key={s.id} style={{ ...cardStyle, marginBottom: 12, padding: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                {s.title}
              </div>
              <div style={secondaryTextStyle}>{formatSessionTime(s.session_time)}</div>
              {s.venue && (
                <div style={{ ...secondaryTextStyle, marginTop: 4 }}>
                  Venue: {s.venue}
                </div>
              )}
            </div>
          ))}
      </div>
    </AppShell>
  );
}