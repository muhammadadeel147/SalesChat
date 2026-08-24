import 'dotenv/config';

import { createApp } from './app.js';
import { appConfig } from './config.js';
import { logger } from './logger.js';
import { prisma } from './modules/core/prisma.js';
import { ensureLayoutColumns } from './modules/settings/settings.service.js';
import { startSyncWorker, stopSyncWorker } from './modules/sync/worker.js';
import { startSubscriptionInterval } from './modules/tenants/subscription.service.js';

export async function start(): Promise<void> {
  const app = createApp();
  let subscriptionTimer: NodeJS.Timeout | undefined;

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down');
    stopSyncWorker();
    if (subscriptionTimer) clearInterval(subscriptionTimer);
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(appConfig.port, appConfig.host, () => resolve());
    server.on('error', reject);
  });

  logger.info(`Server listening on ${appConfig.host}:${appConfig.port}`);

  const layoutOk = await ensureLayoutColumns();
  logger.info(
    { layoutColumns: layoutOk },
    layoutOk
      ? 'Business settings layout columns ready'
      : 'Layout columns unavailable — Customize will stay disabled until DB allows ALTER TABLE',
  );

  subscriptionTimer = startSubscriptionInterval(logger);

  if (appConfig.deploymentMode === 'hybrid') {
    startSyncWorker(logger);
  }
}

if (process.env.SKIP_SERVER_START !== 'true') {
  void start().catch((err: unknown) => {
    logger.error(err);
    process.exit(1);
  });
}
