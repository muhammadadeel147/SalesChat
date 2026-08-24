import { Router } from 'express';

import { FEATURES } from '../../constants/index.js';

import { jsonHandler } from '../../middleware/async-handler.js';
import { ValidationError } from '../core/errors.js';
import { resolveTenantId } from '../core/tenant.js';
import { authenticate, requireFeature } from '../permissions/permissions.middleware.js';
import {
  createCustomer,
  customerSchema,
  deleteCustomer,
  fetchCustomerLedger,
  getCustomer,
  listCustomers,
  recordCustomerPayment,
  recordPaymentSchema,
  updateCustomer,
  voidCustomerLedgerEntry,
} from './customers.service.js';

export function createCustomerRouter(): Router {
  const router = Router();

  router.get(
    '/customers',
    authenticate,
    requireFeature(FEATURES.CUSTOMERS_VIEW),
    jsonHandler(async (req) => {
      const q = req.query as {
        search?: string;
        page?: string;
        pageSize?: string;
        sortBy?: string;
        from?: string;
        to?: string;
      };
      return listCustomers(
        resolveTenantId(req),
        q.search,
        q.page ? Number(q.page) : 1,
        q.pageSize ? Number(q.pageSize) : 50,
        q.sortBy === 'balance' ? 'balance' : 'name',
        q.from,
        q.to,
      );
    }),
  );

  router.get(
    '/customers/:id',
    authenticate,
    requireFeature(FEATURES.CUSTOMERS_VIEW),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      return getCustomer(resolveTenantId(req), id);
    }),
  );

  router.post(
    '/customers',
    authenticate,
    requireFeature(FEATURES.CUSTOMERS_EDIT),
    jsonHandler(async (req) => {
      const parsed = customerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return createCustomer(resolveTenantId(req), parsed.data);
    }),
  );

  router.patch(
    '/customers/:id',
    authenticate,
    requireFeature(FEATURES.CUSTOMERS_EDIT),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      const parsed = customerSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return updateCustomer(resolveTenantId(req), id, parsed.data);
    }),
  );

  router.delete(
    '/customers/:id',
    authenticate,
    requireFeature(FEATURES.CUSTOMERS_EDIT),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      return deleteCustomer(resolveTenantId(req), id);
    }),
  );

  router.get(
    '/customers/:id/ledger',
    authenticate,
    requireFeature(FEATURES.CUSTOMERS_LEDGER_VIEW),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      return fetchCustomerLedger(resolveTenantId(req), id);
    }),
  );

  router.post(
    '/customers/:id/payments',
    authenticate,
    requireFeature(FEATURES.CUSTOMERS_LEDGER_RECORD),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      const parsed = recordPaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return recordCustomerPayment(resolveTenantId(req), id, parsed.data, req.user!.id);
    }),
  );

  router.post(
    '/customers/:id/ledger/:entryId/void',
    authenticate,
    requireFeature(FEATURES.CUSTOMERS_LEDGER_EDIT),
    jsonHandler(async (req) => {
      const { id, entryId } = req.params as { id: string; entryId: string };
      const body = req.body as { reason?: string };
      if (!body?.reason) throw new ValidationError('Void reason is required');
      return voidCustomerLedgerEntry(
        resolveTenantId(req),
        id,
        entryId,
        req.user!.id,
        body.reason,
        req.ip,
      );
    }),
  );

  return router;
}
