# Sistema de Gestión Financiera

> **Aplicación web completa** para gestionar ingresos, gastos y reportes financieros con autenticación y control de roles.

## Características Principales

### Gestión Financiera
- **Transacciones:** Crear, editar, eliminar ingresos y gastos
- **Balance automático:** Cálculo en tiempo real de saldos
- **Reportes:** Gráficos y exportación a CSV
- **Gestión de usuarios:** CRUD completo con roles

### Seguridad y Autenticación
- **GitHub OAuth:** Login seguro con GitHub
- **Sistema de roles:** USER y ADMIN con permisos específicos
- **Protección de rutas:** Middleware de autenticación
- **Validación de datos:** En frontend y backend

### Tecnologías Modernas
- **Next.js 15** con TypeScript
- **Tailwind CSS** para UI moderna
- **PostgreSQL** con Prisma ORM
- **Swagger/OpenAPI** para documentación
- **Jest** para testing

---

## Tabla de Contenidos

- [Características Principales](#características-principales)
- [Instalación Rápida](#instalación-rápida)
- [Configuración Detallada](#configuración-detallada)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Roles y Permisos](#roles-y-permisos)
- [Testing](#testing)
- [API Documentation](#api-documentation)

---

## Instalación Rápida

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
Crear archivo `.env.local`:
```env
# Base de datos (Supabase)
DATABASE_URL="postgresql://usuario:password@host:puerto/database"

# GitHub OAuth
GITHUB_CLIENT_ID="tu-github-client-id"
GITHUB_CLIENT_SECRET="tu-github-client-secret"

# URL base
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Configurar base de datos
```bash
# Generar cliente Prisma
npx prisma generate

# Sincronizar esquema
npx prisma db push

# Agregar datos de prueba
npm run db:seed
```

### 5. Ejecutar el proyecto
```bash
npm run dev
```

**¡Listo!** Visita `http://localhost:3000`

---

## Configuración Detallada

### Configurar GitHub OAuth

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Crea una nueva **OAuth App**
3. Configura:
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Copia el **Client ID** y **Client Secret** a tu `.env.local`

### Configurar Supabase (Base de datos)

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a **Settings > Database**
4. Copia la **Connection string** a tu `DATABASE_URL`

### Comandos útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Build de producción
npm start              # Servidor de producción

# Base de datos
npx prisma studio      # Interfaz visual de la BD
npx prisma db push     # Sincronizar esquema
npx prisma generate    # Regenerar cliente

# Testing
npm test              # Ejecutar pruebas
npm run test:watch    # Modo watch

# Datos de prueba
npm run db:seed       # Agregar datos de ejemplo
```

---

## Despliegue en Vercel

### 1. Preparar el proyecto
```bash
# Verificar que el build funciona
npm run build
```

### 2. Conectar con Vercel

1. Ve a [Vercel](https://vercel.com) y conecta tu repositorio de GitHub
2. Configura las **variables de entorno** en Vercel:
   ```
   DATABASE_URL=tu-url-de-supabase
   GITHUB_CLIENT_ID=tu-github-client-id
   GITHUB_CLIENT_SECRET=tu-github-client-secret
   NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app
   ```

### 3. Desplegar
```bash
# Con Vercel CLI
npm i -g vercel
vercel --prod

# O desde GitHub (automático)
# Solo haz push a main/master
```

**¡Tu app estará disponible en `https://tu-dominio.vercel.app`!**

---

## Estructura del Proyecto

```
prueba-tecnica-fullstack/
├── pages/                    # Páginas y API Routes
│   ├── index.tsx            # Página principal
│   ├── transactions.tsx     # Gestión de transacciones
│   ├── users.tsx            # Gestión de usuarios
│   ├── reports.tsx          # Reportes financieros
│   └── api/                 # API Endpoints
│       ├── auth/            # Autenticación
│       ├── transactions/    # CRUD transacciones
│       ├── users/           # CRUD usuarios
│       ├── reports/         # Reportes CSV
│       └── docs.ts          # Documentación API
├── prisma/
│   └── schema.prisma        # Esquema de base de datos
├── lib/
│   └── auth/                # Configuración Better Auth
├── __tests__/               # Pruebas unitarias
├── components/              # Componentes UI
└── styles/                  # Estilos globales
```

---

## Roles y Permisos

### ADMIN
- Crear, editar, eliminar transacciones
- Gestionar usuarios (crear, editar, eliminar)
- Ver reportes y gráficos
- Descargar reportes CSV
- Acceso a documentación API

### USER
- Ver transacciones
- No puede crear/editar transacciones
- No puede gestionar usuarios
- No puede ver reportes
- No tiene acceso a documentación API

---

## Testing

### Ejecutar pruebas
```bash
# Todas las pruebas
npm test

# Modo watch
npm run test:watch

# Cobertura
npm test -- --coverage
```

### Pruebas incluidas
- **47 pruebas unitarias** ejecutándose
- Validación de datos
- Autenticación y autorización
- Lógica de negocio
- Utilidades

---

## API Documentation

### Acceso a la documentación
- **URL:** `/api/docs` (Swagger UI)
- **Especificación:** OpenAPI 3.0
- **Testing:** Interactivo desde la interfaz

### Endpoints principales

#### Transacciones
```
GET    /api/transactions     # Obtener todas
POST   /api/transactions     # Crear nueva
PUT    /api/transactions/[id] # Actualizar
DELETE /api/transactions/[id] # Eliminar
```

#### Usuarios
```
GET    /api/users            # Obtener todos
POST   /api/users            # Crear nuevo
PUT    /api/users/[id]       # Actualizar
DELETE /api/users            # Eliminar
```

#### Reportes
```
GET    /api/reports/csv      # Descargar CSV
```

---

## Funcionalidades Destacadas

### Gestión de Transacciones
- Formulario intuitivo para agregar ingresos/gastos
- Tabla con filtros y ordenamiento
- Cálculo automático de balance
- Botones de editar/eliminar (solo ADMIN)

### Gestión de Usuarios
- Lista completa de usuarios
- Crear nuevos usuarios
- Editar roles y información
- Protección del usuario de pruebas

### Reportes Financieros
- Gráficos de ingresos vs gastos
- Balance actual en tiempo real
- Exportación a CSV
- Visualización moderna con Tailwind

### Seguridad
- Autenticación con GitHub OAuth
- Control de acceso basado en roles
- Validación de datos en frontend y backend
- Middleware de protección de rutas

---

## Estado del Proyecto

### COMPLETADO (100%)
- Base de datos PostgreSQL configurada
- Autenticación con GitHub funcionando
- CRUD completo para transacciones y usuarios
- Sistema de roles implementado
- Reportes y gráficos funcionando
- Documentación API completa
- Pruebas unitarias (47 tests)
- Diseño responsive con Tailwind
- Despliegue en Vercel listo

---

## Solución de Problemas

### Error de base de datos
```bash
# Regenerar cliente Prisma
npx prisma generate

# Sincronizar esquema
npx prisma db push
```

### Error de autenticación
- Verificar variables de entorno
- Confirmar configuración de GitHub OAuth
- Revisar URLs de callback

### Error de build
```bash
# Limpiar cache
rm -rf .next
npm run build
```

---

## Soporte

- **Issues:** [GitHub Issues](https://github.com/tu-usuario/tu-repo/issues)
- **Documentación:** `/api/docs` en tu aplicación
- **Email:** soporte@ejemplo.com

---

## Licencia

Este proyecto está bajo la **Licencia MIT**. Ver el archivo `LICENSE` para más detalles.

---

## Agradecimientos

- **Next.js** por el framework
- **Vercel** por el hosting
- **Supabase** por la base de datos
- **Tailwind CSS** por los estilos
- **Better Auth** por la autenticación

---

**¡Si te gusta este proyecto, dale una estrella en GitHub!**
