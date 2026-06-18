const FOOTER_LINKS = {
  collections: [
    { label: "Men's Fragrances", href: "/products?gender=men" },
    { label: "Women's Fragrances", href: "/products?gender=women" },
    { label: "Unisex", href: "/products?gender=unisex" },
    { label: "New Arrivals", href: "/products?sort=newest" },
    { label: "Best Sellers", href: "/products?sort=popular" },
  ],
  maison: [
    { label: "Our Story", href: "#brand-story" },
    { label: "Authenticity", href: "#" },
    { label: "Contact", href: "#" },
  ],
  support: [
    { label: "Shipping & Delivery", href: "#" },
    { label: "Returns Policy", href: "#" },
    { label: "FAQ", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-charcoal text-dark-text/70">
      {/* ─── Main Footer ─── */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <h2 className="font-serif text-xl tracking-[0.15em] uppercase font-light text-dark-text mb-4">
              Maison Élara
            </h2>
            <p className="font-sans text-[13px] leading-[1.8] text-dark-text/50 max-w-xs mb-6">
              Curating the world&apos;s finest fragrances for the discerning
              collector. Authenticity guaranteed, always.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-dark-text/40 hover:text-gold transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>

          {/* Collections */}
          <div className="lg:col-span-3">
            <h3 className="font-sans text-[11px] font-medium tracking-[0.25em] uppercase text-dark-text/40 mb-5">
              Collections
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.collections.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="font-sans text-[13px] text-dark-text/60 hover:text-dark-text transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Maison */}
          <div className="lg:col-span-2">
            <h3 className="font-sans text-[11px] font-medium tracking-[0.25em] uppercase text-dark-text/40 mb-5">
              Maison
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.maison.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="font-sans text-[13px] text-dark-text/60 hover:text-dark-text transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-3">
            <h3 className="font-sans text-[11px] font-medium tracking-[0.25em] uppercase text-dark-text/40 mb-5">
              Support
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="font-sans text-[13px] text-dark-text/60 hover:text-dark-text transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ─── Bottom Bar ─── */}
      <div className="border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-[11px] text-dark-text/30">
            &copy; {new Date().getFullYear()} Maison Élara. All rights reserved.
          </p>
          <a
            href="/admin/login"
            className="font-sans text-[10px] text-dark-text/15 hover:text-dark-text/30 transition-colors"
          >
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
}
