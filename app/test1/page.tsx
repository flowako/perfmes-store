"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  useMotionValue,
  useSpring,
  animate,
} from "framer-motion";

// ── Fonts ──────────────────────────────────────────────────────────────────────
function FontLoader() {
  useEffect(() => {
    const l = document.createElement("link");
    l.href =
      "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
  }, []);
  return null;
}

// ── Tokens (Light Theme) ───────────────────────────────────────────────────────
const T = {
  void: "#FAFAF7",        // Light ivory background
  ink: "#F5F1E8",         // Warm off-white
  paper: "#1A1A1A",       // Dark text (inverted)
  mist: "#6B6B6B",        // Muted text
  amber: "#C8A97E",
  violet: "#9B7FE8",
  electric: "#E2C14A",
  rose: "#E8A598",
  surface: "#FFFFFF",     // White surface
  surfaceHigh: "#F5F1E8", // Warm surface
};

// ── Noise Texture Overlay ─────────────────────────────────────────────────────
function Noise({ opacity = 0.035 }: { opacity?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
        mixBlendMode: "overlay",
      }}
    />
  );
}

// ── Animated Mesh Gradient Background ─────────────────────────────────────────
function MeshBg() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "70vw",
          height: "70vw",
          top: "-20%",
          right: "-15%",
          background: `radial-gradient(circle, ${T.violet}25 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
        animate={{ scale: [1, 1.15, 1], rotate: [0, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "60vw",
          height: "60vw",
          bottom: "-10%",
          left: "-10%",
          background: `radial-gradient(circle, ${T.amber}22 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
        animate={{ scale: [1, 1.2, 1], rotate: [0, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "40vw",
          height: "40vw",
          top: "40%",
          left: "30%",
          background: `radial-gradient(circle, ${T.rose}18 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
        animate={{ scale: [1, 1.3, 1], x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 8 }}
      />
    </div>
  );
}

// ── Particle Field ─────────────────────────────────────────────────────────────
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
      particles.current = Array.from({ length: 80 }, () => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        return { x, y, ox: x, oy: y, vx: 0, vy: 0, r: Math.random() * 1.5 + 0.4, a: Math.random() * 0.6 + 0.2 };
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
        const force = Math.max(0, 120 - dist) / 120;
        p.vx += (-dx / dist || 0) * force * 0.8;
        p.vy += (-dy / dist || 0) * force * 0.8;
        p.vx += (p.ox - p.x) * 0.04;
        p.vy += (p.oy - p.y) * 0.04;
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 169, 126, ${p.a * 0.55})`;
        ctx.fill();

        // connection lines
        particles.current.forEach((p2) => {
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 80) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(200, 169, 126, ${0.05 * (1 - d / 80)})`;
            ctx.lineWidth = 0.5;
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

// ── Reveal ─────────────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 40, className = "" }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Pill Tag ───────────────────────────────────────────────────────────────────
function Tag({ children, color = T.amber }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium tracking-widest uppercase"
      style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30`, fontFamily: "DM Sans, sans-serif" }}
    >
      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

// ── Kinetic Button ─────────────────────────────────────────────────────────────
function KineticBtn({ children, variant = "solid", href = "#" }: { children: React.ReactNode; variant?: "solid" | "outline" | "ghost"; href?: string }) {
  const [hov, setHov] = useState(false);
  const base: React.CSSProperties = {
    fontFamily: "DM Sans, sans-serif",
    fontSize: "12px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 28px",
    borderRadius: variant === "solid" ? "100px" : "100px",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
    textDecoration: "none",
  };
  const styles: Record<string, React.CSSProperties> = {
    solid: { ...base, backgroundColor: hov ? T.paper : T.amber, color: T.void, border: "none" },
    outline: { ...base, backgroundColor: hov ? `${T.amber}12` : "transparent", color: T.paper, border: `1px solid ${T.amber}50` },
    ghost: { ...base, backgroundColor: "transparent", color: hov ? T.amber : T.mist, border: "none", padding: "14px 0" },
  };
  return (
    <motion.a
      href={href}
      style={styles[variant]}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: variant === "solid" ? T.paper : `${T.amber}15` }}
        initial={{ scale: 0, opacity: 0 }}
        animate={hov ? { scale: 1.4, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      <motion.span
        style={{ position: "relative", zIndex: 1 }}
        animate={hov ? { x: 4 } : { x: 0 }}
        transition={{ duration: 0.3 }}
      >→</motion.span>
    </motion.a>
  );
}

// ── Header ─────────────────────────────────────────────────────────────────────
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        style={{
          backgroundColor: scrolled ? `${T.surface}F8` : "transparent",
          backdropFilter: scrolled ? "blur(24px) saturate(150%)" : "none",
          borderBottom: scrolled ? `1px solid ${T.amber}20` : "1px solid transparent",
          transition: "all 0.5s ease",
        }}
      >
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 flex items-center justify-between h-16 md:h-20">
          {/* Left nav */}
          <nav className="hidden md:flex items-center gap-8">
            {["Collections", "Parfums", "Maison", "Journal"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[11px] tracking-widest uppercase transition-all duration-300 hover:opacity-100"
                style={{ fontFamily: "DM Sans, sans-serif", color: T.mist, fontWeight: 400 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = T.paper; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = T.mist; }}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Logo */}
          <a href="#" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <motion.span
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: "20px",
                fontWeight: 800,
                color: T.paper,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
              }}
              whileHover={{ letterSpacing: "0.35em" }}
              transition={{ duration: 0.4 }}
            >
              AURA
            </motion.span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "7px", color: T.amber, letterSpacing: "0.55em", textTransform: "uppercase", marginTop: "1px" }}>
              PARIS
            </span>
          </a>

          {/* Right */}
          <div className="hidden md:flex items-center gap-5">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ color: T.mist }}
              className="hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative"
              style={{ color: T.mist }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <motion.span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{ backgroundColor: T.violet, color: T.paper, fontFamily: "DM Sans, sans-serif" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
              >
                3
              </motion.span>
            </motion.button>
            <div className="w-px h-5" style={{ backgroundColor: `${T.mist}25` }} />
            <a
              href="#"
              className="text-[10px] tracking-widest uppercase px-4 py-2 rounded-full transition-all duration-300"
              style={{
                fontFamily: "DM Sans, sans-serif",
                color: T.void,
                backgroundColor: T.amber,
                fontWeight: 600,
              }}
            >
              Shop
            </a>
          </div>

          {/* Mobile burger */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} style={{ color: T.paper }}>
            <div className="flex flex-col gap-1.5 w-6">
              <motion.span className="block h-px bg-current" animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} />
              <motion.span className="block h-px bg-current" animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} />
              <motion.span className="block h-px bg-current" animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} />
            </div>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
            style={{ backgroundColor: T.surface }}
          >
            <Noise opacity={0.04} />
            <MeshBg />
            {["Collections", "Parfums", "Maison", "Journal", "Contact"].map((item, i) => (
              <motion.a
                key={item}
                href="#"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="text-4xl font-bold tracking-tight"
                style={{ fontFamily: "Syne, sans-serif", color: T.paper }}
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

// ── Hero ───────────────────────────────────────────────────────────────────────
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, 147, {
      duration: 2.5,
      delay: 1.5,
      ease: "easeOut",
      onUpdate(v) { setCount(Math.round(v)); },
    });
    return controls.stop;
  }, []);

  return (
    <section ref={ref} className="relative h-screen min-h-[700px] overflow-hidden flex items-center" style={{ backgroundColor: T.void }}>
      <Noise opacity={0.045} />
      <MeshBg />
      <ParticleField />

      {/* Horizontal lines */}
      <div className="absolute inset-0 pointer-events-none">
        {[25, 50, 75].map((pct) => (
          <div key={pct} className="absolute w-full h-px" style={{ top: `${pct}%`, backgroundColor: `${T.paper}06` }} />
        ))}
      </div>

      <motion.div
        className="relative z-10 w-full max-w-screen-xl mx-auto px-6 md:px-10"
        style={{ y, opacity }}
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-12 md:col-span-8 lg:col-span-7">
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mb-8 flex items-center gap-3"
            >
              <Tag color={T.violet}>Nouvelle Saison</Tag>
              <Tag color={T.amber}>SS 2026</Tag>
            </motion.div>

            {/* Headline — massive, weight-shifting */}
            <div className="overflow-hidden mb-2">
              <motion.h1
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                className="leading-none"
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(3.8rem, 10vw, 10rem)",
                  color: T.paper,
                  letterSpacing: "-0.03em",
                }}
              >
                WEAR
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-2">
              <motion.h1
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.62 }}
                className="leading-none"
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(3.8rem, 10vw, 10rem)",
                  color: "transparent",
                  WebkitTextStroke: `1.5px ${T.amber}`,
                  letterSpacing: "-0.03em",
                }}
              >
                YOUR
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-8">
              <motion.h1
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.74 }}
                className="leading-none"
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(3.8rem, 10vw, 10rem)",
                  color: T.paper,
                  letterSpacing: "-0.03em",
                }}
              >
                MEMORY
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.1 }}
              className="text-sm md:text-base leading-loose max-w-sm mb-10"
              style={{ fontFamily: "DM Sans, sans-serif", color: T.mist, fontWeight: 300 }}
            >
              Each flacon holds an entire universe. Crafted in Grasse with 
              ingredients that refuse compromise — worn by those who understand 
              that identity is invisible.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.25 }}
              className="flex flex-wrap items-center gap-4"
            >
              <KineticBtn variant="solid">Discover Now</KineticBtn>
              <KineticBtn variant="outline">View Collection</KineticBtn>
            </motion.div>
          </div>

          {/* Right stat cluster */}
          <div className="hidden lg:flex col-span-5 flex-col items-end gap-6">
            {/* Animated counter card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-2xl p-6 w-48"
              style={{ backgroundColor: T.surfaceHigh, border: `1px solid ${T.amber}18` }}
            >
              <Noise opacity={0.03} />
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: "3.5rem", fontWeight: 800, color: T.paper, lineHeight: 1 }}>
                {count}
              </div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "10px", color: T.amber, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "4px" }}>
                Unique Accords
              </div>
              <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full" style={{ backgroundColor: `${T.amber}10`, filter: "blur(12px)" }} />
            </motion.div>

            {/* Score card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-2xl p-5 w-44"
              style={{ backgroundColor: `${T.violet}18`, border: `1px solid ${T.violet}30` }}
            >
              <Noise opacity={0.03} />
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2.5rem", fontWeight: 800, color: T.paper, lineHeight: 1 }}>
                4.9
              </div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "10px", color: T.violet, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "4px" }}>
                Rating
              </div>
              <div className="flex gap-0.5 mt-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="text-xs" style={{ color: T.electric }}>★</div>
                ))}
              </div>
            </motion.div>

            {/* Worn in card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-2xl p-5 w-52"
              style={{ backgroundColor: T.surfaceHigh, border: `1px solid ${T.paper}08` }}
            >
              <Noise opacity={0.03} />
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "10px", color: T.mist, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "6px" }}>
                Worn in
              </div>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, color: T.paper, lineHeight: 1 }}>
                60+
              </div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "10px", color: T.mist, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "4px" }}>
                Countries
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-5 h-8 rounded-full border flex items-start justify-center pt-1.5"
            style={{ borderColor: `${T.mist}30` }}
          >
            <div className="w-1 h-2 rounded-full" style={{ backgroundColor: T.amber }} />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Scrolling Ticker ───────────────────────────────────────────────────────────
function Ticker() {
  const items = ["Nuit Absolue", "◆", "Blanche Lumière", "◆", "Sel de Mer", "◆", "Forêt d'Or", "◆", "Velours Noir", "◆", "Ambre de Minuit", "◆"];
  return (
    <div className="py-5 overflow-hidden" style={{ backgroundColor: T.surface, borderTop: `1px solid ${T.amber}12`, borderBottom: `1px solid ${T.amber}12` }}>
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="mx-8 text-xs tracking-widest"
            style={{
              fontFamily: item === "◆" ? "inherit" : "Syne, sans-serif",
              color: item === "◆" ? T.amber : `${T.mist}70`,
              fontWeight: item === "◆" ? 400 : 600,
              fontSize: item === "◆" ? "8px" : "11px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Collections Bento ──────────────────────────────────────────────────────────
const COLLECTIONS = [
  { id: 1, name: "L'Homme", sub: "Men", count: 40, color: `${T.violet}22`, accent: T.violet, size: "large" },
  { id: 2, name: "La Femme", sub: "Women", count: 52, color: `${T.rose}18`, accent: T.rose, size: "small" },
  { id: 3, name: "Libre", sub: "Unisex", count: 28, color: `${T.amber}15`, accent: T.amber, size: "small" },
  { id: 4, name: "Éssentiel", sub: "Niche & Rare", count: 12, color: `${T.electric}12`, accent: T.electric, size: "medium" },
];

function CollectionCard({ col, i }: { col: typeof COLLECTIONS[0]; i: number }) {
  const [hov, setHov] = useState(false);
  const heights: Record<string, string> = { large: "420px", small: "200px", medium: "280px" };
  return (
    <Reveal delay={i * 0.08}>
      <motion.a
        href="#"
        className="relative block overflow-hidden rounded-2xl cursor-pointer"
        style={{
          height: heights[col.size],
          backgroundColor: T.surfaceHigh,
          border: `1px solid ${hov ? col.accent + "40" : T.paper + "06"}`,
          transition: "border-color 0.4s ease",
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <Noise opacity={0.04} />
        {/* Glow bg */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ backgroundColor: col.color }}
          animate={{ opacity: hov ? 1.5 : 1 }}
          transition={{ duration: 0.5 }}
        />
        {/* Glow orb */}
        <motion.div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
          style={{ backgroundColor: col.accent, filter: "blur(50px)", opacity: 0.15 }}
          animate={{ scale: hov ? 1.5 : 1, opacity: hov ? 0.25 : 0.12 }}
          transition={{ duration: 0.5 }}
        />

        {/* Count label */}
        <div className="absolute top-5 right-5">
          <Tag color={col.accent}>{col.count} Parfums</Tag>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <motion.div
            className="w-8 h-px mb-4"
            style={{ backgroundColor: col.accent }}
            animate={{ width: hov ? "48px" : "32px" }}
            transition={{ duration: 0.35 }}
          />
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "10px", color: col.accent, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "4px" }}>
            {col.sub}
          </div>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 800, color: T.paper, lineHeight: 1, letterSpacing: "-0.02em" }}>
            {col.name}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: hov ? 1 : 0, y: hov ? 0 : 8 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 mt-4"
            style={{ fontFamily: "DM Sans, sans-serif", fontSize: "11px", color: col.accent, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 500 }}
          >
            Explore <span>→</span>
          </motion.div>
        </div>
      </motion.a>
    </Reveal>
  );
}

