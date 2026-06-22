"use client";

import { useTranslations, useLocale } from 'next-intl';

// Design Tokens
const IVORY = "#F7F4EF";
const GOLD = "#C9A96E";

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  
  const FOOTER_LINKS = {
    collections: [
      { label: t('links.lhomme'), href: `/${locale}/products?gender=MEN` },
      { label: t('links.lafemme'), href: `/${locale}/products?gender=WOMEN` },
      { label: t('links.libre'), href: `/${locale}/products?gender=UNISEX` },
      { label: t('links.essentiel'), href: `/${locale}/products` },
    ],
    maison: [
      { label: t('links.ourStory'), href: `/${locale}/#brand-story` },
      { label: t('links.atelier'), href: `/${locale}/#brand-story` },
      { label: t('links.contact'), href: `/${locale}/#contact` },
    ],
    service: [
      { label: t('links.shipping'), href: `/${locale}/products` },
      { label: t('links.returns'), href: `/${locale}/products` },
      { label: t('links.cart'), href: `/${locale}/cart` },
    ],
  };
  
  return (
    <footer className="py-16 md:py-20 px-6 md:px-12 lg:px-24" style={{ backgroundColor: "#100D0B" }}>
      <div className="max-w-screen-xl mx-auto">
        {/* Top */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-12 mb-16 pb-16" style={{ borderBottom: `1px solid ${GOLD}15` }}>
          {/* Brand */}
          <div>
            <div className="mb-4">
              <div
                className="text-2xl tracking-[0.4em] uppercase"
                style={{ fontFamily: "Cormorant Garamond, serif", color: IVORY, fontWeight: 300 }}
              >
                Éclore
              </div>
              <div
                className="text-[8px] tracking-[0.6em] uppercase"
                style={{ fontFamily: "Inter, sans-serif", color: GOLD }}
              >
                Paris
              </div>
            </div>
            <p
              className="text-xs leading-relaxed max-w-xs"
              style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}35`, fontWeight: 300 }}
            >
              {t('tagline')}
              <br />
              {t('tagline2')}
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-8">
            {/* Collections */}
            <div>
              <p
                className="text-[9px] tracking-[0.35em] uppercase mb-4"
                style={{ fontFamily: "Inter, sans-serif", color: GOLD }}
              >
                {t('collections')}
              </p>
              {FOOTER_LINKS.collections.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-xs mb-2.5 transition-colors duration-200"
                  style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}40`, fontWeight: 300 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = `${IVORY}80`)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = `${IVORY}40`)}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Maison */}
            <div>
              <p
                className="text-[9px] tracking-[0.35em] uppercase mb-4"
                style={{ fontFamily: "Inter, sans-serif", color: GOLD }}
              >
                {t('maison')}
              </p>
              {FOOTER_LINKS.maison.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-xs mb-2.5 transition-colors duration-200"
                  style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}40`, fontWeight: 300 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = `${IVORY}80`)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = `${IVORY}40`)}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Service */}
            <div>
              <p
                className="text-[9px] tracking-[0.35em] uppercase mb-4"
                style={{ fontFamily: "Inter, sans-serif", color: GOLD }}
              >
                {t('service')}
              </p>
              {FOOTER_LINKS.service.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-xs mb-2.5 transition-colors duration-200"
                  style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}40`, fontWeight: 300 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = `${IVORY}80`)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = `${IVORY}40`)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <p
            className="text-[9px] tracking-[0.2em]"
            style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}20` }}
          >
            © {new Date().getFullYear()} {t('copyright')}
          </p>
          <div className="flex gap-6">
            <a
              href="/admin/login"
              className="text-[9px] tracking-[0.15em] uppercase transition-colors"
              style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}20` }}
              onMouseEnter={(e) => (e.currentTarget.style.color = `${IVORY}50`)}
              onMouseLeave={(e) => (e.currentTarget.style.color = `${IVORY}20`)}
            >
              {t('adminLogin')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
