import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Guard / middleware that throws AppError; Express next() on success. */
export function asyncGuard(fn: (req: Request) => Promise<void>): RequestHandler {
  return (req, _res, next) => {
    void fn(req)
      .then(() => next())
      .catch(next);
  };
}

/** Fastify-style JSON route: returned value is sent as JSON. */
export function jsonHandler(fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    void fn(req, res)
      .then((body) => {
        if (!res.headersSent && body !== undefined) {
          res.json(body);
        }
      })
      .catch(next);
  };
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    void fn(req, res, next).catch(next);
  };
}
