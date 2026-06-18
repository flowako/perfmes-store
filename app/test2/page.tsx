



"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";

// ─── Design Tokens (Already Light Theme) ────────────────────────────────────
const IVORY = "#F7F4EF";
const GOLD = "#C9A96E";
const ESPRESSO = "#1A1714";
const LINEN = "#E8E2D9";
const MUTED = "#8B7E74";

// ─── Google Fonts Loader ─────────────────────────────────────────────────────
function FontLoader() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  return null;
}

// ─── Reveal Wrapper ──────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Marquee Strip ───────────────────────────────────────────────────────────
function MarqueeStrip() {
  const items = [
    "Extrait de Parfum",
    "·",
    "Maison Éclore",
    "·",
    "Since 1997",
    "·",
    "Grasse, France",
    "·",
    "Handcrafted",
    "·",
    "Limited Editions",
    "·",
  ];
  return (
    <div
      className="overflow-hidden border-y py-3"
      style={{ borderColor: `${GOLD}40` }}
    >
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap"
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="mx-6 text-xs tracking-[0.25em] uppercase"
            style={{
              fontFamily: "Inter, sans-serif",
              color: item === "·" ? GOLD : MUTED,
            }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
          {/* Nav left */}
          <nav className="hidden md:flex items-center gap-10">
            {["Collections", "Parfums", "Maison"].map((item) => (
              <a
                key={item}
                href="#"
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
                {item}
              </a>
            ))}
          </nav>

          {/* Logo */}
          <a href="#" className="absolute left-1/2 -translate-x-1/2">
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
                Éclore
              </span>
              <span
                className="text-[8px] tracking-[0.5em] uppercase mt-0.5"
                style={{
                  fontFamily: "Inter, sans-serif",
                  color: GOLD,
                  letterSpacing: "0.6em",
                }}
              >
                Paris
              </span>
            </div>
          </a>

          {/* Nav right */}
          <div className="hidden md:flex items-center gap-8">
            {["Journal", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
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
                {item}
              </a>
            ))}
            <div className="flex items-center gap-5 ml-4">
              <button
                style={{ color: scrolled ? ESPRESSO : IVORY }}
                className="transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = scrolled ? ESPRESSO : IVORY)
                }
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>
              <button
                style={{ color: scrolled ? ESPRESSO : IVORY }}
                className="transition-colors relative"
                onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = scrolled ? ESPRESSO : IVORY)
                }
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full text-[9px] flex items-center justify-center font-medium"
                  style={{ backgroundColor: GOLD, color: IVORY }}
                >
                  2
                </span>
              </button>
            </div>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: scrolled ? ESPRESSO : IVORY }}
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

      {/* Mobile menu */}
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
            {["Collections", "Parfums", "Maison", "Journal", "Contact"].map((item, i) => (
              <motion.a
                key={item}
                href="#"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="text-3xl tracking-[0.2em] uppercase"
                style={{ fontFamily: "Cormorant Garamond, serif", color: IVORY, fontWeight: 300 }}
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section ref={containerRef} className="relative h-screen min-h-[700px] overflow-hidden">
      {/* Background */}
      <motion.div className="absolute inset-0" style={{ scale }}>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${ESPRESSO} 0%, #2C1F1A 40%, #1A110E 100%)`,
          }}
        />
        {/* Abstract bottle silhouette */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <defs>
            <radialGradient id="glow1" cx="60%" cy="45%" r="40%">
              <stop offset="0%" stopColor={GOLD} stopOpacity="0.15" />
              <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="glow2" cx="30%" cy="70%" r="30%">
              <stop offset="0%" stopColor="#8B6A3E" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#8B6A3E" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={GOLD} stopOpacity="0.4" />
              <stop offset="50%" stopColor={GOLD} stopOpacity="0.08" />
              <stop offset="100%" stopColor={GOLD} stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#glow1)" />
          <rect width="1440" height="900" fill="url(#glow2)" />

          {/* Elegant perfume bottle silhouette */}
          <g transform="translate(780, 50)">
            {/* Cap */}
            <path d="M60 120 L80 60 L100 60 L120 120 Z" fill={GOLD} opacity="0.3" />
            <rect x="70" y="40" width="50" height="25" rx="4" fill={GOLD} opacity="0.25" />
            {/* Neck */}
            <path d="M65 120 L70 175 L120 175 L125 120 Z" fill="url(#bottleGrad)" />
            {/* Shoulders */}
            <path d="M40 200 Q70 175 90 175 L110 175 Q130 175 150 200 L155 230 L35 230 Z" fill="url(#bottleGrad)" />
            {/* Body */}
            <rect x="35" y="230" width="120" height="380" rx="2" fill="url(#bottleGrad)" />
            {/* Bottom */}
            <path d="M35 610 Q35 640 55 640 L135 640 Q155 640 155 610 L155 600 L35 600 Z" fill="url(#bottleGrad)" />
            {/* Label area */}
            <rect x="50" y="290" width="90" height="130" rx="1" fill={IVORY} opacity="0.04" />
            {/* Liquid effect */}
            <rect x="36" y="480" width="118" height="130" rx="1" fill={GOLD} opacity="0.04" />
          </g>

          {/* Fine lines */}
          <line x1="0" y1="1" x2="1440" y2="1" stroke={GOLD} strokeOpacity="0.08" strokeWidth="1" />
          <line x1="0" y1="899" x2="1440" y2="899" stroke={GOLD} strokeOpacity="0.08" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 lg:px-24"
        style={{ y, opacity }}
      >
        <div className="max-w-screen-xl mx-auto w-full">
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.6em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="text-[10px] md:text-xs uppercase mb-8 md:mb-10 block"
            style={{ fontFamily: "Inter, sans-serif", color: GOLD, letterSpacing: "0.4em" }}
          >
            Nouvelle Collection — Automne 2026
          </motion.p>

          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="leading-none mb-6"
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontWeight: 300,
                fontSize: "clamp(3.5rem, 9vw, 8.5rem)",
                color: IVORY,
                letterSpacing: "-0.01em",
              }}
            >
              Where
              <br />
              <em style={{ fontStyle: "italic", color: `${GOLD}` }}>Memory</em>
              <br />
              Blooms
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm md:text-base leading-relaxed mb-10 max-w-md"
              style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}99`, fontWeight: 300 }}
            >
              Each flacon is a story distilled. An intimate echo of places, 
              moments, and the quiet luxury of being exactly where you belong.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-start gap-5"
            >
              <a
                href="#"
                className="group relative inline-flex items-center gap-3 px-8 py-3.5 text-xs tracking-[0.2em] uppercase overflow-hidden"
                style={{
                  fontFamily: "Inter, sans-serif",
                  color: ESPRESSO,
                  backgroundColor: GOLD,
                }}
              >
                <motion.span
                  className="absolute inset-0"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{ backgroundColor: IVORY }}
                />
                <span className="relative z-10">Discover the Collection</span>
                <span className="relative z-10 transform group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a
                href="#"
                className="group inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase py-3.5"
                style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}80` }}
              >
                <span
                  className="block w-6 h-px transition-all duration-300 group-hover:w-10"
                  style={{ backgroundColor: GOLD }}
                />
                Our Maison
              </a>
            </motion.div>
          </div>

          {/* Bottom stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="absolute bottom-10 left-6 md:left-16 lg:left-24 flex gap-12"
          >
            {[
              { num: "29", label: "Years of Craft" },
              { num: "147", label: "Unique Accords" },
              { num: "60+", label: "Countries" },
            ].map((s) => (
              <div key={s.num}>
                <div
                  className="text-2xl md:text-3xl"
                  style={{ fontFamily: "Cormorant Garamond, serif", color: IVORY, fontWeight: 300 }}
                >
                  {s.num}
                </div>
                <div
                  className="text-[9px] tracking-[0.2em] uppercase mt-0.5"
                  style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}50` }}
                >
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
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-px h-12"
              style={{ backgroundColor: `${GOLD}60` }}
            />
            <span
              className="text-[8px] tracking-[0.3em] uppercase writing-mode-vertical"
              style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}40`, writingMode: "vertical-rl" }}
            >
              Scroll
            </span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Marquee Break ────────────────────────────────────────────────────────────

// ─── Collections Section ──────────────────────────────────────────────────────
const COLLECTIONS = [
  {
    id: 1,
    title: "L'Homme",
    subtitle: "Men's Fragrances",
    desc: "Cedar, vetiver, and dark amber — composed for quiet authority.",
    tag: "40 Parfums",
    accent: "#2C1F1A",
    pattern: "M",
  },
  {
    id: 2,
    title: "La Femme",
    subtitle: "Women's Fragrances",
    desc: "Rose absolute, neroli, and white musks — grace in every trail.",
    tag: "52 Parfums",
    accent: "#3D2535",
    pattern: "F",
  },
  {
    id: 3,
    title: "Libre",
    subtitle: "Unisex Collection",
    desc: "No boundaries. Only the pure language of exceptional ingredients.",
    tag: "28 Parfums",
    accent: "#1E2A2C",
    pattern: "U",
  },
  {
    id: 4,
    title: "Éssentiel",
    subtitle: "Niche & Rare",
    desc: "Ultra-limited. For those who understand that rarity is the highest luxury.",
    tag: "12 Parfums",
    accent: "#2A2215",
    pattern: "N",
  },
];

function CollectionsSection() {
  return (
    <section className="py-24 md:py-36 px-6 md:px-12 lg:px-24" style={{ backgroundColor: IVORY }}>
      <div className="max-w-screen-xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 md:mb-20 gap-6">
            <div>
              <p
                className="text-[10px] tracking-[0.4em] uppercase mb-4"
                style={{ fontFamily: "Inter, sans-serif", color: GOLD }}
              >
                Nos Collections
              </p>
              <h2
                className="leading-none"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                  fontWeight: 300,
                  color: ESPRESSO,
                }}
              >
                A World of
                <br />
                <em>Sensation</em>
              </h2>
            </div>
            <a
              href="#"
              className="group self-start md:self-auto flex items-center gap-3 text-xs tracking-[0.2em] uppercase pb-1"
              style={{
                fontFamily: "Inter, sans-serif",
                color: MUTED,
                borderBottom: `1px solid ${LINEN}`,
              }}
            >
              View All Collections
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </Reveal>

        {/* Collection Grid — editorial asymmetric layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {COLLECTIONS.map((col, i) => (
            <Reveal key={col.id} delay={i * 0.08}>
              <motion.a
                href="#"
                className="group relative block overflow-hidden"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: i === 0 || i === 3 ? "420px" : "320px" }}
              >
                {/* Background */}
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundColor: col.accent }}
                />
                {/* Large letter */}
                <div
                  className="absolute -right-4 -bottom-8 text-[220px] leading-none pointer-events-none select-none"
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontWeight: 300,
                    color: `${IVORY}06`,
                  }}
                >
                  {col.pattern}
                </div>
                {/* Gold accent line */}
                <motion.div
                  className="absolute top-0 left-0 w-full h-px"
                  style={{ backgroundColor: GOLD, scaleX: 0, originX: 0 }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
                {/* Content */}
                <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <span
                      className="text-[9px] tracking-[0.35em] uppercase"
                      style={{ fontFamily: "Inter, sans-serif", color: `${GOLD}` }}
                    >
                      {col.tag}
                    </span>
                  </div>
                  <div>
                    <p
                      className="text-xs mb-3 max-w-xs leading-relaxed"
                      style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}70`, fontWeight: 300 }}
                    >
                      {col.desc}
                    </p>
                    <h3
                      className="leading-none mb-1"
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: "clamp(2rem, 4vw, 3.5rem)",
                        fontWeight: 300,
                        color: IVORY,
                      }}
                    >
                      {col.title}
                    </h3>
                    <p
                      className="text-[10px] tracking-[0.25em] uppercase"
                      style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}50` }}
                    >
                      {col.subtitle}
                    </p>
                    <div className="mt-6 flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
                      <span
                        className="text-[10px] tracking-[0.2em] uppercase"
                        style={{ fontFamily: "Inter, sans-serif", color: GOLD }}
                      >
                        Explore
                      </span>
                      <span
                        className="block h-px w-8 group-hover:w-14 transition-all duration-500"
                        style={{ backgroundColor: GOLD }}
                      />
                    </div>
                  </div>
                </div>
              </motion.a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Best Sellers ─────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 1,
    name: "Nuit Absolue",
    family: "Oriental · Woody",
    concentration: "Extrait de Parfum",
    price: "€340",
    ml: "50ml",
    notes: ["Black oud", "Sandalwood", "Amber"],
    label: "Bestseller",
  },
  {
    id: 2,
    name: "Blanche Lumière",
    family: "Floral · Aldehyde",
    concentration: "Eau de Parfum",
    price: "€285",
    ml: "100ml",
    notes: ["Rose de Mai", "Neroli", "White musk"],
    label: "New",
  },
  {
    id: 3,
    name: "Sel de Mer",
    family: "Aquatic · Aromatic",
    concentration: "Eau de Parfum",
    price: "€210",
    ml: "50ml",
    notes: ["Sea salt", "Driftwood", "Ambergris"],
    label: null,
  },
  {
    id: 4,
    name: "Forêt d'Or",
    family: "Chypre · Mossy",
    concentration: "Parfum",
    price: "€520",
    ml: "30ml",
    notes: ["Oakmoss", "Vetiver", "Patchouli"],
    label: "Limited",
  },
];

