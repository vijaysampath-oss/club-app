"use client";

import React from "react";
import LoggedOutCard from "@/components/LoggedOutCard";
import { useSession } from "next-auth/react";
import AppShell, {
  AppRole,
  cardStyle,
  sectionTitleStyle,
  secondaryTextStyle,
} from "@/components/AppShell";

function getUserRole(session: any): AppRole {
  const role = session?.user?.role;
  if (role === "admin" || role === "member" || role === "not_approved") {
    return role;
  }

  const email = session?.user?.email?.toLowerCase();
  if (email === "vijaysampath@gmail.com") return "admin";

  return "not_approved";
}

const listStyle: React.CSSProperties = {
  margin: "8px 0 0 18px",
  padding: 0,
  lineHeight: 1.8,
};

export default function RoadMapPage() {
  const { data: session, status } = useSession();
  const role = getUserRole(session);

  if (status === "loading") {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!session) {
    return <LoggedOutCard />;
  }

  return (
    <AppShell
      role={role}
      title="Vijay Muthiah's AI Pilot — Product Road Map"
      showIntro={false}
    >
      <div style={{ ...cardStyle, marginTop: 20 }}>
        <p style={{ ...secondaryTextStyle, margin: 0 }}>
          This roadmap shows what is currently live and what is planned next.
        </p>
      </div>

      <div style={{ ...cardStyle, marginTop: 20 }}>
        <h2 style={sectionTitleStyle}>Live Now</h2>
        <ul style={listStyle}>
          <li>Upcoming session visibility</li>
          <li>Admin session creation and management</li>
          <li>Players management</li>
          <li>Voting functionality</li>
          <li>Google authentication</li>
          <li>Single logout experience</li>
          <li>Consistent layout across main pages</li>
        </ul>
      </div>

      <div style={{ ...cardStyle, marginTop: 20 }}>
        <h2 style={sectionTitleStyle}>Phase 2</h2>
        <ul style={listStyle}>
          <li>Member approval workflow</li>
          <li>Facebook login integration</li>
          <li>Session registration with self-cancel</li>
          <li>Role-based UX improvements</li>
          <li>Session capacity tracking</li>
          <li>Shared protected-page layout improvements</li>
        </ul>
      </div>

      <div style={{ ...cardStyle, marginTop: 20 }}>
        <h2 style={sectionTitleStyle}>Future Enhancements</h2>
        <ul style={listStyle}>
          <li>Email notifications and reminders</li>
          <li>Attendance history</li>
          <li>Skill-based grouping</li>
          <li>Mobile-friendly booking flow</li>
          <li>Admin dashboard and analytics</li>
          <li>AI-assisted scheduling and recommendations</li>
        </ul>
      </div>
    </AppShell>
  );
}