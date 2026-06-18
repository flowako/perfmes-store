import { ArrowRight } from "lucide-react";

const COLLECTIONS = [
  {
    title: "Pour Homme",
    subtitle: "Men's Fragrances",
    description: "Bold. Refined. Unforgettable.",
    image:
      "https://images.unsplash.com/photo-1594035910387-fea081ac3cc4?w=700&h=900&fit=crop&q=85",
    href: "/products?gender=men",
  },
  {
    title: "Pour Femme",
    subtitle: "Women's Fragrances",
    description: "Grace. Allure. Timeless beauty.",
    image:
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=700&h=900&fit=crop&q=85",
    href: "/products?gender=women",
  },
  {
    title: "Sans Genre",
    subtitle: "Unisex Collection",
    description: "Beyond convention. Pure expression.",
    image:
      "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=700&h=900&fit=crop&q=85",
    href: "/products?gender=unisex",
  },
  {
    title: "Raretés",
    subtitle: "Niche Collection",
    description: "For the true connoisseur.",
    image:
      "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=700&h=900&fit=crop&q=85",
    href: "/products?category=niche",
  },
];

export default function FeaturedCollections() {
  return (
    <section className="py-28 md:py-36 lg:py-44 bg-cream">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
        {/* ─── Section Header ─── */}
        <div className="text-center mb-20 md:mb-28">
          <span className="section-label">Curated For You</span>
          <h2 className="font-heading text-[2.5rem] md:text-[3.25rem] lg:text-[4rem] font-light text-charcoal mt-6">
            Our Collections
          </h2>
          <div className="divider-gold mx-auto mt-8" />
        </div>

        {/* ─── Collection Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {COLLECTIONS.map((collection) => (
            <a
              key={collection.title}
              href={collection.href}
              className="group relative flex flex-col"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-border/20">
                <img
                  src={collection.image}
                  alt={collection.subtitle}
                  className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/8 transition-colors duration-700" />
              </div>

              {/* Text */}
              <div className="pt-6 pb-2">
                <p className="font-body text-[10px] font-medium tracking-[0.25em] uppercase text-gold mb-2">
                  {collection.subtitle}
                </p>
                <h3 className="font-heading text-[1.5rem] md:text-[1.75rem] font-light text-charcoal leading-tight">
                  {collection.title}
                </h3>
                <p className="font-body text-[14px] text-muted mt-2 leading-relaxed">
                  {collection.description}
                </p>
                <span className="inline-flex items-center gap-2 font-body text-[11px] font-medium tracking-[0.15em] uppercase text-charcoal mt-5 group-hover:text-gold transition-colors duration-400">
                  Discover
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-400 group-hover:translate-x-1" strokeWidth={1.5} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
