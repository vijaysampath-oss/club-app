declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "admin" | "member" | "not_approved";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "member" | "not_approved";
  }
}

export {};