function Collections() {
  return (
    <section className="py-24 md:py-36 px-6 md:px-10" style={{ backgroundColor: T.void }}>
      <div className="max-w-screen-xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-14">
            <div className="flex-1">
              <Tag color={T.amber}>Our Worlds</Tag>
              <h2
                className="mt-4 leading-none"
                style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 5vw, 5rem)", color: T.paper, letterSpacing: "-0.03em" }}
              >
                Four<br /><span style={{ color: "transparent", WebkitTextStroke: `1px ${T.amber}` }}>Universes</span>
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed" style={{ fontFamily: "DM Sans, sans-serif", color: T.mist, fontWeight: 300 }}>
              Each collection is a world unto itself — built around a philosophy, a feeling, a way of inhabiting the world.
            </p>
          </div>
        </Reveal>

        {/* Bento layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <CollectionCard col={COLLECTIONS[0]} i={0} />
          </div>
          <div className="md:col-span-2 grid grid-rows-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <CollectionCard col={COLLECTIONS[1]} i={1} />
              <CollectionCard col={COLLECTIONS[2]} i={2} />
            </div>
            <CollectionCard col={COLLECTIONS[3]} i={3} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Products Horizontal Scroll ─────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: "Nuit Absolue", family: "Oriental · Woody", price: "€340", ml: "50ml", notes: ["Black Oud", "Sandalwood", "Amber"], accent: T.violet, badge: "Best Seller" },
  { id: 2, name: "Blanche Lumière", family: "Floral · Aldehyde", price: "€285", ml: "100ml", notes: ["Rose de Mai", "Neroli", "Musk"], accent: T.rose, badge: "New" },
  { id: 3, name: "Sel de Mer", family: "Aquatic · Aromatic", price: "€210", ml: "50ml", notes: ["Sea Salt", "Driftwood", "Ambergris"], accent: T.amber, badge: null },
  { id: 4, name: "Forêt d'Or", family: "Chypre · Mossy", price: "€520", ml: "30ml", notes: ["Oakmoss", "Vetiver", "Patchouli"], accent: T.electric, badge: "Limited" },
  { id: 5, name: "Velours Noir", family: "Gourmand · Dark", price: "€390", ml: "50ml", notes: ["Dark Vanilla", "Leather", "Coffee"], accent: T.rose, badge: null },
];

function ProductCard3D({ p, i }: { p: typeof PRODUCTS[0]; i: number }) {
  const [hov, setHov] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setPos({ x, y });
  };

  return (
    <Reveal delay={i * 0.08} className="flex-shrink-0 w-72 md:w-80">
      <motion.div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl cursor-pointer"
        style={{
          backgroundColor: T.surfaceHigh,
          border: `1px solid ${hov ? p.accent + "35" : T.paper + "07"}`,
          perspective: "800px",
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => { setHov(false); setPos({ x: 0, y: 0 }); }}
        onMouseMove={handleMove}
        animate={{
          rotateY: hov ? pos.x * 8 : 0,
          rotateX: hov ? -pos.y * 5 : 0,
          scale: hov ? 1.02 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <Noise opacity={0.04} />

        {/* Top visual zone */}
        <div className="relative h-64 flex items-center justify-center" style={{ backgroundColor: `${p.accent}09` }}>
          {/* Glow */}
          <motion.div
            className="absolute w-32 h-32 rounded-full"
            style={{ backgroundColor: p.accent, filter: "blur(40px)" }}
            animate={{ opacity: hov ? 0.2 : 0.08, scale: hov ? 1.3 : 1 }}
          />
          {/* Bottle SVG */}
          <motion.div
            animate={{ y: hov ? -10 : 0, rotateZ: hov ? 3 : 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg viewBox="0 0 100 240" width="90" height="200" fill="none">
              <defs>
                <linearGradient id={`b${p.id}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={p.accent} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={p.accent} stopOpacity="0.15" />
                </linearGradient>
                <linearGradient id={`sh${p.id}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="white" stopOpacity="0.12" />
                  <stop offset="50%" stopColor="white" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect x="38" y="4" width="24" height="14" rx="2.5" fill={p.accent} opacity="0.55" />
              <rect x="41" y="1" width="18" height="7" rx="1.5" fill={p.accent} opacity="0.65" />
              <path d="M38 18 L36 44 L64 44 L62 18Z" fill={`url(#b${p.id})`} stroke={p.accent} strokeWidth="0.5" strokeOpacity="0.3" />
              <path d="M22 58 Q36 44 46 44 L54 44 Q64 44 78 58 L80 68 L20 68Z" fill={`url(#b${p.id})`} stroke={p.accent} strokeWidth="0.5" strokeOpacity="0.3" />
              <rect x="20" y="68" width="60" height="148" rx="1" fill={`url(#b${p.id})`} stroke={p.accent} strokeWidth="0.5" strokeOpacity="0.25" />
              <rect x="20" y="68" width="60" height="148" rx="1" fill={`url(#sh${p.id})`} />
              <path d="M20 216 Q20 230 28 230 L72 230 Q80 230 80 216 L80 216 L20 216Z" fill={`url(#b${p.id})`} />
              <rect x="27" y="92" width="46" height="56" rx="1" fill="white" opacity="0.04" />
              <rect x="21" y="175" width="58" height="40" rx="0.5" fill={p.accent} opacity="0.06" />
            </svg>
          </motion.div>

          {p.badge && (
            <div className="absolute top-4 left-4">
              <Tag color={p.accent}>{p.badge}</Tag>
            </div>
          )}

          {/* Quick add */}
          <motion.div
            className="absolute bottom-0 inset-x-0 flex justify-center pb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: hov ? 1 : 0, y: hov ? 0 : 10 }}
          >
            <button
              className="text-[10px] tracking-widest uppercase px-5 py-2 rounded-full font-medium"
              style={{ backgroundColor: p.accent, color: T.void, fontFamily: "DM Sans, sans-serif" }}
            >
              + Add to Bag
            </button>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "9px", color: p.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
                {p.family}
              </div>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.2rem", fontWeight: 700, color: T.paper, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                {p.name}
              </div>
            </div>
            <div className="text-right">
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: T.paper }}>{p.price}</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "9px", color: T.mist, letterSpacing: "0.1em" }}>{p.ml}</div>
            </div>
          </div>
          <div className="flex gap-1 flex-wrap mt-3">
            {p.notes.map((n) => (
              <span key={n} className="text-[9px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${p.accent}12`, color: p.accent, fontFamily: "DM Sans, sans-serif", letterSpacing: "0.1em" }}>
                {n}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

function BestSellers() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["5%", "-10%"]);

  return (
    <section ref={ref} className="py-24 md:py-36 overflow-hidden" style={{ backgroundColor: T.ink }}>
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 mb-12">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="flex-1">
              <Tag color={T.electric}>Most Sought</Tag>
              <h2
                className="mt-4 leading-none"
                style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 5vw, 5rem)", color: T.paper, letterSpacing: "-0.03em" }}
              >
                Iconic<br /><span style={{ color: T.electric }}>Creations</span>
              </h2>
            </div>
            <KineticBtn variant="outline" href="#">View All →</KineticBtn>
          </div>
        </Reveal>
      </div>

      {/* Scroll-parallax horizontal strip */}
      <motion.div
        style={{ x }}
        className="flex gap-5 px-6 md:px-10 pb-4"
      >
        {PRODUCTS.map((p, i) => (
          <ProductCard3D key={p.id} p={p} i={i} />
        ))}
      </motion.div>
    </section>
  );
}

