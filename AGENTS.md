<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Luxury Perfume Ecommerce — Project Guide

## Overview

Premium Algerian perfume storefront. Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Prisma 7, PostgreSQL. Full i18n (Arabic/French) with RTL. `proxy.ts` handles both locale routing and admin auth — there is NO `middleware.ts`.

**Key version specifics:**
- **Next.js 16**: Uses `proxy.ts` (root-level) instead of `middleware.ts`. `params` in layouts/page are `Promise` — must be awaited. Tailwind CSS v4 uses `@import "tailwindcss"` in CSS, not `@tailwind` directives.
- **next-intl v4**: Middleware-less routing via `createMiddleware()` called inside `proxy.ts`. Locale prefix always present in URLs.
- **Prisma 7**: Uses `prisma.config.ts` instead of `schema` field in `package.json`. Uses `@prisma/adapter-pg` with `pg` Pool.

## Project Status

**Partially built — significant sections remain incomplete.** See individual areas below.

## Architecture

### Routes (storefront — all under `/[locale]/`)
- `page.tsx` — Homepage (hero, collections, marquee, brand story sections)
- `products/page.tsx` — Product listing (filters, grid, infinite scroll)
- `checkout/page.tsx` — Checkout form
- `order-confirmation/[ref]/page.tsx` — Order confirmation (NOT created yet, use `/checkout` sibling pattern)
- `search/page.tsx` — Search results (NOT created yet)

### Routes (admin — no locale prefix, at `/admin/`)
- `/admin/login` — Login page
- `/admin/dashboard` — Dashboard (stats, low stock, recent orders)
- `/admin/products` — Product list (CRUD)
- `/admin/products/new` — Create product (NOT created yet)
- `/admin/products/[id]/edit` — Edit product (NOT created yet — admin uses `[slug]` not `[id]`)
- `/admin/orders` — Order list (with inline status updates)
- `/admin/orders/[id]` — Order detail
- `/admin/promotions` — Promotions list
- `/admin/promotions/new` — Create promotion (NOT created yet)
- `/admin/promotions/[id]/edit` — Edit promotion (NOT created yet)
- `/admin/settings` — Settings page
- `/admin/brands` — Brand management
- `/admin/categories` — Category management

### Route Patterns (admin products/edit)
Admin product editing uses `[slug]` not `[id]` — existing dashboard links point to `/admin/products/${variant.product.slug}/edit`. The directory is `app/admin/products/[slug]/`, not `[id]/`.

### API Routes
- `/api/products` — Public product listing (GET, with search/filter/sort/pagination)
- `/api/orders` — Order creation (POST, with server-side price validation)
- `/api/auth/[...nextauth]` — NextAuth v5
- `/api/brands` — Public brand listing (GET)
- `/api/categories` — Public category listing (GET)
- `/api/settings` — Public settings (GET)
- `/api/upload` — Cloudinary image upload (POST)
- `/api/featured` — Featured products (GET)
- `/api/new-arrivals` — New arrivals (GET)
- `/api/search` — Search (GET)
- `/api/admin/dashboard` — Dashboard stats (GET)
- `/api/admin/products` — Admin product CRUD (GET, POST)
- `/api/admin/orders` — Admin order listing (GET)
- `/api/admin/orders/[id]` — Order detail/update (GET, PATCH)
- `/api/admin/promotions` — Admin promotions CRUD (GET, POST)
- `/api/admin/brands` — Admin brand management
- `/api/admin/categories` — Admin category management
- `/api/admin/variants` — Variant stock/price updates
- `/api/admin/settings` — Settings CRUD

### Route-Level Documentation
Every admin page and API route has a JSDoc comment block at the top with:
- **DESCRIPTION**: What the page/route does
- **FUNCTIONALITY**: List of features
- **BACKEND INTEGRATION**: API endpoints used (for pages) or request/response shape (for routes)
- **SECURITY**: Auth notes (for admin routes)

**Always follow this pattern** when creating new pages/routes.

### Database (Prisma Schema: `prisma/schema.prisma`)
Models: `AdminUser`, `Brand`, `Category`, `Order`, `OrderItem`, `Product`, `ProductCategory`, `ProductImage`, `ProductTranslation`, `Promotion`, `PromotionVariant`, `Settings`, `Variant`

Enums: `Gender` (MEN/WOMEN/UNISEX), `Locale` (ar/fr), `OrderStatus` (PENDING/CONFIRMED/PROCESSING/SHIPPED/DELIVERED/CANCELLED)

