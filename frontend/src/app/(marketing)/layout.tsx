import type { Metadata } from 'next';
import { Footer } from '@/components/marketing/Footer';
import { Navbar } from '@/components/marketing/Navbar';
import { BRAND, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} — Cloud POS, ERP, RMS & HMS`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.tagline,
};

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <main className="w-full min-w-0 overflow-x-hidden bg-surface pt-14 sm:pt-16">{children}</main>
      <Footer />
    </>
  );
}
