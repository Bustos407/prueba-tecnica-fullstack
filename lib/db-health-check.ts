import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};

export const restartDatabaseOnError = async () => {
  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return false;
  }

  try {
    const response = await fetch(`${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        query: 'SELECT pg_reload_conf();',
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
};

export const withDatabaseHealthCheck =
  (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      return await handler(req, res);
    } catch (error) {
      // Si es un error 500 y parece ser de base de datos
      if (res.statusCode === 500 || error instanceof Error) {
        const errorMessage = error instanceof Error ? error.message : '';

        if (
          errorMessage.includes('database') ||
          errorMessage.includes('connection') ||
          errorMessage.includes('prisma')
        ) {
          // Intentar reiniciar la base de datos
          const restartSuccess = await restartDatabaseOnError();

          if (restartSuccess) {
            // Esperar un momento y reintentar la operación
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return await handler(req, res);
          }
        }
      }

      throw error;
    }
  };
