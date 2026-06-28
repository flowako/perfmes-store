"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const T = {
  ivory:    "#F7F4EF",
  gold:     "#C9A96E",
  espresso: "#1A1714",
  linen:    "#E8E2D9",
  muted:    "#8B7E74",
  dust:     "#F2EDE6",
  ink:      "#2C2420",
};

type Gender = "MEN" | "WOMEN" | "UNISEX";

interface ProductVariant {
  id: string;
  size: string;
  price: number;
  stock: number;
  salePrice: number | null;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  brand: string;
  brandSlug: string;
  gender: Gender;
  price: number;
  salePrice: number | null;
  isOnSale: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  images: { url: string; altFr: string | null; altAr: string | null }[];
  categories: { name: string; slug: string }[];
  variants: ProductVariant[];
  stock: number;
}

interface BrandOption {
  name: string;
  slug: string;
}

// Gender filter removed - now determined by route

const CATEGORY_COLORS: Record<string, string> = {
  oriental: "#8B5E3C",
  floral:   "#B87A8A",
  woody:    "#4A5C3A",
  aquatic:  "#4A7A8A",
  fresh:    "#6B7A4A",
  citrus:   "#C9B840",
  spicy:    "#8B5E3C",
  sweet:    "#C9A050",
  default:  "#8B7E74",
};

function getCategoryColor(categoryName: string): string {
  const lower = categoryName.toLowerCase();
  for (const key in CATEGORY_COLORS) {
    if (lower.includes(key)) return CATEGORY_COLORS[key];
  }
  return CATEGORY_COLORS.default;
}

