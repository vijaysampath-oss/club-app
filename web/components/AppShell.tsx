"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import React from "react";
import IntroBanner from "@/components/IntroBanner";

export type AppRole = "admin" | "member" | "not_approved";

const pageWrapStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "24px 16px 32px",
};

const topBarStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "flex-end",
  marginBottom: 20,
};

const pageContainerStyle: React.CSSProperties = {
  maxWidth: 980,
  margin: "0 auto",
};

const titleStyle: React.CSSProperties = {
  fontSize: 36,
  fontWeight: 800,
  margin: 0,
  color: "#111827",
};

const logoutButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  fontWeight: 600,
  cursor: "pointer",
};

const navStyle: React.CSSProperties = {
  padding: "10px 16px",
  border: "1px solid #d1d5db",
  borderRadius: 12,
  textDecoration: "none",
  color: "#111827",
  background: "#ffffff",
  fontWeight: 600,
};

export const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 20,
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
};

export const sectionTitleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  margin: "0 0 16px 0",
  color: "#111827",
};

export const secondaryTextStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#374151",
};

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
};

export const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "#374151",
  marginBottom: 6,
};

export const primaryButtonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
};

function TopNav({ role }: { role: AppRole }) {
  return (
    <nav
      style={{
        display: "flex",
        gap: 12,
        margin: "18px 0 20px 0",
        flexWrap: "wrap",
      }}
    >
      {/* Always visible */}
      <Link href="/" style={navStyle}>
        Sessions
      </Link>

      {/* Admin only */}
      {role === "admin" && (
        <>
          <Link href="/players" style={navStyle}>
            Players
          </Link>
          <Link href="/votes" style={navStyle}>
            Votes
          </Link>
        </>
      )}

      {/* Visible to ALL users */}
      <Link href="/roadmap" style={navStyle}>
        Road Map
      </Link>
    </nav>
  );
}

export default function AppShell({
  role,
  title,
  children,
  showIntro = true,
}: {
  role: AppRole;
  title: string;
  children: React.ReactNode;
  showIntro?: boolean;
}) {
  return (
    <div style={pageWrapStyle}>
      {/* ✅ ONLY logout (top-right, global) */}
      <div style={topBarStyle}>
        <button onClick={() => signOut()} style={logoutButtonStyle}>
          Logout
        </button>
      </div>

      <div style={pageContainerStyle}>
        <h1 style={titleStyle}>{title}</h1>

        <TopNav role={role} />

        {showIntro && (
          <div style={{ marginBottom: 20 }}>
            <IntroBanner />
          </div>
        )}

        {children}
      </div>
    </div>
  );
}