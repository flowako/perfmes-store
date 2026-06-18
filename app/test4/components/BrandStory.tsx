export default function BrandStory() {
  return (
    <section id="brand-story" className="py-24 md:py-32 lg:py-40 bg-ivory">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1616604426203-5c89ae8cbfc6?w=600&h=750&fit=crop&q=80"
                  alt="The art of perfumery"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden md:block absolute -bottom-8 -right-8 lg:-right-12 w-2/5 aspect-square overflow-hidden border-4 border-ivory shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=300&h=300&fit=crop&q=80"
                  alt="Perfume ingredients"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2">
            <span className="section-label">Our Maison</span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-[3.25rem] font-light text-charcoal mt-5 leading-[1.1]">
              A Legacy of<br /><span className="italic">Exquisite Taste</span>
            </h2>
            <div className="divider-gold mt-8 mb-8" />
            <div className="space-y-6 max-w-lg">
              <p className="font-sans text-[15px] leading-[1.85] text-muted">
                For over a decade, Maison Élara has been the trusted destination for those who understand that fragrance is not merely a product — it is an expression of identity, a silent signature that lingers in memory.
              </p>
              <p className="font-sans text-[15px] leading-[1.85] text-muted">
                We curate only authentic fragrances from the world&apos;s most prestigious houses. Every bottle has been selected with the same care the original perfumer poured into its creation.
              </p>
              <p className="font-sans text-[15px] leading-[1.85] text-muted">
                From the fields of Grasse to the ancient oud forests of Southeast Asia, we trace each ingredient to its source — because authenticity is not a feature, it is a promise.
              </p>
            </div>
            <div className="mt-12 flex items-center gap-6">
              <div className="w-16 h-px bg-gold-light" />
              <p className="font-serif text-lg italic text-charcoal/60">
                &ldquo;Scent is the art of memory&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
