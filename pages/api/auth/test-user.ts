import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔐 Test User Login - Iniciando...');
    
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

    console.log('✅ Test User Login - Usuario asegurado:', testUser.name, 'Rol:', testUser.role);

    // Crear una sesión manualmente con el formato que espera Better Auth
    const sessionId = `test-session-${Date.now()}`;
    const sessionToken = `test-token-${Date.now()}-${testUser.id}`;
    
    // Crear la sesión en la base de datos
    await prisma.session.create({
      data: {
        id: sessionId,
        token: sessionToken,
        userId: testUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Establecer la cookie con el formato exacto que espera Better Auth
    const sessionCookie = `better-auth.session-token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
    
    console.log('✅ Test User Login - Sesión creada, cookie establecida:', sessionToken);

    // Devolver respuesta JSON con éxito
    return res.status(200).json({
      success: true,
      message: 'Usuario de prueba configurado correctamente',
      user: {
        id: testUser.id,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role
      }
    });

  } catch (error) {
    console.error('❌ Error al crear usuario de prueba:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 