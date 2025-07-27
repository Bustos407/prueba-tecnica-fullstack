import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/reports/csv:
 *   get:
 *     summary: Descargar reporte CSV de transacciones
 *     description: Genera y descarga un archivo CSV con todas las transacciones del sistema. Solo accesible para administradores.
 *     tags: [Reports]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Archivo CSV generado exitosamente
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *             example: "ID,Concepto,Monto,Tipo,Fecha,Usuario,Fecha Creación\n1,Salario,5000,INGRESO,01/01/2024,John Doe,01/01/2024"
 *         headers:
 *           Content-Disposition:
 *             description: Nombre del archivo descargado
 *             schema:
 *               type: string
 *               example: "attachment; filename=\"reporte-transacciones.csv\""
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Acceso denegado. Solo los administradores pueden descargar reportes
 *       500:
 *         description: Error interno del servidor
 */
const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
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

      // Generar CSV
      const csvHeaders = [
        'ID',
        'Concepto',
        'Monto',
        'Tipo',
        'Fecha',
        'Usuario',
        'Fecha Creación',
      ];

      const csvRows = transactions.map(
        (t: {
          id: string;
          concept: string;
          amount: number;
          type: string;
          date: Date;
          user?: { name: string };
          createdAt: Date;
        }) => [
          t.id,
          t.concept,
          t.amount,
          t.type,
          new Date(t.date).toLocaleDateString('es-ES'),
          t.user?.name || 'N/A',
          new Date(t.createdAt).toLocaleDateString('es-ES'),
        ]
      );

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row: (string | number)[]) => row.join(',')),
      ].join('\n');

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="reporte-transacciones.csv"'
      );

      res.status(200).send(csvContent);
    } catch {
      // Error generating CSV
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default withAuth(handler, 'ADMIN');