function BottleSVG({ hue, size = "md" }: { hue?: string; size?: "sm"|"md"|"lg" }) {
  const h = size === "sm" ? 160 : size === "lg" ? 260 : 200;
  const defaultHue = hue || T.gold;
  const id = `b${defaultHue.replace("#","")}-${size}`;
  return (
    <svg viewBox="0 0 120 280" fill="none" style={{ height: h, width: "auto", display: "block" }}>
      <defs>
        <linearGradient id={`gl-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor={defaultHue} stopOpacity="0.45" />
          <stop offset="50%"  stopColor={defaultHue} stopOpacity="0.18" />
          <stop offset="100%" stopColor={defaultHue} stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={`sh-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="44" y="8" width="32" height="16" rx="2.5" fill={defaultHue} opacity="0.55"/>
      <rect x="48" y="4" width="24" height="8"  rx="2"   fill={defaultHue} opacity="0.65"/>
      <path d="M47 24 L45 54 L75 54 L73 24Z" fill={`url(#gl-${id})`} stroke={defaultHue} strokeWidth="0.5" strokeOpacity="0.35"/>
      <path d="M28 72 Q45 54 57 54 L63 54 Q75 54 92 72 L95 88 L25 88Z" fill={`url(#gl-${id})`} stroke={defaultHue} strokeWidth="0.5" strokeOpacity="0.35"/>
      <rect x="25" y="88" width="70" height="162" rx="1" fill={`url(#gl-${id})`} stroke={defaultHue} strokeWidth="0.5" strokeOpacity="0.3"/>
      <rect x="25" y="88" width="18" height="162" rx="1" fill={`url(#sh-${id})`}/>
      <path d="M25 250 Q25 268 36 268 L84 268 Q95 268 95 250 L25 250Z" fill={`url(#gl-${id})`} stroke={defaultHue} strokeWidth="0.5" strokeOpacity="0.3"/>
      <rect x="33" y="112" width="54" height="72" fill={defaultHue} opacity="0.07"/>
      <rect x="35" y="120" width="50" height="56" fill={defaultHue} opacity="0.04"/>
      <rect x="26" y="200" width="68" height="50" fill={defaultHue} opacity="0.1"/>
      <ellipse cx="60" cy="200" rx="34" ry="3" fill={defaultHue} opacity="0.14"/>
    </svg>
  );
}

function RangeSlider({ min, max, value, onChange }:{
  min:number; max:number; value:[number,number]; onChange:(v:[number,number])=>void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const pct = (v:number) => ((v - min) / (max - min)) * 100;

  const drag = (handle:"lo"|"hi", e: React.MouseEvent|React.TouchEvent) => {
    e.preventDefault();
    const rect = track.current!.getBoundingClientRect();
    const move = (ev: MouseEvent | TouchEvent) => {
      const clientX = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
      const raw = Math.round(((clientX - rect.left) / rect.width) * (max - min) + min);
      const clamped = Math.max(min, Math.min(max, raw));
      if (handle === "lo") onChange([Math.min(clamped, value[1] - 10), value[1]]);
      else                 onChange([value[0], Math.max(clamped, value[0] + 10)]);
    };
    const up = () => {
      window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move); window.addEventListener("touchend", up);
  };

  return (
    <div className="pt-2 pb-1">
      <div ref={track} className="relative h-px mx-2 my-4 cursor-pointer" style={{ backgroundColor:`${T.muted}30` }}>
        <div className="absolute h-full top-0" style={{
          left:`${pct(value[0])}%`, right:`${100-pct(value[1])}%`,
          backgroundColor: T.gold
        }}/>
        {(["lo","hi"] as const).map(h => (
          <div key={h} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 cursor-grab active:cursor-grabbing z-10 transition-transform hover:scale-125"
            style={{
              left: h==="lo" ? `${pct(value[0])}%` : `${pct(value[1])}%`,
              backgroundColor: T.ivory, borderColor: T.gold, boxShadow:`0 0 0 3px ${T.gold}20`
            }}
            onMouseDown={e=>drag(h,e)}
            onTouchStart={e=>drag(h,e)}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] tracking-wider"
        style={{ fontFamily:"Inter,sans-serif", color:T.muted }}>
        <span>DA{value[0]}</span><span>DA{value[1]}</span>
      </div>
    </div>
  );
}

interface Filters {
  brands:      Set<string>;
  categories:  Set<string>;
  sizes:       Set<string>;
  price:       [number,number];
  badges:      Set<string>;
}

function FilterSection({ title, open=true, children }: { title:string; open?:boolean; children:React.ReactNode }) {
  const [expanded, setExpanded] = useState(open);
  return (
    <div className="border-b" style={{ borderColor:`${T.gold}20` }}>
      <button onClick={()=>setExpanded(v=>!v)}
        className="w-full flex items-center justify-between py-4 text-left group">
        <span className="text-[10px] tracking-[0.3em] uppercase"
          style={{ fontFamily:"Inter,sans-serif", color:T.espresso, fontWeight:500 }}>
          {title}
        </span>
        <motion.span animate={{ rotate: expanded ? 45 : 0 }} transition={{ duration:0.25 }}
          className="text-lg leading-none" style={{ color:T.gold }}>+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
            className="overflow-hidden">
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Checkbox({ checked, onChange, label }: { checked:boolean; onChange:(v:boolean)=>void; label:string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-1.5"
      onClick={() => onChange(!checked)}>
      <span className="w-3.5 h-3.5 shrink-0 border transition-all duration-200 flex items-center justify-center"
        style={{ borderColor: checked ? T.gold : `${T.muted}50`, backgroundColor: checked ? T.gold : "transparent" }}>
        {checked && <svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,2" stroke={T.espresso} strokeWidth="1.5" fill="none"/></svg>}
      </span>
      <span className="text-xs transition-colors duration-200"
        style={{ fontFamily:"Inter,sans-serif", fontWeight:300, color: checked ? T.espresso : T.muted }}>
        {label}
      </span>
    </label>
  );
}

function FilterPanel({ filters, onChange, onReset, count, availableBrands, availableCategories, availableSizes, t }:{
  filters:Filters; onChange:(f:Filters)=>void; onReset:()=>void; count:number;
  availableBrands: BrandOption[]; availableCategories: string[]; availableSizes: string[];
  t: (key:string, ...args:any[]) => string;
}) {
  const toggleBrand = (brand: string) => {
    const newBrands = new Set(filters.brands);
    if (newBrands.has(brand)) newBrands.delete(brand);
    else newBrands.add(brand);
    onChange({ ...filters, brands: newBrands });
  };

  const toggleCategory = (category: string) => {
    const newCategories = new Set(filters.categories);
    if (newCategories.has(category)) newCategories.delete(category);
    else newCategories.add(category);
    onChange({ ...filters, categories: newCategories });
  };

  // Gender filter removed

  const toggleSize = (size: string) => {
    const newSizes = new Set(filters.sizes);
    if (newSizes.has(size)) newSizes.delete(size);
    else newSizes.add(size);
    onChange({ ...filters, sizes: newSizes });
  };

  const toggleBadge = (badge: string) => {
    const newBadges = new Set(filters.badges);
    if (newBadges.has(badge)) newBadges.delete(badge);
    else newBadges.add(badge);
    onChange({ ...filters, badges: newBadges });
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-4 mb-1" style={{ borderBottom:`1px solid ${T.gold}20` }}>
        <span className="text-[10px] tracking-[0.35em] uppercase"
          style={{ fontFamily:"Inter,sans-serif", color:T.gold }}>
          {t('refine')}
        </span>
        <button onClick={onReset} className="text-[9px] tracking-[0.2em] uppercase transition-colors"
          style={{ fontFamily:"Inter,sans-serif", color:`${T.muted}80` }}
          onMouseEnter={e=>(e.currentTarget.style.color=T.espresso)}
          onMouseLeave={e=>(e.currentTarget.style.color=`${T.muted}80`)}>
          {t('resetAll')}
        </button>
      </div>

      <div className="py-3 mb-1" style={{ borderBottom:`1px solid ${T.gold}20` }}>
        <motion.span key={count} initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="text-xs" style={{ fontFamily:"Cormorant Garamond,serif", color:T.muted, fontStyle:"italic" }}>
          {count} {count === 1 ? t('fragrance') : t('fragrances')}
        </motion.span>
      </div>

      {availableBrands.length > 0 && (
        <FilterSection title={t('brand')}>
          <div className="max-h-48 overflow-y-auto pr-2 scrollbar-none">
            {availableBrands.map(b => (
              <Checkbox key={b.slug} label={b.name} checked={filters.brands.has(b.slug)}
                onChange={() => toggleBrand(b.slug)}/>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Gender filter removed - determined by route */}

      {availableCategories.length > 0 && (
        <FilterSection title={t('category')}>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-2 scrollbar-none">
            {availableCategories.map(c => {
              const active = filters.categories.has(c);
              const color = getCategoryColor(c);
              return (
                <button key={c} onClick={() => toggleCategory(c)}
                  className="flex items-center gap-3 py-1.5 text-left transition-all duration-200">
                  <span className="w-3 h-3 rounded-full shrink-0 border transition-all duration-200"
                    style={{
                      backgroundColor: active ? color : "transparent",
                      borderColor: active ? color : `${T.muted}40`,
                      boxShadow: active ? `0 0 0 2px ${color}30` : "none"
                    }}/>
                  <span className="text-xs" style={{ fontFamily:"Inter,sans-serif", fontWeight:300,
                    color: active ? T.espresso : T.muted }}>
                    {c}
                  </span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {availableSizes.length > 0 && (
        <FilterSection title={t('size')}>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map(s => {
              const active = filters.sizes.has(s);
              return (
                <button key={s} onClick={() => toggleSize(s)}
                  className="px-3 py-1.5 text-xs border transition-all duration-200"
                  style={{
                    fontFamily:"Inter,sans-serif",
                    borderColor: active ? T.gold : `${T.muted}30`,
                    backgroundColor: active ? T.gold : "transparent",
                    color: active ? T.espresso : T.muted,
                  }}>
                  {s}ml
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Price filter removed */}

      <FilterSection title={t('availability')} open={false}>
        {[
          { key:"isOnSale", label:t('onSale') },
          { key:"isNewArrival", label:t('newArrival') },
          { key:"isFeatured", label:t('featured') },
          { key:"inStock", label:t('inStock') },
        ].map(b => (
          <Checkbox key={b.key} label={b.label} checked={filters.badges.has(b.key)}
            onChange={() => toggleBadge(b.key)}/>
        ))}
      </FilterSection>
    </div>
  );
}

function ProductCard({ product, view, locale, onWishlist, wishlisted, t }:{
  product:Product; view:"grid"|"editorial"; locale: string;
  onWishlist:(id:string)=>void; wishlisted:boolean;
  t: (key:string, ...args:any[]) => string;
}) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const { addToCart } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const currentPrice = selectedVariant.salePrice || selectedVariant.price;
    addToCart({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productNameAr: product.nameAr,
      productSlug: product.slug,
      brandName: product.brand,
      variantSize: selectedVariant.size,
      price: currentPrice,
      originalPrice: selectedVariant.price,
      imageUrl: product.images[0]?.url || '',
      maxStock: selectedVariant.stock,
    }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const displayName = locale === 'ar' ? (product.nameAr || product.name) : product.name;
  const displayDesc = locale === 'ar' ? (product.descriptionAr || product.description) : product.description;
  const badge: string | null = product.isOnSale ? t('sale') : product.isNewArrival ? t('new') : product.isFeatured ? t('featured') : null;
  const categoryColor = product.categories[0] ? getCategoryColor(product.categories[0].name) : T.gold;
  const displayPrice = selectedVariant.salePrice || selectedVariant.price;
  const hasDiscount = !!selectedVariant.salePrice;

  if (view === "editorial") {
    return (
      <motion.article layout
        className="group flex gap-0 overflow-hidden"
        style={{ backgroundColor:T.ivory }}
        initial={{ opacity:0, y:20 }}
        animate={{ opacity:1, y:0 }}
        exit={{ opacity:0, y:-10 }}
        transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
        onMouseEnter={()=>setHovered(true)}
        onMouseLeave={()=>setHovered(false)}>
        <a href={`/${locale}/products/${product.slug}`} className="contents">
          <div className="relative shrink-0 flex items-center justify-center overflow-hidden"
            style={{ width:200, backgroundColor:T.dust, height:280 }}>
            {badge && (
              <span className="absolute top-4 left-4 text-[8px] tracking-[0.25em] uppercase px-2.5 py-1 z-10"
                style={{ fontFamily:"Inter,sans-serif",
                  backgroundColor: badge===t('sale') ? T.espresso : T.gold,
                  color: badge===t('sale') ? T.ivory : T.espresso }}>
                {badge}
              </span>
            )}
            {product.images[0] ? (
              <motion.img src={product.images[0].url} alt={displayName}
                className="w-full h-full object-cover"
                animate={{ scale: hovered ? 1.05 : 1 }} transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}/>
            ) : (
              <motion.div animate={{ y: hovered ? -6 : 0 }} transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}>
                <BottleSVG hue={categoryColor} size="md"/>
              </motion.div>
            )}
            <button className="absolute top-4 right-4 transition-all duration-200 z-10"
              onClick={(e)=>{e.preventDefault();e.stopPropagation();onWishlist(product.id);}}
              style={{ color: wishlisted ? T.gold : `${T.muted}60` }}
              onMouseEnter={e=>(e.currentTarget.style.color=T.gold)}
              onMouseLeave={e=>(e.currentTarget.style.color=wishlisted?T.gold:`${T.muted}60`)}>
              <svg width="16" height="16" viewBox="0 0 24 24"
                fill={wishlisted?"currentColor":"none"} stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          <div className="flex flex-col justify-between p-7 flex-1 border-b" style={{ borderColor:`${T.gold}15` }}>
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-[9px] tracking-[0.3em] uppercase mb-1.5"
                    style={{ fontFamily:"Inter,sans-serif", color: categoryColor }}>
                    {product.categories[0]?.name || "Fragrance"} · {product.brand}
                  </p>
                  <h3 className="leading-none mb-1"
                    style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"1.7rem", fontWeight:400, color:T.espresso }}>
                    {displayName}
                  </h3>
                  <p className="text-sm leading-relaxed mb-2" style={{ fontFamily:"Inter,sans-serif", color:T.muted, fontWeight:300 }}>
                    {displayDesc ? displayDesc.substring(0, 120) : ''}{displayDesc && displayDesc.length > 120 ? '...' : ''}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.categories.map(c => (
                      <span key={c.slug} className="text-[9px] tracking-wider px-2 py-0.5 border"
                        style={{ fontFamily:"Inter,sans-serif", color:T.muted, borderColor:`${T.muted}25` }}>
                        {c.name}
                      </span>
                    ))}
                    <span className="text-[9px] tracking-wider px-2 py-0.5"
                      style={{ fontFamily:"Inter,sans-serif", color:T.muted, backgroundColor:`${T.muted}10` }}>
                      {product.gender}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {hasDiscount && (
                    <div className="text-xs line-through" style={{ fontFamily:"Inter,sans-serif", color:T.muted }}>
                      DA{selectedVariant.price.toFixed(2)}
                    </div>
                  )}
                  <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"1.4rem", fontWeight:400, color:hasDiscount?T.gold:T.espresso }}>
                    DA{displayPrice.toFixed(2)}
                  </div>
                  <div className="text-[9px] tracking-wider" style={{ fontFamily:"Inter,sans-serif", color:T.muted }}>
                    {product.gender}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-5">
              <div className="flex gap-1.5">
                {product.variants.map(v=>(
                  <button key={v.id} onClick={(e)=>{e.preventDefault();e.stopPropagation();setSelectedVariant(v);}}
                    className="text-[9px] tracking-wider px-2.5 py-1 border transition-all duration-200"
                    style={{
                      fontFamily:"Inter,sans-serif",
                      borderColor: selectedVariant.id===v.id ? T.espresso : `${T.muted}30`,
                      color: selectedVariant.id===v.id ? T.espresso : T.muted,
                    }}>
                    {v.size}ml
                  </button>
                ))}
              </div>
              <motion.button onClick={handleAdd} whileTap={{ scale:0.97 }}
                className="ml-auto text-[9px] tracking-[0.22em] uppercase px-6 py-2.5 flex items-center gap-2 transition-all duration-300"
                style={{ fontFamily:"Inter,sans-serif", backgroundColor: added ? T.gold : T.espresso, color: T.ivory }}>
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span key="added" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                      exit={{ opacity:0, y:-8 }} className="flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                      {t('added')}
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}>
                      {t('addToCart')}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </a>
      </motion.article>
    );
  }

  return (
    <motion.article layout
      className="group relative flex flex-col overflow-hidden"
      initial={{ opacity:0, y:24 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, scale:0.97 }}
      transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}>
      <a href={`/${locale}/products/${product.slug}`}>
        <div className="relative overflow-hidden flex items-center justify-center"
          style={{ height:300, backgroundColor:T.dust }}>
          {badge && (
            <span className="absolute top-4 left-4 text-[8px] tracking-[0.2em] uppercase px-2.5 py-1 z-10"
              style={{ fontFamily:"Inter,sans-serif",
                backgroundColor: badge===t('sale') ? T.espresso : T.gold,
                color: badge===t('sale') ? T.ivory : T.espresso }}>
              {badge}
            </span>
          )}
          <motion.button className="absolute top-4 right-4 z-10"
            onClick={(e)=>{e.preventDefault();e.stopPropagation();onWishlist(product.id);}}
            animate={{ opacity: hovered||wishlisted ? 1 : 0 }}
            style={{ color: wishlisted ? T.gold : T.muted }}
            onMouseEnter={e=>(e.currentTarget.style.color=T.gold)}
            onMouseLeave={e=>(e.currentTarget.style.color=wishlisted?T.gold:T.muted)}>
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill={wishlisted?"currentColor":"none"} stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </motion.button>

          {product.images[0] ? (
            <motion.img src={product.images[0].url} alt={displayName}
              className="w-full h-full object-cover"
              animate={{ scale: hovered ? 1.08 : 1 }} transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}/>
          ) : (
            <motion.div animate={{ y: hovered ? -8 : 0 }} transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}>
              <BottleSVG hue={categoryColor} size="md"/>
            </motion.div>
          )}

          <motion.div className="absolute inset-x-0 bottom-0"
            initial={{ y:"100%" }} animate={{ y: hovered ? 0 : "100%" }}
            transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}>
            <motion.button onClick={handleAdd} whileTap={{ scale:0.98 }}
              className="w-full py-3.5 text-[9px] tracking-[0.25em] uppercase flex items-center justify-center gap-2"
              style={{ fontFamily:"Inter,sans-serif", backgroundColor: added ? T.gold : T.espresso, color: T.ivory }}>
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span key="ck" initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
                    className="flex items-center gap-2">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    {t('added')}
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                    {t('addToCart')}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>
      </a>

      <div className="pt-4 pb-5 flex flex-col gap-0.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: categoryColor }}/>
          <span className="text-[9px] tracking-[0.2em] uppercase"
            style={{ fontFamily:"Inter,sans-serif", color:T.muted }}>
            {product.categories[0]?.name || "Fragrance"}
          </span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="leading-none"
              style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"1.3rem", fontWeight:400, color:T.espresso }}>
              {displayName}
            </h3>
            <p className="text-[10px] italic mt-0.5"
              style={{ fontFamily:"Cormorant Garamond,serif", color:T.muted, fontWeight:300 }}>
              {product.brand}
            </p>
          </div>
          <div className="text-right shrink-0 mt-0.5">
            {hasDiscount && (
              <div className="text-[9px] line-through" style={{ fontFamily:"Inter,sans-serif", color:T.muted }}>
                DA{selectedVariant.price.toFixed(2)}
              </div>
            )}
            <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"1.2rem", fontWeight:400, color:hasDiscount?T.gold:T.espresso }}>
              DA{displayPrice.toFixed(2)}
            </div>
            <div className="text-[8px] tracking-wider" style={{ fontFamily:"Inter,sans-serif", color:`${T.muted}70` }}>
              {product.gender}
            </div>
          </div>
        </div>

        {product.variants.length > 1 && (
          <div className="flex gap-1.5 mt-3">
            {product.variants.map(v=>(
              <button key={v.id} onClick={(e)=>{e.preventDefault();setSelectedVariant(v);}}
                className="text-[8px] tracking-wider px-2 py-0.5 border transition-all duration-200"
                style={{
                  fontFamily:"Inter,sans-serif",
                  borderColor: selectedVariant.id===v.id ? T.espresso : `${T.muted}25`,
                  color: selectedVariant.id===v.id ? T.espresso : `${T.muted}70`,
                }}>
                {v.size}ml
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}

function ActiveChips({ filters, onChange, t }:{ filters:Filters; onChange:(f:Filters)=>void; t: (key:string) => string }) {
  const chips: {label:string; remove:()=>void}[] = [];
  filters.brands.forEach(b => chips.push({ label:b, remove:()=>onChange({...filters, brands:new Set([...filters.brands].filter(x=>x!==b))}) }));
  filters.categories.forEach(c => chips.push({ label:c, remove:()=>onChange({...filters, categories:new Set([...filters.categories].filter(x=>x!==c))}) }));
  // Gender filter removed
  filters.sizes.forEach(s => chips.push({ label:`${s}ml`, remove:()=>onChange({...filters, sizes:new Set([...filters.sizes].filter(x=>x!==s))}) }));
  filters.badges.forEach(b => {
    const labelMap: Record<string,string> = { isOnSale: t('onSale'), isNewArrival: t('newArrival'), isFeatured: t('featured'), inStock: t('inStock') };
    chips.push({ label: labelMap[b] || b, remove:()=>onChange({...filters, badges:new Set([...filters.badges].filter(x=>x!==b))}) });
  });
  if (filters.price[0]>20||filters.price[1]<500) chips.push({ label:`DA${filters.price[0]}–DA${filters.price[1]}`,
    remove:()=>onChange({...filters, price:[20,500]}) });
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {chips.map(c=>(
        <motion.button key={c.label} layout
          initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }}
          onClick={c.remove}
          className="flex items-center gap-1.5 px-3 py-1 text-[9px] tracking-wider uppercase border group"
          style={{ fontFamily:"Inter,sans-serif", color:T.muted, borderColor:`${T.gold}35`, backgroundColor:T.ivory }}>
          {c.label}
          <span className="transition-colors group-hover:text-red-400" style={{ color:`${T.muted}60` }}>×</span>
        </motion.button>
      ))}
    </div>
  );
}

function EmptyState({ onReset, t }:{ onReset:()=>void; t: (key:string) => string }) {
  return (
    <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
      className="col-span-full flex flex-col items-center justify-center py-32 text-center">
      <div className="mb-6 opacity-30"><BottleSVG hue={T.gold} size="sm"/></div>
      <h3 className="mb-3" style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"2rem", fontWeight:300, color:T.espresso }}>
        {t('noResults')}
      </h3>
      <p className="text-sm mb-8 max-w-xs" style={{ fontFamily:"Inter,sans-serif", color:T.muted, fontWeight:300 }}>
        {t('noResultsDesc')}
      </p>
      <button onClick={onReset}
        className="text-[10px] tracking-[0.25em] uppercase px-8 py-3 border transition-all duration-300"
        style={{ fontFamily:"Inter,sans-serif", color:T.espresso, borderColor:`${T.espresso}40` }}
        onMouseEnter={e=>{ e.currentTarget.style.backgroundColor=T.espresso; e.currentTarget.style.color=T.ivory; }}
        onMouseLeave={e=>{ e.currentTarget.style.backgroundColor="transparent"; e.currentTarget.style.color=T.espresso; }}>
        {t('clearAll')}
      </button>
    </motion.div>
  );
}

function MobileFilterDrawer({ open, onClose, filters, onChange, onReset, count, availableBrands, availableCategories, availableSizes, t }:{
  open:boolean; onClose:()=>void;
  filters:Filters; onChange:(f:Filters)=>void; onReset:()=>void; count:number;
  availableBrands: BrandOption[]; availableCategories: string[]; availableSizes: string[];
  t: (key:string, ...args:any[]) => string;
}) {
  useEffect(()=>{
    document.body.style.overflow = open ? "hidden" : "";
    return ()=>{ document.body.style.overflow=""; };
  },[open]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-40" style={{ backgroundColor:`${T.espresso}60` }} onClick={onClose}/>
          <motion.div initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
            transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}
            className="fixed top-0 right-0 bottom-0 z-50 overflow-y-auto p-6 w-80 scrollbar-none"
            style={{ backgroundColor:T.ivory }}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] tracking-[0.35em] uppercase"
                style={{ fontFamily:"Inter,sans-serif", color:T.espresso }}>{t('refine')}</span>
              <button onClick={onClose} style={{ color:T.muted }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <FilterPanel filters={filters} onChange={onChange} onReset={()=>{ onReset(); onClose(); }} count={count}
              availableBrands={availableBrands} availableCategories={availableCategories} availableSizes={availableSizes} t={t}/>
            <div className="mt-6 pt-4" style={{ borderTop:`1px solid ${T.gold}20` }}>
              <button onClick={onClose}
                className="w-full py-3.5 text-[10px] tracking-[0.25em] uppercase"
                style={{ fontFamily:"Inter,sans-serif", backgroundColor:T.espresso, color:T.ivory }}>
                {t('viewResults', { count })}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PageBanner({ t, customTitle, customSubtitle }: { t: (key:string) => string; customTitle?: string; customSubtitle?: string }) {
  return (
    <div className="relative overflow-hidden py-16 md:py-24 px-6" style={{ backgroundColor:T.espresso }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMid slice">
        <defs><radialGradient id="bannerGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={T.gold} stopOpacity="0.1"/>
          <stop offset="100%" stopColor={T.gold} stopOpacity="0"/>
        </radialGradient></defs>
        <rect width="1440" height="300" fill="url(#bannerGlow)"/>
        <line x1="0" y1="1" x2="1440" y2="1" stroke={T.gold} strokeOpacity="0.12" strokeWidth="1"/>
        <line x1="0" y1="299" x2="1440" y2="299" stroke={T.gold} strokeOpacity="0.12" strokeWidth="1"/>
      </svg>
      <div className="relative max-w-7xl mx-auto">
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
          className="text-[9px] tracking-[0.5em] uppercase mb-4"
          style={{ fontFamily:"Inter,sans-serif", color:T.gold }}>Maison Éclore · Paris</motion.p>
        <motion.h1 initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3, duration:0.8, ease:[0.22,1,0.36,1] }}
          className="leading-none"
          style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"clamp(2.8rem,6vw,5rem)", fontWeight:300, color:T.ivory }}>
          {customTitle || t('pageTitle')}
        </motion.h1>
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          className="mt-3 text-sm max-w-md" style={{ fontFamily:"Inter,sans-serif", color:`${T.ivory}50`, fontWeight:300 }}>
          {customSubtitle || t('pageSubtitle')}
        </motion.p>
      </div>
    </div>
  );
}

type SortKey = "newest"|"price-asc"|"price-desc"|"promo-first";

function SortSelect({ value, onChange, t }:{ value:SortKey; onChange:(v:SortKey)=>void; t: (key:string) => string }) {
  const [open, setOpen] = useState(false);
  const SORT_OPTIONS: {value:SortKey; label:string}[] = [
    { value:"newest",      label:t('filters.sort.newest') },
    { value:"promo-first", label:t('filters.sort.promoFirst') },
    { value:"price-asc",   label:t('filters.sort.priceAsc') },
    { value:"price-desc",  label:t('filters.sort.priceDesc') },
  ];
  const current = SORT_OPTIONS.find(o=>o.value===value)!;
  return (
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)}
        className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase py-2 px-4 border transition-colors"
        style={{ fontFamily:"Inter,sans-serif", color:T.espresso, borderColor:`${T.muted}25`, backgroundColor:T.ivory }}>
        {current.label}
        <motion.svg animate={{ rotate: open?180:0 }} transition={{ duration:0.2 }}
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6,9 12,15 18,9"/>
        </motion.svg>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={()=>setOpen(false)}/>
            <motion.div initial={{ opacity:0,y:-6 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-6 }}
              transition={{ duration:0.2 }}
              className="absolute right-0 top-full mt-1 z-20 min-w-full border shadow-lg"
              style={{ backgroundColor:T.ivory, borderColor:`${T.muted}20` }}>
              {SORT_OPTIONS.map(o=>(
                <button key={o.value} onClick={()=>{ onChange(o.value); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-[10px] tracking-[0.15em] uppercase transition-colors whitespace-nowrap"
                  style={{ fontFamily:"Inter,sans-serif",
                    color: o.value===value ? T.espresso : T.muted,
                    backgroundColor: o.value===value ? T.dust : "transparent" }}
                  onMouseEnter={e=>(e.currentTarget.style.backgroundColor=T.dust)}
                  onMouseLeave={e=>(e.currentTarget.style.backgroundColor=o.value===value?T.dust:"transparent")}>
                  {o.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ViewToggle({ view, onChange }:{ view:"grid"|"editorial"; onChange:(v:"grid"|"editorial")=>void }) {
  return (
    <div className="flex border" style={{ borderColor:`${T.muted}25` }}>
      {(["grid","editorial"] as const).map(v=>(
        <button key={v} onClick={()=>onChange(v)}
          className="px-3 py-2 transition-all duration-200"
          style={{ backgroundColor: view===v ? T.espresso : "transparent" }}>
          {v==="grid" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={view==="grid"?T.ivory:T.muted} strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={view==="editorial"?T.ivory:T.muted} strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="18"/><rect x="14" y="3" width="7" height="8"/>
              <rect x="14" y="14" width="7" height="7"/>
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}

function filtersToParams(filters: Filters, sort: SortKey, search: string): URLSearchParams {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (sort !== 'newest') params.set('sort', sort);
  filters.brands.forEach(b => params.append('brand', b));
  filters.categories.forEach(c => params.append('category', c));
  // Gender params removed - determined by route, not stored in URL
  filters.sizes.forEach(s => params.append('size', s));
  if (filters.price[0] > 20) params.set('minPrice', String(filters.price[0]));
  if (filters.price[1] < 500) params.set('maxPrice', String(filters.price[1]));
  if (filters.badges.has('isOnSale')) params.set('onSale', 'true');
  if (filters.badges.has('isNewArrival')) params.set('isNewArrival', 'true');
  if (filters.badges.has('isFeatured')) params.set('isFeatured', 'true');
  if (filters.badges.has('inStock')) params.set('inStock', 'true');
  return params;
}

function paramsToFilters(searchParams: URLSearchParams): { filters: Filters; sort: SortKey; search: string } {
  const filters: Filters = {
    brands: new Set(searchParams.getAll('brand')),
    categories: new Set(searchParams.getAll('category')),
    // Gender removed from filters - handled by route
    sizes: new Set(searchParams.getAll('size')),
    price: [
      parseInt(searchParams.get('minPrice') || '20'),
      parseInt(searchParams.get('maxPrice') || '500'),
    ],
    badges: new Set<string>(),
  };
  if (searchParams.get('onSale') === 'true') filters.badges.add('isOnSale');
  if (searchParams.get('isNewArrival') === 'true') filters.badges.add('isNewArrival');
  if (searchParams.get('isFeatured') === 'true') filters.badges.add('isFeatured');
  if (searchParams.get('inStock') === 'true') filters.badges.add('inStock');
  const sort = (searchParams.get('sort') as SortKey) || 'newest';
  const search = searchParams.get('search') || '';
  return { filters, sort, search };
}

const DEFAULT_FILTERS: Filters = {
  brands: new Set(), categories: new Set(),
  sizes: new Set(), price: [20, 500], badges: new Set(),
};

interface ProductsPageComponentProps {
  fixedGenders: Gender[]; // ['MEN', 'UNISEX'] or ['WOMEN', 'UNISEX']
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function ProductsPageComponent({ fixedGenders, pageTitle, pageSubtitle }: ProductsPageComponentProps) {
  return (
    <Suspense fallback={
      <div style={{ backgroundColor:T.ivory, minHeight:"100vh" }}>
        <Header/>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="mb-4 opacity-30"><BottleSVG hue={T.gold} size="sm"/></div>
            <p className="text-sm" style={{ fontFamily:"Inter,sans-serif", color:T.muted }}>Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ProductsPage fixedGenders={fixedGenders} pageTitle={pageTitle} pageSubtitle={pageSubtitle} />
    </Suspense>
  );
}

function ProductsPage({ fixedGenders, pageTitle, pageSubtitle }: ProductsPageComponentProps) {
  const locale = useLocale();
  const t = useTranslations('products');
  const searchParams = useSearchParams();
  const isRtl = locale === 'ar';

  const [products, setProducts] = useState<Product[]>([]);
  const [allBrands, setAllBrands] = useState<BrandOption[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allSizes, setAllSizes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [view, setView] = useState<"grid"|"editorial">("grid");
  const [drawerOpen, setDrawer] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
    setDebouncedSearch("");
    setSort("newest");
  }, []);

  useEffect(() => {
    const { filters: urlFilters, sort: urlSort, search: urlSearch } = paramsToFilters(searchParams);
    setFilters(urlFilters);
    setSort(urlSort);
    setSearch(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/products?limit=1000');
        if (response.ok) {
          const data = await response.json();
          const allProducts = data.products || [];
          const brandsMap = new Map<string, string>();
          allProducts.forEach((p: Product) => brandsMap.set(p.brandSlug, p.brand));
          setAllBrands(Array.from(brandsMap.entries()).map(([slug, name]) => ({ name, slug })).sort((a, b) => a.name.localeCompare(b.name)));
          const categoriesSet = new Set<string>();
          allProducts.forEach((p: Product) => p.categories.forEach(c => categoriesSet.add(c.name)));
          setAllCategories(Array.from(categoriesSet).sort());
          const sizesSet = new Set<string>();
          allProducts.forEach((p: Product) => p.variants.forEach(v => sizesSet.add(v.size)));
          setAllSizes(Array.from(sizesSet).sort((a, b) => parseInt(a) - parseInt(b)));
        }
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const params = filtersToParams(filters, sort, debouncedSearch);
    const qs = params.toString();
    const currentQs = window.location.search.replace(/^\?/, '');
    if (qs !== currentQs) {
      const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, [filters, sort, debouncedSearch]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (sort) params.append('sort', sort);
        filters.brands.forEach(b => params.append('brand', b));
        filters.categories.forEach(c => params.append('category', c));
        // Apply fixed genders from route (e.g., ['MEN', 'UNISEX'] or ['WOMEN', 'UNISEX'])
        fixedGenders.forEach(g => params.append('gender', g));
        if (filters.price[0] > 20) params.append('minPrice', filters.price[0].toString());
        if (filters.price[1] < 500) params.append('maxPrice', filters.price[1].toString());
        if (filters.badges.has('isOnSale')) params.append('onSale', 'true');
        if (filters.badges.has('inStock')) params.append('inStock', 'true');

        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        let fetchedProducts = data.products || [];

        if (filters.badges.has('isNewArrival')) {
          fetchedProducts = fetchedProducts.filter((p: Product) => p.isNewArrival);
        }
        if (filters.badges.has('isFeatured')) {
          fetchedProducts = fetchedProducts.filter((p: Product) => p.isFeatured);
        }
        if (filters.sizes.size > 0) {
          fetchedProducts = fetchedProducts.filter((p: Product) =>
            p.variants.some(v => filters.sizes.has(v.size))
          );
        }

        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, debouncedSearch, sort, fixedGenders]);

  const activeFilterCount =
    filters.brands.size + filters.categories.size + filters.sizes.size +
    filters.badges.size + (filters.price[0]>20||filters.price[1]<500 ? 1 : 0);

  const handleWishlist = (id:string) => {
    setWishlist(s=>{ const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });
  };

  return (
    <div style={{ backgroundColor:T.ivory, minHeight:"100vh" }} dir={isRtl ? "rtl" : "ltr"}>
      <Header/>
      <PageBanner t={t} customTitle={pageTitle} customSubtitle={pageSubtitle} />

      <div className="sticky top-16 md:top-20 z-20" style={{ backgroundColor:T.ivory, borderBottom:`1px solid ${T.muted}12` }}>
        {/*<div className="max-w-7xl mx-auto px-5 md:px-10 py-4 flex items-center gap-2">
          {[
            { label: t('home'), href: `/${locale}` },
            { label: t('allFragrances'), href: `/${locale}/products` },
          ].map((b,i,arr)=>(
            <span key={b.label} className="flex items-center gap-2">
              <a href={b.href}
                className="text-[9px] tracking-[0.15em] uppercase transition-colors hover:opacity-70"
                style={{ fontFamily:"Inter,sans-serif", color: i<arr.length-1 ? `${T.muted}70` : T.espresso,
                  textDecoration: i<arr.length-1 ? 'none' : 'none' }}>
                {b.label}
              </a>
              {i<arr.length-1 && <span style={{ color:`${T.muted}40`, fontSize:"10px" }}>/</span>}
            </span>
          ))}
        </div>*/}

        <div className="max-w-7xl mx-auto px-5 md:px-10 pt-3 pb-3">
          <div className="relative">
            <motion.div
              animate={{ borderColor: searchFocused ? T.gold : `${T.muted}25` }}
              transition={{ duration:0.2 }}
              className="flex items-center gap-3 border px-4 py-3"
              style={{ backgroundColor:T.ivory }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={searchFocused?T.gold:T.muted} strokeWidth="1.5"
                className="shrink-0 transition-colors duration-200">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input ref={searchRef} type="text" value={search} onChange={e=>setSearch(e.target.value)}
                onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)}
                placeholder={t('searchPlaceholder')}
                className="flex-1 outline-none bg-transparent text-sm"
                style={{ fontFamily:"Inter,sans-serif", color:T.espresso, fontWeight:300,
                  direction: isRtl ? "rtl" : "ltr" }}/>
              <AnimatePresence>
                {search && (
                  <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    onClick={()=>setSearch("")} style={{ color:T.muted }}
                    className="transition-colors hover:text-espresso">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button onClick={()=>setDrawer(true)}
                className="md:hidden flex items-center gap-2 text-[9px] tracking-[0.2em] uppercase px-3.5 py-2 border relative"
                style={{ fontFamily:"Inter,sans-serif", color:T.espresso, borderColor:`${T.muted}25` }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                </svg>
                {t('filtersButton')}
                {activeFilterCount>0 && (
                  <span className="w-4 h-4 rounded-full text-[8px] flex items-center justify-center"
                    style={{ backgroundColor:T.gold, color:T.espresso }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <motion.span key={products.length} initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="text-[10px]" style={{ fontFamily:"Cormorant Garamond,serif", color:T.muted, fontStyle:"italic" }}>
                {loading ? t('loading') : t('resultsCount', { count: products.length })}
              </motion.span>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters}
                  className="text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 border transition-all duration-200 flex items-center gap-1.5"
                  style={{ fontFamily:"Inter,sans-serif", color:T.espresso, borderColor:`${T.gold}50`, backgroundColor:`${T.gold}12` }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.gold; e.currentTarget.style.backgroundColor=`${T.gold}25`; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=`${T.gold}50`; e.currentTarget.style.backgroundColor=`${T.gold}12`; }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  {t('clearAll')}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <SortSelect value={sort} onChange={setSort} t={t}/>
              <ViewToggle view={view} onChange={setView}/>
            </div>
          </div>

          <AnimatePresence>
            {activeFilterCount>0 && <ActiveChips filters={filters} onChange={setFilters} t={t}/>}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 pb-24">
        <div className="flex gap-8 lg:gap-12 items-start">
          <aside className="hidden md:block shrink-0 w-52 lg:w-60">
            <FilterPanel filters={filters} onChange={setFilters} onReset={resetFilters} count={products.length}
              availableBrands={allBrands} availableCategories={allCategories} availableSizes={allSizes} t={t}/>
          </aside>

          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <div className="mb-4 opacity-30"><BottleSVG hue={T.gold} size="sm"/></div>
                  <p className="text-sm" style={{ fontFamily:"Inter,sans-serif", color:T.muted }}>{t('loading')}</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <h3 className="mb-3" style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"2rem", fontWeight:300, color:T.espresso }}>
                    {t('error')}
                  </h3>
                  <p className="text-sm" style={{ fontFamily:"Inter,sans-serif", color:T.muted }}>{error}</p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {products.length===0 ? (
                  <EmptyState key="empty" onReset={resetFilters} t={t}/>
                ) : view==="grid" ? (
                  <motion.div key="grid"
                    className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
                    <AnimatePresence>
                      {products.map((p,i)=>(
                        <motion.div key={p.id} layout
                          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                          exit={{ opacity:0, scale:0.96 }}
                          transition={{ duration:0.4, delay:i*0.04, ease:[0.22,1,0.36,1] }}>
                          <ProductCard product={p} view="grid" locale={locale}
                            onWishlist={handleWishlist} wishlisted={wishlist.has(p.id)} t={t}/>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div key="editorial" className="flex flex-col gap-4">
                    <AnimatePresence>
                      {products.map((p,i)=>(
                        <motion.div key={p.id} layout
                          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                          exit={{ opacity:0 }}
                          transition={{ duration:0.4, delay:i*0.04, ease:[0.22,1,0.36,1] }}>
                          <ProductCard product={p} view="editorial" locale={locale}
                            onWishlist={handleWishlist} wishlisted={wishlist.has(p.id)} t={t}/>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>

      <MobileFilterDrawer open={drawerOpen} onClose={()=>setDrawer(false)}
        filters={filters} onChange={setFilters} onReset={resetFilters} count={products.length}
        availableBrands={allBrands} availableCategories={allCategories} availableSizes={allSizes} t={t}/>

      <Footer/>
    </div>
  );
}