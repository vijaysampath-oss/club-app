export const ADMIN_EMAILS = [
    "vijaysampath@gmail.com",
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