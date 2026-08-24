'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { APP_LOGIN_URL, APP_SIGNUP_URL, NAV_LINKS } from '@/lib/constants';
import { Button } from './Button';
import { Logo } from './Logo';
import { MaterialIcon } from './MaterialIcon';

type Indicator = { left: number; width: number };

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(href));
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [indicator, setIndicator] = useState<Indicator>({ left: 0, width: 0 });
  const [ready, setReady] = useState(false);

  const measure = useCallback(
    (href?: string) => {
      const nav = navRef.current;
      if (!nav) return;

      const targetHref =
        href ??
        NAV_LINKS.find((link) => isActivePath(pathname, link.href))?.href ??
        NAV_LINKS[0].href;
      const el = linkRefs.current.get(targetHref);
      if (!el) return;

      const navBox = nav.getBoundingClientRect();
      const linkBox = el.getBoundingClientRect();
      setIndicator({
        left: linkBox.left - navBox.left,
        width: linkBox.width,
      });
      setReady(true);
    },
    [pathname],
  );

  useLayoutEffect(() => {
    measure();
  }, [measure, pathname]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measure]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="fixed top-0 z-50 w-full bg-gradient-to-r from-[#bc6b32] to-[#8a4a1c] shadow-[var(--shadow-header)]">
      <div className="site-shell flex h-14 items-center justify-between gap-3 sm:h-16">
        <Logo showTagline light />

        <nav
          ref={navRef}
          className="relative hidden items-center gap-1 lg:flex lg:gap-2"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                ref={(node) => {
                  if (node) linkRefs.current.set(link.href, node);
                  else linkRefs.current.delete(link.href);
                }}
                onClick={() => measure(link.href)}
                className={`relative z-10 px-2.5 py-1 font-caveat text-[1.05rem] transition-colors lg:px-3 lg:text-[1.15rem] ${
                  active
                    ? 'font-semibold text-pure-white'
                    : 'text-pure-white/85 hover:text-pure-white'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}

          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 h-0 border-b-2 border-dotted border-primary-container"
            style={{
              left: indicator.left,
              width: indicator.width,
              opacity: ready ? 1 : 0,
              transition:
                'left 450ms cubic-bezier(0.22, 1, 0.36, 1), width 450ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease',
            }}
          />
        </nav>

        <div className="hidden items-center gap-3 lg:flex lg:gap-4">
          <Link
            href={APP_LOGIN_URL}
            className="font-caveat text-[1.25rem] font-semibold text-pure-white hover:text-primary-container lg:text-[1.35rem]"
          >
            Login
          </Link>
          <Button
            href={APP_SIGNUP_URL}
            variant="onBrown"
            size="sm"
            className="px-4 font-caveat text-[1.2rem] font-bold lg:text-[1.3rem]"
          >
            Start Free Trial
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-dotted border-pure-white bg-transparent text-pure-white transition-all hover:border-transparent hover:bg-pure-white hover:text-primary lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <MaterialIcon name={open ? 'close' : 'menu'} className="text-[22px]" />
        </button>
      </div>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 top-14 z-40 bg-deep-slate/40 sm:top-16 lg:hidden"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-nav"
            className="absolute left-0 right-0 top-full z-50 border-t border-pure-white/15 bg-[#8a4a1c] shadow-lg lg:hidden"
          >
            <div className="site-shell flex flex-col gap-1 py-3">
              {NAV_LINKS.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2.5 font-caveat text-[1.2rem] ${
                      active
                        ? 'border-b-2 border-dotted border-primary-container font-semibold text-pure-white'
                        : 'text-pure-white hover:bg-pure-white/10'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-2 flex flex-col gap-2 border-t border-pure-white/15 pt-3">
                <Link
                  href={APP_LOGIN_URL}
                  className="font-caveat px-3 py-2 text-[1.3rem] font-semibold text-pure-white"
                >
                  Login
                </Link>
                <Button
                  href={APP_SIGNUP_URL}
                  variant="onBrown"
                  size="sm"
                  className="w-full font-caveat text-[1.25rem] font-bold"
                >
                  Start Free Trial
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
