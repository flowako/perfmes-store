"use client";

import { useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import { Link } from "@/i18n/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ─── Design Tokens ────────────────────────────────────────
const IVORY = "#F7F4EF";
const CREAM = "#FAF8F3";
const GOLD = "#C9A96E";
const GOLD_DEEP = "#A8854A";
const ESPRESSO = "#1A1714";
const COCOA = "#241D17";
const LINEN = "#E8E2D9";
const MUTED = "#8B7E74";

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Reveal Wrapper ──────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  y = 36,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Eyebrow label ───────────────────────────────────────
function Eyebrow({
  children,
  color = GOLD,
  className = "",
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={`text-[10px] md:text-[11px] tracking-[0.4em] uppercase ${className}`}
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color, fontWeight: 500 }}
    >
      {children}
    </span>
  );
}

// ─── Gold underline that grows on hover ──────────────────
function GoldLink({
  href,
  children,
  color = MUTED,
  barColor = GOLD,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  color?: string;
  barColor?: string;
  external?: boolean;
}) {
  const inner = (
    <span className="group inline-flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase pb-1" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color, fontWeight: 500 }}>
      {children}
      <span className="block h-px w-7 transition-all duration-500 group-hover:w-14" style={{ backgroundColor: barColor }} />
      <span className="transform group-hover:translate-x-1 transition-transform duration-300" style={{ color: barColor }}>→</span>
    </span>
  );
  if (external) return <a href={href}>{inner}</a>;
  return <Link href={href}>{inner}</Link>;
}