Key relationships:
- Product has many Variants, Images, Translations, Categories (M2M via ProductCategory)
- Variant has many OrderItems, PromotionVariants (M2M)
- Promotion has many PromotionVariants linking to Variants
- AdminUser is the only auth model (single admin, seeded via script)
- Settings is a singleton with id "singleton"

### Auth (NextAuth v5, Credentials Provider)
- Configured in `lib/auth.ts` — exports `handlers`, `auth`, `signIn`, `signOut`
- 1-second artificial delay on login attempts
- Session: JWT strategy, 8-hour maxAge
- Admin route protection in `proxy.ts` — checks JWT token for all `/admin/*` except `/admin/login`
- API route protection: use `requireAdmin()` from `lib/auth-helpers.ts` which returns `{ authorized: boolean, response?: NextResponse }`

### i18n (next-intl v4)
- **`proxy.ts`**: Runs `createMiddleware(routing)` for locale handling on all non-admin, non-API routes
- **Routing**: `locales: ['fr', 'ar']`, `defaultLocale: 'fr'`, `localePrefix: 'always'`
- **Pathnames**: Customized in `i18n/routing.ts` — e.g., `/products` → FR: `/produits`, AR: `/products` (kept as `/products`)
- **Navigation**: Use `@/i18n/navigation` for `Link`, `redirect`, `usePathname`, `useRouter` — NOT `next/navigation` directly (for locale-aware routing)
- **Translations**: `messages/fr.json`, `messages/ar.json` — all UI strings. Product content stored in DB as `ProductTranslation`
- **Usage**: `useTranslations('nav')` on client, `getTranslations('nav')` on server
- **RTL**: Set `<html dir="rtl">` in layout when locale is 'ar'

### Styling (Tailwind CSS v4)

Uses `@import "tailwindcss"` in `app/globals.css` (NOT `@tailwind base/components/utilities`).

Custom theme tokens defined with `@theme` directive:
```css
@theme {
  --color-ivory: #FAFAF7;
  --color-gold: #C9A84C;
  --color-gold-dark: #A07830;
  --color-charcoal: #1A1A1A;
  --color-muted: #6B6B6B;
  --color-border: #E8E4DC;
  --color-dark-bg: #0F0F0F;
  --color-dark-text: #F5F0E8;
  --font-heading: var(--font-cormorant), "Georgia", serif;
  --font-body: var(--font-inter), system-ui, sans-serif;
}
```

Utility classes defined in globals.css: `.section-label`, `.divider-gold`, `.btn-gold`, `.btn-outline-light`

