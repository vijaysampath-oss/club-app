import GoogleProvider from "next-auth/providers/google";
import { getUserAccess } from "@/lib/access";

type AppRole = "admin" | "member" | "not_approved";

type JwtToken = {
  email?: string | null;
  role?: AppRole;
  [key: string]: unknown;
};

type SessionCallbackArg = {
  session: {
    expires: string;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: AppRole;
    };
  };
  token: JwtToken;
};

function getRoleFromEmail(email?: string | null): AppRole {
  const access = getUserAccess(email);
  if (access === "admin") return "admin";
  if (access === "approved") return "member";
  return "not_approved";
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token }: { token: JwtToken }) {
      token.role = getRoleFromEmail(token.email);
      return token;
    },
    async session({ session, token }: SessionCallbackArg) {
      if (session.user) {
        session.user.role = token.role ?? "not_approved";
      }
      return session;
    },
  },
};