// ─── Hero Section ─────────────────────────────────────────
function Hero() {
  const t = useTranslations("hero");
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const stats = [
    { num: "29", label: t("stats.years") },
    { num: "147", label: t("stats.accords") },
    { num: "60+", label: t("stats.countries") },
  ];

  return (
    <section ref={containerRef} className="relative h-screen min-h-[680px] overflow-hidden" style={{ backgroundColor: ESPRESSO }}>
      <motion.div className="absolute inset-0" style={{ scale }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(120% 90% at 70% 40%, ${COCOA} 0%, ${ESPRESSO} 55%, #100C09 100%)` }} />
        <div className="ec-grain" />
        {/* Abstract bottle silhouette */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden>
          <defs>
            <radialGradient id="glow1" cx="62%" cy="42%" r="42%">
              <stop offset="0%" stopColor={GOLD} stopOpacity="0.18" />
              <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={GOLD} stopOpacity="0.42" />
              <stop offset="50%" stopColor={GOLD} stopOpacity="0.08" />
              <stop offset="100%" stopColor={GOLD} stopOpacity="0.26" />
            </linearGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#glow1)" />
          <g transform="translate(820, 70)">
            <path d="M60 120 L80 60 L100 60 L120 120 Z" fill={GOLD} opacity="0.32" />
            <rect x="70" y="40" width="50" height="25" rx="4" fill={GOLD} opacity="0.26" />
            <path d="M65 120 L70 175 L120 175 L125 120 Z" fill="url(#bottleGrad)" />
            <path d="M40 200 Q70 175 90 175 L110 175 Q130 175 150 200 L155 230 L35 230 Z" fill="url(#bottleGrad)" />
            <rect x="35" y="230" width="120" height="380" rx="2" fill="url(#bottleGrad)" />
            <path d="M35 610 Q35 640 55 640 L135 640 Q155 640 155 610 L155 600 L35 600 Z" fill="url(#bottleGrad)" />
            <rect x="50" y="290" width="90" height="130" rx="1" fill={IVORY} opacity="0.05" />
            <rect x="36" y="480" width="118" height="130" rx="1" fill={GOLD} opacity="0.05" />
          </g>
        </svg>
      </motion.div>

      {/* Content */}
      <motion.div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 lg:px-24" style={{ y, opacity }}>
        <div className="max-w-screen-xl mx-auto w-full">
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.6em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
            className="block mb-8 md:mb-10"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: GOLD, fontWeight: 500, fontSize: "clamp(10px, 1vw, 12px)", letterSpacing: "0.4em", textTransform: "uppercase" }}
          >
            {t("newCollection")}
          </motion.p>

          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 52 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
              className="leading-[0.95] mb-7"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 300, fontSize: "clamp(3.4rem, 9vw, 8.5rem)", color: IVORY, letterSpacing: "-0.015em" }}
            >
              {t("title1")}{" "}
              <em style={{ fontStyle: "italic", color: GOLD }}>{t("title2")}</em>{" "}
              {t("title3")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.85, ease: EASE }}
              className="text-sm md:text-base leading-relaxed mb-11 max-w-md"
              style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: `${IVORY}99`, fontWeight: 300 }}
            >
              {t("subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.05, ease: EASE }}
              className="flex flex-col sm:flex-row items-start gap-6"
            >
              <Link
                href="/products"
                className="group relative inline-flex items-center gap-3 px-9 py-4 overflow-hidden"
                style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: ESPRESSO, backgroundColor: GOLD, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}
              >
                <span className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ backgroundColor: IVORY }} />
                <span className="relative z-10">{t("discoverBtn")}</span>
                <span className="relative z-10 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
              <a
                href="#brand-story"
                className="group inline-flex items-center gap-3 py-4"
                style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: `${IVORY}80`, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}
              >
                <span className="block w-6 h-px transition-all duration-300 group-hover:w-10" style={{ backgroundColor: GOLD }} />
                {t("ourMaison")}
              </a>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="absolute bottom-10 left-6 md:left-16 lg:left-24 flex gap-10 md:gap-14"
          >
            {stats.map((s) => (
              <div key={s.num}>
                <div className="text-2xl md:text-3xl" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: IVORY, fontWeight: 300 }}>
                  {s.num}
                </div>
                <div className="text-[8px] md:text-[9px] tracking-[0.2em] uppercase mt-1 max-w-[90px]" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: `${IVORY}50`, fontWeight: 400 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="absolute bottom-10 right-6 md:right-16 lg:right-24 flex flex-col items-center gap-2"
          >
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-px h-12" style={{ backgroundColor: `${GOLD}60` }} />
            <span className="text-[8px] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: `${IVORY}40`, writingMode: "vertical-rl" }}>
              {t("scroll")}
            </span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Marquee Strip ───────────────────────────────────────
function MarqueeStrip() {
  const t = useTranslations("marquee");
  const items = [t("extrait"), t("maison"), t("since"), t("location"), t("handcrafted"), t("limited")];
  const row = [...items, ...items, ...items, ...items];
  return (
    <div className="overflow-hidden border-y py-3.5" style={{ borderColor: `${GOLD}30`, backgroundColor: IVORY }}>
      <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 32, repeat: Infinity, ease: "linear" }} className="flex whitespace-nowrap">
        {row.map((item, i) => (
          <span key={i} className="mx-6 inline-flex items-center gap-6">
            <span className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: MUTED, fontWeight: 500 }}>
              {item}
            </span>
            <span style={{ color: GOLD, fontSize: "8px" }}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Collections Section ──────────────────────────────────
function CollectionsSection() {
  const t = useTranslations("collections");

  // Unified dark base with a subtle per-collection tonal tint for coherent,
  // premium differentiation. All cards share identical proportions.
  const COLLECTIONS = [
    { id: "lhomme", tint: "#3A1F18", pattern: "I", href: "/products?gender=MEN" },
    { id: "lafemme", tint: "#2E1D2C", pattern: "II", href: "/products?gender=WOMEN" },
    { id: "libre", tint: "#1C2A2C", pattern: "III", href: "/products?gender=UNISEX" },
    { id: "essentiel", tint: "#2A2218", pattern: "IV", href: "/products" },
  ] as const;

  return (
    <section className="py-24 md:py-36 px-6 md:px-12 lg:px-24" style={{ backgroundColor: IVORY }}>
      <div className="max-w-screen-xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 md:mb-20 gap-8">
            <div>
              <Eyebrow className="block mb-5">{t("sectionTag")}</Eyebrow>
              <h2 className="leading-[0.95]" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 300, color: ESPRESSO }}>
                {t("title")} <em style={{ fontStyle: "italic", color: GOLD_DEEP }}>{t("titleItalic")}</em>
              </h2>
            </div>
            <Link href="/products" className="group self-start md:self-auto inline-flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase pb-1" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: MUTED, fontWeight: 500, borderBottom: `1px solid ${LINEN}` }}>
              {t("viewAll")}
              <span className="transform group-hover:translate-x-1 transition-transform duration-300" style={{ color: GOLD }}>→</span>
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {COLLECTIONS.map((col, i) => {
            const c = col as unknown as { id: string; tint: string; pattern: string; href: string };
            return (
              <Reveal key={c.id} delay={i * 0.08}>
                <Link
                  href={c.href}
                  className="group relative block overflow-hidden aspect-[4/5]"
                  style={{ backgroundColor: ESPRESSO }}
                >
                  {/* Tonal radial overlay for subtle, coherent identity */}
                  <div className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-90" style={{ background: `radial-gradient(120% 90% at 30% 0%, ${c.tint} 0%, ${ESPRESSO} 62%, #100C09 100%)` }} />
                  <div className="ec-grain" style={{ opacity: 0.5 }} />
                  {/* Faint roman numeral */}
                  <div className="absolute -right-4 -top-6 text-[140px] leading-none pointer-events-none select-none transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 300, color: `${GOLD}10` }}>
                    {c.pattern}
                  </div>
                  {/* Top gold reveal line */}
                  <div className="absolute top-0 left-0 w-full h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" style={{ backgroundColor: GOLD }} />
                  {/* Soft inner border for framed, premium feel */}
                  <div className="absolute inset-3 md:inset-4 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-30" style={{ border: `1px solid ${IVORY}14` }} />
                  <div className="absolute inset-0 p-7 md:p-8 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <Eyebrow>{t(`${c.id}.tag`)}</Eyebrow>
                      <span className="text-[9px] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: `${IVORY}35`, fontWeight: 500 }}>
                        {c.pattern}
                      </span>
                    </div>
                    <div>
                      <h3 className="leading-[0.95] mb-2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(1.75rem, 2.6vw, 2.5rem)", fontWeight: 300, color: IVORY, letterSpacing: "-0.01em" }}>
                        {t(`${c.id}.title`)}
                      </h3>
                      <p className="text-[10px] tracking-[0.25em] uppercase mb-4" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: `${GOLD}CC`, fontWeight: 500 }}>
                        {t(`${c.id}.subtitle`)}
                      </p>
                      <p className="text-xs mb-7 max-w-[14rem] leading-relaxed" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: `${IVORY}60`, fontWeight: 300 }}>
                        {t(`${c.id}.desc`)}
                      </p>
                      <div className="flex items-center gap-2 group-hover:gap-4 transition-all duration-500">
                        <span className="text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: GOLD, fontWeight: 500 }}>
                          {t("explore")}
                        </span>
                        <span className="block h-px w-8 group-hover:w-14 transition-all duration-500" style={{ backgroundColor: GOLD }} />
                        <span className="transform group-hover:translate-x-1 transition-transform duration-300" style={{ color: GOLD }}>→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Best Sellers / Featured Creations ───────────────────
