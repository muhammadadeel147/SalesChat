import { asyncGuard } from '../../middleware/async-handler.js';
import { UnauthorizedError } from '../core/errors.js';
import { authenticateSyncDevice } from './sync-device.service.js';

export const requireSyncApiKey = asyncGuard(async (req) => {
  const provided = req.headers['x-sync-api-key'];
  if (typeof provided !== 'string' || provided.length === 0) {
    throw new UnauthorizedError('Sync API key required');
  }

  const device = await authenticateSyncDevice(provided);
  if (!device) {
    throw new UnauthorizedError('Invalid sync API key');
  }

  req.syncDevice = device;
});
