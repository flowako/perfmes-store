"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { STORE } from "@/lib/store";

const IVORY = "#F7F4EF";
const GOLD = "#C9A96E";
const ESPRESSO = "#1A1714";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart, openCart } = useCart();
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  
  const NAV_LINKS = [
    { label: t('products'), href: `/${locale}/products` },
    { label: t('forMen'), href: `/${locale}/products?gender=MEN` },
    { label: t('forWomen'), href: `/${locale}/products?gender=WOMEN` },
  ];
  
  const switchLocale = (newLocale: string) => {
    const currentPath = pathname.replace(`/${locale}`, '');
    router.push(`/${newLocale}${currentPath}`);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? `${IVORY}F5` : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? `1px solid ${GOLD}30` : "1px solid transparent",
        }}
      >
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 flex items-center justify-between h-16 md:h-20">
          <nav className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs tracking-[0.2em] uppercase transition-colors duration-300"
                style={{
                  fontFamily: "Inter, sans-serif",
                  color: scrolled ? ESPRESSO : IVORY,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = scrolled ? ESPRESSO : IVORY)
                }
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a href={`/${locale}`} className="absolute left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center leading-none">
              <span
                className="text-xl md:text-2xl tracking-[0.35em] uppercase"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontWeight: 300,
                  color: scrolled ? ESPRESSO : IVORY,
                  letterSpacing: "0.4em",
                }}
              >
                {locale === 'ar' ? STORE.name.ar : STORE.name.fr}
              </span>
              <span
                className="text-[8px] tracking-[0.5em] uppercase mt-0.5"
                style={{
                  fontFamily: "Inter, sans-serif",
                  color: GOLD,
                  letterSpacing: "0.6em",
                }}
              >
                0798705096
              </span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => switchLocale('fr')}
                className={`text-[10px] tracking-wider uppercase transition-colors ${locale === 'fr' ? 'font-semibold' : ''}`}
                style={{
                  fontFamily: "Inter, sans-serif",
                  color: locale === 'fr' ? GOLD : (scrolled ? `${ESPRESSO}60` : `${IVORY}60`),
                }}
              >
                FR
              </button>
              <span style={{ color: scrolled ? `${ESPRESSO}40` : `${IVORY}40` }}>|</span>
              <button
                onClick={() => switchLocale('ar')}
                className={`text-[10px] tracking-wider uppercase transition-colors ${locale === 'ar' ? 'font-semibold' : ''}`}
                style={{
                  fontFamily: "Inter, sans-serif",
                  color: locale === 'ar' ? GOLD : (scrolled ? `${ESPRESSO}60` : `${IVORY}60`),
                }}
              >
                AR
              </button>
            </div>
            
            <button
              onClick={openCart}
              style={{ color: scrolled ? ESPRESSO : IVORY }}
              className="transition-colors relative"
              onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = scrolled ? ESPRESSO : IVORY)
              }
              aria-label={t('cart')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cart.itemCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full text-[9px] flex items-center justify-center font-medium"
                  style={{ backgroundColor: GOLD, color: IVORY }}
                >
                  {cart.itemCount}
                </span>
              )}
            </button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: scrolled ? ESPRESSO : IVORY }}
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.5">
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="block w-6 h-px"
                style={{ backgroundColor: "currentColor" }}
              />
              <motion.span
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block w-4 h-px"
                style={{ backgroundColor: "currentColor" }}
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="block w-6 h-px"
                style={{ backgroundColor: "currentColor" }}
              />
            </div>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
            style={{ backgroundColor: ESPRESSO }}
          >
            {NAV_LINKS.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="text-3xl tracking-[0.2em] uppercase"
                style={{ fontFamily: "Cormorant Garamond, serif", color: IVORY, fontWeight: 300 }}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </motion.a>
            ))}
            <motion.button
              onClick={() => {
                setMenuOpen(false);
                openCart();
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: NAV_LINKS.length * 0.08 }}
              className="mt-8 px-8 py-3 border border-gold flex items-center gap-3"
              style={{ color: IVORY }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="text-sm tracking-[0.2em] uppercase">{t('cart')} ({cart.itemCount})</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}