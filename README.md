# Skyletters API (TypeScript)

API REST en Node.js con TypeScript, Express, Prisma y MySQL. Arquitectura en capas: routes → controllers → services → repositories.

## Stack

- **Node.js** + **TypeScript** (strict mode)
- **Express.js** – framework HTTP
- **Prisma ORM** – MySQL
- **Zod** – validación de requests
- **JWT** – autenticación con refresh tokens
- **Winston** – logger
- **bcryptjs** – hash de contraseñas

## Requisitos

- Node.js >= 18
- MySQL 8.x (o compatible)
- npm o yarn

## Instalación

1. Clonar el repositorio e instalar dependencias:

```bash
npm install
```

2. Copiar variables de entorno:

```bash
cp .env.example .env
```

3. Editar `.env` y configurar al menos:

- `DATABASE_URL`: cadena de conexión MySQL (ej: `mysql://user:password@localhost:3306/skyletters_db`)
- `JWT_SECRET` y `JWT_REFRESH_SECRET`: claves seguras (mínimo 16 caracteres)

4. Generar el cliente de Prisma y ejecutar migraciones:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. (Opcional) Ejecutar el seed para crear un usuario administrador y rol por defecto:

```bash
npm run prisma:seed
```

Credenciales por defecto tras el seed:

- **Email:** `admin@skyletters.com`
- **Contraseña:** `Admin123!`

## Scripts

| Comando | Descripción |
|--------|-------------|
| `npm run dev` | Servidor en modo desarrollo (recarga automática) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm run start` | Ejecuta la API compilada (`node dist/server.js`) |
| `npm run lint` | Ejecuta ESLint sobre `src/` |
| `npm run prisma:generate` | Genera el cliente Prisma |
| `npm run prisma:migrate` | Aplica migraciones a la base de datos |
| `npm run prisma:studio` | Abre Prisma Studio |
| `npm run prisma:seed` | Ejecuta el seed (admin + rol inicial) |

## Estructura del proyecto

```
src/
├── app.ts                 # Configuración Express (rutas, middlewares)
├── server.ts              # Punto de entrada, conexión DB
├── config/
│   ├── env.ts             # Variables de entorno (Zod)
│   ├── database.ts        # Cliente Prisma
│   ├── cors.ts
│   └── rateLimit.ts
├── middlewares/
│   ├── auth.ts            # JWT (authMiddleware, optionalAuth)
│   ├── roles.ts           # requireRole, requireTipoUsuario
│   ├── errorHandler.ts
│   └── validate.ts        # Validación Zod en rutas
├── modules/
│   ├── auth/              # Login, refresh, logout
│   ├── usuarios/          # CRUD usuarios (admin, cont, aux)
│   ├── roles/             # RolesYPermisos
│   ├── parametrizacion/   # ParametrizacionSistema
│   ├── asientos/          # AsientoContable
│   ├── reportes/          # ReporteFinanciero
│   ├── impuestos/         # Impuestos
│   └── conciliacion/      # ConciliacionBancaria
├── repositories/          # Acceso a datos (Prisma)
├── services/              # Lógica de negocio
└── utils/
    ├── AppError.ts        # Errores HTTP centralizados
    └── logger.ts          # Winston
prisma/
├── schema.prisma          # Modelos y migraciones
└── seed.ts                # Datos iniciales (admin + rol)
```

## API

Prefijo base: `/api/v1`.

### Autenticación (público)

- `POST /api/v1/auth/login` – Body: `{ correoUsuario, contrasenaUsuario }`
- `POST /api/v1/auth/refresh` – Body: `{ refreshToken }`
- `POST /api/v1/auth/logout` – Header `Authorization: Bearer <token>`, Body opcional: `{ refreshToken }`

El resto de rutas requieren `Authorization: Bearer <accessToken>` y el permiso correspondiente en el rol (según `RolesYPermisos`).

### Rutas protegidas (requieren JWT + permiso)

- **Usuarios:** `GET/POST /api/v1/usuarios`, `GET/PUT/DELETE /api/v1/usuarios/:id` (permiso: `usuarios`)
- **Roles:** `GET/POST /api/v1/roles`, `GET/PUT/DELETE /api/v1/roles/:id` (permiso: `roles`)
- **Parametrización:** `GET/POST /api/v1/parametrizacion`, `GET /api/v1/parametrizacion/current`, `GET/PUT/DELETE /api/v1/parametrizacion/:id` (permiso: `parametrizacion`)
- **Asientos:** `GET/POST /api/v1/asientos`, `GET/PUT/DELETE /api/v1/asientos/:id` (permiso: `asientos`)
- **Reportes:** `GET/POST /api/v1/reportes`, `GET/PUT/DELETE /api/v1/reportes/:id` (permiso: `reportes`)
- **Impuestos:** `GET/POST /api/v1/impuestos`, `GET/PUT/DELETE /api/v1/impuestos/:id` (permiso: `impuestos`)
- **Conciliación:** `GET/POST /api/v1/conciliacion`, `GET/PUT/DELETE /api/v1/conciliacion/:id` (permiso: `conciliacion`)

### Documentación e interfaz de pruebas

- **Swagger UI:** `GET http://localhost:3000/api-docs` – Documentación OpenAPI y pruebas de endpoints. Para rutas protegidas, usa **Authorize** e ingresa el `accessToken` obtenido en `POST /api/v1/auth/login`.

### Health check

- `GET /health` – Respuesta: `{ success: true, message: "OK", timestamp }`

## Modelos (Prisma)

- **Usuario** (base): id, nombreUsuario, correoUsuario, contrasenaUsuario, rolUsuario, estadoUsuario, tipoUsuario (admin | cont | aux).
- **UsuarioAdmin**, **UsuarioCont**, **UsuarioAux**: extensiones 1:1 con Usuario.
- **RolesYPermisos**: nombre, listaPermisos, listaRol, descripcion.
- **ParametrizacionSistema**, **AsientoContable**, **ReporteFinanciero**, **Impuesto**, **ConciliacionBancaria**: según diagrama de clases.

## Variables de entorno (.env.example)

Ver `.env.example` para todas las variables. Imprescindibles: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`. El resto tiene valores por defecto.

## Licencia

ISC
