import type { Metadata } from 'next';
import { BRAND, SITE_URL } from './constants';

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = path === '/' ? title : `${title} | ${BRAND.name}`;

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: BRAND.name,
      type: 'website',
      locale: 'en_PK',
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${BRAND.name} — Cloud POS, ERP, RMS & HMS`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [`${SITE_URL}/opengraph-image`],
    },
  };
}
