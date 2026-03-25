// src/config/database.ts
// Singleton de Prisma Client - evita múltiples conexiones en hot-reload de desarrollo

import { PrismaClient } from '@prisma/client';
import { createModuleLogger } from '../utils/logger';

const log = createModuleLogger('database');

// Extensión global para desarrollo (evita re-instanciación en hot reload)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
  const client = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  });

  // Log de queries en desarrollo
  if (process.env.NODE_ENV === 'development') {
    client.$on('query', (e) => {
      log.debug('Query ejecutada', {
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`,
      });
    });
  }

  client.$on('error', (e) => {
    log.error('Error en Prisma', { message: e.message, target: e.target });
  });

  client.$on('warn', (e) => {
    log.warn('Advertencia en Prisma', { message: e.message, target: e.target });
  });

  return client;
};

export const prisma: PrismaClient =
  global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

// Desconexión limpia al cerrar la app
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    log.info('✅ Base de datos conectada correctamente');
  } catch (error) {
    log.error('❌ Error al conectar base de datos', { error });
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  log.info('Base de datos desconectada');
};
