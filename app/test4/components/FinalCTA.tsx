import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative py-24 md:py-32 lg:py-40 bg-dark-section overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative max-w-3xl mx-auto px-6 md:px-12 text-center">
        <span className="section-label text-gold-light">Begin Your Journey</span>

        <h2 className="font-serif text-3xl md:text-4xl lg:text-[3.5rem] font-light text-dark-text mt-6 leading-[1.1]">
          Find the Fragrance That
          <br />
          <span className="italic">Defines You</span>
        </h2>

        <div className="w-12 h-px bg-gold/50 mx-auto mt-8 mb-8" />

        <p className="font-sans text-[15px] leading-[1.85] text-dark-text/60 max-w-lg mx-auto">
          Every great story begins with a single note. Explore our curated
          collection and discover the scent that becomes uniquely yours.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/products" className="btn-gold">
            Explore All Fragrances
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </section>
  );
}
