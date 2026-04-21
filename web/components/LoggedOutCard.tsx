"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { cardStyle } from "@/components/AppShell";

const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#111827",
  textDecoration: "none",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#111827",
  color: "#fff",
  border: "1px solid #111827",
};

export default function LoggedOutCard({
  message = "Please sign in to continue using the app.",
}: {
  message?: string;
}) {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <div style={cardStyle}>
        <h1
          style={{
            marginTop: 0,
            marginBottom: 12,
            fontSize: 28,
            fontWeight: 800,
            color: "#111827",
          }}
        >
          Hi-Sport Badminton Club - Sessions
        </h1>

        <p
          style={{
            margin: 0,
            color: "#374151",
            lineHeight: 1.7,
            fontSize: 16,
          }}
        >
          Welcome to our badminton club app. Sign in using your Google or
          Facebook account to get started.
        </p>

        <p
          style={{
            marginTop: 10,
            marginBottom: 0,
            color: "#374151",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>

        <p
          style={{
            marginTop: 10,
            marginBottom: 0,
            color: "#374151",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          Member access will be enabled after approval by the admin.
        </p>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => signIn("google")} style={primaryButtonStyle}>
            Sign in with Google
          </button>
        </div>

        <div
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: 8,
              fontSize: 18,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            What happens next?
          </h2>

          <div style={{ color: "#374151", lineHeight: 1.8, fontSize: 15 }}>
            <div>1. Sign in using your email account</div>
            <div>2. Your account will be reviewed by the admin</div>
            <div>3. Once approved, you can access sessions and club features</div>
          </div>
        </div>
      </div>
    </div>
  );
}