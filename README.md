# Sistema de Gestión Financiera

> **Aplicación web completa** para gestionar ingresos, gastos y reportes financieros con autenticación y control de roles.

## 🌐 **Aplicación Desplegada**

**URL de Producción:** [https://prueba-tecnica-fullstack-bice.vercel.app](https://prueba-tecnica-fullstack-bice.vercel.app)

> **¡La aplicación está completamente funcional en producción!**

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

### Funcionalidades Avanzadas

- **Mensajes de error informativos:** Información clara sobre problemas de BD
- **CORS configurado:** Para requests desde Vercel
- **Variables de entorno optimizadas:** Para producción

---

## Tabla de Contenidos

- [Aplicación Desplegada](#aplicación-desplegada)
- [Características Principales](#características-principales)
- [Instalación Rápida](#instalación-rápida)
- [Configuración Detallada](#configuración-detallada)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Roles y Permisos](#roles-y-permisos)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Solución de Problemas](#solución-de-problemas)

---

## Instalación Rápida

### 1. Clonar el repositorio

```bash
git clone https://github.com/Bustos407/prueba-tecnica-fullstack.git
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
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000/api/auth"
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

### ✅ **Aplicación Desplegada**

**URL:** [https://prueba-tecnica-fullstack-bice.vercel.app](https://prueba-tecnica-fullstack-bice.vercel.app)

### Configuración de Producción

#### Variables de Entorno en Vercel

Configura las siguientes variables en tu proyecto de Vercel:

```env
# Base de datos
DATABASE_URL="tu-database-url"

# GitHub OAuth
GITHUB_CLIENT_ID="tu-github-client-id"
GITHUB_CLIENT_SECRET="tu-github-client-secret"
BETTER_AUTH_SECRET="tu-secret-super-seguro"

# URLs de producción
NEXT_PUBLIC_BASE_URL="https://tu-app.vercel.app"
NEXT_PUBLIC_BETTER_AUTH_URL="https://tu-app.vercel.app/api/auth"
```

#### Configuración de GitHub OAuth para Producción

1. Ve a tu aplicación OAuth en GitHub
2. Configura:
   - **Homepage URL:** `https://prueba-tecnica-fullstack-bice.vercel.app`
   - **Authorization callback URL:** `https://prueba-tecnica-fullstack-bice.vercel.app/api/auth/callback/github`

### Proceso de Despliegue

1. **Conectar repositorio** a Vercel
2. **Configurar variables de entorno** (ver arriba)
3. **Hacer push** a la rama main
4. **Vercel despliega automáticamente**

### Características del Despliegue

- ✅ **Build automático** con `prisma generate`
- ✅ **CORS configurado** para requests desde Vercel
- ✅ **Variables de entorno** optimizadas
- ✅ **Mensajes de error informativos**

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
│   ├── auth/                # Configuración Better Auth
│   ├── cors.ts              # Middleware CORS
│   └── db-health-check.ts   # Salud de base de datos

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

### Gestión de Errores

- **Mensajes informativos:** Errores 500 con contexto
- **CORS configurado:** Para requests desde Vercel
- **Variables de entorno:** Optimizadas para producción

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

### Error 500 con mensaje informativo

Si ves el mensaje:
```
"Error interno del servidor - Haciendo reset de la BD (posible caída de Supabase) - Puede tardar unos minutos"
```

**Solución:** Si hay problemas de conexión con la base de datos, es mejor reiniciar la BD directamente en el dashboard de Supabase.

---
