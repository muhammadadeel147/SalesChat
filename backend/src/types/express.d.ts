import type { FeatureKey, UserRole } from '../constants/features.js';
import type { AuthenticatedSyncDevice } from '../modules/sync/sync-device.service.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  tenantId: string | null;
  features: FeatureKey[];
  mustChangePassword: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      syncDevice?: AuthenticatedSyncDevice;
    }
  }
}

export {};
