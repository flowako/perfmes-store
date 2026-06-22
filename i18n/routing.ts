import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'ar'],
  defaultLocale: 'fr',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/products': {
      fr: '/produits',
      ar: '/products'
    },
    '/cart': {
      fr: '/panier',
      ar: '/cart'
    },
    '/checkout': {
      fr: '/commande',
      ar: '/checkout'
    }
  }
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];