// ── Promo / Offer Banner ───────────────────────────────────────────────────────
function PromoBanner() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <section ref={ref} className="py-4 px-6 md:px-10" style={{ backgroundColor: T.void }}>
      <Reveal>
        <div
          className="relative overflow-hidden rounded-3xl px-8 md:px-16 py-16 md:py-20"
          style={{
            background: `linear-gradient(135deg, ${T.violet}25 0%, ${T.void} 40%, ${T.amber}15 100%)`,
            border: `1px solid ${T.violet}25`,
          }}
        >
          <Noise opacity={0.045} />
          <MeshBg />

          {/* Floating sticker */}
          <motion.div
            className="absolute top-8 right-8 md:top-12 md:right-12 flex flex-col items-center justify-center w-24 h-24 rounded-full"
            style={{ backgroundColor: T.electric, border: `2px solid ${T.void}` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: "1.4rem", fontWeight: 800, color: T.void, lineHeight: 1 }}>45</span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "8px", color: `${T.void}80`, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>%OFF</span>
          </motion.div>

          <div className="relative z-10 max-w-2xl">
            <Tag color={T.violet}>Limited Time · Ends in 72 hours</Tag>
            <h2
              className="mt-6 mb-4 leading-none"
              style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 4.5rem)", color: T.paper, letterSpacing: "-0.03em" }}
            >
              The Discovery Set
            </h2>
            <p className="text-sm leading-loose mb-8 max-w-sm" style={{ fontFamily: "DM Sans, sans-serif", color: T.mist, fontWeight: 300 }}>
              Eight 10ml flacons. Our most celebrated accords — composed as a journey through the Aura universe.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span style={{ fontFamily: "Syne, sans-serif", fontSize: "2.5rem", fontWeight: 800, color: T.paper }}>€195</span>
                <span className="ml-3 text-sm line-through" style={{ color: T.mist }}>€360</span>
              </div>
              <KineticBtn variant="solid">Reserve Yours</KineticBtn>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── Brand Story ────────────────────────────────────────────────────────────────
