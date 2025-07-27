import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Asegurar que el usuario de prueba existe
    const testUser = await prisma.user.upsert({
      where: { email: 'test-user@example.com' },
      update: {
        name: 'Usuario de Prueba',
        emailVerified: true,
        role: 'USER',
      },
      create: {
        id: 'test-user-id',
        name: 'Usuario de Prueba',
        email: 'test-user@example.com',
        emailVerified: true,
        role: 'USER',
      },
    });

    // Crear una sesión personalizada con un token único
    const sessionToken = `custom-test-session-${Date.now()}-${testUser.id}`;
    
    // Crear la sesión en la base de datos
    await prisma.session.create({
      data: {
        id: `custom-session-${Date.now()}`,
        token: sessionToken,
        userId: testUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Establecer múltiples cookies para asegurar compatibilidad
    const cookies = [
      `custom-auth-token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
      `better-auth.session-token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
      `session-token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    ];

    // Redirigir a la página principal con todas las cookies
    res.writeHead(302, {
      'Location': '/',
      'Set-Cookie': cookies
    });
    res.end();

  } catch (error) {
    console.error('Error al crear login de prueba:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 