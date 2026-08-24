import type { Metadata } from 'next';
import { EcosystemHub } from '@/components/marketing/home/EcosystemHub';
import { HeroSection } from '@/components/marketing/home/HeroSection';
import { PainPointsInteractive } from '@/components/marketing/home/PainPointsInteractive';
import { PricingSection } from '@/components/marketing/home/PricingSection';
import { TrustTicker } from '@/components/marketing/home/TrustTicker';
import { JsonLd } from '@/components/marketing/JsonLd';
import { BRAND, SITE_URL } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Cloud POS, ERP, RMS & HMS Software for Retail & Hospitality',
  description:
    'SaleChat is cloud POS and ERP software for retail, restaurants (RMS), and hotels (HMS). Billing, inventory, udhaar, and multi-branch sync — built for Pakistan SMBs.',
  path: '/',
});

export default function HomePage() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: BRAND.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'SaleChat is cloud POS and ERP software for retail, restaurants (RMS), and hotels (HMS). Billing, inventory, udhaar, and multi-branch sync for Pakistan SMBs.',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'PKR',
      lowPrice: '2500',
      highPrice: '7500',
      offerCount: 3,
    },
    url: SITE_URL,
    provider: {
      '@type': 'Organization',
      name: BRAND.company,
      url: BRAND.companyUrl,
    },
  };

  return (
    <>
      <JsonLd data={softwareSchema} />
      <div className="relative flex w-full flex-col">
        <HeroSection />
        <TrustTicker />
        <EcosystemHub />
        <PainPointsInteractive />
        <PricingSection />
      </div>
    </>
  );
}
