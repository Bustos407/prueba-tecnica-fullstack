import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
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

    if (!sessionToken) {
      return res.status(200).json({
        authenticated: false,
        message: 'No hay sesión activa',
      });
    }

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

    if (!session) {
      return res.status(200).json({
        authenticated: false,
        message: 'Sesión no válida',
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: session.user,
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    });
  } catch {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
