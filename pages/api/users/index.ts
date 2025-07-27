import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

const prisma = new PrismaClient();

// Función para validar datos de usuario
const validateUserData = (data: {
  name?: string;
  email?: string;
  role?: string;
}) => {
  if (!data.name || data.name.trim().length < 2) {
    return { error: 'El nombre debe tener al menos 2 caracteres' };
  }
  if (!data.email || !data.email.includes('@')) {
    return { error: 'El email debe ser válido' };
  }
  if (data.role && !['USER', 'ADMIN'].includes(data.role)) {
    return { error: 'El rol debe ser USER o ADMIN' };
  }
  return null;
};

// Función para manejar POST requests (CREATE)
const handlePost = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  try {
    const validationError = validateUserData(req.body);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const { name, email, role = 'USER' } = req.body;

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        email: email.toLowerCase(),
        emailVerified: false,
        role: role as 'USER' | 'ADMIN',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    res.status(201).json(newUser);
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Función para manejar DELETE requests
const handleDelete = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Se requiere el ID del usuario' });
    }

    // Verificar si el usuario existe
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    });

    if (!userToDelete) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Proteger el usuario de pruebas
    if (userToDelete.email === 'test-user@example.com') {
      return res.status(403).json({ 
        error: 'No se puede eliminar el usuario de pruebas',
        userEmail: userToDelete.email
      });
    }

    // Eliminar el usuario
    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(200).json({ 
      message: 'Usuario eliminado exitosamente',
      deletedUser: { id: userToDelete.id, email: userToDelete.email }
    });
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Retorna la lista de todos los usuarios del sistema. Solo accesible para administradores.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Acceso denegado. Solo los administradores pueden ver usuarios
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crear un nuevo usuario
 *     description: Crea un nuevo usuario en el sistema. Solo accesible para administradores.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del usuario
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 description: Email del usuario
 *                 example: "juan@example.com"
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 description: Rol del usuario
 *                 example: "USER"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos o email ya registrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Acceso denegado. Solo los administradores pueden crear usuarios
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar un usuario
 *     description: Elimina un usuario del sistema. Solo accesible para administradores. No se puede eliminar el usuario de pruebas.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID del usuario a eliminar
 *                 example: "user_1234567890_abc123"
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado exitosamente"
 *                 deletedUser:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: ID de usuario requerido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Acceso denegado o intento de eliminar usuario de pruebas
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {

  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.status(200).json(users);
    } catch {
      // Error fetching users
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else if (req.method === 'POST') {
    await handlePost(req, res);
  } else if (req.method === 'DELETE') {
    await handleDelete(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler, 'ADMIN');
