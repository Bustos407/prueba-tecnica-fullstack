import { NextApiRequest, NextApiResponse } from 'next';

export const cors = (req: NextApiRequest, res: NextApiResponse) => {
  // Permitir todos los orígenes en desarrollo
  const allowedOrigins = [
    'http://localhost:3000',
    'https://prueba-tecnica-fullstack-l7hrovak2.vercel.app',
    'https://vercel.app',
    'https://*.vercel.app',
  ];

  const origin = req.headers.origin;
  const isAllowedOrigin = allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin.includes('*')) {
      return origin?.includes(allowedOrigin.replace('*', ''));
    }
    return origin === allowedOrigin;
  });

  // Configurar headers de CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Origin',
    isAllowedOrigin ? origin! : allowedOrigins[0]
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
};

export const withCors = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const isPreflight = cors(req, res);
    if (isPreflight) return;

    return handler(req, res);
  };
};