function BestSellersSection() {
  const t = useTranslations("bestSellers");
  const locale = useLocale();

  const PRODUCTS = [
    { id: "nuit", accent: "#1F1812", badge: "bestseller" as const, price: locale === "ar" ? "12,400" : "320" },
    { id: "blanche", accent: "#EFEAE0", badge: "new" as const, price: locale === "ar" ? "9,800" : "260" },
    { id: "sel", accent: "#1C262A", badge: "limited" as const, price: locale === "ar" ? "11,200" : "290" },
    { id: "foret", accent: "#262017", badge: "bestseller" as const, price: locale === "ar" ? "13,500" : "350" },
  ] as const;

  const badgeLabel: Record<string, string> = {
    bestseller: t("bestseller"),
    new: t("new"),
    limited: t("limited"),
  };

  return (
    <section className="py-24 md:py-36 px-6 md:px-12 lg:px-24" style={{ backgroundColor: CREAM }}>
      <div className="max-w-screen-xl mx-auto">
        <Reveal>
          <div className="text-center mb-16 md:mb-20">
            <Eyebrow className="block mb-5">{t("tag")}</Eyebrow>
            <h2 className="leading-[0.95] mb-6" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 300, color: ESPRESSO }}>
              {t("title")} <em style={{ fontStyle: "italic", color: GOLD_DEEP }}>{t("titleItalic")}</em>
            </h2>
            <p className="text-sm md:text-base leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: MUTED, fontWeight: 300 }}>
              {t("subtitle")}
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {PRODUCTS.map((p, i) => {
            const isLight = p.accent === "#EFEAE0";
            const txt = isLight ? ESPRESSO : IVORY;
            const notes = t.raw(`products.${p.id}.notes`) as string[];
            return (
              <Reveal key={p.id} delay={i * 0.1}>
                <article className="group relative overflow-hidden" style={{ backgroundColor: p.accent }}>
                  {/* Bottle silhouette */}
                  <div className="relative aspect-[4/5] flex items-end justify-center overflow-hidden">
                    <div className="ec-grain" style={{ opacity: isLight ? 0.25 : 0.5 }} />
                    <svg viewBox="0 0 120 160" className="absolute bottom-0 h-[78%] w-auto transition-transform duration-[1.1s] group-hover:-translate-y-2 group-hover:scale-[1.03]" fill="none" aria-hidden>
                      <defs>
                        <linearGradient id={`g-${p.id}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={GOLD} stopOpacity={isLight ? 0.55 : 0.5} />
                          <stop offset="100%" stopColor={GOLD} stopOpacity={isLight ? 0.15 : 0.12} />
                        </linearGradient>
                      </defs>
                      <rect x="48" y="8" width="24" height="14" rx="2" fill={GOLD} opacity="0.5" />
                      <rect x="52" y="22" width="16" height="10" fill={GOLD} opacity="0.4" />
                      <path d="M44 32 Q60 28 76 32 L78 42 L42 42 Z" fill={`url(#g-${p.id})`} />
                      <rect x="42" y="42" width="36" height="92" rx="2" fill={`url(#g-${p.id})`} stroke={GOLD} strokeOpacity="0.25" />
                      <rect x="48" y="58" width="24" height="40" rx="1" fill={isLight ? ESPRESSO : IVORY} opacity="0.06" />
                    </svg>
                    <span
                      className="absolute top-5 left-5 text-[9px] tracking-[0.25em] uppercase px-3 py-1 rounded-full"
                      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", backgroundColor: isLight ? `${ESPRESSO}10` : `${GOLD}25`, color: isLight ? ESPRESSO : GOLD, fontWeight: 500, border: `1px solid ${isLight ? `${ESPRESSO}15` : `${GOLD}40`}` }}
                    >
                      {badgeLabel[p.badge]}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-6 md:p-7">
                    <p className="text-[9px] tracking-[0.25em] uppercase mb-2" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: `${txt}60`, fontWeight: 500 }}>
                      {t(`products.${p.id}.family`)}
                    </p>
                    <h3 className="leading-tight mb-3" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.65rem", fontWeight: 400, color: txt }}>
                      {t(`products.${p.id}.name`)}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mb-5 min-h-[36px]">
                      {notes.map((n) => (
                        <span key={n} className="text-[9px] tracking-[0.12em] uppercase px-2.5 py-1" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: `${txt}70`, border: `1px solid ${isLight ? `${ESPRESSO}12` : `${IVORY}18`}`, fontWeight: 400 }}>
                          {n}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-5" style={{ borderTop: `1px solid ${isLight ? `${ESPRESSO}10` : `${IVORY}14`}` }}>
                      <div>
                        <div className="text-[8px] tracking-[0.2em] uppercase mb-0.5" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: `${txt}45`, fontWeight: 500 }}>
                          {t(`products.${p.id}.concentration`)}
                        </div>
                        <div className="text-lg" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: GOLD, fontWeight: 400 }}>
                          {p.price} <span className="text-[10px]" style={{ color: `${txt}60` }}>{locale === "ar" ? "دج" : "€"}</span>
                        </div>
                      </div>
                      <span className="text-[10px] tracking-[0.2em] uppercase transform group-hover:translate-x-1 transition-transform duration-300" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: GOLD, fontWeight: 500 }}>
                        →
                      </span>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-16 text-center">
            <GoldLink href="/products" color={ESPRESSO}>{t("addToCart")}</GoldLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Promo / Coffret Section ──────────────────────────────
