import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener la sesión actual
    const session = await auth.api.getSession({
      headers: req.headers as unknown as Headers,
    });

    if (!session) {
      return res.status(401).json({ error: 'No hay sesión activa' });
    }

    // Limpiar cookies de sesión para forzar recreación
    const clearCookies = [
      'better-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      'better-auth.csrf-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    ];

    res.writeHead(302, {
      Location: '/',
      'Set-Cookie': clearCookies,
    });
    res.end();
  } catch {
    return res.status(500).json({
      error:
        'Error interno del servidor - Haciendo reset de la BD (posible caída de Supabase) - Puede tardar unos minutos',
    });
  }
}