function BrandStory() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], ["30px", "-30px"]);

  return (
    <section ref={ref} className="py-24 md:py-40 px-6 md:px-10" style={{ backgroundColor: T.void }}>
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — visual */}
          <Reveal>
            <div className="relative">
              {/* Main card */}
              <div
                className="relative overflow-hidden rounded-3xl"
                style={{ height: "520px", backgroundColor: T.surface, border: `1px solid ${T.paper}06` }}
              >
                <Noise opacity={0.05} />
                <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 70%, ${T.violet}15 0%, transparent 60%)` }} />
                <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 70% 20%, ${T.amber}12 0%, transparent 60%)` }} />

                {/* Large abstract type */}
                <div
                  className="absolute -left-8 top-1/2 -translate-y-1/2 select-none pointer-events-none"
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: "clamp(8rem, 18vw, 16rem)",
                    fontWeight: 800,
                    color: "transparent",
                    WebkitTextStroke: `1px ${T.amber}12`,
                    lineHeight: 1,
                  }}
                >
                  G
                </div>

                {/* Quote */}
                <div className="absolute bottom-0 left-0 right-0 p-8" style={{ background: `linear-gradient(to top, ${T.void} 0%, transparent 100%)` }}>
                  <motion.p
                    style={{
                      y: yText,
                      fontFamily: "DM Sans, sans-serif",
                      color: `${T.paper}85`,
                      fontStyle: "italic",
                      fontWeight: 300,
                      lineHeight: 1.8,
                    }}
                    className="text-lg italic leading-relaxed"
                  >
                    "A fragrance is not made.
                    <br />It is remembered."
                  </motion.p>
                  <p className="mt-3 text-xs tracking-widest uppercase" style={{ fontFamily: "DM Sans, sans-serif", color: T.amber }}>
                    — Isabelle Morel, Founder · Grasse 1997
                  </p>
                </div>
              </div>

              {/* Floating metric */}
              <motion.div
                className="absolute -bottom-6 -right-6 rounded-2xl p-5"
                style={{ backgroundColor: T.amber, width: "150px" }}
                whileHover={{ scale: 1.05, rotate: -2 }}
              >
                <div style={{ fontFamily: "Syne, sans-serif", fontSize: "3rem", fontWeight: 800, color: T.void, lineHeight: 1 }}>29</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "9px", color: `${T.void}70`, letterSpacing: "0.2em", textTransform: "uppercase" }}>Years Crafting</div>
              </motion.div>

              {/* Floating badge */}
              <motion.div
                className="absolute -top-5 -left-5 rounded-2xl px-4 py-3"
                style={{ backgroundColor: T.surfaceHigh, border: `1px solid ${T.violet}30` }}
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "9px", color: T.violet, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "2px" }}>Grasse · France</div>
                <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: T.paper }}>Atelier</div>
              </motion.div>
            </div>
          </Reveal>

          {/* Right — text */}
          <div>
            <Reveal>
              <Tag color={T.amber}>Notre Maison</Tag>
              <h2
                className="mt-6 mb-8 leading-none"
                style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 4.5vw, 4.5rem)", color: T.paper, letterSpacing: "-0.03em" }}
              >
                Born from<br />the fields<br /><span style={{ color: T.amber }}>of Grasse</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-sm leading-loose mb-6 max-w-md" style={{ fontFamily: "DM Sans, sans-serif", color: T.mist, fontWeight: 300 }}>
                Aura was born in a small atelier overlooking the jasmine fields of Grasse. Our founder, Isabelle Morel, spent fifteen years apprenticed to the great noses of Provence before creating her first accord.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-sm leading-loose mb-10 max-w-md" style={{ fontFamily: "DM Sans, sans-serif", color: T.mist, fontWeight: 300 }}>
                Today, every fragrance follows the same slow, intentional process — natural raw materials sourced at peak perfection, absolute refusal of shortcuts. True luxury is invisible, and speaks only to the soul.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="flex flex-wrap gap-5">
                <KineticBtn variant="solid">Our Story</KineticBtn>
                <KineticBtn variant="ghost">Visit the Atelier</KineticBtn>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pillars ────────────────────────────────────────────────────────────────────
