import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

// Type declarations
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      role: string;
    };
    accessToken: string;
    refreshToken: string;
    error?: string;
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
    token: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
  }
}

// Refresh token function
async function refreshAccessToken(refreshToken: string) {
  try {
    const res = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        status: false,
        message: data.message || "Failed to refresh token",
      };
    }

    return {
      status: true,
      data: {
        accessToken: data.data?.accessToken,
        refreshToken: data.data?.refreshToken || refreshToken,
      },
    };
  } catch (error) {
    console.error("Refresh token error:", error);
    return {
      status: false,
      message: "Network error while refreshing token",
    };
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const res = await fetch(`${baseUrl}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();
          console.log("API Response:", data);

          if (!res.ok) {
            throw new Error(data.message || "Login failed");
          }

          const { email, role, name } = data.data;
          const accessToken = data.data?.accessToken;
          const refreshToken = data.data?.refreshToken;

          if (!email || !accessToken || !refreshToken) {
            throw new Error("Invalid response from server");
          }
          // Return user object with token
          return {
            id: data.data.userId || email,
            name: name,
            email: email,
            image: data.data.profileImage || "",
            role: role,
            token: accessToken,
            refreshToken: refreshToken,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          throw new Error("Invalid email or password");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          accessToken: user.token,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        };
      }

      // Update session trigger (if you have profile updates)
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      // Return token if not expired
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Token expired - try to refresh
      try {
        console.log("Token expired, attempting refresh...");
        const refreshedTokens = await refreshAccessToken(token.refreshToken);

        if (!refreshedTokens.status || !refreshedTokens.data) {
          console.error("Refresh failed:", refreshedTokens.message);
          return {
            ...token,
            error: "RefreshAccessTokenError",
          };
        }

        console.log("Token refreshed successfully");

        return {
          ...token,
          accessToken: refreshedTokens.data.accessToken,
          accessTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
          refreshToken: refreshedTokens.data.refreshToken || token.refreshToken,
          error: undefined,
        };
      } catch (error) {
        console.error("Error refreshing token:", error);
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        image: token.image || "",
        role: token.role,
      };
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;

      return session;
    },
  },

  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
