export const SITE_URL = 'https://www.salechat.com';

/** Shop POS login in this combined Next.js app. */
export const APP_LOGIN_URL = '/pos/login';

/** Support contacts — match POS `frontend/src/lib/support.ts`. */
export const SUPPORT_WHATSAPP_E164 = '923462734539';
export const SUPPORT_WHATSAPP_DISPLAY = '+92 346 2734539';
export const SUPPORT_EMAIL = 'info@nexmindsystems.com';
export const SUPPORT_PHONE_DISPLAY = '+92 346 2734539';
export const SUPPORT_PHONE_TEL = '+923462734539';

const defaultTrialMessage =
  "Hi, I'd like to start a free trial of SaleChat / SaleChat POS. Please help me get set up.";

const defaultDemoMessage = "Hi, I'd like to book a demo of SaleChat / SaleChat POS.";

export function supportWhatsappUrl(text: string = defaultTrialMessage): string {
  return `https://wa.me/${SUPPORT_WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}

/** Start Free Trial → WhatsApp (same number as in-app contact). */
export const APP_TRIAL_URL = supportWhatsappUrl(defaultTrialMessage);

/** @deprecated Prefer APP_TRIAL_URL — free trial is via WhatsApp, not a public signup form. */
export const APP_SIGNUP_URL = APP_TRIAL_URL;

export const APP_DEMO_WHATSAPP_URL = supportWhatsappUrl(defaultDemoMessage);

export const BRAND = {
  name: 'SaleChat',
  tagline: 'The modern-functional ERP ecosystem for multi-vertical growth.',
  company: 'NexMind Systems',
  companyUrl: 'https://www.NexMindSystems.com',
  email: SUPPORT_EMAIL,
  phone: SUPPORT_PHONE_DISPLAY,
  whatsapp: SUPPORT_WHATSAPP_DISPLAY,
  whatsappUrl: supportWhatsappUrl("Hi, I'd like help with SaleChat / SaleChat POS"),
  supportHours: 'Mon–Sat, 10:00 AM – 6:00 PM PKT',
  productBy: 'A product by NexMind Systems',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact Us' },
] as const;
