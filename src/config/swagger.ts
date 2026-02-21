import { env } from "./env";

const { API_PREFIX } = env;

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Skyletters API",
    description: "API REST para el sistema contable Skyletters. Autenticación JWT. Rutas protegidas requieren header `Authorization: Bearer <accessToken>`.",
    version: "1.0.0",
  },
  servers: [{ url: `http://localhost:${env.PORT}`, description: "Servidor local" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token obtenido en POST /auth/login",
      },
    },
    schemas: {
      LoginBody: {
        type: "object",
        required: ["correoUsuario", "contrasenaUsuario"],
        properties: {
          correoUsuario: { type: "string", format: "email" },
          contrasenaUsuario: { type: "string" },
        },
      },
      Persona: {
        type: "object",
        required: ["nombrePersona", "apellidoPersona", "correoPersona", "direccionPersona", "telefonoPersona", "generoPersona", "fechaNacimientoPersona"],
        properties: {
          nombrePersona: { type: "string" },
          apellidoPersona: { type: "string" },
          correoPersona: { type: "string", format: "email" },
          direccionPersona: { type: "string" },
          telefonoPersona: { type: "string" },
          generoPersona: { type: "string" },
          fechaNacimientoPersona: { type: "string", format: "date" },
        },
      },
      RefreshBody: {
        type: "object",
        required: ["refreshToken"],
        properties: { refreshToken: { type: "string" } },
      },
      CreateUsuarioBase: {
        type: "object",
        required: ["nombreUsuario", "correoUsuario", "contrasenaUsuario", "rolUsuario", "persona"],
        properties: {
          nombreUsuario: { type: "string" },
          correoUsuario: { type: "string", format: "email" },
          contrasenaUsuario: { type: "string" },
          rolUsuario: { type: "string" },
          estadoUsuario: { type: "boolean" },
          persona: { $ref: "#/components/schemas/Persona" },
        },
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        tags: ["Health"],
        responses: { 200: { description: "OK" } },
      },
    },
    [`${API_PREFIX}/auth/login`]: {
      post: {
        summary: "Iniciar sesión",
        tags: ["Auth"],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/LoginBody" } } } },
        responses: {
          200: { description: "Devuelve usuario y tokens (accessToken, refreshToken)" },
          401: { description: "Credenciales inválidas", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    [`${API_PREFIX}/auth/refresh`]: {
      post: {
        summary: "Refrescar access token",
        tags: ["Auth"],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshBody" } } } },
        responses: { 200: { description: "Nuevos tokens" }, 401: { description: "Refresh token inválido" } },
      },
    },
    [`${API_PREFIX}/auth/logout`]: {
      post: {
        summary: "Cerrar sesión (revocar refresh token)",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { refreshToken: { type: "string" } } } } } },
        responses: { 204: { description: "OK" } },
      },
    },
    [`${API_PREFIX}/usuarios`]: {
      get: { summary: "Listar usuarios", tags: ["Usuarios"], security: [{ bearerAuth: [] }], responses: { 200: { description: "Lista de usuarios" } } },
      post: {
        summary: "Crear usuario (admin/cont/aux)",
        tags: ["Usuarios"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateUsuarioBase",
              },
            },
          },
        },
        responses: { 201: { description: "Usuario creado" } },
      },
    },
    [`${API_PREFIX}/usuarios/{id}`]: {
      get: { summary: "Obtener usuario por ID", tags: ["Usuarios"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Usuario" }, 404: { description: "No encontrado" } } },
      put: { summary: "Actualizar usuario", tags: ["Usuarios"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Usuario actualizado" } } },
      delete: { summary: "Eliminar usuario", tags: ["Usuarios"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 204: { description: "Eliminado" } } },
    },
    [`${API_PREFIX}/roles`]: {
      get: { summary: "Listar roles y permisos", tags: ["Roles"], security: [{ bearerAuth: [] }], responses: { 200: { description: "Lista" } } },
      post: { summary: "Crear rol", tags: ["Roles"], security: [{ bearerAuth: [] }], responses: { 201: { description: "Rol creado" } } },
    },
    [`${API_PREFIX}/roles/{id}`]: {
      get: { summary: "Obtener rol por ID", tags: ["Roles"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Rol" } } },
      put: { summary: "Actualizar rol", tags: ["Roles"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Rol actualizado" } } },
      delete: { summary: "Eliminar rol", tags: ["Roles"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 204: { description: "Eliminado" } } },
    },
    [`${API_PREFIX}/parametrizacion`]: {
      get: { summary: "Listar parametrizaciones", tags: ["Parametrización"], security: [{ bearerAuth: [] }], responses: { 200: { description: "Lista" } } },
      post: { summary: "Crear parametrización", tags: ["Parametrización"], security: [{ bearerAuth: [] }], responses: { 201: { description: "Creado" } } },
    },
    [`${API_PREFIX}/parametrizacion/current`]: {
      get: { summary: "Parametrización actual", tags: ["Parametrización"], security: [{ bearerAuth: [] }], responses: { 200: { description: "Parametrización vigente" } } },
    },
    [`${API_PREFIX}/parametrizacion/{id}`]: {
      get: { summary: "Obtener por ID", tags: ["Parametrización"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Parametrización" } } },
      put: { summary: "Actualizar", tags: ["Parametrización"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Actualizado" } } },
      delete: { summary: "Eliminar", tags: ["Parametrización"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 204: { description: "Eliminado" } } },
    },
    [`${API_PREFIX}/asientos`]: {
      get: { summary: "Listar asientos contables", tags: ["Asientos"], security: [{ bearerAuth: [] }], responses: { 200: { description: "Lista" } } },
      post: { summary: "Crear asiento", tags: ["Asientos"], security: [{ bearerAuth: [] }], responses: { 201: { description: "Creado" } } },
    },
    [`${API_PREFIX}/asientos/{id}`]: {
      get: { summary: "Obtener asiento por ID", tags: ["Asientos"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Asiento" } } },
      put: { summary: "Actualizar asiento", tags: ["Asientos"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Actualizado" } } },
      delete: { summary: "Eliminar asiento", tags: ["Asientos"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 204: { description: "Eliminado" } } },
    },
    [`${API_PREFIX}/reportes`]: {
      get: { summary: "Listar reportes financieros", tags: ["Reportes"], security: [{ bearerAuth: [] }], responses: { 200: { description: "Lista" } } },
      post: { summary: "Crear reporte", tags: ["Reportes"], security: [{ bearerAuth: [] }], responses: { 201: { description: "Creado" } } },
    },
    [`${API_PREFIX}/reportes/{id}`]: {
      get: { summary: "Obtener reporte por ID", tags: ["Reportes"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Reporte" } } },
      put: { summary: "Actualizar reporte", tags: ["Reportes"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Actualizado" } } },
      delete: { summary: "Eliminar reporte", tags: ["Reportes"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 204: { description: "Eliminado" } } },
    },
    [`${API_PREFIX}/personas`]: {
      get: { summary: "Listar personas", tags: ["Personas"], security: [{ bearerAuth: [] }], responses: { 200: { description: "Lista" } } },
      post: {
        summary: "Crear persona", tags: ["Personas"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Persona",
              },
            },
          },
        },
        security: [{ bearerAuth: [] }], responses: { 201: { description: "Creado" } }
      },
    },
    [`${API_PREFIX}/personas/{id}`]: {
      get: { summary: "Obtener persona por ID", tags: ["Personas"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Persona" } } },
      put: { summary: "Actualizar persona", tags: ["Personas"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Actualizado" } } },
      delete: { summary: "Eliminar persona", tags: ["Personas"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 204: { description: "Eliminado" } } },
    },
  },
};
