"use client";

import { useTranslations, useLocale } from 'next-intl';
import { STORE } from '@/lib/store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTiktok, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { config, library } from '@fortawesome/fontawesome-svg-core';

config.autoAddCss = false;
library.add(faInstagram, faTiktok, faFacebook);
import Link from 'next/link';

const IVORY = "#F7F4EF";
const GOLD = "#C9A96E";

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  
  const FOOTER_LINKS = {
    collections: [
      { label: t('links.lhomme'), href: `/${locale}/products/men` },
      { label: t('links.lafemme'), href: `/${locale}/products/women` },
      { label: t('links.libre'), href: `/${locale}/products/unisex` },
     
    ],
    maison: [
      { label: t('links.ourStory'), href: `/${locale}/#brand-story` },
    ],
    service: [
     
      { label: t('links.cart'), href: `/${locale}/cart` },
    ],
  };
  
  return (
    <footer className="py-16 md:py-20 px-6 md:px-12 lg:px-24" style={{ backgroundColor: "#100D0B" }}>
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-12 mb-16 pb-16" style={{ borderBottom: `1px solid ${GOLD}15` }}>
          <div>
            <div className="mb-4">
              <div
                className="text-2xl tracking-[0.4em] uppercase"
                style={{ fontFamily: "Cormorant Garamond, serif", color: IVORY, fontWeight: 300 }}
              >
                {locale === 'ar' ? STORE.name.ar : STORE.name.fr}
              </div>
              <div
                className="text-[8px] tracking-[0.6em] uppercase"
                style={{ fontFamily: "Inter, sans-serif", color: GOLD }}
              >
                {STORE.phone}
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
<div className="flex gap-4 mt-6">
              <a href={STORE.instagram} target="_blank" rel="noopener noreferrer"
                className="text-xs transition-colors duration-200 inline-flex items-center gap-1.5"
                style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}40`, fontWeight: 300 }}
                onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={e => (e.currentTarget.style.color = `${IVORY}40`)}>
                <FontAwesomeIcon icon={faInstagram} style={{ width: 14, height: 14 }} />
              </a>
              <a href={STORE.tiktok} target="_blank" rel="noopener noreferrer"
                className="text-xs transition-colors duration-200 inline-flex items-center gap-1.5"
                style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}40`, fontWeight: 300 }}
                onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={e => (e.currentTarget.style.color = `${IVORY}40`)}>
                <FontAwesomeIcon icon={faTiktok} style={{ width: 14, height: 14 }} />
              </a>
              <a href={STORE.facebook} target="_blank" rel="noopener noreferrer"
                className="text-xs transition-colors duration-200 inline-flex items-center gap-1.5"
                style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}40`, fontWeight: 300 }}
                onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={e => (e.currentTarget.style.color = `${IVORY}40`)}>
                <FontAwesomeIcon icon={faFacebook} style={{ width: 14, height: 14 }} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-8">
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

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <p
            className="text-[9px] tracking-[0.2em]"
            style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}20` }}
          >
            © {new Date().getFullYear()} {STORE.name.fr} — {STORE.phone}
          </p>
          <div className="flex gap-6">
            <a
              href={`tel:${STORE.phone}`}
              className="text-[9px] tracking-[0.15em] uppercase transition-colors"
              style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}20` }}
              onMouseEnter={(e) => (e.currentTarget.style.color = `${IVORY}50`)}
              onMouseLeave={(e) => (e.currentTarget.style.color = `${IVORY}20`)}
            >
              {STORE.phone}
            </a>
            <Link
              href="/admin/login"
              className="text-[9px] tracking-[0.15em] uppercase transition-colors"
              style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}20` }}
              onMouseEnter={(e) => (e.currentTarget.style.color = `${IVORY}50`)}
              onMouseLeave={(e) => (e.currentTarget.style.color = `${IVORY}20`)}
            >
              {t('adminLogin')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}