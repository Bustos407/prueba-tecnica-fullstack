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

    if (sessionToken) {
      // Eliminar la sesión de la base de datos
      await prisma.session.deleteMany({
        where: {
          token: sessionToken,
        },
      });
    }

    // Establecer cookies vacías para invalidar la sesión
    const clearCookies = [
      'custom-auth-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      'better-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      'session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    ];

    // Redirigir a la página principal con cookies limpias
    res.writeHead(302, {
      Location: '/',
      'Set-Cookie': clearCookies,
    });
    res.end();
  } catch {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
