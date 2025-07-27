import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  providers: [
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials: Record<string, string | undefined>) => {
        if (
          credentials?.email === 'test-user@example.com' &&
          credentials?.password === 'test-password'
        ) {
          const user = await prisma.user.findUnique({
            where: { email: 'test-user@example.com' },
            select: { id: true, email: true, name: true, role: true },
          });
          if (user) {
            return user;
          }
        }
        return null;
      },
    },
  ],
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  callbacks: {
    session: ({
      session,
      user,
    }: {
      session: { user: Record<string, unknown> };
      user: Record<string, unknown>;
    }) => {
      // Verificar si el usuario tiene rol, si no, asignar ADMIN por defecto
      const userRole = (user.role as string) || 'ADMIN';

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id as string,
          name: user.name as string,
          email: user.email as string,
          role: userRole,
        },
      };
    },
    user: async (user: Record<string, unknown>) => {
      // Para usuarios de GitHub, siempre asignar rol ADMIN
      const userEmail = user.email as string;
      if (userEmail && userEmail.includes('@')) {
        try {
          await prisma.user.update({
            where: { id: user.id as string },
            data: { role: 'ADMIN' },
          });
          user.role = 'ADMIN';
        } catch {
          // Error handling
          user.role = 'ADMIN'; // Asignar por defecto en memoria
        }
      }

      return user;
    },
  },
  pages: {
    signIn: '/',
  },
});

export type Session = typeof auth.$Infer.Session;
