"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { useState } from "react";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    brands: Array<{ id: string; name: string; slug: string }>;
    selectedBrands: string[];
    categories: Array<{ id: string; name: string; slug: string }>;
    selectedCategories: string[];
    gender: string;
    priceMin: string;
    priceMax: string;
    onSale: boolean;
    inStock: boolean;
  };
  onFilterChange: (filterType: string, value: any) => void;
  onClearFilters: () => void;
  isMobile?: boolean;
}

export default function FilterSidebar({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  isMobile = false,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    gender: true,
    category: true,
    price: true,
    other: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters =
    filters.selectedBrands.length > 0 ||
    filters.selectedCategories.length > 0 ||
    filters.gender !== "ALL" ||
    filters.priceMin !== "" ||
    filters.priceMax !== "" ||
    filters.onSale ||
    filters.inStock;

  const FilterSection = ({
    title,
    section,
    children,
  }: {
    title: string;
    section: keyof typeof expandedSections;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-border-light last:border-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-body text-[11px] tracking-[0.2em] uppercase text-charcoal font-medium">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted transition-transform duration-300 ${
            expandedSections[section] ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {expandedSections[section] && (
          <motion.div
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const content = (
    <div className="h-full flex flex-col bg-cream">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-light">
        <h2 className="font-heading text-[22px] text-charcoal">Filtres</h2>
        {isMobile && (
          <button onClick={onClose} className="p-2 -mr-2 text-muted hover:text-charcoal">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="px-6 py-4 border-b border-border-light">
          <button
            onClick={onClearFilters}
            className="text-[11px] tracking-[0.15em] uppercase text-gold hover:text-gold-dark font-medium transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex-1 overflow-y-auto px-6">
        {/* Gender */}
        <FilterSection title="Genre" section="gender">
          <div className="space-y-2">
            {["ALL", "WOMEN", "MEN", "UNISEX"].map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={filters.gender === option}
                  onChange={(e) => onFilterChange("gender", e.target.value)}
                  className="w-4 h-4 text-gold border-border focus:ring-gold focus:ring-offset-0"
                />
                <span className="font-body text-[13px] text-charcoal group-hover:text-gold transition-colors">
                  {option === "ALL"
                    ? "Tous"
                    : option === "WOMEN"
                    ? "Femmes"
                    : option === "MEN"
                    ? "Hommes"
                    : "Unisexe"}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Brand */}
        <FilterSection title="Marque" section="brand">
          <div className="space-y-2">
            {filters.brands.map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.selectedBrands.includes(brand.name)}
                  onChange={(e) => {
                    const newBrands = e.target.checked
                      ? [...filters.selectedBrands, brand.name]
                      : filters.selectedBrands.filter((b) => b !== brand.name);
                    onFilterChange("selectedBrands", newBrands);
                  }}
                  className="w-4 h-4 text-gold border-border focus:ring-gold focus:ring-offset-0 rounded"
                />
                <span className="font-body text-[13px] text-charcoal group-hover:text-gold transition-colors">
                  {brand.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Category */}
        <FilterSection title="Catégorie" section="category">
          <div className="space-y-2">
            {filters.categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.selectedCategories.includes(category.name)}
                  onChange={(e) => {
                    const newCategories = e.target.checked
                      ? [...filters.selectedCategories, category.name]
                      : filters.selectedCategories.filter((c) => c !== category.name);
                    onFilterChange("selectedCategories", newCategories);
                  }}
                  className="w-4 h-4 text-gold border-border focus:ring-gold focus:ring-offset-0 rounded"
                />
                <span className="font-body text-[13px] text-charcoal group-hover:text-gold transition-colors">
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Prix (DA)" section="price">
          <div className="space-y-3">
            <div>
              <label className="block font-body text-[11px] text-muted mb-1.5">
                Minimum
              </label>
              <input
                type="number"
                value={filters.priceMin}
                onChange={(e) => onFilterChange("priceMin", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-border focus:border-gold focus:outline-none text-[13px] bg-cream"
              />
            </div>
            <div>
              <label className="block font-body text-[11px] text-muted mb-1.5">
                Maximum
              </label>
              <input
                type="number"
                value={filters.priceMax}
                onChange={(e) => onFilterChange("priceMax", e.target.value)}
                placeholder="100000"
                className="w-full px-3 py-2 border border-border focus:border-gold focus:outline-none text-[13px] bg-cream"
              />
            </div>
          </div>
        </FilterSection>

        {/* Other Filters */}
        <FilterSection title="Autres" section="other">
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={(e) => onFilterChange("onSale", e.target.checked)}
                className="w-4 h-4 text-gold border-border focus:ring-gold focus:ring-offset-0 rounded"
              />
              <span className="font-body text-[13px] text-charcoal group-hover:text-gold transition-colors">
                En promotion
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => onFilterChange("inStock", e.target.checked)}
                className="w-4 h-4 text-gold border-border focus:ring-gold focus:ring-offset-0 rounded"
              />
              <span className="font-body text-[13px] text-charcoal group-hover:text-gold transition-colors">
                En stock uniquement
              </span>
            </label>
          </div>
        </FilterSection>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={onClose}
              className="fixed inset-0 bg-charcoal/40 z-40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-[380px] z-50 shadow-2xl"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return <div className="w-full">{content}</div>;
}
