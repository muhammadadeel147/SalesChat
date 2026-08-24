import { Router } from 'express';
import { z } from 'zod';

import { USER_ROLES } from '../../constants/index.js';
import { logger } from '../../logger.js';
import { jsonHandler } from '../../middleware/async-handler.js';
import { appConfig } from '../../config.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../core/errors.js';
import { prisma } from '../core/prisma.js';
import { resolveTenantId } from '../core/tenant.js';
import { authenticate } from '../permissions/permissions.middleware.js';
import { fetchChangelogSince } from './changelog.service.js';
import { getCloudRecord } from './cloud-record.service.js';
import { ingestRemoteChanges, ingestRequestSchema } from './ingest.service.js';
import {
  buildSyncStatusMessage,
  dismissOutboxEntry,
  getFailedOutboxCount,
  listOutboxIssues,
  retryOutboxEntry,
} from './outbox-issues.service.js';
import {
  getConflictOutboxCount,
  getPendingOutboxCount,
  isSyncOutboxActive,
} from './outbox.service.js';
import { requireSyncApiKey } from './sync-auth.middleware.js';
import { assertSyncDeviceBinding, registerSyncDevice } from './sync-device.service.js';
import {
  getSyncWorkerConfig,
  isCloudIngestEnabled,
  isHybridWorkerConfigured,
} from './sync-config.js';
import { isSyncWorkerRunning, runSyncCycle } from './worker.js';

const registerDeviceSchema = z.object({
  deviceId: z.string().min(1).max(100),
  label: z.string().max(255).optional(),
});

const dismissSchema = z.object({
  reason: z.string().min(1).max(500),
});

export function createSyncRouter(): Router {
  const router = Router();

  router.get(
    '/sync/status',
    authenticate,
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const pendingCount = isSyncOutboxActive() ? await getPendingOutboxCount(tenantId) : 0;
      const conflictCount = isSyncOutboxActive() ? await getConflictOutboxCount(tenantId) : 0;
      const failedCount = isSyncOutboxActive() ? await getFailedOutboxCount(tenantId) : 0;

      const syncState = await prisma.syncState.findUnique({ where: { tenantId } });
      const config = getSyncWorkerConfig();

      let status: 'synced' | 'pending' | 'conflict' | 'failed' = 'synced';
      if (conflictCount > 0) status = 'conflict';
      else if (failedCount > 0) status = 'failed';
      else if (pendingCount > 0) status = 'pending';

      return {
        deploymentMode: appConfig.deploymentMode,
        pendingChanges: pendingCount,
        conflictChanges: conflictCount,
        failedChanges: failedCount,
        status,
        userMessage: buildSyncStatusMessage(pendingCount, conflictCount, failedCount),
        workerRunning: isSyncWorkerRunning(),
        workerConfigured: isHybridWorkerConfigured(config),
        lastPushedAt: syncState?.lastPushedAt?.toISOString() ?? null,
        lastPulledAt: syncState?.lastPulledAt?.toISOString() ?? null,
        cloudCursor: syncState?.cloudCursor ?? null,
      };
    }),
  );

  router.get(
    '/sync/outbox/issues',
    authenticate,
    jsonHandler(async (req) => {
      if (!isSyncOutboxActive()) {
        return { data: [] };
      }
      const tenantId = resolveTenantId(req);
      return { data: await listOutboxIssues(tenantId) };
    }),
  );

  router.post(
    '/sync/outbox/:outboxId/retry',
    authenticate,
    jsonHandler(async (req) => {
      if (!isSyncOutboxActive()) {
        throw new ForbiddenError('Outbox retry is only available in hybrid mode');
      }
      if (req.user!.role === USER_ROLES.STAFF) {
        throw new ForbiddenError('Only client admins can manage sync conflicts');
      }
      const { outboxId } = req.params as { outboxId: string };
      return retryOutboxEntry(resolveTenantId(req), outboxId);
    }),
  );

  router.post(
    '/sync/outbox/:outboxId/dismiss',
    authenticate,
    jsonHandler(async (req) => {
      if (!isSyncOutboxActive()) {
        throw new ForbiddenError('Outbox dismiss is only available in hybrid mode');
      }
      if (req.user!.role === USER_ROLES.STAFF) {
        throw new ForbiddenError('Only client admins can manage sync conflicts');
      }
      const { outboxId } = req.params as { outboxId: string };
      const parsed = dismissSchema.safeParse(req.body);
      if (!parsed.success)
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      return dismissOutboxEntry(resolveTenantId(req), outboxId, parsed.data.reason);
    }),
  );

  router.post(
    '/sync/run',
    authenticate,
    jsonHandler(async () => {
      if (!isHybridWorkerConfigured()) {
        throw new ForbiddenError(
          'Manual sync requires hybrid mode with SYNC_CLOUD_URL, SYNC_API_KEY, SYNC_DEVICE_ID, and TENANT_ID',
        );
      }
      const summary = await runSyncCycle(getSyncWorkerConfig(), logger);
      return summary ?? { online: false, push: null, pull: null };
    }),
  );

  router.post(
    '/sync/devices',
    authenticate,
    jsonHandler(async (req) => {
      if (req.user!.role === USER_ROLES.STAFF) {
        throw new ForbiddenError('Only client admins can register sync devices');
      }
      const parsed = registerDeviceSchema.safeParse(req.body);
      if (!parsed.success)
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      return registerSyncDevice(resolveTenantId(req), parsed.data.deviceId, parsed.data.label);
    }),
  );

  if (isCloudIngestEnabled()) {
    router.post(
      '/sync/ingest',
      requireSyncApiKey,
      jsonHandler(async (req) => {
        const parsed = ingestRequestSchema.safeParse(req.body);
        if (!parsed.success) {
          throw new ValidationError('Invalid ingest payload', parsed.error.flatten());
        }

        const results = await ingestRemoteChanges(parsed.data, req.syncDevice!);
        return { results };
      }),
    );

    router.get(
      '/sync/changes',
      requireSyncApiKey,
      jsonHandler(async (req) => {
        const q = req.query as { tenantId?: string; cursor?: string; limit?: string };
        if (!q.tenantId) throw new ValidationError('tenantId is required');

        assertSyncDeviceBinding(req.syncDevice!, q.tenantId, req.syncDevice!.deviceId);

        const limit = q.limit ? Math.min(Number(q.limit), 100) : 50;
        const changes = await fetchChangelogSince(
          q.tenantId,
          q.cursor ?? null,
          limit,
          req.syncDevice!.deviceId,
        );

        return {
          changes: changes.map((c) => ({
            id: c.id,
            tableName: c.tableName,
            recordId: c.recordId,
            operation: c.operation,
            payload: c.payload,
            recordVersion: c.recordVersion,
            createdAt: c.createdAt.toISOString(),
          })),
          nextCursor: changes.length > 0 ? changes[changes.length - 1]!.id : (q.cursor ?? null),
        };
      }),
    );

    router.get(
      '/sync/records/:tableName/:recordId',
      requireSyncApiKey,
      jsonHandler(async (req) => {
        const { tableName, recordId } = req.params as { tableName: string; recordId: string };
        const q = req.query as { tenantId?: string };
        if (!q.tenantId) throw new ValidationError('tenantId is required');

        assertSyncDeviceBinding(req.syncDevice!, q.tenantId, req.syncDevice!.deviceId);

        const record = await getCloudRecord(q.tenantId, tableName, recordId);
        if (!record) throw new NotFoundError('Remote record not found');

        return record;
      }),
    );
  }

  return router;
}
