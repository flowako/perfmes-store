import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen bg-ivory pt-20 md:pt-24">
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center min-h-[calc(100vh-96px)]">

          {/* ─── Text ─── */}
          <div className="flex flex-col justify-center py-16 lg:py-0 order-2 lg:order-1 lg:col-span-5">
            <p className="section-label mb-8">
              The Art of Scent
            </p>

            <h1 className="font-heading text-[3rem] sm:text-[3.75rem] md:text-[4.75rem] lg:text-[5.5rem] xl:text-[6rem] leading-[0.95] font-light text-charcoal mb-10">
              Where Elegance
              <br />
              <span className="italic font-light">Meets Essence</span>
            </h1>

            <div className="w-16 h-[1px] bg-gold mb-10" />

            <p className="font-body text-[15px] md:text-[16px] leading-[1.75] text-muted max-w-[480px] mb-12">
              Discover a curated collection of the world&apos;s most coveted
              fragrances. Each scent, a masterpiece. Each bottle, a statement
              of refined taste.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/products"
                className="inline-flex items-center justify-center gap-3 h-[56px] px-10 bg-charcoal text-cream font-body text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-charcoal-light transition-all duration-400"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a
                href="#brand-story"
                className="inline-flex items-center justify-center h-[56px] px-10 border border-border-light text-charcoal font-body text-[11px] font-medium tracking-[0.2em] uppercase hover:border-charcoal transition-all duration-400"
              >
                Our Story
              </a>
            </div>
          </div>

          {/* ─── Image ─── */}
          <div className="relative order-1 lg:order-2 lg:col-span-7 flex items-center justify-end">
            <div className="relative w-full max-w-[560px] lg:max-w-none">
              <div className="aspect-[3/4] lg:aspect-[4/5] w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&h=1200&fit=crop&q=85"
                  alt="Luxury perfume editorial"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating badge */}
              <div className="hidden md:block absolute bottom-8 -left-8 lg:-left-12 bg-cream px-8 py-6 shadow-md">
                <p className="font-body text-[10px] font-medium tracking-[0.25em] uppercase text-gold mb-2">
                  New Season
                </p>
                <p className="font-heading text-lg text-charcoal">
                  Autumn Collection 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
