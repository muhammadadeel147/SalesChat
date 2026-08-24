import type { Metadata } from 'next';
import { CustomErpCta, ModuleGrid } from '@/components/marketing/features/ModuleGrid';
import { FeaturesHero } from '@/components/marketing/features/FeaturesHero';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Features',
  description:
    'Explore SaleChat cloud features across POS, ERP, RMS, HMS, and custom-built systems for your business.',
  path: '/features',
});

export default function FeaturesPage() {
  return (
    <div className="flex w-full flex-col">
      <FeaturesHero />
      <ModuleGrid />
      <CustomErpCta />
    </div>
  );
}
