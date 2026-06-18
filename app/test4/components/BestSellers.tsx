const PRODUCTS = [
  {
    id: 1,
    brand: "Tom Ford",
    name: "Oud Wood",
    size: "100ml",
    price: "28,500 DA",
    image:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=750&fit=crop&q=85",
    badge: null,
  },
  {
    id: 2,
    brand: "Maison Francis Kurkdjian",
    name: "Baccarat Rouge 540",
    size: "70ml",
    price: "35,000 DA",
    image:
      "https://images.unsplash.com/photo-1594035910387-fea081ac3cc4?w=600&h=750&fit=crop&q=85",
    badge: "Best Seller",
  },
  {
    id: 3,
    brand: "Byredo",
    name: "Gypsy Water",
    size: "100ml",
    price: "22,000 DA",
    image:
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&h=750&fit=crop&q=85",
    badge: "New",
  },
  {
    id: 4,
    brand: "Dior",
    name: "Sauvage Elixir",
    size: "60ml",
    price: "19,500 DA",
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=750&fit=crop&q=85",
    badge: null,
  },
  {
    id: 5,
    brand: "Chanel",
    name: "N°5 L'Eau",
    size: "100ml",
    price: "24,000 DA",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=750&fit=crop&q=85",
    badge: null,
  },
  {
    id: 6,
    brand: "Creed",
    name: "Aventus",
    size: "100ml",
    price: "42,000 DA",
    image:
      "https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=600&h=750&fit=crop&q=85",
    badge: "Exclusive",
  },
];

export default function BestSellers() {
  return (
    <section className="py-28 md:py-36 lg:py-44 bg-ivory">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
        {/* ─── Section Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20 md:mb-28 gap-8">
          <div>
            <span className="section-label">Most Coveted</span>
            <h2 className="font-heading text-[2.5rem] md:text-[3.25rem] lg:text-[4rem] font-light text-charcoal mt-6">
              Best Sellers
            </h2>
          </div>
          <a
            href="/products?sort=popular"
            className="font-body text-[11px] font-medium tracking-[0.15em] uppercase text-muted hover:text-charcoal transition-colors duration-400 pb-1 border-b border-muted/30 hover:border-charcoal self-start md:self-end"
          >
            View All Fragrances
          </a>
        </div>

        {/* ─── Product Grid: Editorial staggered layout ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-16 md:gap-x-8 md:gap-y-20">
          {PRODUCTS.map((product, index) => (
            <a
              key={product.id}
              href={`/products/${product.id}`}
              className={`group flex flex-col ${
                index % 3 === 1 ? "lg:mt-16" : ""
              }`}
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden bg-cream">
                <img
                  src={product.image}
                  alt={`${product.brand} ${product.name}`}
                  className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
                />

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 left-4">
                    <span className="font-body text-[9px] font-medium tracking-[0.2em] uppercase bg-charcoal text-cream px-3.5 py-2">
                      {product.badge}
                    </span>
                  </div>
                )}

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/5 transition-colors duration-700" />
              </div>

              {/* Product Info */}
              <div className="pt-6 flex flex-col gap-1.5">
                <p className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-muted-light">
                  {product.brand}
                </p>
                <h3 className="font-heading text-[1.25rem] md:text-[1.4rem] font-light text-charcoal leading-tight">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className="font-body text-[14px] font-medium text-charcoal">
                    {product.price}
                  </span>
                  <span className="font-body text-[12px] text-muted">
                    {product.size}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
