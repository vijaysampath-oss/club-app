export const API = "http://127.0.0.1:8000";
import { getSession } from "next-auth/react";

export async function createSession(data: any) {
  const session = await getSession();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-email": session?.user?.email || "",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}