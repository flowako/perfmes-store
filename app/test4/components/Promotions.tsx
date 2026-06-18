import { ArrowRight } from "lucide-react";

export default function Promotions() {
  return (
    <section className="bg-dark-bg text-dark-text">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[650px] md:min-h-[750px]">
          {/* ─── Image Side ─── */}
          <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1000&h=800&fit=crop&q=85"
              alt="Limited edition fragrance collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-dark-bg/60 via-dark-bg/20 to-transparent" />
          </div>

          {/* ─── Text Side ─── */}
          <div className="flex flex-col justify-center px-8 md:px-16 lg:px-20 xl:px-24 py-20 lg:py-28 order-1 lg:order-2">
            <span className="section-label !text-gold-light">Limited Edition</span>

            <h2 className="font-heading text-[2.5rem] md:text-[3.25rem] lg:text-[3.75rem] font-light text-dark-text mt-6 leading-[1.05]">
              The Midnight
              <br />
              <span className="italic">Collection</span>
            </h2>

            <div className="w-16 h-[1px] bg-gold/40 mt-10 mb-10" />

            <p className="font-body text-[15px] md:text-[16px] leading-[1.8] text-dark-text/70 max-w-[480px]">
              An exclusive selection of rare evening fragrances, available
              for a limited time. Each scent captures the mystery and allure
              of midnight — deep oud, velvet rose, and smoky amber.
            </p>

            {/* Offer Details */}
            <div className="mt-12 flex items-baseline gap-5">
              <span className="font-heading text-[4rem] md:text-[5rem] font-light text-gold leading-none">
                20%
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-body text-[11px] font-medium tracking-[0.15em] uppercase text-dark-text/60">
                  Off Selected
                </span>
                <span className="font-body text-[11px] font-medium tracking-[0.15em] uppercase text-dark-text/60">
                  Fragrances
                </span>
              </div>
            </div>

            <div className="mt-12">
              <a href="/products?promo=true" className="btn-outline-light">
                Shop the Edit
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </a>
            </div>

            <p className="font-body text-[11px] text-dark-text/30 mt-8 tracking-wide">
              Offer valid until December 31, 2026. While stocks last.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
