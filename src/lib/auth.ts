// src/lib/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        // ⚠️ Поки що plain-text перевірка
        if (credentials.password !== user.passwordHash) {
          return null;
        }

        // Якщо це лікар — знайдемо повʼязаний Doctor, щоб дістати slug
        let doctorSlug: string | undefined = undefined;
        if (user.role === "DOCTOR") {
          const doctor = await prisma.doctor.findFirst({
            where: { userId: user.id },
            select: { slug: true },
          });
          doctorSlug = doctor?.slug ?? undefined;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          doctorSlug,
        } as any;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // при логіні переносимо дані з user до токена
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.doctorSlug = (user as any).doctorSlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).doctorSlug = token.doctorSlug;
      }
      return session;
    },
  },
};
