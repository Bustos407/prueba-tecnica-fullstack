import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from './index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
  };
}

export const withAuth =
  (
    handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
    requiredRole?: 'USER' | 'ADMIN'
  ) =>
  async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Verificar si hay una sesión activa usando las cookies
      const hasSessionCookie =
        req.headers.cookie?.includes('better-auth') ||
        req.headers.cookie?.includes('session') ||
        req.headers.cookie?.includes('custom-auth-token');

      if (!hasSessionCookie) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      // Primero intentar con Better Auth
      const session = await auth.api.getSession({
        headers: req.headers as unknown as Headers,
      });

      let user = null;

      if (session) {
        // Obtener el usuario real de la base de datos
        user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        });
      } else {
        // Intentar con sesión de prueba
        const cookies = req.headers.cookie || '';
        let sessionToken = null;

        // Buscar en diferentes formatos de cookies
        if (cookies.includes('custom-auth-token=')) {
          sessionToken = cookies.split('custom-auth-token=')[1]?.split(';')[0];
        } else if (cookies.includes('better-auth.session-token=')) {
          sessionToken = cookies
            .split('better-auth.session-token=')[1]
            ?.split(';')[0];
        } else if (cookies.includes('session-token=')) {
          sessionToken = cookies.split('session-token=')[1]?.split(';')[0];
        }

        if (sessionToken) {
          // Buscar la sesión en la base de datos
          const session = await prisma.session.findFirst({
            where: {
              token: sessionToken,
              expiresAt: { gt: new Date() },
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          });

          if (session) {
            user = session.user;
          }
        }
      }

      if (!user) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }

      // Verificar si el usuario tiene el rol requerido
      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({
          error: 'Acceso denegado. Rol requerido: ' + requiredRole,
          userRole: user.role,
          requiredRole,
        });
      }

      // Asignar el usuario real al request
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      // Ejecutar el handler
      return handler(req, res);
    } catch {
      // Error handling
      return res.status(401).json({ error: 'Error de autenticación' });
    }
  };
