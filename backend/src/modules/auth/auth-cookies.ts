import type { CookieOptions, Request, Response } from 'express';

import { appConfig } from '../../config.js';

export const ACCESS_COOKIE = 'pos_access';
export const REFRESH_COOKIE = 'pos_refresh';

const isProd = appConfig.nodeEnv === 'production';

/** Express maxAge is milliseconds. Fastify used seconds. */
function cookieBase(maxAgeSec: number): CookieOptions {
  return {
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: maxAgeSec * 1000,
  };
}

function accessMaxAgeSec(): number {
  const raw = appConfig.jwt.accessExpiresIn;
  const m = /^(\d+)([smhd])$/i.exec(raw.trim());
  if (!m) return 15 * 60;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  if (unit === 's') return n;
  if (unit === 'm') return n * 60;
  if (unit === 'h') return n * 3600;
  if (unit === 'd') return n * 86400;
  return 15 * 60;
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
): void {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, cookieBase(accessMaxAgeSec()));
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieBase(7 * 24 * 3600));
}

export function clearAuthCookies(res: Response): void {
  const base: CookieOptions = {
    path: '/',
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };
  res.clearCookie(ACCESS_COOKIE, base);
  res.clearCookie(REFRESH_COOKIE, base);
}

export function readAccessToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ') && header.length > 7) {
    return header.slice(7);
  }
  const cookie = req.cookies?.[ACCESS_COOKIE];
  return typeof cookie === 'string' && cookie.trim() ? cookie.trim() : null;
}

export function readRefreshToken(req: Request, bodyToken?: string): string | null {
  if (bodyToken?.trim()) return bodyToken.trim();
  const cookie = req.cookies?.[REFRESH_COOKIE];
  return typeof cookie === 'string' && cookie.trim() ? cookie.trim() : null;
}
