import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API de Gestión Financiera - Documentación</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                spec: ${JSON.stringify({
                  openapi: '3.0.0',
                  info: {
                    title: 'API de Gestión Financiera',
                    version: '1.0.0',
                    description:
                      'API para el sistema de gestión de ingresos y egresos con autenticación por cookies',
                    contact: {
                      name: 'Soporte API',
                      email: 'soporte@ejemplo.com',
                    },
                  },
                  servers: [
                    {
                      url:
                        process.env.NEXT_PUBLIC_BASE_URL ||
                        'http://localhost:3000',
                      description: 'Servidor de desarrollo',
                    },
                  ],
                  components: {
                    securitySchemes: {
                      cookieAuth: {
                        type: 'apiKey',
                        in: 'cookie',
                        name: 'session',
                        description:
                          'Cookie de sesión para autenticación. Se maneja automáticamente por el navegador.',
                      },
                    },
                    schemas: {
                      Transaction: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            description: 'ID único de la transacción',
                          },
                          amount: {
                            type: 'number',
                            description: 'Monto de la transacción',
                          },
                          concept: {
                            type: 'string',
                            description: 'Concepto de la transacción',
                          },
                          type: {
                            type: 'string',
                            enum: ['INCOME', 'EXPENSE'],
                            description: 'Tipo de transacción',
                          },
                          date: {
                            type: 'string',
                            format: 'date',
                            description: 'Fecha de la transacción',
                          },
                          user: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              email: { type: 'string' },
                            },
                          },
                          createdAt: { type: 'string', format: 'date-time' },
                          updatedAt: { type: 'string', format: 'date-time' },
                        },
                      },
                      TransactionInput: {
                        type: 'object',
                        required: ['amount', 'concept', 'type', 'date'],
                        properties: {
                          amount: {
                            type: 'number',
                            description: 'Monto de la transacción',
                          },
                          concept: {
                            type: 'string',
                            description: 'Concepto de la transacción',
                          },
                          type: {
                            type: 'string',
                            enum: ['INCOME', 'EXPENSE'],
                            description: 'Tipo de transacción',
                          },
                          date: {
                            type: 'string',
                            format: 'date',
                            description: 'Fecha de la transacción',
                          },
                        },
                      },
                      User: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            description: 'ID único del usuario',
                          },
                          name: {
                            type: 'string',
                            description: 'Nombre del usuario',
                          },
                          email: {
                            type: 'string',
                            description: 'Email del usuario',
                          },
                          phone: {
                            type: 'string',
                            description: 'Teléfono del usuario',
                          },
                          role: {
                            type: 'string',
                            enum: ['USER', 'ADMIN'],
                            description: 'Rol del usuario',
                          },
                          createdAt: { type: 'string', format: 'date-time' },
                        },
                      },
                      UserInput: {
                        type: 'object',
                        required: ['name', 'email'],
                        properties: {
                          name: {
                            type: 'string',
                            description: 'Nombre del usuario',
                          },
                          email: {
                            type: 'string',
                            description: 'Email del usuario',
                          },
                          role: {
                            type: 'string',
                            enum: ['USER', 'ADMIN'],
                            description: 'Rol del usuario',
                            default: 'USER',
                          },
                        },
                      },
                    },
                  },
                  paths: {
                    '/api/transactions': {
                      get: {
                        summary: 'Obtener todas las transacciones',
                        description:
                          'Retorna la lista de todas las transacciones del sistema. Accesible para todos los usuarios autenticados.',
                        tags: ['Transactions'],
                        security: [{ cookieAuth: [] }],
                        responses: {
                          '200': {
                            description:
                              'Lista de transacciones obtenida exitosamente',
                            content: {
                              'application/json': {
                                schema: {
                                  type: 'array',
                                  items: {
                                    $ref: '#/components/schemas/Transaction',
                                  },
                                },
                              },
                            },
                          },
                          '401': { description: 'No autenticado' },
                          '500': { description: 'Error interno del servidor' },
                        },
                      },
                      post: {
                        summary: 'Crear nueva transacción',
                        description:
                          'Crea una nueva transacción en el sistema. Solo accesible para administradores.',
                        tags: ['Transactions'],
                        security: [{ cookieAuth: [] }],
                        requestBody: {
                          required: true,
                          content: {
                            'application/json': {
                              schema: {
                                $ref: '#/components/schemas/TransactionInput',
                              },
                              example: {
                                amount: 1000,
                                concept: 'Salario',
                                type: 'INCOME',
                                date: '2024-01-15',
                              },
                            },
                          },
                        },
                        responses: {
                          '201': {
                            description: 'Transacción creada exitosamente',
                            content: {
                              'application/json': {
                                schema: {
                                  $ref: '#/components/schemas/Transaction',
                                },
                              },
                            },
                          },
                          '400': {
                            description: 'Datos de entrada inválidos',
                            content: {
                              'application/json': {
                                schema: {
                                  type: 'object',
                                  properties: {
                                    error: {
                                      type: 'string',
                                      example:
                                        'Todos los campos son requeridos',
                                    },
                                  },
                                },
                              },
                            },
                          },
                          '401': { description: 'No autenticado' },
                          '403': {
                            description:
                              'Acceso denegado. Solo los administradores pueden crear transacciones',
                          },
                          '500': { description: 'Error interno del servidor' },
                        },
                      },
                    },
                    '/api/transactions/{id}': {
                      put: {
                        summary: 'Actualizar transacción',
                        description:
                          'Actualiza una transacción existente en el sistema. Solo accesible para administradores.',
                        tags: ['Transactions'],
                        security: [{ cookieAuth: [] }],
                        parameters: [
                          {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'string' },
                            description: 'ID de la transacción a actualizar',
                          },
                        ],
                        requestBody: {
                          required: true,
                          content: {
                            'application/json': {
                              schema: {
                                $ref: '#/components/schemas/TransactionInput',
                              },
                            },
                          },
                        },
                        responses: {
                          '200': {
                            description: 'Transacción actualizada exitosamente',
                            content: {
                              'application/json': {
                                schema: {
                                  $ref: '#/components/schemas/Transaction',
                                },
                              },
                            },
                          },
                          '400': {
                            description: 'Datos de entrada inválidos',
                            content: {
                              'application/json': {
                                schema: {
                                  type: 'object',
                                  properties: {
                                    error: {
                                      type: 'string',
                                      example:
                                        'Todos los campos son requeridos',
                                    },
                                  },
                                },
                              },
                            },
                          },
                          '401': { description: 'No autenticado' },
                          '403': {
                            description:
                              'Acceso denegado. Solo los administradores pueden actualizar transacciones',
                          },
                          '404': { description: 'Transacción no encontrada' },
                          '500': { description: 'Error interno del servidor' },
                        },
                      },
                      delete: {
                        summary: 'Eliminar transacción',
                        description:
                          'Elimina una transacción del sistema. Solo accesible para administradores.',
                        tags: ['Transactions'],
                        security: [{ cookieAuth: [] }],
                        parameters: [
                          {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'string' },
                            description: 'ID de la transacción a eliminar',
                          },
                        ],
                        responses: {
                          '200': {
                            description: 'Transacción eliminada exitosamente',
                            content: {
                              'application/json': {
                                schema: {
                                  type: 'object',
                                  properties: {
                                    message: {
                                      type: 'string',
                                      example:
                                        'Transacción eliminada exitosamente',
                                    },
                                  },
                                },
                              },
                            },
                          },
                          '401': { description: 'No autenticado' },
                          '403': {
                            description:
                              'Acceso denegado. Solo los administradores pueden eliminar transacciones',
                          },
                          '404': { description: 'Transacción no encontrada' },
                          '500': { description: 'Error interno del servidor' },
                        },
                      },
                    },
                    '/api/users': {
                      get: {
                        summary: 'Obtener todos los usuarios',
                        description:
                          'Retorna la lista de todos los usuarios del sistema. Solo accesible para administradores.',
                        tags: ['Users'],
                        security: [{ cookieAuth: [] }],
                        responses: {
                          '200': {
                            description:
                              'Lista de usuarios obtenida exitosamente',
                            content: {
                              'application/json': {
                                schema: {
                                  type: 'array',
                                  items: { $ref: '#/components/schemas/User' },
                                },
                              },
                            },
                          },
                          '401': { description: 'No autenticado' },
                          '403': {
                            description:
                              'Acceso denegado. Solo los administradores pueden ver usuarios',
                          },
                          '500': { description: 'Error interno del servidor' },
                        },
                      },
                      post: {
                        summary: 'Crear un nuevo usuario',
                        description:
                          'Crea un nuevo usuario en el sistema. Solo accesible para administradores.',
                        tags: ['Users'],
                        security: [{ cookieAuth: [] }],
                        requestBody: {
                          required: true,
                          content: {
                            'application/json': {
                              schema: {
                                $ref: '#/components/schemas/UserInput',
                              },
                            },
                          },
                        },
                        responses: {
                          '201': {
                            description: 'Usuario creado exitosamente',
                            content: {
                              'application/json': {
                                schema: { $ref: '#/components/schemas/User' },
                              },
                            },
                          },
                          '400': {
                            description:
                              'Datos inválidos o email ya registrado',
                          },
                          '401': { description: 'No autenticado' },
                          '403': {
                            description:
                              'Acceso denegado. Solo los administradores pueden crear usuarios',
                          },
                          '500': { description: 'Error interno del servidor' },
                        },
                      },
                      delete: {
                        summary: 'Eliminar un usuario',
                        description:
                          'Elimina un usuario del sistema. Solo accesible para administradores. No se puede eliminar el usuario de pruebas.',
                        tags: ['Users'],
                        security: [{ cookieAuth: [] }],
                        requestBody: {
                          required: true,
                          content: {
                            'application/json': {
                              schema: {
                                type: 'object',
                                required: ['userId'],
                                properties: {
                                  userId: {
                                    type: 'string',
                                    description: 'ID del usuario a eliminar',
                                  },
                                },
                              },
                            },
                          },
                        },
                        responses: {
                          '200': {
                            description: 'Usuario eliminado exitosamente',
                            content: {
                              'application/json': {
                                schema: {
                                  type: 'object',
                                  properties: {
                                    message: {
                                      type: 'string',
                                      example: 'Usuario eliminado exitosamente',
                                    },
                                    deletedUser: {
                                      type: 'object',
                                      properties: {
                                        id: { type: 'string' },
                                        email: { type: 'string' },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          '400': { description: 'ID de usuario requerido' },
                          '401': { description: 'No autenticado' },
                          '403': {
                            description:
                              'Acceso denegado o intento de eliminar usuario de pruebas',
                          },
                          '404': { description: 'Usuario no encontrado' },
                          '500': { description: 'Error interno del servidor' },
                        },
                      },
                    },
                    '/api/users/{id}': {
                      put: {
                        summary: 'Actualizar un usuario',
                        description:
                          'Actualiza la información de un usuario específico. Solo accesible para administradores.',
                        tags: ['Users'],
                        security: [{ cookieAuth: [] }],
                        parameters: [
                          {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'string' },
                            description: 'ID del usuario a actualizar',
                          },
                        ],
                        requestBody: {
                          required: true,
                          content: {
                            'application/json': {
                              schema: {
                                $ref: '#/components/schemas/UserInput',
                              },
                            },
                          },
                        },
                        responses: {
                          '200': {
                            description: 'Usuario actualizado exitosamente',
                            content: {
                              'application/json': {
                                schema: { $ref: '#/components/schemas/User' },
                              },
                            },
                          },
                          '400': {
                            description:
                              'Datos inválidos o email ya registrado',
                          },
                          '401': { description: 'No autenticado' },
                          '403': {
                            description:
                              'Acceso denegado. Solo los administradores pueden actualizar usuarios',
                          },
                          '404': { description: 'Usuario no encontrado' },
                          '500': { description: 'Error interno del servidor' },
                        },
                      },
                    },
                    '/api/reports/csv': {
                      get: {
                        summary: 'Descargar reporte CSV de transacciones',
                        description:
                          'Genera y descarga un archivo CSV con todas las transacciones del sistema. Solo accesible para administradores.',
                        tags: ['Reports'],
                        security: [{ cookieAuth: [] }],
                        responses: {
                          '200': {
                            description: 'Archivo CSV generado exitosamente',
                            content: {
                              'text/csv': {
                                schema: { type: 'string' },
                                example:
                                  'ID,Concepto,Monto,Tipo,Fecha,Usuario,Fecha Creación\\n1,Salario,5000,INGRESO,01/01/2024,John Doe,01/01/2024',
                              },
                            },
                            headers: {
                              'Content-Disposition': {
                                description: 'Nombre del archivo descargado',
                                schema: {
                                  type: 'string',
                                  example:
                                    'attachment; filename="reporte-transacciones.csv"',
                                },
                              },
                            },
                          },
                          '401': { description: 'No autenticado' },
                          '403': {
                            description:
                              'Acceso denegado. Solo los administradores pueden descargar reportes',
                          },
                          '500': { description: 'Error interno del servidor' },
                        },
                      },
                    },
                  },
                })},
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                  SwaggerUIBundle.presets.apis,
                  SwaggerUIStandalonePreset
                ],
                plugins: [
                  SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
