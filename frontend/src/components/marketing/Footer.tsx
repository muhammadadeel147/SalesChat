import Link from 'next/link';
import { BRAND } from '@/lib/constants';
import { Logo } from './Logo';
import { MaterialIcon } from './MaterialIcon';

const platformLinks = [
  { href: '/features#pos', label: 'POS System' },
  { href: '/features#erp', label: 'Inventory' },
  { href: '/features', label: 'All Features' },
];

const companyLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
  { href: '/pricing', label: 'Pricing' },
];

export function Footer() {
  return (
    <footer className="relative z-20 w-full bg-gradient-to-b from-[#059669] to-[#065f46] py-8 text-pure-white sm:py-9">
      <div className="site-shell">
        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10">
          <div>
            <Logo light />
            <p className="mt-3 text-body-sm text-primary-container/85">{BRAND.productBy}</p>
            <p className="mt-3 text-body-sm text-primary-container/85">
              <a href={`mailto:${BRAND.email}`} className="hover:text-pure-white">
                {BRAND.email}
              </a>
              <span className="mx-2 opacity-50">·</span>
              <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} className="hover:text-pure-white">
                {BRAND.phone}
              </a>
            </p>
            <div className="mt-3 flex gap-2.5">
              <a
                href={BRAND.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="chip-on-brown inline-flex h-8 w-8 items-center justify-center rounded-full"
                aria-label="WhatsApp"
              >
                <MaterialIcon name="chat" className="text-[16px]" />
              </a>
              <a
                href={BRAND.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="chip-on-brown inline-flex h-8 w-8 items-center justify-center rounded-full"
                aria-label="Website"
              >
                <MaterialIcon name="language" className="text-[16px]" />
              </a>
              <a
                href={`mailto:${BRAND.email}`}
                className="chip-on-brown inline-flex h-8 w-8 items-center justify-center rounded-full"
                aria-label="Email"
              >
                <MaterialIcon name="mail" className="text-[16px]" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-label-caps mb-3 text-primary-container">Platform</h4>
            <ul className="space-y-2 text-body-sm text-primary-container/80">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-pure-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-label-caps mb-3 text-primary-container">Company</h4>
            <ul className="space-y-2 text-body-sm text-primary-container/80">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-pure-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-pure-white/20 pt-4 text-body-sm text-primary-container/60 sm:flex-row sm:gap-3">
          <span className="text-center sm:text-left">
            © 2026 {BRAND.name}. All rights reserved.
          </span>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
            <span className="cursor-pointer hover:text-pure-white">Privacy Policy</span>
            <span className="cursor-pointer hover:text-pure-white">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
