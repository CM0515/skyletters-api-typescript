// src/server.ts
// Punto de entrada: arranca el servidor con manejo de señales del OS
// Decisión técnica: graceful shutdown para no cortar conexiones activas

import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  // 1. Conectar BD antes de aceptar tráfico
  await connectDatabase();

  // 2. Crear app Express
  const app = createApp();

  // 3. Iniciar servidor HTTP
  const server = app.listen(env.PORT, () => {
    logger.info('🚀 SKYLETTERS API iniciada', {
      puerto: env.PORT,
      entorno: env.NODE_ENV,
      empresa: env.EMPRESA_NOMBRE,
      api: `http://localhost:${env.PORT}${env.API_PREFIX}`,
    });
  });

  // ─── Graceful Shutdown ────────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Señal ${signal} recibida. Cerrando servidor...`);

    server.close(async () => {
      logger.info('Servidor HTTP cerrado');
      await disconnectDatabase();
      logger.info('✅ Apagado limpio completado');
      process.exit(0);
    });

    // Forzar cierre si tarda más de 10 segundos
    setTimeout(() => {
      logger.error('Cierre forzado por timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Capturar errores no manejados
  process.on('uncaughtException', (error) => {
    logger.error('Excepción no capturada', { error: error.message, stack: error.stack });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Promise rejection no manejada', { reason });
    process.exit(1);
  });
};

startServer().catch((error) => {
  logger.error('Error fatal al iniciar servidor', { error });
  process.exit(1);
});