Design tokens: Ivory (#FAFAF7), Warm White (#FAF9F6), Charcoal (#1A1A1A), Gold (#C9A84C), Gold Dark (#A07830), Muted (#6B6B6B)

### Components
- **Storefront**: `Header.tsx`, `Footer.tsx`, `CartDrawer.tsx`, `FilterSidebar.tsx` — all created
- **Admin**: `AdminNavigation.tsx` — created
- **Context**: `CartContext.tsx` — cart state via localStorage
- **Storefront pages use `"use client"`** pattern with Framer Motion animations
- **Admin pages use `"use client"`** pattern with server data fetching from `/api/admin/*`
- **Missing storefront components** (should be created as needed): ProductCard, ProductGrid, HeroSection, ImageGallery, VariantSelector, StockBadge, PromoBadge, AnnouncementBanner
- **Missing admin components**: ProductForm, VariantTable, ImageUploader, OrderTable, PromotionForm, DashboardStats, LowStockAlert

### Lib Modules
- `lib/auth.ts` — NextAuth config
- `lib/auth-helpers.ts` — `verifyAdminSession()`, `requireAdmin()` for API routes
- `lib/prisma.ts` — Prisma client singleton (uses `@prisma/adapter-pg` with `pg` Pool)
- `lib/cart.ts` — localStorage cart utilities (getCart, saveCart, addToCart, etc.)
- `lib/cloudinary.ts` — Cloudinary upload/delete helpers
- `lib/promotions.ts` — `isPromotionActive()`, `getPromotionHoursRemaining()`
- `lib/validation.ts` — Zod schemas: checkoutSchema, productSchema, promotionSchema, settingsSchema, orderStatusSchema, variantUpdateSchema, phoneSchema
- `lib/wilayas.ts` — Array of 58 Algerian wilayas
- `lib/data.ts` — Mock data (legacy, being replaced by Prisma queries)

## Coding Conventions

### Page Layout Pattern
Every page is wrapped by the locale layout `app/[locale]/layout.tsx` (for storefront) or `app/admin/layout.tsx` (for admin). The locale layout provides `NextIntlClientProvider` and `CartProvider` + `CartDrawer`.

**Admin pages** fetch data client-side from `/api/admin/*` endpoints. Layout (`app/admin/layout.tsx`) calls `auth()` server-side and shows `AdminNavigation` for authenticated users.

### JSDoc Comments
All admin pages and API routes have JSDoc blocks at the top. Follow this pattern for new files:
```
/**
 * Page/Route Name
 * 
 * DESCRIPTION: What it does
 * FUNCTIONALITY: Feature list
 * BACKEND INTEGRATION: API endpoints / request-response shapes
 * SECURITY: Auth notes (for admin)
 */
```

### Storefront Page Pattern
- `"use client"` directive
- `useTranslations('namespace')` from `next-intl`
- `useLocale()` from `next-intl`
- Import `Link`, `useRouter` from `@/i18n/navigation` (NOT `next/navigation`)
- `Header` and `Footer` components imported and rendered
- Framer Motion for animations (slow, deliberate: `ease: [0.22, 1, 0.36, 1]`, duration 0.7-1s)

### API Route Pattern
- Export named functions (GET, POST, PUT, PATCH, DELETE)
- Use `NextRequest` and `NextResponse` from `next/server`
- Validate with zod schemas from `lib/validation.ts`
- Admin routes: call `requireAdmin()` first, check `authorized`
- Return `{ error: string }` with appropriate HTTP status on failure
- Try/catch with `NextResponse.json({ error: '...' }, { status: xxx })`

### Validation
Use zod schemas from `lib/validation.ts`:
- `checkoutSchema` for order creation
- `productSchema` for product CRUD
- `promotionSchema` for promotion CRUD
- `settingsSchema` for settings
- `orderStatusSchema` for status updates
- `variantUpdateSchema` for variant stock/price

### Cart
- Fully client-side via localStorage (key: `maison-elara-cart`)
- CartContext in `contexts/CartContext.tsx` provides: `cart`, `addToCart`, `updateQuantity`, `removeItem`, `clearCart`, `openCart`, `closeCart`
- CartItem type includes: variantId, productId, productName, productSlug, brandName, variantSize, price, originalPrice, quantity, imageUrl, maxStock
- CartDrawer slides in from right (lucide-react icons, Framer Motion)

### Seed Script
- `prisma/seed.ts` creates: admin user, settings singleton, 3 brands, 3 categories
- Run with: `tsx prisma/seed.ts`
- Uses env vars: `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- bcrypt cost factor 12

### Remaining Work (from docs.md)
**Storefront missing:**
- Product detail page at `/[locale]/products/[slug]`
- Search results page at `/[locale]/search`
- Checkout page at `/[locale]/checkout`
- Order confirmation at `/[locale]/order-confirmation/[ref]`
- Missing components: ProductCard, ImageGallery, VariantSelector, StockBadge, PromoBadge, AnnouncementBanner, HeroSection (homepage hero is inline in the page)

**Admin missing:**
- Create product at `/admin/products/new`
- Edit product at `/admin/products/[slug]/edit`
- Create promotion at `/admin/promotions/new`
- Edit promotion at `/admin/promotions/[id]/edit`
- Missing components: ProductForm, VariantTable, ImageUploader, OrderTable, PromotionForm, DashboardStats, LowStockAlert

**Polish missing:**
- SEO metadata per product
- Announcement banner
- Error pages (not-found.tsx, error.tsx)
- Sitemap
- Framer Motion polish on remaining pages

## Import Rules
- Use `@/` path alias (e.g., `@/lib/prisma`, `@/components/Header`)
- For locale-aware routing: import from `@/i18n/navigation` (provides `Link`, `redirect`, `usePathname`, `useRouter`)
- For i18n: `useTranslations` from `next-intl`, `getTranslations` from `next-intl/server`
- For auth: `auth`, `signIn`, `signOut` from `@/lib/auth`; `requireAdmin` from `@/lib/auth-helpers`
- For animations: `framer-motion`
- For icons: `lucide-react`

## Testing & Commands
- `pnpm run dev` — Development server
- `pnpm run build` — Full build
- `pnpm run lint` — ESLint
- `pnpm run db:generate` — Generate Prisma client
- `pnpm run db:push` — Push schema to database
- `pnpm run db:migrate` — Run migrations
- `pnpm run db:studio` — Prisma Studio
- `pnpm run db:seed` — Seed database (`tsx prisma/seed.ts`)