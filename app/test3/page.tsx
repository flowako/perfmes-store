"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  animate,
} from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS - Premium 2026 Palette (Light Theme)
// ─────────────────────────────────────────────────────────────────────────────
const PALETTE = {
  void: "#FAFAF7",         // Light ivory background
  midnight: "#FFFFFF",     // Pure white
  surface: "#F5F1E8",      // Warm off-white
  ivory: "#1A1A1A",        // Dark text (inverted)
  champagne: "#2A2A2A",    // Dark secondary text
  gold: "#C9A96E",
  goldLight: "#E8D5A3",
  amber: "#D4AF37",
  obsidian: "#FFFFFF",     // White cards
  mist: "#6B6B6B",         // Muted text
  pearl: "#1A1A1A",        // Dark highlights
  copper: "#B87333",
  whisper: "#4A4A4A",      // Body text dark
};

// ─────────────────────────────────────────────────────────────────────────────
// Font Loader
// ─────────────────────────────────────────────────────────────────────────────
function FontLoader() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@200;300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Noise Texture Overlay
// ─────────────────────────────────────────────────────────────────────────────
function NoiseTexture({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "140px 140px",
        mixBlendMode: "overlay",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated Mesh Gradient Background
// ─────────────────────────────────────────────────────────────────────────────
function MeshBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "75vw",
          height: "75vw",
          top: "-25%",
          right: "-20%",
          background: `radial-gradient(circle, ${PALETTE.gold}20 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "65vw",
          height: "65vw",
          bottom: "-15%",
          left: "-15%",
          background: `radial-gradient(circle, ${PALETTE.goldLight}18 0%, transparent 70%)`,
          filter: "blur(90px)",
        }}
        animate={{ scale: [1, 1.25, 1], rotate: [0, -25, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "50vw",
          height: "50vw",
          top: "35%",
          left: "25%",
          background: `radial-gradient(circle, ${PALETTE.copper}12 0%, transparent 70%)`,
          filter: "blur(70px)",
        }}
        animate={{ scale: [1, 1.35, 1], x: [0, 50, 0], y: [0, -40, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 10 }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Particle Field
// ─────────────────────────────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const particles = useRef<
    { x: number; y: number; ox: number; oy: number; vx: number; vy: number; r: number; a: number }[]
  >([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles.current = Array.from({ length: 90 }, () => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        return { x, y, ox: x, oy: y, vx: 0, vy: 0, r: Math.random() * 1.8 + 0.5, a: Math.random() * 0.5 + 0.25 };
      });
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener("mousemove", onMouseMove);

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach((p) => {
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(0, 140 - dist) / 140;
        p.vx += (-dx / dist || 0) * force * 0.9;
        p.vy += (-dy / dist || 0) * force * 0.9;
        p.vx += (p.ox - p.x) * 0.05;
        p.vy += (p.oy - p.y) * 0.05;
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 110, ${p.a * 0.5})`;
        ctx.fill();

        particles.current.forEach((p2) => {
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(201, 169, 110, ${0.06 * (1 - d / 90)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reveal Animation Wrapper
// ─────────────────────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 45, className = "" }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Premium Tag Component
// ─────────────────────────────────────────────────────────────────────────────
function PremiumTag({ children, color = PALETTE.gold }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-medium tracking-[0.3em] uppercase"
      style={{ 
        backgroundColor: `${color}12`, 
        color, 
        border: `1px solid ${color}25`,
        fontFamily: "Inter, sans-serif" 
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Kinetic Premium Button
// ─────────────────────────────────────────────────────────────────────────────
function KineticButton({ 
  children, 
  variant = "solid", 
  href = "#" 
}: { 
  children: React.ReactNode; 
  variant?: "solid" | "outline" | "ghost"; 
  href?: string 
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const variants = {
    solid: {
      base: { backgroundColor: PALETTE.gold, color: PALETTE.void, border: "none" },
      hover: { backgroundColor: PALETTE.goldLight, color: PALETTE.void }
    },
    outline: {
      base: { backgroundColor: "transparent", color: PALETTE.ivory, border: `1px solid ${PALETTE.gold}40` },
      hover: { backgroundColor: `${PALETTE.gold}15`, color: PALETTE.ivory, border: `1px solid ${PALETTE.gold}70` }
    },
    ghost: {
      base: { backgroundColor: "transparent", color: PALETTE.mist, border: "none" },
      hover: { backgroundColor: "transparent", color: PALETTE.gold, border: "none" }
    }
  };

  const currentStyle = isHovered ? variants[variant].hover : variants[variant].base;

  return (
    <motion.a
      href={href}
      style={{
        ...currentStyle,
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        padding: variant === "ghost" ? "16px 0" : "16px 32px",
        borderRadius: "100px",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.19, 1, 0.22, 1)",
        textDecoration: "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: variant === "solid" ? PALETTE.goldLight : `${PALETTE.gold}20` }}
        initial={{ scale: 0, opacity: 0 }}
        animate={isHovered ? { scale: 1.5, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      <motion.span
        style={{ position: "relative", zIndex: 1 }}
        animate={isHovered ? { x: 5 } : { x: 0 }}
        transition={{ duration: 0.3 }}
      >
        →
      </motion.span>
    </motion.a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Premium Header Component
// ─────────────────────────────────────────────────────────────────────────────
function PremiumHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1], delay: 0.3 }}
        style={{
          backgroundColor: scrolled ? `${PALETTE.midnight}F8` : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(140%)" : "none",
          borderBottom: scrolled ? `1px solid ${PALETTE.gold}20` : "1px solid transparent",
          transition: "all 0.5s cubic-bezier(0.19, 1, 0.22, 1)",
        }}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between h-20 md:h-24">
          {/* Left Navigation */}
          <nav className="hidden md:flex items-center gap-10 lg:gap-12">
            {["Collections", "Parfums", "Maison", "Craft"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[10px] tracking-[0.2em] uppercase transition-all duration-400"
                style={{ fontFamily: "Inter, sans-serif", color: PALETTE.mist, fontWeight: 400 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = PALETTE.pearl; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = PALETTE.mist; }}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Center Logo */}
          <a href="#" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <motion.span
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "24px",
                fontWeight: 300,
                color: PALETTE.pearl,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
              }}
              whileHover={{ letterSpacing: "0.45em" }}
              transition={{ duration: 0.5 }}
            >
              ÉLYSÉE
            </motion.span>
            <span style={{ 
              fontFamily: "Inter, sans-serif", 
              fontSize: "7px", 
              color: PALETTE.gold, 
              letterSpacing: "0.6em", 
              textTransform: "uppercase", 
              marginTop: "2px" 
            }}>
              PARIS
            </span>
          </a>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ color: PALETTE.mist }}
              className="hover:text-white transition-colors"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative"
              style={{ color: PALETTE.mist }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <motion.span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{ backgroundColor: PALETTE.gold, color: PALETTE.void, fontFamily: "Inter, sans-serif" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring" }}
              >
                2
              </motion.span>
            </motion.button>
            <div className="w-px h-6" style={{ backgroundColor: `${PALETTE.mist}20` }} />
            <a
              href="#"
              className="text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded-full transition-all duration-400"
              style={{
                fontFamily: "Inter, sans-serif",
                color: PALETTE.midnight,
                backgroundColor: PALETTE.gold,
                fontWeight: 600,
              }}
            >
              Shop
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} style={{ color: PALETTE.pearl }}>
            <div className="flex flex-col gap-1.5 w-6">
              <motion.span className="block h-px bg-current" animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} />
              <motion.span className="block h-px bg-current" animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} />
              <motion.span className="block h-px bg-current" animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} />
            </div>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
            style={{ backgroundColor: PALETTE.midnight }}
          >
            <NoiseTexture opacity={0.05} />
            <MeshBackground />
            {["Collections", "Parfums", "Maison", "Craft", "Contact"].map((item, i) => (
              <motion.a
                key={item}
                href="#"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="text-4xl font-light tracking-tight"
                style={{ fontFamily: "Cormorant Garamond, serif", color: PALETTE.pearl }}
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

// ─────────────────────────────────────────────────────────────────────────────
// Hero Section - Premium 2026
// ─────────────────────────────────────────────────────────────────────────────
function PremiumHero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, 156, {
      duration: 2.8,
      delay: 1.8,
      ease: "easeOut",
      onUpdate(v) { setCount(Math.round(v)); },
    });
    return controls.stop;
  }, []);

  return (
    <section 
      ref={ref} 
      className="relative h-screen min-h-[750px] overflow-hidden flex items-center" 
      style={{ backgroundColor: PALETTE.void }}
    >
      <NoiseTexture opacity={0.05} />
      <motion.div style={{ scale }} className="absolute inset-0">
        <MeshBackground />
      </motion.div>
      <ParticleField />

      {/* Decorative lines */}
      <div className="absolute inset-0 pointer-events-none">
        {[30, 50, 70].map((pct) => (
          <div key={pct} className="absolute w-full h-px" style={{ top: `${pct}%`, backgroundColor: `${PALETTE.pearl}08` }} />
        ))}
      </div>

      <motion.div
        className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12"
        style={{ y, opacity }}
      >
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 lg:col-span-7">
            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-10 flex items-center gap-3 flex-wrap"
            >
              <PremiumTag color={PALETTE.gold}>Édition Limitée</PremiumTag>
              <PremiumTag color={PALETTE.copper}>Automne 2026</PremiumTag>
            </motion.div>

            {/* Hero Title */}
            <div className="overflow-hidden mb-2">
              <motion.h1
                initial={{ y: "115%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay: 0.6 }}
                className="leading-[0.92]"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontWeight: 300,
                  fontSize: "clamp(4rem, 11vw, 11rem)",
                  color: PALETTE.ivory,
                  letterSpacing: "-0.02em",
                }}
              >
                Where
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-2">
              <motion.h1
                initial={{ y: "115%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay: 0.74 }}
                className="leading-[0.92]"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontWeight: 300,
                  fontStyle: "italic",
                  fontSize: "clamp(4rem, 11vw, 11rem)",
                  color: PALETTE.gold,
                  letterSpacing: "-0.02em",
                }}
              >
                Essence
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-10">
              <motion.h1
                initial={{ y: "115%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay: 0.88 }}
                className="leading-[0.92]"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontWeight: 300,
                  fontSize: "clamp(4rem, 11vw, 11rem)",
                  color: PALETTE.ivory,
                  letterSpacing: "-0.02em",
                }}
              >
                Meets Memory
              </motion.h1>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.3 }}
              className="text-base md:text-lg leading-relaxed max-w-xl mb-12"
              style={{ fontFamily: "Inter, sans-serif", color: PALETTE.whisper, fontWeight: 300, lineHeight: 1.8 }}
            >
              Each flacon is a masterwork of olfactory art. Born in Grasse, 
              refined in Paris, crafted for those who understand that true luxury 
              is felt, not seen.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.5 }}
              className="flex flex-wrap items-center gap-5"
            >
              <KineticButton variant="solid">Explore Collection</KineticButton>
              <KineticButton variant="outline">Discover Maison</KineticButton>
            </motion.div>
          </div>

          {/* Right Side - Floating Stats */}
          <div className="hidden lg:flex col-span-5 flex-col items-end gap-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 35 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
              className="relative overflow-hidden rounded-3xl p-8 w-56"
              style={{ 
                backgroundColor: `${PALETTE.surface}DD`, 
                border: `1px solid ${PALETTE.gold}20`,
                backdropFilter: "blur(20px)" 
              }}
            >
              <NoiseTexture opacity={0.04} />
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "4.2rem", fontWeight: 300, color: PALETTE.ivory, lineHeight: 0.95 }}>
                {count}
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: PALETTE.gold, letterSpacing: "0.25em", textTransform: "uppercase", marginTop: "8px" }}>
                Unique Accords
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full" style={{ backgroundColor: `${PALETTE.gold}12`, filter: "blur(15px)" }} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 35 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.78, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
              className="relative overflow-hidden rounded-3xl p-7 w-48"
              style={{ backgroundColor: `${PALETTE.copper}15`, border: `1px solid ${PALETTE.copper}30` }}
            >
              <NoiseTexture opacity={0.04} />
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "3rem", fontWeight: 300, color: PALETTE.ivory, lineHeight: 0.95 }}>
                4.9
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: PALETTE.copper, letterSpacing: "0.25em", textTransform: "uppercase", marginTop: "6px" }}>
                Expert Rating
              </div>
              <div className="flex gap-1 mt-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="text-sm" style={{ color: PALETTE.gold }}>★</div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 35 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.96, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
              className="relative overflow-hidden rounded-3xl p-7 w-60"
              style={{ backgroundColor: `${PALETTE.surface}DD`, border: `1px solid ${PALETTE.ivory}10`, backdropFilter: "blur(20px)" }}
            >
              <NoiseTexture opacity={0.04} />
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: PALETTE.mist, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "8px" }}>
                Crafted in
              </div>
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2.5rem", fontWeight: 300, color: PALETTE.ivory, lineHeight: 0.95 }}>
                Grasse
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: PALETTE.mist, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "6px" }}>
                France
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-9 rounded-full border flex items-start justify-center pt-2"
            style={{ borderColor: `${PALETTE.mist}25` }}
          >
            <div className="w-1 h-2 rounded-full" style={{ backgroundColor: PALETTE.gold }} />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scrolling Marquee Ticker
