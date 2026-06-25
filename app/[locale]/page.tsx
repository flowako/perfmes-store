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
import { STORE } from "@/lib/store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const IVORY = "#F7F4EF";
const CREAM = "#FAF8F3";
const GOLD = "#C9A96E";
const GOLD_DEEP = "#A8854A";
const ESPRESSO = "#1A1714";
const COCOA = "#241D17";
const LINEN = "#E8E2D9";
const MUTED = "#8B7E74";

const EASE = [0.22, 1, 0.36, 1] as const;

function Reveal({ children, delay = 0, y = 36, className = "" }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: EASE, delay }}
      className={className}>
      {children}
    </motion.div>
  );
}

function Eyebrow({ children, color = GOLD, className = "" }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <span className={`text-[10px] md:text-[11px] tracking-[0.4em] uppercase ${className}`}
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color, fontWeight: 500 }}>
      {children}
    </span>
  );
}

function GoldLink({ href, children, color = MUTED }: { href: string; children: React.ReactNode; color?: string }) {
  const inner = (
    <span className="group inline-flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase pb-1" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color, fontWeight: 500 }}>
      {children}
      <span className="block h-px w-7 transition-all duration-500 group-hover:w-14" style={{ backgroundColor: GOLD }} />
      <span className="transform group-hover:translate-x-1 transition-transform duration-300" style={{ color: GOLD }}>→</span>
    </span>
  );
  return <Link href={href as any}>{inner}</Link>;
}

function Hero() {
  const t = useTranslations("hero");
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const locale = useLocale();

  return (
    <section ref={containerRef} className="relative h-screen min-h-[680px] overflow-hidden" style={{ backgroundColor: ESPRESSO }}>
      <motion.div className="absolute inset-0" style={{ scale }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(120% 90% at 70% 40%, ${COCOA} 0%, ${ESPRESSO} 55%, #100C09 100%)` }} />
        <div className="ec-grain" />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden>
          <defs>
            <radialGradient id="glow1" cx="62%" cy="42%" r="42%">
              <stop offset="0%" stopColor={GOLD} stopOpacity="0.18" />
              <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#glow1)" />
        </svg>
      </motion.div>

      <motion.div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 lg:px-24" style={{ y, opacity }}>
        <div className="max-w-screen-xl mx-auto w-full">
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.6em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
            className="block mb-8 md:mb-10"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: GOLD, fontWeight: 500, fontSize: "clamp(10px, 1vw, 12px)", letterSpacing: "0.4em", textTransform: "uppercase" }}>
            {t("tag")}
          </motion.p>

          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 52 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
              className="leading-[0.95] mb-7"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 300, fontSize: "clamp(3.4rem, 9vw, 8.5rem)", color: IVORY, letterSpacing: "-0.015em" }}>
              {t("title1")}{" "}
              <em style={{ fontStyle: "italic", color: GOLD }}>{t("title2")}</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.85, ease: EASE }}
              className="text-sm md:text-base leading-relaxed mb-11 max-w-md"
              style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: `${IVORY}99`, fontWeight: 300 }}>
              {t("subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.05, ease: EASE }}
              className="flex flex-col sm:flex-row items-start gap-6">
              <Link href="/products"
                className="group relative inline-flex items-center gap-3 px-9 py-4 overflow-hidden"
                style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: ESPRESSO, backgroundColor: GOLD, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}>
                <span className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ backgroundColor: IVORY }} />
                <span className="relative z-10">{t("discoverBtn")}</span>
                <span className="relative z-10 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function MarqueeStrip() {
  const t = useTranslations("marquee");
  const items = [t("tester"), t("qualite"), t("livraison"), t("prix"), t("stock"), t("fiable")];
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

function CollectionsSection() {
  const t = useTranslations("collections");
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
                <Link href={c.href as any}
                  className="group relative block overflow-hidden aspect-[4/5]"
                  style={{ backgroundColor: ESPRESSO }}>
                  <div className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-90" style={{ background: `radial-gradient(120% 90% at 30% 0%, ${c.tint} 0%, ${ESPRESSO} 62%, #100C09 100%)` }} />
                  <div className="ec-grain" style={{ opacity: 0.5 }} />
                  <div className="absolute -right-4 -top-6 text-[140px] leading-none pointer-events-none select-none transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 300, color: `${GOLD}10` }}>
                    {c.pattern}
                  </div>
                  <div className="absolute top-0 left-0 w-full h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" style={{ backgroundColor: GOLD }} />
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

function TesterExplanationSection() {
  const t = useTranslations("brandStory");
  const locale = useLocale();

  return (
    <section className="py-28 md:py-40 px-6 md:px-12 lg:px-24" style={{ backgroundColor: CREAM }}>
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        <Reveal className="lg:col-span-5" y={40}>
          <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: ESPRESSO }}>
            <div className="ec-grain" />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden>
              <defs>
                <radialGradient id="testerGlow" cx="50%" cy="45%" r="50%">
                  <stop offset="0%" stopColor={GOLD} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="400" height="500" fill="url(#testerGlow)" />
              <g transform="translate(200, 250)" opacity="0.6">
                <rect x="-60" y="-80" width="120" height="160" rx="3" fill="none" stroke={GOLD} strokeOpacity="0.3" />
                <rect x="-60" y="-80" width="120" height="160" rx="3" fill={GOLD} opacity="0.05" />
                <circle cx="0" cy="-20" r="4" fill={GOLD} opacity="0.5" />
              </g>
              <text x="200" y="470" textAnchor="middle" className="uppercase" style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "10px", letterSpacing: "0.4em", fill: `${IVORY}40` }}>
                Tester 1er Choix
              </text>
            </svg>
            <div className="absolute top-6 left-6 right-6 flex justify-between" style={{ color: `${IVORY}40` }}>
              <span className="text-[9px] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{locale === 'ar' ? 'ضمان الجودة' : 'Qualité Garantie'}</span>
              <span className="text-[9px] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-inter), sans-serif" }}>99%</span>
            </div>
          </div>
        </Reveal>

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
        </div>
      </div>
    </section>
  );
}

function WhyChooseUsSection() {
  const t = useTranslations("whyChooseUs");
  const features = ["quality", "delivery", "price"] as const;

  return (
    <section className="py-24 md:py-36 px-6 md:px-12 lg:px-24" style={{ backgroundColor: IVORY, borderTop: `1px solid ${LINEN}`, borderBottom: `1px solid ${LINEN}` }}>
      <div className="max-w-screen-xl mx-auto">
        <Reveal>
          <div className="text-center mb-16 md:mb-20">
            <Eyebrow className="block mb-5">{t("tag")}</Eyebrow>
            <h2 className="leading-[0.95]" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 300, color: ESPRESSO }}>
              {t("title")} <em style={{ fontStyle: "italic", color: GOLD_DEEP }}>{t("titleItalic")}</em>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ backgroundColor: LINEN }}>
          {features.map((f, i) => (
            <Reveal key={f} delay={i * 0.1}>
              <div className="h-full p-8 md:p-10 flex flex-col" style={{ backgroundColor: IVORY }}>
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
          <Link href="/products"
            className="group relative inline-flex items-center gap-3 px-9 py-4 overflow-hidden"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: ESPRESSO, backgroundColor: GOLD, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}>
            <span className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ backgroundColor: IVORY }} />
            <span className="relative z-10">{t("shopBtn")}</span>
            <span className="relative z-10 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <Header />
      <main>
        <Hero />
        <MarqueeStrip />
        <CollectionsSection />
        <TesterExplanationSection />
        <WhyChooseUsSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}