// Minimal bottle SVG
function BottleSVG({ color = GOLD }: { color?: string }) {
  return (
    <svg viewBox="0 0 120 280" fill="none" className="w-full h-full">
      <defs>
        <linearGradient id={`bg-${color}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="50%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {/* Cap */}
      <rect x="42" y="8" width="36" height="18" rx="3" fill={color} opacity="0.5" />
      <rect x="46" y="4" width="28" height="8" rx="2" fill={color} opacity="0.6" />
      {/* Neck */}
      <path d="M46 26 L44 55 L76 55 L74 26Z" fill={`url(#bg-${color})`} stroke={color} strokeWidth="0.5" strokeOpacity="0.4" />
      {/* Shoulders */}
      <path d="M28 75 Q44 55 56 55 L64 55 Q76 55 92 75 L95 90 L25 90Z" fill={`url(#bg-${color})`} stroke={color} strokeWidth="0.5" strokeOpacity="0.4" />
      {/* Body */}
      <rect x="25" y="90" width="70" height="155" rx="1" fill={`url(#bg-${color})`} stroke={color} strokeWidth="0.5" strokeOpacity="0.4" />
      {/* Base */}
      <path d="M25 245 Q25 265 35 265 L85 265 Q95 265 95 245 L95 245 L25 245Z" fill={`url(#bg-${color})`} stroke={color} strokeWidth="0.5" strokeOpacity="0.4" />
      {/* Label */}
      <rect x="33" y="115" width="54" height="70" fill={color} opacity="0.06" />
      {/* Liquid */}
      <rect x="26" y="195" width="68" height="50" fill={color} opacity="0.08" />
    </svg>
  );
}

function ProductCard({ product, index }: { product: typeof PRODUCTS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal delay={index * 0.1}>
      <motion.div
        className="group relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Product visual */}
        <div
          className="relative mb-6 overflow-hidden flex items-center justify-center"
          style={{ height: "320px", backgroundColor: LINEN }}
        >
          {product.label && (
            <span
              className="absolute top-5 left-5 text-[9px] tracking-[0.25em] uppercase px-3 py-1"
              style={{
                fontFamily: "Inter, sans-serif",
                backgroundColor: product.label === "Limited" ? ESPRESSO : GOLD,
                color: product.label === "Limited" ? IVORY : ESPRESSO,
              }}
            >
              {product.label}
            </span>
          )}
          <motion.div
            className="w-28 h-60"
            animate={{ y: hovered ? -8 : 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <BottleSVG color={GOLD} />
          </motion.div>
          {/* Add to cart overlay */}
          <motion.div
            className="absolute inset-x-0 bottom-0 flex items-center justify-center py-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
            transition={{ duration: 0.3 }}
            style={{ backgroundColor: `${ESPRESSO}CC`, backdropFilter: "blur(4px)" }}
          >
            <button
              className="text-[10px] tracking-[0.25em] uppercase flex items-center gap-3"
              style={{ fontFamily: "Inter, sans-serif", color: IVORY }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Add to Selection
            </button>
          </motion.div>
        </div>

        {/* Info */}
        <div>
          <div className="flex justify-between items-start mb-1">
            <div>
              <p
                className="text-[9px] tracking-[0.25em] uppercase mb-1"
                style={{ fontFamily: "Inter, sans-serif", color: GOLD }}
              >
                {product.family}
              </p>
              <h3
                className="leading-tight"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "1.5rem",
                  fontWeight: 400,
                  color: ESPRESSO,
                }}
              >
                {product.name}
              </h3>
            </div>
            <div className="text-right">
              <div
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "1.25rem",
                  fontWeight: 400,
                  color: ESPRESSO,
                }}
              >
                {product.price}
              </div>
              <div
                className="text-[9px] tracking-widest"
                style={{ fontFamily: "Inter, sans-serif", color: MUTED }}
              >
                {product.ml}
              </div>
            </div>
          </div>
          <p
            className="text-[10px] tracking-wider mt-2"
            style={{ fontFamily: "Inter, sans-serif", color: MUTED }}
          >
            {product.notes.join(" · ")}
          </p>
          <p
            className="text-[9px] tracking-widest mt-1 uppercase"
            style={{ fontFamily: "Inter, sans-serif", color: `${MUTED}80` }}
          >
            {product.concentration}
          </p>
        </div>
      </motion.div>
    </Reveal>
  );
}

function BestSellers() {
  return (
    <section className="py-24 md:py-36 px-6 md:px-12 lg:px-24" style={{ backgroundColor: "#F2EDE6" }}>
      <div className="max-w-screen-xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 md:mb-20 gap-6">
            <div>
              <p
                className="text-[10px] tracking-[0.4em] uppercase mb-4"
                style={{ fontFamily: "Inter, sans-serif", color: GOLD }}
              >
                Our Finest
              </p>
              <h2
                className="leading-none"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                  fontWeight: 300,
                  color: ESPRESSO,
                }}
              >
                Most Sought
                <br />
                <em>Creations</em>
              </h2>
            </div>
            <div
              className="w-full md:w-px md:h-16 h-px md:self-center"
              style={{ backgroundColor: `${GOLD}30` }}
            />
            <p
              className="max-w-xs text-sm leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif", color: MUTED, fontWeight: 300 }}
            >
              Chosen by those who know that true luxury lives in the invisible — in a trail, a memory, a presence felt long after departure.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Promo Banner ─────────────────────────────────────────────────────────────
