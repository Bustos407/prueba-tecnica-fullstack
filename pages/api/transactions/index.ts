import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Obtener todas las transacciones
 *     description: Retorna la lista de todas las transacciones del sistema. Accesible para todos los usuarios autenticados.
 *     tags: [Transactions]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de transacciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crear nueva transacción
 *     description: Crea una nueva transacción en el sistema. Solo accesible para administradores.
 *     tags: [Transactions]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionInput'
 *           example:
 *             amount: 1000
 *             concept: "Salario"
 *             type: "INCOME"
 *             date: "2024-01-15"
 *     responses:
 *       201:
 *         description: Transacción creada exitosamente
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
 *         description: Acceso denegado. Solo los administradores pueden crear transacciones
 *       500:
 *         description: Error interno del servidor
 */

// Función para manejar GET requests
const handleGet = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    // Todos los usuarios pueden ver todas las transacciones
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.status(200).json(transactions);
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

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

// Función para manejar POST requests
const handlePost = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  userId: string
) => {
  try {
    const validationError = validateTransactionData(req.body);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const { amount, concept, type, date } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        concept,
        type,
        date: new Date(date),
        userId,
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

    res.status(201).json(transaction);
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    await handleGet(req, res);
  } else if (req.method === 'POST') {
    // Solo los ADMIN pueden crear transacciones
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        error:
          'Acceso denegado. Solo los administradores pueden crear transacciones.',
        userRole: req.user?.role,
        requiredRole: 'ADMIN',
      });
    }
    await handlePost(req, res, req.user!.id);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

// Usar withAuth normal para mantener las verificaciones de rol
export default withAuth(handler);
