"use client";

import { useSession } from "next-auth/react";
import LoggedOutCard from "@/components/LoggedOutCard";
import React, { useEffect, useMemo, useState } from "react";
import { clubJson } from "@/lib/api";
import { getUserAccess } from "@/lib/access";
import AppShell, {
  cardStyle,
  inputStyle,
  labelStyle,
  primaryButtonStyle,
  sectionTitleStyle,
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

function toPostgresTimestamp(dtLocal: string) {
  if (!dtLocal) return "";
  return dtLocal.replace("T", " ") + ":00";
}

function isUpcomingOpenSession(session: SessionItem) {
  const now = new Date();
  const sessionDate = new Date(session.session_time);
  return session.status?.toLowerCase() === "open" && sessionDate > now;
}

function formatSessionTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function HomePage() {
  const { data: session, status } = useSession();

  // ✅ NEW ACCESS LOGIC
  const access = getUserAccess(session?.user?.email);

  const isAdmin = access === "admin";
  const isApproved = access === "approved";
  const isPending = access === "pending";

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [venue, setVenue] = useState("");
  const [capacity, setCapacity] = useState<number>(16);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function loadSessions() {
    setLoading(true);
    setError(null);

    try {
      const data = await clubJson<{ sessions?: SessionItem[] }>("/sessions");
      setSessions(data.sessions || []);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to load sessions"));
    } finally {
      setLoading(false);
    }
  }

  async function createSession(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      await clubJson("/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          session_time: toPostgresTimestamp(sessionTime),
          venue,
          capacity,
          status: "open",
        }),
      });

      setTitle("");
      setSessionTime("");
      setVenue("");
      setCapacity(16);

      await loadSessions();
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error, "Failed to create session"));
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && (isAdmin || isApproved)) {
      loadSessions();
    }
  }, [status, isAdmin, isApproved]);

  const visibleSessions = useMemo(
    () => sessions.filter(isUpcomingOpenSession),
    [sessions]
  );

  // 🔹 Loading
  if (status === "loading") {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  // 🔹 Not logged in
  if (!session) {
    return <LoggedOutCard />;
  }

  // 🔹 Pending approval
  if (isPending) {
    return (
      <AppShell role="not_approved" title="Hi-Sport Badminton Club — Sessions">
        <div style={{ ...cardStyle, marginTop: 20 }}>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>
            Account pending approval
          </h2>
          <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.6 }}>
            Your account is not yet approved. Please contact the admin to gain
            access to sessions and club features.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role={isAdmin ? "admin" : "member"} title="Hi-Sport Badminton Club — Sessions">
      {/* ✅ Admin only */}
      {isAdmin && (
        <div style={{ ...cardStyle, marginTop: 20 }}>
          <h2 style={sectionTitleStyle}>Create Session</h2>

          <form onSubmit={createSession}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                alignItems: "end",
              }}
            >
              <div>
                <label style={labelStyle}>Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Session Time</label>
                <input
                  type="datetime-local"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Venue</label>
                <input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Capacity</label>
                <input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>

              <div>
                <button
                  type="submit"
                  style={{ ...primaryButtonStyle, width: "100%" }}
                >
                  {submitting ? "Creating..." : "Create Session"}
                </button>
              </div>
            </div>

            {submitError && (
              <p style={{ color: "#b91c1c", marginTop: 12 }}>
                {submitError}
              </p>
            )}
          </form>
        </div>
      )}

      {/* Sessions */}
      <div style={{ marginTop: 20 }}>
        <h2 style={sectionTitleStyle}>Upcoming Open Sessions</h2>

        {loading && <div style={cardStyle}>Loading sessions...</div>}
        {error && <div style={{ ...cardStyle, color: "red" }}>{error}</div>}
        {!loading && visibleSessions.length === 0 && (
          <div style={cardStyle}>No sessions available</div>
        )}

        {visibleSessions.map((s) => (
          <div key={s.id} style={{ ...cardStyle, marginBottom: 12 }}>
            <div>
              <strong>{s.title}</strong>
              <div>{formatSessionTime(s.session_time)}</div>
              {s.venue && <div>Venue: {s.venue}</div>}
              <div>Capacity: {s.capacity}</div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}