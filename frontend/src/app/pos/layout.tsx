import { Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

import { AppProviders } from '@/components/providers';
import './pos.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export default function PosRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`pos-app ${plusJakarta.variable}`}>
      <AppProviders>{children}</AppProviders>
    </div>
  );
}
