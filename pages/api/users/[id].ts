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

// Función para manejar PUT requests (UPDATE)
const handlePut = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  id: string
) => {
  try {
    const validationError = validateUserData(req.body);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const { name, email, role } = req.body;

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: String(id) },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si el email ya existe en otro usuario
    if (email && email !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (userWithEmail) {
        return res
          .status(400)
          .json({ error: 'El email ya está registrado por otro usuario' });
      }
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: String(id) },
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        role: role as 'USER' | 'ADMIN',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     description: Actualiza la información de un usuario específico. Solo accesible para administradores.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a actualizar
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
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos o email ya registrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Acceso denegado. Solo los administradores pueden actualizar usuarios
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (req.method === 'PUT') {
    await handlePut(req, res, String(id));
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default withAuth(handler, 'ADMIN');
