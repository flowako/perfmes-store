"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Search } from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ProductCard from "@/app/components/ProductCard";
import FilterSidebar from "@/app/components/FilterSidebar";

type SortOption = "newest" | "price-asc" | "price-desc" | "promo-first";

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  brand: string;
  brandSlug: string;
  gender: string;
  price: number;
  salePrice: number | null;
  isOnSale: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  images: Array<{ url: string; altFr: string; altAr: string }>;
  categories: Array<{ name: string; slug: string }>;
  stock: number;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const PRODUCTS_PER_PAGE = 16;

export default function ProductsPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Data state
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    selectedBrands: [] as string[],
    selectedCategories: [] as string[],
    gender: "ALL",
    priceMin: "",
    priceMax: "",
    onSale: false,
    inStock: false,
  });

  // Fetch brands and categories
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          fetch('/api/brands'),
          fetch('/api/categories'),
        ]);

        const brandsData = await brandsRes.json();
        const categoriesData = await categoriesRes.json();

        setBrands(brandsData.brands || []);
        setCategories(categoriesData.categories || []);
      } catch (err) {
        console.error('Error fetching filters data:', err);
      }
    };

    fetchFiltersData();
  }, []);

  // Fetch products once on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch('/api/products?limit=1000');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch products');
        }

        setAllProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter, search, and sort products (client-side)
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Apply search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.categories.some((cat) => cat.name.toLowerCase().includes(query))
      );
    }

    // Apply brand filter
    if (filters.selectedBrands.length > 0) {
      filtered = filtered.filter(p => filters.selectedBrands.includes(p.brand));
    }

    // Apply category filter
    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter(p =>
        p.categories.some(cat => filters.selectedCategories.includes(cat.name))
      );
    }

    // Apply gender filter
    if (filters.gender !== 'ALL') {
      filtered = filtered.filter(p => p.gender === filters.gender);
    }

    // Apply price filters
    if (filters.priceMin !== '') {
      filtered = filtered.filter(p => p.price >= Number(filters.priceMin));
    }

    if (filters.priceMax !== '') {
      filtered = filtered.filter(p => p.price <= Number(filters.priceMax));
    }

    // Apply promotion filter
    if (filters.onSale) {
      filtered = filtered.filter(p => p.isOnSale);
    }

    // Apply stock filter
    if (filters.inStock) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
        break;
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "promo-first":
        filtered.sort((a, b) => (b.isOnSale ? 1 : 0) - (a.isOnSale ? 1 : 0));
        break;
    }

    return filtered;
  }, [allProducts, filters, sortBy, searchQuery]);

  const handleFilterChange = useCallback((filterType: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setDisplayCount(PRODUCTS_PER_PAGE);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      selectedBrands: [],
      selectedCategories: [],
      gender: "ALL",
      priceMin: "",
      priceMax: "",
      onSale: false,
      inStock: false,
    });
    setSearchQuery("");
    setDisplayCount(PRODUCTS_PER_PAGE);
  }, []);

  // Infinite scroll implementation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredAndSortedProducts.length) {
          setDisplayCount((prev) => Math.min(prev + PRODUCTS_PER_PAGE, filteredAndSortedProducts.length));
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [displayCount, filteredAndSortedProducts.length]);

  const displayedProducts = filteredAndSortedProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredAndSortedProducts.length;

  const activeFilterCount =
    filters.selectedBrands.length +
    filters.selectedCategories.length +
    (filters.gender !== "ALL" ? 1 : 0) +
    (filters.priceMin !== "" ? 1 : 0) +
    (filters.priceMax !== "" ? 1 : 0) +
    (filters.onSale ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-ivory pt-20 md:pt-24">
        {/* Hero Section */}
        <div className="relative bg-warm-white border-b border-border-light">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center max-w-3xl mx-auto"
            >
              <p className="section-label mb-3">Collection</p>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-charcoal mb-3">
                Nos Fragrances
              </h1>
              <p className="font-body text-[14px] text-muted leading-relaxed max-w-xl mx-auto">
                Découvrez notre sélection exclusive de parfums de luxe
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sticky Sidebar */}
            <aside className="hidden lg:block w-[280px] flex-shrink-0">
              <div className="sticky top-24">
                <FilterSidebar
                  isOpen={true}
                  onClose={() => {}}
                  filters={{ ...filters, brands, categories }}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                  isMobile={false}
                />
              </div>
            </aside>

            {/* Products Section */}
            <div className="flex-1 min-w-0">
              {/* Sticky Search & Toolbar Container */}
              <div className="sticky top-20 md:top-24 z-20 bg-ivory pb-4 -mt-2 pt-2">
                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none"
                      strokeWidth={1.5}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setDisplayCount(PRODUCTS_PER_PAGE);
                      }}
                      placeholder="Rechercher un parfum, une marque..."
                      className="w-full pl-12 pr-12 py-3 border border-border focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 font-body text-[14px] bg-cream transition-all shadow-sm"
                    />
                    <AnimatePresence>
                      {searchQuery && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => {
                            setSearchQuery("");
                            setDisplayCount(PRODUCTS_PER_PAGE);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal transition-colors"
                        >
                          <X className="w-4 h-4" strokeWidth={2} />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-border-light bg-ivory">
                  <div className="flex items-center gap-3">
                    {/* Mobile Filter Button */}
                    <button
                      onClick={() => setFilterOpen(true)}
                      className="lg:hidden relative inline-flex items-center gap-2 px-4 py-2.5 border border-border hover:border-gold transition-all hover:shadow-sm bg-cream"
                    >
                      <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
                      <span className="font-body text-[11px] tracking-[0.15em] uppercase">
                        Filtres
                      </span>
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-gold text-charcoal text-[10px] font-medium flex items-center justify-center rounded-full shadow-sm">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>

                    {/* Results Count */}
                    <div className="font-body text-[13px] text-muted">
                      <span className="font-semibold text-charcoal">
                        {filteredAndSortedProducts.length}
                      </span>{" "}
                      {filteredAndSortedProducts.length === 1 ? "produit" : "produits"}
                    </div>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="sort"
                      className="hidden sm:block font-body text-[11px] tracking-[0.15em] uppercase text-muted"
                    >
                      Trier
                    </label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="px-3 py-2 border border-border hover:border-gold focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 font-body text-[13px] bg-cream cursor-pointer transition-all"
                    >
                      <option value="newest">Plus récents</option>
                      <option value="price-asc">Prix croissant</option>
                      <option value="price-desc">Prix décroissant</option>
                      <option value="promo-first">Promotions</option>
                    </select>
                  </div>
                </div>

                {/* Active Filters Pills */}
                <AnimatePresence mode="popLayout">
                  {activeFilterCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center gap-2 pt-4">
                        {searchQuery && (
                          <FilterPill
                            label={`"${searchQuery}"`}
                            onRemove={() => setSearchQuery("")}
                          />
                        )}
                        {filters.selectedBrands.map((brand) => (
                          <FilterPill
                            key={brand}
                            label={brand}
                            onRemove={() =>
                              handleFilterChange(
                                "selectedBrands",
                                filters.selectedBrands.filter((b) => b !== brand)
                              )
                            }
                          />
                        ))}
                        {filters.selectedCategories.map((category) => (
                          <FilterPill
                            key={category}
                            label={category}
                            onRemove={() =>
                              handleFilterChange(
                                "selectedCategories",
                                filters.selectedCategories.filter((c) => c !== category)
                              )
                            }
                          />
                        ))}
                        {filters.gender !== "ALL" && (
                          <FilterPill
                            label={
                              filters.gender === "WOMEN"
                                ? "Femmes"
                                : filters.gender === "MEN"
                                ? "Hommes"
                                : "Unisexe"
                            }
                            onRemove={() => handleFilterChange("gender", "ALL")}
                          />
                        )}
                        {(filters.priceMin !== "" || filters.priceMax !== "") && (
                          <FilterPill
                            label={`${filters.priceMin || "0"} - ${filters.priceMax || "∞"} DA`}
                            onRemove={() => {
                              handleFilterChange("priceMin", "");
                              handleFilterChange("priceMax", "");
                            }}
                          />
                        )}
                        {activeFilterCount > 1 && (
                          <button
                            onClick={clearFilters}
                            className="ml-2 font-body text-[11px] tracking-wide text-gold hover:text-gold-dark font-medium transition-colors underline underline-offset-2"
                          >
                            Tout effacer
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Products Grid Container */}
              <div ref={gridRef}>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-20">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="btn-gold"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : filteredAndSortedProducts.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {displayedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    {/* Infinite Scroll Trigger */}
                    {hasMore && (
                      <div
                        ref={loadMoreRef}
                        className="flex items-center justify-center py-12"
                      >
                        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 mb-6 rounded-full bg-warm-white flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted" strokeWidth={1.2} />
                    </div>
                    <h3 className="font-heading text-2xl text-charcoal mb-3">
                      Aucun résultat trouvé
                    </h3>
                    <p className="font-body text-[14px] text-muted mb-6 max-w-md">
                      Nous n'avons trouvé aucun produit correspondant à vos critères.
                      Essayez d'ajuster vos filtres.
                    </p>
                    <button onClick={clearFilters} className="btn-gold">
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <FilterSidebar
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          filters={{ ...filters, brands, categories }}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          isMobile={true}
        />
      </div>
      <Footer />
    </>
  );
}

// Filter Pill Component
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-light/30 hover:bg-gold-light/50 text-charcoal text-[11px] font-medium tracking-wide transition-all group border border-gold-light/50"
    >
      <span className="max-w-[200px] truncate">{label}</span>
      <X className="w-3 h-3 flex-shrink-0 group-hover:text-gold-dark transition-colors" strokeWidth={2.5} />
    </motion.button>
  );
}