function PromoBanner() {
  return (
    <section
      className="relative py-20 md:py-28 px-6 overflow-hidden"
      style={{ backgroundColor: ESPRESSO }}
    >
      {/* Gold line decoration */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ backgroundColor: `${GOLD}30` }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ backgroundColor: `${GOLD}30` }}
      />

      <div className="max-w-screen-xl mx-auto text-center">
        <Reveal>
          <p
            className="text-[9px] tracking-[0.5em] uppercase mb-6"
            style={{ fontFamily: "Inter, sans-serif", color: GOLD }}
          >
            Offre Exclusive · Édition Limitée
          </p>
          <h2
            className="leading-none mb-6"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
              fontWeight: 300,
              color: IVORY,
            }}
          >
            The Discovery Set
          </h2>
          <p
            className="text-sm leading-relaxed max-w-lg mx-auto mb-10"
            style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}60`, fontWeight: 300 }}
          >
            Eight 10ml flacons. Our most celebrated accords, each one a chapter of the Éclore universe — offered as a single, considered gift.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <div style={{ color: IVORY }}>
              <span
                style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2.5rem", fontWeight: 300 }}
              >
                €195
              </span>
              <span
                className="text-xs ml-2 line-through"
                style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}40` }}
              >
                €360
              </span>
            </div>
            <div className="w-px h-8 hidden sm:block" style={{ backgroundColor: `${GOLD}30` }} />
            <a
              href="#"
              className="group relative inline-flex items-center gap-3 px-8 py-3.5 text-xs tracking-[0.2em] uppercase overflow-hidden border"
              style={{
                fontFamily: "Inter, sans-serif",
                color: IVORY,
                borderColor: `${GOLD}50`,
              }}
            >
              <motion.span
                className="absolute inset-0"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.4 }}
                style={{ backgroundColor: GOLD }}
              />
              <span className="relative z-10" style={{ color: IVORY }}>
                Reserve Yours
              </span>
              <span
                className="relative z-10 transform group-hover:translate-x-1 transition-transform"
                style={{ color: IVORY }}
              >
                →
              </span>
            </a>
          </div>
          <p
            className="text-[9px] tracking-[0.3em] uppercase"
            style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}30` }}
          >
            Free engraving · Complimentary gift wrap · 30-day returns
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Brand Story ──────────────────────────────────────────────────────────────
function BrandStory() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section ref={ref} className="py-24 md:py-40 overflow-hidden" style={{ backgroundColor: IVORY }}>
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — text */}
          <div>
            <Reveal>
              <p
                className="text-[10px] tracking-[0.4em] uppercase mb-6"
                style={{ fontFamily: "Inter, sans-serif", color: GOLD }}
              >
                Notre Maison
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="leading-none mb-10"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "clamp(2.5rem, 4.5vw, 4rem)",
                  fontWeight: 300,
                  color: ESPRESSO,
                }}
              >
                Crafted in
                <br />
                Grasse,
                <br />
                <em>Since 1997</em>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p
                className="text-sm leading-[1.9] mb-6 max-w-md"
                style={{ fontFamily: "Inter, sans-serif", color: MUTED, fontWeight: 300 }}
              >
                Éclore was born in a small atelier overlooking the jasmine fields of Grasse. Our founder, perfumer Isabelle Morel, spent fifteen years apprenticed to the great noses of Provence before creating her first accord.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p
                className="text-sm leading-[1.9] mb-10 max-w-md"
                style={{ fontFamily: "Inter, sans-serif", color: MUTED, fontWeight: 300 }}
              >
                Today, every fragrance we create still follows the same slow, intentional process — natural raw materials sourced at their peak, absolute refusal of shortcuts, and the understanding that true luxury is invisible to the eye and speaks only to the soul.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <a
                href="#"
                className="group inline-flex items-center gap-4 text-xs tracking-[0.2em] uppercase"
                style={{ fontFamily: "Inter, sans-serif", color: ESPRESSO }}
              >
                <span
                  className="block h-px w-8 group-hover:w-16 transition-all duration-500"
                  style={{ backgroundColor: GOLD }}
                />
                Our Story
              </a>
            </Reveal>
          </div>

          {/* Right — abstract visual composition */}
          <Reveal delay={0.15}>
            <div className="relative">
              <motion.div style={{ x }} className="relative">
                {/* Large card */}
                <div
                  className="relative overflow-hidden"
                  style={{ height: "480px", backgroundColor: ESPRESSO }}
                >
                  {/* Abstract scent visualization */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 480" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <radialGradient id="storyGlow" cx="50%" cy="40%" r="60%">
                        <stop offset="0%" stopColor={GOLD} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <rect width="500" height="480" fill="url(#storyGlow)" />
                    {/* Elegant curved lines representing scent trails */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <path
                        key={i}
                        d={`M${100 + i * 60} 480 Q${130 + i * 55} ${280 - i * 20} ${200 + i * 30} ${200 - i * 30} Q${260 + i * 20} ${120 - i * 15} ${220 + i * 40} 0`}
                        stroke={GOLD}
                        strokeWidth="0.5"
                        strokeOpacity={0.15 + i * 0.06}
                        fill="none"
                      />
                    ))}
                    {/* Central bottle */}
                    <g transform="translate(170, 80)">
                      <rect x="70" y="5" width="30" height="14" rx="2" fill={GOLD} opacity="0.4" />
                      <rect x="73" y="1" width="24" height="7" rx="1.5" fill={GOLD} opacity="0.5" />
                      <path d="M68 19 L66 42 L104 42 L102 19Z" fill={GOLD} opacity="0.15" stroke={GOLD} strokeWidth="0.4" strokeOpacity="0.3" />
                      <path d="M52 55 Q66 42 77 42 L93 42 Q104 42 118 55 L121 65 L49 65Z" fill={GOLD} opacity="0.15" stroke={GOLD} strokeWidth="0.4" strokeOpacity="0.3" />
                      <rect x="49" y="65" width="72" height="185" rx="0.5" fill={GOLD} opacity="0.12" stroke={GOLD} strokeWidth="0.4" strokeOpacity="0.25" />
                      <path d="M49 250 Q49 268 58 268 L112 268 Q121 268 121 250 L121 250 L49 250Z" fill={GOLD} opacity="0.12" stroke={GOLD} strokeWidth="0.4" strokeOpacity="0.25" />
                      <rect x="57" y="90" width="56" height="70" fill={GOLD} opacity="0.04" />
                    </g>
                  </svg>
                  {/* Text overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <p
                      className="text-[9px] tracking-[0.4em] uppercase mb-2"
                      style={{ fontFamily: "Inter, sans-serif", color: GOLD }}
                    >
                      Grasse · France
                    </p>
                    <p
                      className="text-base italic leading-relaxed"
                      style={{ fontFamily: "Cormorant Garamond, serif", color: `${IVORY}90`, fontWeight: 300 }}
                    >
                      "A fragrance is not made. It is remembered — drawn from the world and returned to it."
                    </p>
                    <p
                      className="text-[9px] tracking-widest uppercase mt-3"
                      style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}40` }}
                    >
                      — Isabelle Morel, Founder
                    </p>
                  </div>
                </div>
                {/* Small accent card */}
                <div
                  className="absolute -bottom-6 -left-6 p-6"
                  style={{ backgroundColor: GOLD, width: "160px" }}
                >
                  <div
                    className="text-4xl leading-none mb-1"
                    style={{ fontFamily: "Cormorant Garamond, serif", color: ESPRESSO, fontWeight: 300 }}
                  >
                    29
                  </div>
                  <div
                    className="text-[9px] tracking-[0.2em] uppercase"
                    style={{ fontFamily: "Inter, sans-serif", color: `${ESPRESSO}80` }}
                  >
                    Years of craft
                  </div>
                </div>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── Why Choose Us ────────────────────────────────────────────────────────────
