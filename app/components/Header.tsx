"use client";

import { useState } from "react";
import { Search, ShoppingBag, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Collections", href: "/collections" },
  { label: "Fragrances", href: "/products" },
  { label: "Maison", href: "#brand-story" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ivory/95 backdrop-blur-sm border-b border-border-light/50">
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Left — Desktop nav */}
          <div className="flex items-center min-w-0 flex-1">
            <button
              className="md:hidden p-2 -ml-2 text-charcoal"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
            </button>
            <nav className="hidden md:flex items-center gap-10 lg:gap-12">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-body text-[10px] lg:text-[11px] font-medium tracking-[0.2em] uppercase text-muted hover:text-charcoal transition-colors duration-400"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Center — Logo */}
          <a href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="font-heading text-[20px] md:text-[24px] lg:text-[26px] tracking-[0.15em] uppercase font-light text-charcoal">
              Maison Élara
            </span>
          </a>

          {/* Right — Actions */}
          <div className="flex items-center justify-end gap-5 lg:gap-6 flex-1">
            <button aria-label="Search" className="p-2 text-muted hover:text-charcoal transition-colors duration-400">
              <Search className="w-[19px] h-[19px]" strokeWidth={1.3} />
            </button>
            <button aria-label="Shopping bag" className="relative p-2 text-muted hover:text-charcoal transition-colors duration-400">
              <ShoppingBag className="w-[19px] h-[19px]" strokeWidth={1.3} />
              <span className="absolute top-0 right-0 w-[15px] h-[15px] bg-charcoal text-cream text-[9px] font-medium flex items-center justify-center rounded-full leading-none">
                0
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cream border-t border-border-light/50">
          <nav className="flex flex-col px-6 py-8 gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-body text-[13px] tracking-[0.15em] uppercase text-charcoal hover:text-gold transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
