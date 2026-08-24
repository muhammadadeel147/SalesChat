export const SITE_URL = 'https://www.salechat.com';
export const APP_SIGNUP_URL = 'https://app.billimatic.com/signup';
export const APP_LOGIN_URL = '/pos/login';

export const BRAND = {
  name: 'SaleChat',
  tagline: 'The modern-functional ERP ecosystem for multi-vertical growth.',
  company: 'NexMind Systems',
  companyUrl: 'https://www.NexMindSystems.com',
  email: 'hello@salechat.com',
  phone: '+92 300 0000000',
  supportHours: 'Mon–Sat, 10:00 AM – 6:00 PM PKT',
  productBy: 'A product by NexMind Systems',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact Us' },
] as const;