const PILLARS = [
  {
    n: "I",
    title: "Purity of Ingredients",
    body: "We source from a network of 47 trusted cultivators. From Bulgarian rose fields to Sri Lankan cinnamon groves — only the finest raw materials enter our atelier.",
  },
  {
    n: "II",
    title: "The Art of Patience",
    body: "Our macerations age for a minimum of six months before blending. You cannot rush an accord any more than you can rush a season.",
  },
  {
    n: "III",
    title: "Flacon as Object",
    body: "Each bottle is weighted crystal — designed to earn a place on the finest dressing tables. The vessel is as considered as its contents.",
  },
  {
    n: "IV",
    title: "White Glove Service",
    body: "Complimentary engraving. Hand-wrapped in tissue and sealing wax. Delivered by a courier who knows the value of what they carry.",
  },
];

function WhyUsSection() {
  return (
    <section className="py-24 md:py-36 px-6 md:px-12 lg:px-24" style={{ backgroundColor: "#F2EDE6" }}>
      <div className="max-w-screen-xl mx-auto">
        <Reveal>
          <div className="text-center mb-20">
            <p
              className="text-[10px] tracking-[0.4em] uppercase mb-4"
              style={{ fontFamily: "Inter, sans-serif", color: GOLD }}
            >
              L'Excellence Éclore
            </p>
            <h2
              className="leading-none"
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                fontWeight: 300,
                color: ESPRESSO,
              }}
            >
              Four Promises.
              <br />
              <em>Never Compromised.</em>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          {PILLARS.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.1}>
              <div className="group">
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className="text-xs"
                    style={{ fontFamily: "Cormorant Garamond, serif", color: GOLD, fontStyle: "italic" }}
                  >
                    {p.n}
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundColor: `${GOLD}30` }} />
                </div>
                <h3
                  className="mb-4 leading-snug"
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "1.35rem",
                    fontWeight: 400,
                    color: ESPRESSO,
                  }}
                >
                  {p.title}
                </h3>
                <p
                  className="text-sm leading-[1.9]"
                  style={{ fontFamily: "Inter, sans-serif", color: MUTED, fontWeight: 300 }}
                >
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section
      className="relative py-28 md:py-44 px-6 overflow-hidden"
      style={{ backgroundColor: ESPRESSO }}
    >
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="ctaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={GOLD} stopOpacity="0.08" />
              <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1440" height="600" fill="url(#ctaGlow)" />
          <circle cx="720" cy="300" r="400" stroke={GOLD} strokeWidth="0.5" strokeOpacity="0.06" fill="none" />
          <circle cx="720" cy="300" r="280" stroke={GOLD} strokeWidth="0.5" strokeOpacity="0.08" fill="none" />
          <circle cx="720" cy="300" r="160" stroke={GOLD} strokeWidth="0.5" strokeOpacity="0.10" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <Reveal>
          <p
            className="text-[10px] tracking-[0.5em] uppercase mb-6"
            style={{ fontFamily: "Inter, sans-serif", color: GOLD }}
          >
            Begin Your Journey
          </p>
          <h2
            className="leading-none mb-8"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(3rem, 7vw, 6.5rem)",
              fontWeight: 300,
              color: IVORY,
            }}
          >
            Find Your
            <br />
            <em>Signature</em>
          </h2>
          <p
            className="text-sm leading-relaxed mb-12 max-w-md mx-auto"
            style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}55`, fontWeight: 300 }}
          >
            Every fragrance tells a story. Let ours help you begin — or continue — yours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <a
              href="#"
              className="group relative inline-flex items-center gap-3 px-10 py-4 text-xs tracking-[0.25em] uppercase overflow-hidden"
              style={{
                fontFamily: "Inter, sans-serif",
                color: ESPRESSO,
                backgroundColor: GOLD,
              }}
            >
              <motion.span
                className="absolute inset-0"
                style={{ backgroundColor: IVORY }}
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.4 }}
              />
              <span className="relative z-10">Shop All Parfums</span>
              <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <a
              href="#"
              className="group inline-flex items-center gap-3 text-xs tracking-[0.25em] uppercase py-4"
              style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}60` }}
            >
              Take our Scent Quiz
              <span
                className="block h-px w-6 group-hover:w-10 transition-all duration-400"
                style={{ backgroundColor: `${GOLD}80` }}
              />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
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
              Haute Parfumerie since 1997.
              <br />
              Crafted with intention. Worn with purpose.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-2">
            {[
              {
                title: "Collections",
                links: ["L'Homme", "La Femme", "Libre", "Éssentiel"],
              },
              {
                title: "Maison",
                links: ["Notre Histoire", "L'Atelier", "Journal", "Contact"],
              },
              {
                title: "Service",
                links: ["Shipping", "Returns", "Engravings", "Gift Sets"],
              },
            ].map((group) => (
              <div key={group.title}>
                <p
                  className="text-[9px] tracking-[0.35em] uppercase mb-4"
                  style={{ fontFamily: "Inter, sans-serif", color: GOLD }}
                >
                  {group.title}
                </p>
                {group.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-xs mb-2.5 transition-colors duration-200"
                    style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}40`, fontWeight: 300 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = `${IVORY}80`)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = `${IVORY}40`)}
                  >
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <p
            className="text-[9px] tracking-[0.2em]"
            style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}20` }}
          >
            © 2026 Maison Éclore Paris. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[9px] tracking-[0.15em] uppercase transition-colors"
                style={{ fontFamily: "Inter, sans-serif", color: `${IVORY}20` }}
                onMouseEnter={(e) => (e.currentTarget.style.color = `${IVORY}50`)}
                onMouseLeave={(e) => (e.currentTarget.style.color = `${IVORY}20`)}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Custom Cursor ────────────────────────────────────────────────────────────
function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 500, damping: 40 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 40 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);
    };
    const leave = () => setVisible(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
    };
  }, [cursorX, cursorY, visible]);

  return (
    <>
      {/* Dot */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full mix-blend-difference hidden md:block"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          width: 8,
          height: 8,
          backgroundColor: IVORY,
          opacity: visible ? 1 : 0,
        }}
      />
      {/* Ring */}
      <motion.div
        className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full border hidden md:block"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          width: 36,
          height: 36,
          borderColor: `${GOLD}60`,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s",
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LuxuryPerfumeLanding() {
  return (
    <>
      <FontLoader />
      <CustomCursor />
      <div style={{ backgroundColor: IVORY, cursor: "none" }}>
        <Header />
        <Hero />
        <MarqueeStrip />
        <CollectionsSection />
        <BestSellers />
        <PromoBanner />
        <BrandStory />
        <WhyUsSection />
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
}