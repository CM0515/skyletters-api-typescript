# SKYLETTERS 🌟
### Sistema Contable para CARTAS AL CIELO

Backend profesional con Node.js + TypeScript, diseñado sobre principios contables reales (partida doble, PUC Colombia).

---

## 🏗️ Arquitectura

```
src/
├── app.ts                        # Configuración de Express
├── server.ts                     # Punto de entrada + graceful shutdown
├── config/
│   ├── database.ts               # Prisma singleton
│   └── env.ts                    # Validación de variables de entorno (Zod)
├── middlewares/
│   ├── auth.ts                   # JWT autenticar + autorizar (RBAC)
│   └── errorHandler.ts           # Handler global + asyncHandler wrapper
├── modules/
│   ├── auth/                     # Login, refresh, logout
│   ├── usuarios/                 # CRUD usuarios + cambio de contraseña
│   ├── asientos/                 # Asientos contables (partida doble)
│   ├── reportes/                 # Balance General, Estado Resultados, Mayor
│   ├── impuestos/                # IVA, Retenciones, cálculo
│   ├── parametrizacion/          # Plan de cuentas, períodos, parámetros
│   └── conciliacion/             # Conciliación bancaria
├── utils/
│   ├── logger.ts                 # Winston estructurado
│   └── AppError.ts               # Jerarquía de errores del dominio
prisma/
├── schema.prisma                 # Modelo de datos completo
└── seed.ts                       # Datos iniciales (roles, PUC Colombia, impuestos)
```

---

## 🚀 Inicio rápido

### 1. Prerequisitos
- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm o pnpm

### 2. Instalación

```bash
npm install
cp .env.example .env
# Edita .env con tu DATABASE_URL y secretos JWT
```

### 3. Base de datos

```bash
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed
```

### 4. Ejecutar

```bash
# Desarrollo (hot reload)
npm run dev

# Producción
npm run build && npm start
```

### 5. Verificar

```bash
curl http://localhost:3000/health
```

---

## 🔐 Autenticación

```bash
# Login
POST /api/v1/auth/login
{ "email": "admin@cartasalcielo.com", "password": "Admin123!" }

# Respuesta
{
  "tokens": {
    "accessToken": "eyJ...",     # Válido 15 min
    "refreshToken": "eyJ...",    # Válido 7 días
    "expiresIn": "15m"
  },
  "usuario": { "id": "...", "rol": "Administrador" }
}

# Renovar token
POST /api/v1/auth/refresh
{ "refreshToken": "eyJ..." }
```

---

## 📊 Endpoints principales

### Asientos Contables
```
POST   /api/v1/asientos              Crear asiento (valida partida doble)
GET    /api/v1/asientos              Listar con filtros + paginación
GET    /api/v1/asientos/:id          Obtener asiento con líneas
PATCH  /api/v1/asientos/:id/aprobar  Aprobar asiento borrador
PATCH  /api/v1/asientos/:id/anular   Anular (crea reverso si estaba aprobado)
GET    /api/v1/asientos/saldo/:id    Saldo de cuenta contable
```

### Reportes Financieros
```
GET /api/v1/reportes/balance-general?fecha=2024-12-31
GET /api/v1/reportes/estado-resultados?desde=...&hasta=...
GET /api/v1/reportes/libro-diario?desde=...&hasta=...
GET /api/v1/reportes/mayor/:cuentaId?desde=...&hasta=...
```

### Plan de Cuentas
```
GET  /api/v1/parametrizacion/cuentas         Listar PUC (filtros: tipo, solo_hoja)
POST /api/v1/parametrizacion/cuentas         Crear cuenta
GET  /api/v1/parametrizacion/periodos        Listar períodos
POST /api/v1/parametrizacion/periodos        Crear período
PATCH /api/v1/parametrizacion/periodos/:id/estado  Abrir/Cerrar período
```

### Impuestos
```
GET  /api/v1/impuestos           Listar impuestos activos
POST /api/v1/impuestos           Crear impuesto
POST /api/v1/impuestos/calcular  Calcular valor { impuestoId, base }
```

### Conciliación Bancaria
```
POST /api/v1/conciliacion/cuentas-bancarias    Crear cuenta bancaria
GET  /api/v1/conciliacion/movimientos          Listar movimientos
POST /api/v1/conciliacion/movimientos          Registrar movimiento
POST /api/v1/conciliacion/movimientos/lote     Importar extracto (hasta 500)
POST /api/v1/conciliacion/iniciar              Iniciar proceso de conciliación
GET  /api/v1/conciliacion/:id                  Estado de conciliación
```

---

## 📋 Ejemplo: Crear asiento de venta

```json
POST /api/v1/asientos
Authorization: Bearer <token>

{
  "fecha": "2024-03-15T00:00:00.000Z",
  "descripcion": "Venta de servicios a cliente ABC",
  "tipo": "INGRESO",
  "periodoId": "clxxx...",
  "terceroId": "clyyy...",
  "referencia": "FV-2024-001",
  "lineas": [
    {
      "cuentaId": "<id-cuenta-1305>",
      "descripcion": "Cuenta por cobrar cliente ABC",
      "debito": 1190000,
      "credito": 0
    },
    {
      "cuentaId": "<id-cuenta-4155>",
      "descripcion": "Ingresos por servicios",
      "debito": 0,
      "credito": 1000000
    },
    {
      "cuentaId": "<id-cuenta-2408>",
      "descripcion": "IVA 19% generado",
      "debito": 0,
      "credito": 190000
    }
  ]
}
```

**Validaciones automáticas:**
- ✅ Total débitos ($1.190.000) = Total créditos ($1.190.000)
- ✅ Período activo (ABIERTO)
- ✅ Cuentas hoja (acepta_movimientos = true)
- ✅ Una línea no puede tener débito Y crédito simultáneamente

---

## 🛡️ Roles y Permisos

| Módulo          | Auxiliar   | Contador   | Administrador |
|-----------------|------------|------------|---------------|
| Asientos        | leer/crear | todos      | todos         |
| Reportes        | leer       | todos      | todos         |
| Usuarios        | —          | leer       | todos         |
| Parametrización | leer       | leer       | todos         |
| Impuestos       | leer       | todos      | todos         |
| Conciliación    | —          | todos      | todos         |

---

## 🧩 Tecnologías

| Capa             | Tecnología                    |
|------------------|-------------------------------|
| Runtime          | Node.js 18+ / TypeScript 5    |
| Framework        | Express 4                     |
| ORM              | Prisma 5 (PostgreSQL)         |
| Autenticación    | JWT (access + refresh tokens) |
| Validación       | Zod                           |
| Logs             | Winston                       |
| Seguridad        | Helmet, bcryptjs, rate-limit  |
| Hashing          | bcryptjs (rounds: 12)         |

---

## 📐 Principios contables implementados

1. **Partida doble** — Todo asiento requiere Débitos = Créditos (validado con ε=0.001)
2. **Naturaleza de cuentas** — DÉBITO (Activos, Gastos, Costos) / CRÉDITO (Pasivos, Patrimonio, Ingresos)
3. **Período contable** — No se permite registrar en períodos cerrados o bloqueados
4. **Anulación con reverso** — Los asientos aprobados se anulan creando un asiento espejo
5. **Cuentas de agrupación** — Solo cuentas hoja (nivel 3+) aceptan movimientos directos
6. **Ecuación contable** — Balance General verifica: Activos = Pasivos + Patrimonio

---

*SKYLETTERS v1.0.0 — Construido con ❤️ para CARTAS AL CIELO*