const PILLARS = [
  { icon: "◐", title: "Pure Origins", body: "47 trusted cultivators across 18 countries. Every ingredient traced to its source.", color: T.violet },
  { icon: "⧖", title: "Patient Craft", body: "Six months minimum maceration. You cannot rush an accord any more than a season.", color: T.amber },
  { icon: "⬡", title: "Crystal Flacon", body: "Weighted Baccarat-grade crystal. Designed to earn a permanent place on the finest dressing tables.", color: T.rose },
  { icon: "◎", title: "White Glove", body: "Complimentary engraving, hand-sealed in wax, delivered by those who know what they carry.", color: T.electric },
];

function WhyUs() {
  return (
    <section className="py-24 md:py-36 px-6 md:px-10" style={{ backgroundColor: T.ink }}>
      <div className="max-w-screen-xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <Tag color={T.amber}>L'Excellence</Tag>
            <h2
              className="mt-4 leading-none"
              style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 5vw, 5rem)", color: T.paper, letterSpacing: "-0.03em" }}
            >
              Four promises.<br /><span style={{ color: "transparent", WebkitTextStroke: `1.5px ${T.electric}` }}>Never broken.</span>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <motion.div
                className="relative overflow-hidden rounded-2xl p-6"
                style={{ backgroundColor: T.surfaceHigh, border: `1px solid ${T.paper}06`, minHeight: "220px" }}
                whileHover={{ scale: 1.02, y: -4, borderColor: `${p.color}30` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Noise opacity={0.04} />
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full" style={{ backgroundColor: p.color, filter: "blur(40px)", opacity: 0.12 }} />
                <div className="text-3xl mb-5" style={{ color: p.color }}>{p.icon}</div>
                <h3 className="mb-3 leading-tight" style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: T.paper }}>
                  {p.title}
                </h3>
                <p className="text-sm leading-loose" style={{ fontFamily: "DM Sans, sans-serif", color: T.mist, fontWeight: 300 }}>
                  {p.body}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ──────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-4 pb-8 px-6 md:px-10" style={{ backgroundColor: T.void }}>
      <Reveal>
        <div
          className="relative overflow-hidden rounded-3xl py-24 md:py-36 flex flex-col items-center text-center"
          style={{
            background: `linear-gradient(160deg, ${T.surface} 0%, ${T.void} 50%, ${T.surface} 100%)`,
            border: `1px solid ${T.paper}06`,
          }}
        >
          <Noise opacity={0.05} />
          <MeshBg />

          {/* Huge BG text */}
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center select-none pointer-events-none"
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "clamp(8rem, 25vw, 22rem)",
              fontWeight: 800,
              color: "transparent",
              WebkitTextStroke: `1px ${T.paper}04`,
              lineHeight: 1,
              letterSpacing: "-0.05em",
            }}
          >
            AURA
          </div>

          <div className="relative z-10 px-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full border flex items-center justify-center mx-auto mb-10"
              style={{ borderColor: `${T.amber}30` }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: T.amber }} />
            </motion.div>

            <Tag color={T.violet}>Begin Your Journey</Tag>
            <h2
              className="mt-6 mb-6 leading-none"
              style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(3rem, 8vw, 8rem)", color: T.paper, letterSpacing: "-0.04em" }}
            >
              Find Your<br /><span style={{ color: T.amber }}>Signature</span>
            </h2>
            <p className="text-sm leading-loose mb-12 max-w-sm mx-auto" style={{ fontFamily: "DM Sans, sans-serif", color: T.mist, fontWeight: 300 }}>
              Every fragrance tells a story. Let ours help you begin — or continue — yours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <KineticBtn variant="solid">Shop All Parfums</KineticBtn>
              <KineticBtn variant="outline">Take the Scent Quiz</KineticBtn>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  const links = {
    Collections: ["L'Homme", "La Femme", "Libre", "Éssentiel"],
    Maison: ["Our Story", "The Atelier", "Journal", "Contact"],
    Service: ["Shipping", "Returns", "Engravings", "Gift Sets"],
  };

  return (
    <footer className="px-6 md:px-10 pb-8" style={{ backgroundColor: T.void }}>
      <div
        className="max-w-screen-xl mx-auto pt-12 pb-8 rounded-3xl px-8 md:px-12"
        style={{ backgroundColor: T.surface, border: `1px solid ${T.paper}06` }}
      >
        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 pb-12" style={{ borderBottom: `1px solid ${T.paper}06` }}>
          {/* Brand */}
          <div className="md:col-span-2">
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.8rem", fontWeight: 800, color: T.paper, letterSpacing: "0.2em" }}>AURA</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "8px", color: T.amber, letterSpacing: "0.5em", textTransform: "uppercase", marginBottom: "16px" }}>PARIS</div>
            <p className="text-xs leading-loose max-w-xs" style={{ fontFamily: "DM Sans, sans-serif", color: T.mist, fontWeight: 300 }}>
              Haute Parfumerie since 1997. Crafted in Grasse with intention, worn with purpose.
            </p>
            {/* Social dots */}
            <div className="flex gap-3 mt-6">
              {["IG", "TK", "FB", "PI"].map((s) => (
                <motion.a
                  key={s}
                  href="#"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ backgroundColor: `${T.paper}08`, color: T.mist, fontFamily: "DM Sans, sans-serif" }}
                  whileHover={{ backgroundColor: `${T.amber}20`, color: T.amber, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {s}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: "11px", fontWeight: 700, color: T.paper, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
                {group}
              </div>
              {items.map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  className="block text-xs mb-3"
                  style={{ fontFamily: "DM Sans, sans-serif", color: T.mist, fontWeight: 300 }}
                  whileHover={{ color: T.paper, x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-6">
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "10px", color: `${T.mist}50`, fontWeight: 300, letterSpacing: "0.1em" }}>
            © 2026 Maison Aura Paris. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <motion.a
                key={item}
                href="#"
                style={{ fontFamily: "DM Sans, sans-serif", fontSize: "10px", color: `${T.mist}50`, textTransform: "uppercase", letterSpacing: "0.15em" }}
                whileHover={{ color: T.amber }}
                transition={{ duration: 0.2 }}
              >
                {item}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Custom Cursor ──────────────────────────────────────────────────────────────
function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40 });
  const sy = useSpring(y, { stiffness: 600, damping: 40 });
  const rx = useSpring(x, { stiffness: 80, damping: 20 });
  const ry = useSpring(y, { stiffness: 80, damping: 20 });
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); setVis(true); };
    const leave = () => setVis(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseleave", leave); };
  }, []);

  return (
    <>
      {/* Ring */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none hidden md:block"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%", opacity: vis ? 0.6 : 0, width: 40, height: 40, borderRadius: "50%", border: `1px solid ${T.amber}`, transition: "opacity 0.3s" }}
      />
      {/* Dot */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none hidden md:block rounded-full"
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%", opacity: vis ? 1 : 0, width: 5, height: 5, backgroundColor: T.amber, transition: "opacity 0.3s" }}
      />
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function LuxuryPerfumeLanding() {
  return (
    <>
      <FontLoader />
      <CustomCursor />
      <main style={{ backgroundColor: T.void, cursor: "none", overflowX: "hidden" }}>
        <Header />
        <Hero />
        <Ticker />
        <Collections />
        <BestSellers />
        <PromoBanner />
        <BrandStory />
        <WhyUs />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}