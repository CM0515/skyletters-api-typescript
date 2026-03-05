import app from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { logger } from "./utils/logger";

const server = app.listen(env.PORT, () => {
  logger.info(`Servidor escuchando en puerto ${env.PORT} (${env.NODE_ENV})`);
});

connectDatabase().catch((err) => {
  logger.error("No se pudo conectar a la base de datos", err);
  process.exit(1);
});

const shutdown = async (): Promise<void> => {
  logger.info("Cerrando servidor...");
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);