// ─────────────────────────────────────────────────────────────────────────────
function MarqueeTicker() {
  const items = ["Nuit Absolue", "◆", "Lumière Blanche", "◆", "Sel de Mer", "◆", "Forêt d'Ambre", "◆", "Velours Noir", "◆", "Cuir Précieux", "◆"];
  return (
    <div className="py-6 overflow-hidden" style={{ backgroundColor: PALETTE.surface, borderTop: `1px solid ${PALETTE.gold}10`, borderBottom: `1px solid ${PALETTE.gold}10` }}>
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="mx-10 text-xs tracking-widest"
            style={{
              fontFamily: item === "◆" ? "inherit" : "Cormorant Garamond, serif",
              color: item === "◆" ? PALETTE.gold : `${PALETTE.whisper}70`,
              fontWeight: item === "◆" ? 400 : 300,
              fontSize: item === "◆" ? "9px" : "12px",
              textTransform: "uppercase",
              letterSpacing: item === "◆" ? "0" : "0.25em",
            }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Elegant Bottle SVG
// ─────────────────────────────────────────────────────────────────────────────
function BottleSVG({ accent = PALETTE.gold }: { accent?: string }) {
  return (
    <svg viewBox="0 0 130 300" fill="none" className="w-full h-full">
      <defs>
        <linearGradient id={`bottle-grad-${accent}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.2" />
          <stop offset="50%" stopColor={accent} stopOpacity="0.45" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.15" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Cap */}
      <rect x="47" y="10" width="36" height="20" rx="4" fill={accent} opacity="0.6" />
      <rect x="52" y="5" width="26" height="10" rx="3" fill={accent} opacity="0.7" />
      {/* Neck */}
      <path d="M50 30 L48 65 L82 65 L80 30Z" fill={`url(#bottle-grad-${accent})`} stroke={accent} strokeWidth="0.6" strokeOpacity="0.5" />
      {/* Shoulders */}
      <path d="M32 85 Q48 65 60 65 L70 65 Q82 65 98 85 L102 100 L28 100Z" fill={`url(#bottle-grad-${accent})`} stroke={accent} strokeWidth="0.6" strokeOpacity="0.5" />
      {/* Body */}
      <rect x="28" y="100" width="74" height="170" rx="2" fill={`url(#bottle-grad-${accent})`} stroke={accent} strokeWidth="0.6" strokeOpacity="0.5" />
      {/* Base */}
      <path d="M28 270 Q28 290 40 290 L90 290 Q102 290 102 270 L102 270 L28 270Z" fill={`url(#bottle-grad-${accent})`} stroke={accent} strokeWidth="0.6" strokeOpacity="0.5" />
      {/* Label area */}
      <rect x="38" y="130" width="54" height="80" fill={accent} opacity="0.08" />
      {/* Liquid */}
      <rect x="29" y="220" width="72" height="50" fill={accent} opacity="0.1" filter="url(#glow)" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Collections Section - Premium Bento Grid
// ─────────────────────────────────────────────────────────────────────────────
const COLLECTIONS_DATA = [
  { 
    id: 1, 
    name: "L'Homme", 
    subtitle: "Men's Collection", 
    count: 42, 
    accent: PALETTE.copper,
    desc: "Cedar, vetiver, dark amber — composed for quiet authority.",
    size: "large" 
  },
  { 
    id: 2, 
    name: "La Femme", 
    subtitle: "Women's Collection", 
    count: 58, 
    accent: "#B8846E",
    desc: "Rose absolute, neroli, white musk — grace in every note.",
    size: "small" 
  },
  { 
    id: 3, 
    name: "Libre", 
    subtitle: "Unisex Collection", 
    count: 32, 
    accent: PALETTE.gold,
    desc: "No boundaries. Only the pure language of exceptional ingredients.",
    size: "small" 
  },
  { 
    id: 4, 
    name: "Éssentiel", 
    subtitle: "Niche & Rare", 
    count: 15, 
    accent: PALETTE.amber,
    desc: "Ultra-limited editions for those who understand rarity.",
    size: "medium" 
  },
];

function CollectionCard({ collection, index }: { collection: typeof COLLECTIONS_DATA[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const heights: Record<string, string> = { large: "460px", small: "220px", medium: "320px" };
  
  return (
    <Reveal delay={index * 0.1}>
      <motion.a
        href="#"
        className="relative block overflow-hidden rounded-3xl cursor-pointer"
        style={{
          height: heights[collection.size],
          backgroundColor: PALETTE.surface,
          border: `1px solid ${isHovered ? collection.accent + "45" : PALETTE.ivory + "08"}`,
          transition: "border-color 0.5s cubic-bezier(0.19, 1, 0.22, 1)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.015, y: -6 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      >
        <NoiseTexture opacity={0.05} />
        
        {/* Gradient background */}
        <motion.div
          className="absolute inset-0"
          style={{ 
            background: `radial-gradient(circle at 70% 40%, ${collection.accent}20 0%, transparent 70%)`,
          }}
          animate={{ opacity: isHovered ? 1.3 : 1 }}
          transition={{ duration: 0.6 }}
        />
        
        {/* Glow orb */}
        <motion.div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full"
          style={{ backgroundColor: collection.accent, filter: "blur(60px)", opacity: 0.15 }}
          animate={{ scale: isHovered ? 1.6 : 1, opacity: isHovered ? 0.28 : 0.15 }}
          transition={{ duration: 0.6 }}
        />

        {/* Count badge */}
        <div className="absolute top-6 right-6">
          <PremiumTag color={collection.accent}>{collection.count} Parfums</PremiumTag>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <motion.div
            className="h-px mb-5"
            style={{ backgroundColor: collection.accent, width: "40px" }}
            animate={{ width: isHovered ? "60px" : "40px" }}
            transition={{ duration: 0.4 }}
          />
          
          <div style={{ 
            fontFamily: "Inter, sans-serif", 
            fontSize: "10px", 
            color: collection.accent, 
            letterSpacing: "0.3em", 
            textTransform: "uppercase", 
            marginBottom: "6px" 
          }}>
            {collection.subtitle}
          </div>
          
          <div style={{ 
            fontFamily: "Cormorant Garamond, serif", 
            fontSize: "clamp(1.8rem, 4.5vw, 3rem)", 
            fontWeight: 300, 
            color: PALETTE.ivory, 
            lineHeight: 1, 
            letterSpacing: "-0.01em",
            marginBottom: "12px"
          }}>
            {collection.name}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: PALETTE.whisper,
              lineHeight: 1.6,
              marginBottom: "16px",
              maxWidth: "90%"
            }}
          >
            {collection.desc}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-3"
            style={{ 
              fontFamily: "Inter, sans-serif", 
              fontSize: "11px", 
              color: collection.accent, 
              textTransform: "uppercase", 
              letterSpacing: "0.2em", 
              fontWeight: 500 
            }}
          >
            Discover <span>→</span>
          </motion.div>
        </div>
      </motion.a>
    </Reveal>
  );
}

function CollectionsSection() {
  return (
    <section className="py-32 md:py-40 px-6 md:px-12" style={{ backgroundColor: PALETTE.void }}>
      <div className="max-w-[1600px] mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end gap-8 mb-16">
            <div className="flex-1">
              <PremiumTag color={PALETTE.gold}>Nos Univers</PremiumTag>
              <h2
                className="mt-6 leading-none"
                style={{ 
                  fontFamily: "Cormorant Garamond, serif", 
                  fontWeight: 300, 
                  fontSize: "clamp(2.8rem, 6vw, 5.5rem)", 
                  color: PALETTE.ivory, 
                  letterSpacing: "-0.02em" 
                }}
              >
                Four Worlds
                <br />
                <span style={{ fontStyle: "italic", color: PALETTE.gold }}>of Sensation</span>
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: PALETTE.whisper, fontWeight: 300 }}>
              Each collection tells a different story. From bold masculinity 
              to delicate femininity, from unisex freedom to rare niche masterpieces.
            </p>
          </div>
        </Reveal>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {COLLECTIONS_DATA.map((collection, i) => (
            <CollectionCard key={collection.id} collection={collection} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Premium Products Section
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCTS_DATA = [
  {
    id: 1,
    name: "Nuit Absolue",
    family: "Oriental · Woody",
    concentration: "Extrait de Parfum",
    price: "€380",
    ml: "50ml",
    notes: ["Black oud", "Sandalwood", "Amber"],
    label: "Bestseller",
    accent: PALETTE.copper,
  },
  {
    id: 2,
    name: "Lumière Blanche",
    family: "Floral · Aldehyde",
    concentration: "Eau de Parfum",
    price: "€295",
    ml: "100ml",
    notes: ["Rose de Mai", "Neroli", "White musk"],
    label: "New",
    accent: PALETTE.gold,
  },
  {
    id: 3,
    name: "Sel de Mer",
    family: "Aquatic · Aromatic",
    concentration: "Eau de Parfum",
    price: "€230",
    ml: "50ml",
    notes: ["Sea salt", "Driftwood", "Ambergris"],
    label: null,
    accent: "#7AA6B0",
  },
  {
    id: 4,
    name: "Forêt d'Ambre",
    family: "Chypre · Mossy",
    concentration: "Parfum",
    price: "€560",
    ml: "30ml",
    notes: ["Oakmoss", "Vetiver", "Patchouli"],
    label: "Limited",
    accent: PALETTE.amber,
  },
];

function ProductCard({ product, index }: { product: typeof PRODUCTS_DATA[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Reveal delay={index * 0.12}>
      <motion.div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Visual */}
        <div
          className="relative mb-7 overflow-hidden rounded-2xl flex items-center justify-center"
          style={{ height: "380px", backgroundColor: PALETTE.surface, border: `1px solid ${PALETTE.ivory}06` }}
        >
          <NoiseTexture opacity={0.04} />
          
          {product.label && (
            <span
              className="absolute top-6 left-6 text-[9px] tracking-[0.28em] uppercase px-3.5 py-1.5 rounded-full"
              style={{
                fontFamily: "Inter, sans-serif",
                backgroundColor: product.label === "Limited" ? PALETTE.void : product.accent,
                color: product.label === "Limited" ? PALETTE.ivory : PALETTE.void,
                fontWeight: 600,
              }}
            >
              {product.label}
            </span>
          )}
          
          <motion.div
            className="w-32 h-72"
            animate={{ y: isHovered ? -10 : 0, rotateY: isHovered ? 5 : 0 }}
            transition={{ duration: 0.65, ease: [0.19, 1, 0.22, 1] }}
          >
            <BottleSVG accent={product.accent} />
          </motion.div>
          
          {/* Add to Cart Overlay */}
          <motion.div
            className="absolute inset-x-0 bottom-0 flex items-center justify-center py-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 12 }}
            transition={{ duration: 0.4 }}
            style={{ backgroundColor: `${PALETTE.void}E6`, backdropFilter: "blur(8px)" }}
          >
            <button
              className="text-[10px] tracking-[0.28em] uppercase flex items-center gap-3"
              style={{ fontFamily: "Inter, sans-serif", color: PALETTE.ivory, fontWeight: 500 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Add to Collection
            </button>
          </motion.div>
        </div>

        {/* Product Info */}
        <div>
          <div className="flex justify-between items-start mb-1.5">
            <div>
              <p
                className="text-[9px] tracking-[0.28em] uppercase mb-1"
                style={{ fontFamily: "Inter, sans-serif", color: product.accent, fontWeight: 500 }}
              >
                {product.family}
              </p>
              <h3
                className="text-xl leading-tight mb-1"
                style={{ fontFamily: "Cormorant Garamond, serif", color: PALETTE.ivory, fontWeight: 400 }}
              >
                {product.name}
              </h3>
              <p
                className="text-[10px] tracking-[0.22em] uppercase"
                style={{ fontFamily: "Inter, sans-serif", color: PALETTE.mist }}
              >
                {product.concentration} · {product.ml}
              </p>
            </div>
            <div className="text-right">
              <div
                className="text-2xl"
                style={{ fontFamily: "Cormorant Garamond, serif", color: PALETTE.ivory, fontWeight: 400 }}
              >
                {product.price}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-wrap gap-2 mt-4">
            {product.notes.map((note) => (
              <span
                key={note}
                className="text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full"
                style={{
                  fontFamily: "Inter, sans-serif",
                  backgroundColor: `${product.accent}12`,
                  color: PALETTE.whisper,
                  border: `1px solid ${product.accent}20`,
                }}
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

function ProductsSection() {
  return (
    <section className="py-32 md:py-40 px-6 md:px-12" style={{ backgroundColor: PALETTE.midnight }}>
      <div className="max-w-[1600px] mx-auto">
        <Reveal>
          <div className="text-center mb-20">
            <PremiumTag color={PALETTE.gold}>Signature Selection</PremiumTag>
            <h2
              className="mt-6 leading-none"
              style={{ 
                fontFamily: "Cormorant Garamond, serif", 
                fontWeight: 300, 
                fontSize: "clamp(2.8rem, 6vw, 5.5rem)", 
                color: PALETTE.ivory, 
                letterSpacing: "-0.02em" 
              }}
            >
              <span style={{ fontStyle: "italic", color: PALETTE.gold }}>Best</span> Sellers
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: PALETTE.whisper, fontWeight: 300 }}>
              Our most coveted fragrances. Each one a masterpiece crafted 
              by world-renowned perfumers using the finest ingredients.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS_DATA.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand Story Section
// ─────────────────────────────────────────────────────────────────────────────
function BrandStorySection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

  return (
    <section ref={ref} className="relative py-32 md:py-48 overflow-hidden" style={{ backgroundColor: PALETTE.void }}>
      <NoiseTexture opacity={0.04} />
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left - Image */}
          <motion.div className="lg:col-span-5" style={{ y }}>
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                <img
                  src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&h=1000&fit=crop&q=90"
                  alt="Perfume craftsmanship"
                  className="w-full h-full object-cover"
                  style={{ filter: "grayscale(20%) contrast(1.05)" }}
                />
                <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 0%, ${PALETTE.void}40 100%)` }} />
              </div>
            </Reveal>
          </motion.div>

          {/* Right - Content */}
          <div className="lg:col-span-7">
            <Reveal delay={0.2}>
              <PremiumTag color={PALETTE.gold}>Notre Histoire</PremiumTag>
              <h2
                className="mt-6 mb-8 leading-none"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontWeight: 300,
                  fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                  color: PALETTE.ivory,
                  letterSpacing: "-0.02em"
                }}
              >
                Crafted in the
                <br />
                <span style={{ fontStyle: "italic", color: PALETTE.gold }}>Heart</span> of Grasse
              </h2>

              <div className="space-y-6 mb-10 max-w-2xl">
                <p className="text-base leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: PALETTE.whisper, fontWeight: 300 }}>
                  Since 1997, Élysée has been synonymous with olfactory excellence. 
                  Our atelier in Grasse, France — the world's perfume capital — 
                  is where centuries-old traditions meet contemporary artistry.
                </p>
                <p className="text-base leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: PALETTE.whisper, fontWeight: 300 }}>
                  Every fragrance is a collaboration between master perfumers and 
                  rare ingredient suppliers. We source only the most exceptional 
                  materials: Bulgarian rose, Madagascan vanilla, Indonesian patchouli, 
                  Indian sandalwood.
                </p>
                <p className="text-base leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: PALETTE.whisper, fontWeight: 300 }}>
                  The result? Perfumes that don't just smell beautiful — they 
                  tell stories, evoke memories, and become part of your identity.
                </p>
              </div>

              <KineticButton variant="outline">Discover Our Maison</KineticButton>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Final CTA Section
// ─────────────────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="relative py-32 md:py-40 overflow-hidden" style={{ backgroundColor: PALETTE.midnight }}>
      <NoiseTexture opacity={0.05} />
      <MeshBackground />
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
        <Reveal>
          <PremiumTag color={PALETTE.gold}>Join the Élysée World</PremiumTag>
          <h2
            className="mt-8 mb-10 leading-none"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontWeight: 300,
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              color: PALETTE.ivory,
              letterSpacing: "-0.02em"
            }}
          >
            Your Signature
            <br />
            <span style={{ fontStyle: "italic", color: PALETTE.gold }}>Awaits</span>
          </h2>
          
          <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-12" style={{ fontFamily: "Inter, sans-serif", color: PALETTE.whisper, fontWeight: 300 }}>
            Explore our full collection, visit our Parisian boutique, or 
            schedule a private consultation with one of our perfume experts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <KineticButton variant="solid">Explore All Fragrances</KineticButton>
            <KineticButton variant="outline">Book a Consultation</KineticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────────────
function PremiumFooter() {
  return (
    <footer className="py-16 px-6 md:px-12 border-t" style={{ backgroundColor: PALETTE.void, borderColor: `${PALETTE.gold}10` }}>
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="mb-6">
              <span
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "28px",
                  fontWeight: 300,
                  color: PALETTE.ivory,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                }}
              >
                ÉLYSÉE
              </span>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: PALETTE.gold, letterSpacing: "0.6em", textTransform: "uppercase" }}>
                PARIS
              </p>
            </div>
            <p className="text-sm leading-relaxed max-w-md" style={{ fontFamily: "Inter, sans-serif", color: PALETTE.mist, fontWeight: 300 }}>
              Haute parfumerie depuis 1997. Creating exceptional fragrances 
              for those who understand that luxury is a whisper, not a shout.
            </p>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.25em] uppercase mb-4" style={{ fontFamily: "Inter, sans-serif", color: PALETTE.ivory, fontWeight: 500 }}>
              Collections
            </h4>
            <nav className="flex flex-col gap-3">
              {["L'Homme", "La Femme", "Libre", "Éssentiel"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-sm transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", color: PALETTE.mist, fontWeight: 300 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = PALETTE.gold; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = PALETTE.mist; }}
                >
                  {link}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.25em] uppercase mb-4" style={{ fontFamily: "Inter, sans-serif", color: PALETTE.ivory, fontWeight: 500 }}>
              Maison
            </h4>
            <nav className="flex flex-col gap-3">
              {["Our Story", "Craftsmanship", "Boutiques", "Contact"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-sm transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", color: PALETTE.mist, fontWeight: 300 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = PALETTE.gold; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = PALETTE.mist; }}
                >
                  {link}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: `${PALETTE.gold}10` }}>
          <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: PALETTE.mist }}>
            © 2026 Élysée Paris. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Instagram", "Facebook", "Twitter"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs tracking-[0.2em] uppercase transition-colors"
                style={{ fontFamily: "Inter, sans-serif", color: PALETTE.mist }}
                onMouseEnter={(e) => { e.currentTarget.style.color = PALETTE.gold; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = PALETTE.mist; }}
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Premium Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function PremiumPage() {
  return (
    <>
      <FontLoader />
      <PremiumHeader />
      <main className="flex-1">
        <PremiumHero />
        <MarqueeTicker />
        <CollectionsSection />
        <ProductsSection />
        <BrandStorySection />
        <FinalCTA />
      </main>
      <PremiumFooter />
    </>
  );
}
