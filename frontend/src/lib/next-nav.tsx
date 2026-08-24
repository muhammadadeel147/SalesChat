'use client';

import NextLink from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';

const NAV_STATE_KEY = 'pos_nav_state';

function writeNavState(state: unknown) {
  if (typeof window === 'undefined') return;
  if (state == null) sessionStorage.removeItem(NAV_STATE_KEY);
  else sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify(state));
}

function readNavState(): unknown {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(NAV_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

type LinkProps = {
  to: string;
  children?: ReactNode;
  className?: string;
  replace?: boolean;
  title?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  state?: unknown;
  style?: CSSProperties;
};

export function Link({
  to,
  children,
  className,
  replace,
  title,
  onClick,
  style,
  state,
}: LinkProps) {
  return (
    <NextLink
      href={to}
      className={className}
      replace={replace}
      title={title}
      style={style}
      onClick={(e) => {
        writeNavState(state !== undefined ? state : null);
        onClick?.(e);
      }}
    >
      {children}
    </NextLink>
  );
}

export function NavLink({
  to,
  end,
  className,
  children,
  title,
  onClick,
  state,
}: {
  to: string;
  end?: boolean;
  className?: string | ((args: { isActive: boolean }) => string);
  children?: ReactNode;
  title?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  state?: unknown;
}) {
  const pathname = usePathname();
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  const cls = typeof className === 'function' ? className({ isActive }) : className;

  return (
    <NextLink
      href={to}
      className={cls}
      title={title}
      onClick={(e) => {
        writeNavState(state !== undefined ? state : null);
        onClick?.(e);
      }}
    >
      {children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, opts?: { replace?: boolean; state?: unknown }) => {
    if (typeof to === 'number') {
      router.back();
      return;
    }
    writeNavState(opts && 'state' in opts ? opts.state : null);
    if (opts?.replace) router.replace(to);
    else router.push(to);
  };
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  const search = searchParams.toString();
  // Re-read after route changes; sessionStorage is not a React dep.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- pathname/search are the navigation signal
  const state = useMemo(() => readNavState(), [pathname, search]);
  return { pathname, search: search ? `?${search}` : '', hash: '', state };
}

export function Navigate({
  to,
  replace = true,
  state,
}: {
  to: string;
  replace?: boolean;
  state?: unknown;
}) {
  const router = useRouter();
  useEffect(() => {
    writeNavState(state !== undefined ? state : null);
    if (replace) router.replace(to);
    else router.push(to);
  }, [to, replace, router, state]);
  return null;
}

export function useSearchParams() {
  const nextParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setSearchParams = useCallback(
    (
      next: URLSearchParams | Record<string, string> | ((prev: URLSearchParams) => URLSearchParams),
      opts?: { replace?: boolean },
    ) => {
      const prev = new URLSearchParams(nextParams.toString());
      const resolved =
        typeof next === 'function'
          ? next(prev)
          : next instanceof URLSearchParams
            ? next
            : new URLSearchParams(next);
      const q = resolved.toString();
      const href = q ? `${pathname}?${q}` : pathname;
      if (opts?.replace) router.replace(href);
      else router.push(href);
    },
    [nextParams, pathname, router],
  );

  return [nextParams, setSearchParams] as const;
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string>>() {
  return useNextParams() as T;
}
