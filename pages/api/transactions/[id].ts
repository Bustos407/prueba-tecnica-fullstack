import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Actualizar transacción
 *     description: Actualiza una transacción existente en el sistema. Solo accesible para administradores.
 *     tags: [Transactions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transacción a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionInput'
 *           example:
 *             amount: 1500
 *             concept: "Salario actualizado"
 *             type: "INCOME"
 *             date: "2024-01-15"
 *     responses:
 *       200:
 *         description: Transacción actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Todos los campos son requeridos"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Acceso denegado. Solo los administradores pueden actualizar transacciones
 *       404:
 *         description: Transacción no encontrada
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar transacción
 *     description: Elimina una transacción del sistema. Solo accesible para administradores.
 *     tags: [Transactions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transacción a eliminar
 *     responses:
 *       200:
 *         description: Transacción eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transacción eliminada exitosamente"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Acceso denegado. Solo los administradores pueden eliminar transacciones
 *       404:
 *         description: Transacción no encontrada
 *       500:
 *         description: Error interno del servidor
 */

// Función para validar datos de transacción
const validateTransactionData = (data: {
  amount?: number;
  concept?: string;
  type?: string;
  date?: string;
}) => {
  const { amount, concept, type, date } = data;

  if (!amount || !concept || !type || !date) {
    return { error: 'Todos los campos son requeridos' };
  }

  if (type !== 'INCOME' && type !== 'EXPENSE') {
    return { error: 'Tipo debe ser INCOME o EXPENSE' };
  }

  if (amount <= 0) {
    return { error: 'El monto debe ser mayor a 0' };
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
    // Solo los ADMIN pueden actualizar transacciones
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Acceso denegado. Solo los administradores pueden actualizar transacciones.',
        userRole: req.user?.role,
        requiredRole: 'ADMIN'
      });
    }

    const validationError = validateTransactionData(req.body);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const { amount, concept, type, date } = req.body;

    const updatedTransaction = await prisma.transaction.update({
      where: { id: String(id) },
      data: {
        amount: parseFloat(amount),
        concept,
        type,
        date: new Date(date),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json(updatedTransaction);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      res.status(404).json({ error: 'Transacción no encontrada' });
    } else {
      console.error('Error al actualizar transacción:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

// Función para manejar DELETE requests
const handleDelete = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  id: string
) => {
  try {
    // Solo los ADMIN pueden eliminar transacciones
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Acceso denegado. Solo los administradores pueden eliminar transacciones.',
        userRole: req.user?.role,
        requiredRole: 'ADMIN'
      });
    }

    await prisma.transaction.delete({
      where: { id: String(id) },
    });

    res.status(200).json({ message: 'Transacción eliminada exitosamente' });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      res.status(404).json({ error: 'Transacción no encontrada' });
    } else {
      console.error('Error al eliminar transacción:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    await handlePut(req, res, String(id));
  } else if (req.method === 'DELETE') {
    await handleDelete(req, res, String(id));
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler); 