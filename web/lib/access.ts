export const ADMIN_EMAILS = [
  "vijaysampath@gmail.com",
  "rosspiggott84@gmail.com",
];
  
  export const APPROVED_EMAILS = [
    "vijaysampath@gmail.com",
    "dhanyams.vijaysampath@gmail.com"
  ];
  
  export function getUserAccess(email?: string | null) {
    if (!email) return "pending";
  
    const normalized = email.toLowerCase();
  
    if (ADMIN_EMAILS.includes(normalized)) return "admin";
    if (APPROVED_EMAILS.includes(normalized)) return "approved";
  
    return "pending";
  }

export function roleFromSessionFallback(
  tokenRole: string | undefined,
  email: string | null | undefined
): "admin" | "member" | "not_approved" {
  if (tokenRole === "admin" || tokenRole === "member" || tokenRole === "not_approved") {
    return tokenRole;
  }
  const access = getUserAccess(email);
  if (access === "admin") return "admin";
  if (access === "approved") return "member";
  return "not_approved";
}