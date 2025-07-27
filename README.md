# Sistema de Gestión Financiera

## Descripción

Sistema completo de gestión de ingresos y egresos con autenticación, roles de usuario y reportes financieros. Desarrollado con Next.js, TypeScript, Prisma y Better Auth.

## Características Implementadas

### ✅ Funcionalidades Principales

1. **Autenticación con GitHub**
   - Integración con Better Auth
   - Todos los nuevos usuarios son automáticamente ADMIN para facilitar pruebas

2. **Gestión de Ingresos y Gastos**
   - Tabla de transacciones con filtros
   - Formulario para agregar nuevas transacciones
   - Cálculo automático de saldos

3. **Gestión de Usuarios**
   - Lista de usuarios con roles
   - Edición de nombres y roles
   - Control de acceso por roles

4. **Reportes Financieros**
   - Gráficos de ingresos vs egresos
   - Saldo actual
   - Descarga de reportes en CSV

### ✅ Tecnologías Utilizadas

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Base de Datos:** PostgreSQL (Supabase)
- **Autenticación:** Better Auth con GitHub
- **Documentación:** OpenAPI/Swagger
- **Testing:** Jest, React Testing Library

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd prueba-tecnica-fullstack
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@host:puerto/database"

# Better Auth
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000/api/auth"
GITHUB_CLIENT_ID="tu-github-client-id"
GITHUB_CLIENT_SECRET="tu-github-client-secret"

# URL base
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Configurar GitHub OAuth

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Crea una nueva OAuth App
3. Configura la URL de callback: `http://localhost:3000/api/auth/callback/github`
4. Copia el Client ID y Client Secret a tu `.env.local`

### 5. Configurar la base de datos

```bash
# Generar el cliente de Prisma
npx prisma generate

# Ejecutar las migraciones
npx prisma db push

# Agregar datos de prueba
npm run db:seed

# (Opcional) Abrir Prisma Studio
npx prisma studio
```

### 6. Ejecutar el proyecto

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## Estructura del Proyecto

```
prueba-tecnica-fullstack/
├── pages/
│   ├── api/                    # API Routes
│   │   ├── auth/              # Autenticación
│   │   ├── transactions/      # CRUD transacciones
│   │   ├── users/             # CRUD usuarios
│   │   ├── reports/           # Reportes CSV
│   │   └── docs.ts            # Documentación API
│   ├── index.tsx              # Página principal
│   ├── transactions.tsx       # Gestión transacciones
│   ├── users.tsx              # Gestión usuarios
│   ├── reports.tsx            # Reportes
│   └── api-docs.tsx           # Documentación API
├── prisma/
│   └── schema.prisma          # Esquema de base de datos
├── lib/
│   └── auth/                  # Configuración Better Auth
├── __tests__/                 # Pruebas unitarias
└── components/                # Componentes UI
```

## API Endpoints

### Transacciones

- `GET /api/transactions` - Obtener todas las transacciones
- `POST /api/transactions` - Crear nueva transacción

### Usuarios

- `GET /api/users` - Obtener todos los usuarios
- `PUT /api/users/[id]` - Actualizar usuario

### Reportes

- `GET /api/reports/csv` - Descargar reporte CSV

### Documentación

- `GET /api/docs` - Especificación OpenAPI
- `/api-docs` - Interfaz Swagger UI

## Roles y Permisos

- **ADMIN:** Acceso completo a todas las funcionalidades
- **USER:** Solo puede ver transacciones (no implementado en esta versión)

## Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch
```

## Despliegue en Vercel

### 1. Preparar el proyecto

```bash
# Asegúrate de que el build funcione localmente
npm run build
```

### 2. Configurar en Vercel

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno en Vercel:
   - `DATABASE_URL`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `NEXT_PUBLIC_BASE_URL`

### 3. Desplegar

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

## Características de Seguridad

- ✅ Control de acceso basado en roles (RBAC)
- ✅ Autenticación con GitHub OAuth
- ✅ Validación de datos en API endpoints
- ✅ Protección de rutas sensibles

## Estado Actual del Proyecto

### ✅ **COMPLETADO (100%)**

- ✅ Base de datos PostgreSQL con Prisma
- ✅ Todas las páginas y componentes UI
- ✅ API endpoints para CRUD completo
- ✅ Documentación OpenAPI/Swagger
- ✅ Control de roles en frontend y backend
- ✅ Datos de prueba incluidos
- ✅ Testing con Jest
- ✅ Estructura completa del proyecto
- ✅ **Autenticación real implementada**
- ✅ **Protección de endpoints activada**
- ✅ **Middleware de seguridad funcionando**

### 🎯 **Para usar el proyecto:**

1. Configura las variables de entorno
2. Ejecuta `npx prisma db push`
3. Ejecuta `npm run db:seed` para datos de prueba
4. Ejecuta `npm run dev`
5. Visita `http://localhost:3000`

## Características de Seguridad Implementadas

- ✅ **Control de acceso basado en roles (RBAC)** - Frontend y backend
- ✅ **Autenticación con GitHub OAuth** - Configurada y funcionando
- ✅ **Validación de datos** en todos los API endpoints
- ✅ **Protección de rutas sensibles** - Middleware activo
- ✅ **Verificación de sesiones** - En todos los endpoints protegidos
- ✅ **Validación de permisos** - Solo admins pueden acceder a ciertas funciones

## Próximos Pasos (Opcionales)

- [ ] Agregar más pruebas unitarias y de integración
- [ ] Implementar filtros avanzados en transacciones
- [ ] Agregar gráficos más sofisticados
- [ ] Implementar notificaciones en tiempo real
- [ ] Agregar auditoría de cambios
- [ ] Implementar rate limiting

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
