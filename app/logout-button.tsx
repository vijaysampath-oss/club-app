"use client";

import { signOut, useSession } from "next-auth/react";

export default function LogoutButton() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <button
      onClick={() => signOut()}
      style={{
        padding: "8px 12px",
        border: "1px solid #ddd",
        borderRadius: 10,
        background: "#fff",
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  );
}