function PromoSection() {
  const t = useTranslations("promo");
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  const features = t("features").split("·");

  return (
    <section ref={ref} className="relative overflow-hidden py-28 md:py-40 px-6 md:px-12 lg:px-24" style={{ backgroundColor: ESPRESSO }}>
      <motion.div className="absolute inset-0" style={{ y, scale: 1.15 }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(90% 70% at 80% 50%, ${COCOA} 0%, ${ESPRESSO} 60%, #0E0B08 100%)` }} />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden>
          <defs>
            <radialGradient id="promoGlow" cx="78%" cy="50%" r="35%">
              <stop offset="0%" stopColor={GOLD} stopOpacity="0.22" />
              <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1440" height="800" fill="url(#promoGlow)" />
          {/* Coffret silhouette */}
          <g transform="translate(940, 230)" opacity="0.5">
            <rect x="0" y="40" width="280" height="220" rx="3" fill="none" stroke={GOLD} strokeOpacity="0.3" />
            <rect x="0" y="40" width="280" height="220" rx="3" fill={GOLD} opacity="0.05" />
            <line x1="0" y1="40" x2="280" y2="40" stroke={GOLD} strokeOpacity="0.4" />
            <circle cx="140" cy="40" r="6" fill={GOLD} opacity="0.5" />
            {[0, 1, 2].map((row) =>
              [0, 1, 2, 3].map((col) => (
                <rect key={`${row}-${col}`} x={20 + col * 62} y={60 + row * 62} width="48" height="48" rx="2" fill="none" stroke={GOLD} strokeOpacity="0.18" />
              ))
            )}
          </g>
        </svg>
      </motion.div>
      <div className="ec-grain" />

      <div className="relative z-10 max-w-screen-xl mx-auto">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow className="block mb-6">{t("tag")}</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="leading-[0.98] mb-8" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(2.8rem, 6vw, 5.5rem)", fontWeight: 300, color: IVORY }}>
              {t("title")}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-base md:text-lg leading-relaxed mb-10 max-w-xl" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: `${IVORY}80`, fontWeight: 300 }}>
              {t("description")}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-12">
              {features.map((f, i) => (
                <span key={i} className="text-[10px] tracking-[0.2em] uppercase inline-flex items-center gap-3" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: `${IVORY}55`, fontWeight: 400 }}>
                  {f.trim()}
                  {i < features.length - 1 && <span style={{ color: `${GOLD}60` }}>·</span>}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <Link
              href="/products"
              className="group relative inline-flex items-center gap-3 px-9 py-4 overflow-hidden"
              style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: ESPRESSO, backgroundColor: GOLD, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}
            >
              <span className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ backgroundColor: IVORY }} />
              <span className="relative z-10">{t("reserve")}</span>
              <span className="relative z-10 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── Brand Story Section ─────────────────────────────────
function BrandStorySection() {
  const t = useTranslations("brandStory");
  return (
    <section id="brand-story" className="py-28 md:py-40 px-6 md:px-12 lg:px-24" style={{ backgroundColor: IVORY }}>
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        {/* Visual */}
        <Reveal className="lg:col-span-5" y={40}>
          <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: COCOA }}>
            <div className="ec-grain" />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden>
              <defs>
                <radialGradient id="storyGlow" cx="50%" cy="45%" r="50%">
                  <stop offset="0%" stopColor={GOLD} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="400" height="500" fill="url(#storyGlow)" />
              {/* Atelier drops */}
              <g transform="translate(200, 250)" opacity="0.6">
                <path d="M0 -70 C 30 -30 40 10 0 60 C -40 10 -30 -30 0 -70 Z" fill={GOLD} opacity="0.18" />
                <path d="M0 -70 C 30 -30 40 10 0 60 C -40 10 -30 -30 0 -70 Z" fill="none" stroke={GOLD} strokeOpacity="0.4" />
                <circle cx="0" cy="20" r="4" fill={GOLD} opacity="0.5" />
              </g>
              <text x="200" y="470" textAnchor="middle" className="uppercase" style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "10px", letterSpacing: "0.4em", fill: `${IVORY}40` }}>
                Grasse · 1997
              </text>
            </svg>
            <div className="absolute top-6 left-6 right-6 flex justify-between" style={{ color: `${IVORY}40` }}>
              <span className="text-[9px] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-inter), sans-serif" }}>N°01</span>
              <span className="text-[9px] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-inter), sans-serif" }}>L&rsquo;Atelier</span>
            </div>
          </div>
        </Reveal>

        {/* Text */}
        <div className="lg:col-span-7">
          <Reveal>
            <Eyebrow className="block mb-6">{t("tag")}</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="leading-[0.95] mb-10" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(2.5rem, 5.5vw, 5rem)", fontWeight: 300, color: ESPRESSO }}>
              {t("title")} <em style={{ fontStyle: "italic", color: GOLD_DEEP }}>{t("titleItalic")}</em>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="space-y-6 max-w-xl mb-12">
              <p className="text-base leading-relaxed" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: "#4A4038", fontWeight: 300 }}>{t("paragraph1")}</p>
              <p className="text-base leading-relaxed" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: "#4A4038", fontWeight: 300 }}>{t("paragraph2")}</p>
              <p className="text-lg leading-relaxed" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: ESPRESSO, fontStyle: "italic", fontWeight: 400 }}>{t("paragraph3")}</p>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <figure className="border-l-2 pl-8 max-w-xl" style={{ borderColor: GOLD }}>
              <blockquote className="text-xl md:text-2xl leading-snug mb-4" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: ESPRESSO, fontStyle: "italic", fontWeight: 400 }}>
                “{t("quote")}”
              </blockquote>
              <figcaption className="text-[10px] tracking-[0.25em] uppercase" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: MUTED, fontWeight: 500 }}>
                {t("quoteAuthor")}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── Why Choose Us Section ───────────────────────────────
