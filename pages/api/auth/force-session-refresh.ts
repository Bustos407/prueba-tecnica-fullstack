import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔄 Force Session Refresh - Iniciando...');
    
    // Obtener la sesión actual
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });
    
    if (!session) {
      return res.status(401).json({ error: 'No hay sesión activa' });
    }
    
    console.log('✅ Sesión actual encontrada:', {
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: (session.user as any)?.role
    });
    
    // Limpiar cookies de sesión para forzar recreación
    const clearCookies = [
      'better-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      'better-auth.csrf-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    ];
    
    res.writeHead(302, {
      'Location': '/',
      'Set-Cookie': clearCookies
    });
    res.end();
    return;
    
    console.log('✅ Sesión invalidada, redirigiendo...');
    
    // Redirigir a la página principal para que se recree la sesión
    res.writeHead(302, {
      'Location': '/'
    });
    res.end();

  } catch (error) {
    console.error('❌ Error al forzar refresh de sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 