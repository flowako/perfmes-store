import { Shield, Truck, Award, Gem } from "lucide-react";

const PILLARS = [
  {
    icon: Shield,
    title: "Guaranteed Authentic",
    description: "Every fragrance is sourced directly from authorized distributors. No counterfeits, no compromises.",
  },
  {
    icon: Gem,
    title: "Curated Selection",
    description: "We don't stock everything — only what deserves to be in your collection. Quality over quantity, always.",
  },
  {
    icon: Truck,
    title: "Premium Delivery",
    description: "Carefully packaged and delivered to your door across all 58 wilayas. Your fragrance arrives pristine.",
  },
  {
    icon: Award,
    title: "Expert Guidance",
    description: "Our team lives and breathes fragrance. We'll help you find the scent that speaks to who you are.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-16 md:mb-20">
          <span className="section-label">The Élara Difference</span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-charcoal mt-4">
            Why Our Clients Trust Us
          </h2>
          <div className="divider-gold mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 flex items-center justify-center border border-border mb-6">
                <pillar.icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl font-light text-charcoal mb-3">
                {pillar.title}
              </h3>
              <p className="font-sans text-[13px] leading-[1.8] text-muted max-w-xs">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