function WhyChooseUsSection() {
  const t = useTranslations("whyChooseUs");
  const features = ["ingredients", "handcrafted", "sustainable", "expertise"] as const;

  return (
    <section className="py-24 md:py-36 px-6 md:px-12 lg:px-24" style={{ backgroundColor: CREAM, borderTop: `1px solid ${LINEN}`, borderBottom: `1px solid ${LINEN}` }}>
      <div className="max-w-screen-xl mx-auto">
        <Reveal>
          <div className="text-center mb-16 md:mb-20">
            <Eyebrow className="block mb-5">{t("tag")}</Eyebrow>
            <h2 className="leading-[0.95]" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 300, color: ESPRESSO }}>
              {t("title")} <em style={{ fontStyle: "italic", color: GOLD_DEEP }}>{t("titleItalic")}</em>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: LINEN }}>
          {features.map((f, i) => (
            <Reveal key={f} delay={i * 0.1}>
              <div className="h-full p-8 md:p-10 flex flex-col" style={{ backgroundColor: CREAM }}>
                <div className="mb-8">
                  <span className="text-[40px] leading-none" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: GOLD, fontWeight: 300 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-2xl mb-3 leading-tight" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: ESPRESSO, fontWeight: 400 }}>
                  {t(`features.${f}.title`)}
                </h3>
                <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: MUTED, fontWeight: 300 }}>
                  {t(`features.${f}.desc`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA Section ───────────────────────────────────
function FinalCtaSection() {
  const t = useTranslations("finalCta");
  return (
    <section className="relative overflow-hidden py-32 md:py-48 px-6 md:px-12 lg:px-24 text-center" style={{ backgroundColor: ESPRESSO }}>
      <div className="ec-grain" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(60% 50% at 50% 40%, ${COCOA} 0%, ${ESPRESSO} 70%)` }} />
      <div className="relative z-10 max-w-3xl mx-auto">
        <Reveal>
          <Eyebrow className="block mb-8">—</Eyebrow>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="leading-[0.95] mb-8" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(3rem, 7vw, 6rem)", fontWeight: 300, color: IVORY }}>
            {t("title")} <em style={{ fontStyle: "italic", color: GOLD }}>{t("titleItalic")}</em>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-base md:text-lg leading-relaxed mb-12 max-w-xl mx-auto" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: `${IVORY}75`, fontWeight: 300 }}>
            {t("description")}
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/products"
              className="group relative inline-flex items-center gap-3 px-9 py-4 overflow-hidden"
              style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: ESPRESSO, backgroundColor: GOLD, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}
            >
              <span className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ backgroundColor: IVORY }} />
              <span className="relative z-10">{t("shopBtn")}</span>
              <span className="relative z-10 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
            <a
              href="#brand-story"
              className="group inline-flex items-center gap-3 py-4"
              style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: `${IVORY}80`, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}
            >
              <span className="block w-6 h-px transition-all duration-300 group-hover:w-10" style={{ backgroundColor: GOLD }} />
              {t("consultBtn")}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────
export default function Home() {
  return (
    <div>
      <Header />
      <main>
        <Hero />
        <MarqueeStrip />
        <CollectionsSection />
        <BestSellersSection />
        <PromoSection />
        <BrandStorySection />
        <WhyChooseUsSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}
