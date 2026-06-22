# Luxury Perfume Ecommerce — Full Implementation Specification

---

## 1. Executive Summary

A premium luxury perfume storefront for a single Algerian retailer. Customers browse, filter, and order via cash-on-delivery with no accounts required. One administrator manages everything through a private dashboard. The stack is Next.js (App Router, fullstack), TypeScript, Tailwind CSS, Prisma, and PostgreSQL. The site supports Arabic and French with full RTL handling. The aesthetic is editorial luxury — ivory, champagne gold, refined typography, subtle motion.

---

## 2. Assumptions Made

- Deployment target: a VPS or platform like Railway/Render (not Vercel serverless, since Prisma + PostgreSQL needs persistent connections). **Assumption: Railway or Render.**
- Currency: Algerian Dinar (DZD). Displayed as "DA" suffix.
- No tax calculation required.
- Images hosted via local filesystem or Cloudinary free tier. **Assumption: Cloudinary** (free, reliable, no self-hosting complexity).
- Single admin user seeded via a script — no admin registration UI.
- WhatsApp optional future feature; not built now.
- Low-stock threshold: ≤ 5 units per variant.
- Phone number format: Algerian mobile (+213 prefix, 10 digits local).
- Wilayas (provinces) used as the "state" field for delivery addresses — full list of 58 wilayas included as a dropdown.
- Session via HTTP-only cookies using `next-auth` with credentials provider.
- No email sending required at launch.

---

## 3. Functional Requirements

**Customer-facing:**
- Browse all active products
- Filter by brand, gender, category, price range, promotion status
- Full-text search (Arabic + French)
- Product detail with variant selector, image gallery, stock badge
- Cart (localStorage-persisted, no server session needed)
- Checkout form with COD submission
- Order confirmation page with order reference number
- Language switcher (AR / FR), persisted in cookie
- RTL layout when Arabic is active

**Admin:**
- Secure login (credentials)
- Dashboard: orders count, revenue today/week/month, low stock alerts, recent orders
- Products CRUD with image upload, variant management, promotion linkage
- Orders list with status updates
- Promotions CRUD
- Settings: store name, contact info, announcement banner text
- Mobile-accessible admin (responsive tables, collapsible sidebar)

---

## 4. Complete Feature List

1. Product catalog (browse, search, filter, sort)
2. Product detail page with image gallery and variant selector
3. Stock availability display (In Stock / Low Stock / Out of Stock)
4. Featured products section
5. New arrivals section
6. Promotions display (badges, original price strikethrough, countdown optional)
7. Persistent cart (localStorage)
8. Quantity management in cart
9. COD checkout form
10. Order confirmation with reference number
11. Admin authentication (credentials + HTTP-only session)
12. Admin product management (CRUD + image upload + variants)
13. Admin order management (list + status update)
14. Admin promotion management (CRUD with date range)
15. Admin dashboard statistics
16. Admin settings (store metadata, banner)
17. Arabic/French i18n with RTL support
18. SEO metadata per product page
19. Responsive mobile-first design
20. Announcement banner (admin-configurable)

---

## 5. User Roles

| Role | Description |
|---|---|
| Customer | Anonymous visitor. No login. Full storefront access. |
| Administrator | Single authenticated user. Full admin dashboard access. |

---

## 6. User Stories

**Customer:**
- As a customer, I want to browse perfumes so I can discover products.
- As a customer, I want to filter by gender so I can find perfumes for me.
- As a customer, I want to see if a product is in stock before adding to cart.
- As a customer, I want to select a size variant and see its price.
- As a customer, I want to add products to a cart and modify quantities.
- As a customer, I want to checkout with my name, phone, and address.
- As a customer, I want a confirmation page with an order number.
- As a customer, I want to read the site in Arabic or French.

**Admin:**
- As admin, I want to log in securely.
- As admin, I want to add a new product with images and variants.
- As admin, I want to mark an order as delivered.
- As admin, I want to create a promotion with a start and end date.
- As admin, I want to see today's orders at a glance.
- As admin, I want to update stock for a variant.
- As admin, I want to deactivate a product without deleting it.

---

## 7. User Journeys

**Customer — Purchase Journey:**
1. Lands on homepage → sees hero, featured products, promotions
2. Clicks category or uses search → product listing page
3. Applies filters → refined results
4. Clicks product → product detail page
5. Selects variant (size) → sees price and stock
6. Adds to cart → cart drawer slides open
7. Reviews cart → proceeds to checkout
8. Fills checkout form → submits
9. Sees order confirmation page with reference number

**Admin — Daily Operations:**
1. Navigates to `/admin/login` via footer link
2. Logs in → redirected to `/admin/dashboard`
3. Checks new orders → updates statuses
4. Checks low stock alerts → updates quantities
5. Creates or edits a product or promotion

---

## 8. Information Architecture

```
Storefront
├── Homepage
├── Products (all)
│   ├── Filter sidebar / drawer
│   └── Sort controls
├── Product Detail
├── Search Results
├── Cart (drawer/page)
├── Checkout
└── Order Confirmation

Admin (protected)
├── Dashboard
├── Products
│   ├── List
│   ├── Create
│   └── Edit
├── Orders
│   ├── List
│   └── Detail
├── Promotions
│   ├── List
│   ├── Create
│   └── Edit
└── Settings
```

---

## 9. Site Map & Route Definitions

| Route | Description | Protected |
|---|---|---|
| `/` | Homepage | No |
| `/products` | All products listing | No |
| `/products/[slug]` | Product detail | No |
| `/search` | Search results | No |
| `/cart` | Cart page (fallback if drawer disabled) | No |
| `/checkout` | Checkout form | No |
| `/order-confirmation/[ref]` | Order success | No |
| `/admin/login` | Admin login | No |
| `/admin/dashboard` | Admin overview | Yes |
| `/admin/products` | Product list | Yes |
| `/admin/products/new` | Create product | Yes |
| `/admin/products/[id]/edit` | Edit product | Yes |
| `/admin/orders` | Order list | Yes |
| `/admin/orders/[id]` | Order detail | Yes |
| `/admin/promotions` | Promotion list | Yes |
| `/admin/promotions/new` | Create promotion | Yes |
| `/admin/promotions/[id]/edit` | Edit promotion | Yes |
| `/admin/settings` | Store settings | Yes |

---

## 10. Database Design & ERD

**Entities:** Product, ProductTranslation, Brand, Category, ProductImage, Variant, Promotion, Order, OrderItem, Settings

**Relationships:**
- Product → many ProductTranslations (one per locale: ar, fr)
- Product → one Brand
- Product → many Categories (many-to-many)
- Product → many ProductImages
- Product → many Variants
- Variant → one Promotion (optional, active period)
- Promotion → many Variants
- Order → many OrderItems
- OrderItem → one Variant

---

## 11. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Brand {
  id       String    @id @default(cuid())
  name     String    @unique
  slug     String    @unique
  products Product[]
  createdAt DateTime @default(now())
}

model Category {
  id       String             @id @default(cuid())
  name     String             @unique
  slug     String             @unique
  products ProductCategory[]
}

model Product {
  id           String             @id @default(cuid())
  slug         String             @unique
  brand        Brand              @relation(fields: [brandId], references: [id])
  brandId      String
  gender       Gender
  isFeatured   Boolean            @default(false)
  isNewArrival Boolean            @default(false)
  isActive     Boolean            @default(true)
  translations ProductTranslation[]
  images       ProductImage[]
  variants     Variant[]
  categories   ProductCategory[]
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
}

model ProductTranslation {
  id          String  @id @default(cuid())
  product     Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId   String
  locale      Locale
  name        String
  description String  @db.Text
  @@unique([productId, locale])
}

model ProductImage {
  id        String  @id @default(cuid())
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String
  url       String
  altAr     String?
  altFr     String?
  order     Int     @default(0)
}

model ProductCategory {
  product    Product  @relation(fields: [productId], references: [id])
  productId  String
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId String
  @@id([productId, categoryId])
}

model Variant {
  id          String      @id @default(cuid())
  product     Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId   String
  size        String      // e.g. "30ml", "50ml", "100ml"
  price       Decimal     @db.Decimal(10, 2)
  stock       Int         @default(0)
  promotion   Promotion?  @relation(fields: [promotionId], references: [id])
  promotionId String?
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())
}

model Promotion {
  id             String    @id @default(cuid())
  name           String
  discountedPrice Decimal  @db.Decimal(10, 2)
  startDate      DateTime
  endDate        DateTime
  isActive       Boolean   @default(true)
  variants       Variant[]
  createdAt      DateTime  @default(now())
}

model Order {
  id         String      @id @default(cuid())
  reference  String      @unique @default(cuid())
  status     OrderStatus @default(PENDING)
  fullName   String
  phone      String
  wilaya     String
  commune    String
  address    String
  notes      String?
  items      OrderItem[]
  total      Decimal     @db.Decimal(10, 2)
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  order     Order   @relation(fields: [orderId], references: [id])
  orderId   String
  variant   Variant @relation(fields: [variantId], references: [id])
  variantId String
  quantity  Int
  unitPrice Decimal @db.Decimal(10, 2)
  productNameFr String
  productNameAr String
  variantSize   String
}

model Settings {
  id              String  @id @default("singleton")
  storeNameFr     String  @default("Parfums")
  storeNameAr     String  @default("عطور")
  phone           String  @default("")
  email           String  @default("")
  instagramUrl    String  @default("")
  bannerTextFr    String  @default("")
  bannerTextAr    String  @default("")
  bannerEnabled   Boolean @default(false)
}

model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

enum Gender {
  MEN
  WOMEN
  UNISEX
}

enum Locale {
  ar
  fr
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

---

## 12. i18n Strategy

**Library:** `next-intl` (best Next.js App Router i18n library in 2026)

**Locales:** `ar`, `fr`

**Default locale:** Detected from `Accept-Language` header on first visit. Fallback: `fr`.

**Persistence:** Cookie `NEXT_LOCALE` (1 year expiry).

**Routing:** Locale prefix in URL — `/fr/products`, `/ar/products`. Middleware redirects based on cookie or browser header.

**RTL:** When locale is `ar`, `<html dir="rtl" lang="ar">` is set. Tailwind RTL plugin (`tailwindcss-rtl` or built-in `rtl:` variants) handles layout mirroring. Test every flex/grid layout for RTL.

**Translation files:** `/messages/fr.json` and `/messages/ar.json` for all UI strings (buttons, labels, status names, errors). Product content is stored in DB as `ProductTranslation` — not in translation files.

**Language switcher:** Globe icon in the top navigation. Clicking switches locale and reloads current page in the new locale.

**Number formatting:** `Intl.NumberFormat` with locale-appropriate separators. Currency always "DA".

---

## 13. Authentication

**Library:** `next-auth` v5 (Auth.js) with Credentials provider.

**Flow:**
1. Admin visits `/admin/login` via the footer link (discreet, small link, no label advertising it).
2. Enters email + password.
3. Server validates against `AdminUser.passwordHash` using `bcryptjs`.
4. On success: HTTP-only, Secure, SameSite=Strict session cookie set. Redirected to `/admin/dashboard`.
5. On failure: Generic error "Identifiants incorrects" (no detail about which field is wrong).

**Route protection:** Middleware checks session for all `/admin/*` routes (except `/admin/login`). Unauthenticated requests redirect to `/admin/login`.

**Session duration:** 8 hours (idle expiry). Extendable via activity.

**Password management:** Admin password set via a one-time CLI seed script (`npm run seed:admin`). To change, run `npm run reset:admin`. No UI for password reset — appropriate for a single known admin.

**Security notes:**
- Passwords hashed with bcrypt, cost factor 12.
- No brute-force protection needed at this scale (obscure URL, single admin), but add a 1-second artificial delay on failed login.
- CSRF protected automatically by next-auth.
- Session stored server-side (JWT with next-auth secret, not DB sessions, for simplicity).

---

## 14. Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `ivory` | `#FAFAF7` | Primary background |
| `white` | `#FFFFFF` | Cards, panels |
| `gold-light` | `#E8D5A3` | Subtle accents |
| `gold` | `#C9A84C` | Primary accent, CTAs |
| `gold-dark` | `#A07830` | Hover states |
| `charcoal` | `#1A1A1A` | Primary text |
| `muted` | `#6B6B6B` | Secondary text |
| `border` | `#E8E4DC` | Borders, dividers |
| `dark-section` | `#0F0F0F` | Dark hero sections |
| `dark-text` | `#F5F0E8` | Text on dark sections |
| `error` | `#C0392B` | Error states |
| `success` | `#27AE60` | Success states |

### Typography

**Headings (FR):** `Cormorant Garamond` — serif, editorial, luxury feel. Weights: 300, 400, 600.

**Headings (AR):** `Noto Serif Arabic` — elegant Arabic serif for headings.

**Body (FR/EN):** `Inter` — clean, readable sans-serif. Weights: 400, 500.

**Body (AR):** `Noto Sans Arabic` — highly readable, widely tested.

**Scale:**
```
text-xs:  12px
text-sm:  14px
text-base: 16px
text-lg:  18px
text-xl:  20px
text-2xl: 24px
text-3xl: 30px
text-4xl: 36px
text-5xl: 48px
text-6xl: 64px
```

### Spacing Scale
Standard Tailwind 4-unit base (4px). Key values: 4, 8, 12, 16, 24, 32, 48, 64, 96.

### Border Radius
- Cards: `rounded-none` or `rounded-sm` (2px) — luxury brands avoid rounded cards.
- Buttons: `rounded-none` — sharp, editorial.
- Inputs: `rounded-none`.
- Badges: `rounded-full` for stock/promo pills only.

### Shadows
- Cards on hover: `shadow-md` with `transition-shadow`.
- Modals/drawers: `shadow-2xl`.
- Admin panels: `shadow-sm`.
- No heavy shadows on product cards — luxury aesthetic uses whitespace, not depth.

### Animation Philosophy
- All animations via Framer Motion.
- Philosophy: **slow, deliberate, confident**. Never bouncy.
- Default: `ease: [0.25, 0.1, 0.25, 1]` (ease-in-out), duration 0.4s for most transitions.
- Page transitions: subtle fade + slight Y offset (12px up).
- Cart drawer: slides in from right (LTR) or left (RTL), 0.35s.
- Product cards: scale 1.02 + shadow on hover, 0.3s.
- Image gallery: crossfade between images.
- Hero text: staggered fade-in on load.
- Avoid: bounce, spin, excessive scale, rapid flashes.

### Iconography
**Library:** `lucide-react` — clean, minimal stroke icons consistent with luxury tone.

Key icons used:
- Search: `Search`
- Cart: `ShoppingBag` (not ShoppingCart — more fashion-forward)
- Menu: `Menu`
- Close: `X`
- Arrow: `ArrowRight`, `ChevronDown`
- Check: `Check`
- Language: `Globe`
- Admin: hidden, no icon in footer

### Imagery Recommendations
- Product images: square (1:1) or portrait (3:4). White or neutral backgrounds.
- Hero images: wide editorial shots or abstract fragrance imagery. Min 1920px wide.
- No stock photos of people — focus on product, texture, mood.
- Cloudinary transformations: auto format, quality auto, responsive srcset.

---

## 15. Landing Page (Homepage) Structure

### Section 1 — Announcement Banner
- **Objective:** Promotions, shipping info, seasonal messaging.
- **Content:** Single line text (from Settings.bannerText), dismissible.
- **Animation:** Slides down on page load if enabled.
- **Mobile:** Full width, font size reduces to text-sm.

### Section 2 — Navigation Header
- **Content:** Logo (left/right in RTL), nav links (Products, Brands, Sale), language switcher, cart icon with item count badge.
- **Behavior:** Sticky. Background transitions from transparent to ivory/white on scroll past hero.
- **Mobile:** Hamburger menu. Drawer slides in.

### Section 3 — Hero Section
- **Objective:** Communicate luxury, create desire, drive to shop.
- **Content:** Full-viewport editorial image or split layout (image left, text right). Headline in Cormorant Garamond, subheadline, CTA button "Découvrir la Collection" / "اكتشف المجموعة".
- **Animation:** Headline fades in with stagger. Image has subtle Ken Burns effect (very slow zoom, 20s loop).
- **Mobile:** Stacked. Image top, text below. Reduced headline size.

### Section 4 — Featured Products
- **Objective:** Showcase 4–6 curated products immediately.
- **Content:** Section title, horizontal scroll on mobile / 4-column grid on desktop. Each card: image, name, brand, price (with promotion badge if applicable).
- **Animation:** Cards fade in as they enter viewport (IntersectionObserver via Framer Motion `whileInView`).
- **Interaction:** Click → product detail. Hover → image scale, price reveal animation (optional).

### Section 5 — Brand Strip / Marquee
- **Objective:** Signal prestige through brand names.
- **Content:** Horizontal scrolling list of brand names (text only or small logos). Auto-scrolling marquee, pauses on hover.
- **Mobile:** Same, slightly slower scroll.

### Section 6 — New Arrivals
- **Objective:** Drive urgency and return visits.
- **Content:** 2–4 products tagged `isNewArrival`. "New" badge on card. Same card component as Featured.

### Section 7 — Promotional Banner / Collection Highlight
- **Objective:** Drive traffic to sale items.
- **Content:** Full-width dark section. Gold text. "Shop Sale" CTA linking to `/products?promo=true`. Editorial mood image.
- **Animation:** Parallax scroll effect on image (subtle, 15% depth).

### Section 8 — Scent Story / Brand Statement
- **Objective:** Build brand trust and emotional connection.
- **Content:** Short paragraph about the store's curation philosophy. 2–3 sentences. Centered. Serif font. Ivory background.
- **Mobile:** Full width, padding reduced.

### Section 9 — Footer
- **Content:** Logo, store name, Instagram link, phone, language switcher, copyright. Admin login link (discreet, small, no label — just text "Admin" in muted color).
- **Layout:** 3-column desktop, stacked mobile.

---

## 16. Product Listing Page

**URL:** `/[locale]/products`

**Layout:** Sidebar (filters) + main grid. On mobile: filter button opens a bottom drawer.

**Grid:** 2 columns mobile, 3 columns tablet, 4 columns desktop.

**Sorting options:** Newest, Price Low-High, Price High-Low, Promotions First.

**Filter options:**
- Brand (checkbox list)
- Gender (MEN / WOMEN / UNISEX toggle)
- Category (checkbox list)
- Price range (min/max inputs or dual-handle slider)
- On Sale (toggle)
- In Stock Only (toggle)

**Filter behavior:** URL query params update in real time. No "Apply" button needed for checkbox filters — they apply immediately. Filters persist on back navigation.

**Product Card:**
- Image (lazy loaded, hover zoom)
- Brand name (muted, small, above product name)
- Product name (locale-appropriate)
- Price: if promotion active → show discounted price in gold, original in strikethrough muted
- Stock badge: "En stock" / "Stock limité" / "Épuisé" (or Arabic equivalent)
- "Nouveau" / "جديد" badge if isNewArrival
- "Promo" / "عرض" badge if promotion active
- Click → product detail

**Empty state:** Elegant centered message with illustration, "Aucun résultat trouvé" / "لا توجد نتائج", reset filters CTA.

**Pagination:** Infinite scroll (load 16 at a time). No numbered pages — too utilitarian for luxury.

---

## 17. Product Detail Page

**URL:** `/[locale]/products/[slug]`

**Layout (desktop):** 60/40 split. Images left, info right.

**Layout (mobile):** Stacked. Images on top.

**Image gallery:** Main large image + thumbnail strip below. Click thumbnail → crossfade. Pinch-to-zoom on mobile.

**Info panel (right/below):**
- Brand name (linked to brand filter)
- Product name (locale)
- Rating/reviews: NOT included (no reviews system)
- Price display: show active promotion price prominently. Show original price struck through. Show savings amount ("Vous économisez 800 DA").
- Promotion countdown timer if promotion ends within 48h (optional but recommended for urgency).
- Variant selector: button group for sizes ("30ml", "50ml", "100ml"). Each button shows size. Disabled + strikethrough if out of stock.
- Selected variant price updates dynamically.
- Stock badge updates based on selected variant.
- Quantity selector: [-] [1] [+]. Max capped at stock quantity.
- "Ajouter au panier" / "أضف إلى السلة" button. Full width. Gold background. Disabled if out of stock.
- "En rupture de stock" / "نفد المخزون" state if out of stock.
- Description: toggle tabs or accordion. "Description" tab. Locale-appropriate text. Rich text rendered safely.
- Share: Instagram icon only (copy URL functionality).

**Related products:** 4 products from same brand or category. Simple horizontal scroll on mobile.

**SEO:** `<title>`, `<meta name="description">`, OG tags generated from product translation + brand.

---

## 18. Cart

**Implementation:** `localStorage` persisted. React Context for state management. No server cart.

**Cart drawer:** Slides in from right (left in RTL). Overlay darkens background. Close on overlay click or X button.

**Cart contents:**
- Product image (small)
- Product name + variant size
- Unit price (promotion-aware)
- Quantity stepper [-] [n] [+]
- Remove button (X icon)
- Subtotal per item

**Cart summary:**
- Total items count
- Total price
- "Passer la commande" / "إتمام الطلب" CTA → `/checkout`
- "Continuer les achats" / "متابعة التسوق" link

**Empty cart:** Simple centered message with ShoppingBag icon.

**Cart badge:** Number overlay on ShoppingBag icon in header. Animates (scale pop) when item added.

**Validation before checkout:**
- If any cart item's variant is now out of stock → show warning, do not block checkout but flag it.
- Prices are re-validated server-side at order submission.

---

## 19. Checkout Page

**URL:** `/[locale]/checkout`

**Form fields:**

| Field | Type | Validation |
|---|---|---|
| Full Name | Text | Required, min 3 chars |
| Phone | Tel | Required, Algerian format (0[5-7][0-9]{8}), 10 digits |
| Wilaya | Select (58 wilayas) | Required |
| Commune | Text | Required, min 2 chars |
| Address | Textarea | Required, min 10 chars |
| Notes | Textarea | Optional, max 300 chars |

**Layout:** Single column. Clean, spacious. Each field has a floating label or clear label above.

**Order summary sidebar (desktop):** Shows cart items, quantities, prices, total. On mobile: collapsible accordion at top.

**Submit button:** "Confirmer la commande" / "تأكيد الطلب". Full width. Gold. Shows loading spinner on submit.

**On submit:**
1. Client validates form.
2. POST to `/api/orders` with cart items + form data.
3. Server re-validates prices from DB (compare cart prices to current DB prices + active promotions).
4. Server checks stock (decrement optimistically — if stock becomes 0, order still accepted, admin handles it).
5. Order created with status `PENDING`.
6. Server returns `{ reference }`.
7. Cart cleared from localStorage.
8. Redirect to `/order-confirmation/[reference]`.

**On error:** Inline field errors in red. Toast for server errors.

---

## 20. Order Confirmation Page

**URL:** `/[locale]/order-confirmation/[reference]`

**Content:**
- Large checkmark animation (Framer Motion draw SVG).
- "Merci pour votre commande!" / "شكراً لطلبك!"
- Order reference number (large, copyable).
- "Nous vous contacterons bientôt pour confirmer la livraison."
- Order summary: items, total, delivery address.
- "Retour à l'accueil" button.

**Note:** This page is accessible via direct URL but only shows order info if the reference is valid. No security concern — reference is a CUID, not guessable.

---

## 21. Admin Dashboard

### Navigation
Sidebar on desktop (collapsible). Bottom nav on mobile (4 icons: Dashboard, Products, Orders, More).

**Sidebar links:**
- Dashboard (Home icon)
- Products (Package icon)
- Orders (ShoppingBag icon)
- Promotions (Tag icon)
- Settings (Settings icon)
- Logout button at bottom

### Dashboard Widgets
- Today's orders (count + total DA)
- This week's orders
- This month's orders
- Pending orders count (large, highlighted if > 0)
- Low stock alerts: list of variants with stock ≤ 5
- Recent orders table (last 10): reference, name, wilaya, total, status, date

### Product Management

**List view:**
- Table: Image thumbnail, Name (FR), Brand, Variants count, Active toggle, Edit button, Delete button.
- Search by name.
- Filter by active/inactive.
- Pagination: 20 per page (admin users are OK with pagination unlike storefront).

**Create/Edit form:**
- Tabs: General | Images | Variants | SEO
- **General tab:** Name FR, Name AR, Description FR (textarea), Description AR (textarea), Brand (select/create), Gender (select), Categories (multi-select), isFeatured toggle, isNewArrival toggle, isActive toggle.
- **Images tab:** Drag-and-drop upload. Cloudinary upload. Reorder images by drag. Set primary image. Delete images.
- **Variants tab:** Table of variants. Each row: Size (text input), Price (number), Stock (number), Promotion (select, optional). Add variant button. Delete variant button.
- **SEO tab:** Meta title FR, Meta title AR, Meta description FR, Meta description AR. Auto-populated from product name if empty.

### Order Management

**List view:**
- Table: Reference, Customer name, Phone, Wilaya, Total, Status (badge), Date, Actions.
- Filter by status.
- Search by reference or name.
- Status update: inline dropdown in table row (no separate edit page needed).

**Detail page:**
- Full order info: customer details, items ordered (name, size, qty, price), total.
- Status history (simple: current status + timestamp).
- Status update dropdown + "Update" button.
- Print button (browser print, styled for receipt).

### Promotion Management

**List view:** Name, Discounted price, Start date, End date, Active status, Edit, Delete.

**Create/Edit form:**
- Name (internal label, not shown to customers)
- Discounted price (DA)
- Start date (datetime picker)
- End date (datetime picker)
- Select variants to apply to (multi-select, searchable by product name + size)
- isActive toggle (allows manual override)

**Business logic:** A promotion is "live" if `isActive = true AND now >= startDate AND now <= endDate`. This is computed at query time (no cron job needed). Prisma `where` clause filters this.

### Settings

Single form:
- Store name FR + AR
- Phone number
- Email
- Instagram URL
- Announcement banner text FR + AR
- Banner enabled toggle

Save button. Toast on success.

---

## 22. Inventory Rules

| Stock | Display | Badge Color | Add to Cart |
|---|---|---|---|
| > 5 | "En stock" / "متوفر" | Green pill | Enabled |
| 1–5 | "Stock limité" / "كمية محدودة" | Amber pill | Enabled |
| 0 | "Épuisé" / "نفد المخزون" | Red pill | Disabled |

Stock is decremented when an order is submitted (not when confirmed). If stock hits 0 mid-order, the order is still accepted — the admin is responsible for resolution. No automatic hold/reservation system (too complex for this scope).

---

## 23. Order Lifecycle

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                                        ↓
                                    CANCELLED (any stage before SHIPPED)
```

Status labels shown to admin in Arabic and French. Customers see no order tracking — they receive the reference number and await a call.

---

## 24. Validation Rules

**Phone:** `/^(0)(5|6|7)[0-9]{8}$/` — Algerian mobile format.

**Full Name:** min 3 chars, max 100 chars, letters and spaces only (Unicode-aware for Arabic names).

**Commune:** min 2 chars, max 100 chars.

**Address:** min 10 chars, max 500 chars.

**Notes:** max 300 chars.

**Cart quantity:** min 1, max = variant stock (or 10 if stock > 10, to prevent abuse).

**Product price:** positive decimal, max 9,999,999.99 DA.

**Product name:** required in both FR and AR. Max 200 chars each.

**Promotion discounted price:** must be less than the linked variant's price.

**Promotion dates:** endDate must be after startDate.

---

## 25. Recommended Libraries

| Purpose | Library |
|---|---|
| Framework | `next` (latest) |
| Language | `typescript` |
| Styling | `tailwindcss` |
| Animation | `framer-motion` |
| i18n | `next-intl` |
| Auth | `next-auth` v5 |
| ORM | `prisma` |
| DB | PostgreSQL |
| Password | `bcryptjs` |
| Image hosting | Cloudinary (`next/image` + Cloudinary loader) |
| Forms | `react-hook-form` |
| Validation | `zod` |
| Toast | `sonner` |
| Date handling | `date-fns` |
| Icons | `lucide-react` |
| Admin file upload | `react-dropzone` |
| Drag to reorder | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Select/Combobox | `cmdk` or `shadcn/ui` Command |
| UI primitives | `shadcn/ui` (admin only — storefront is custom) |
| HTTP client | Native `fetch` (no axios needed) |
| Slug generation | `slugify` |

---

## 26. Folder Structure

```
/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx              # Product listing
│   │   │   └── [slug]/page.tsx       # Product detail
│   │   ├── search/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── order-confirmation/[ref]/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── promotions/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── orders/route.ts
│       ├── products/route.ts
│       ├── admin/
│       │   ├── products/route.ts
│       │   ├── orders/[id]/route.ts
│       │   ├── promotions/route.ts
│       │   └── settings/route.ts
│       └── upload/route.ts
├── components/
│   ├── storefront/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── FilterSidebar.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── ImageGallery.tsx
│   │   ├── VariantSelector.tsx
│   │   ├── StockBadge.tsx
│   │   ├── PromoBadge.tsx
│   │   └── AnnouncementBanner.tsx
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── ProductForm.tsx
│   │   ├── VariantTable.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── OrderTable.tsx
│   │   ├── PromotionForm.tsx
│   │   ├── DashboardStats.tsx
│   │   └── LowStockAlert.tsx
│   └── ui/                           # Shared primitives (shadcn/ui based)
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── auth.ts                       # next-auth config
│   ├── cloudinary.ts                 # Upload helper
│   ├── cart.ts                       # Cart logic (localStorage)
│   ├── promotions.ts                 # isPromotionActive helper
│   └── wilayas.ts                    # Array of 58 Algerian wilayas
├── messages/
│   ├── fr.json
│   └── ar.json
├── middleware.ts                     # Locale detection + admin route protection
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                       # Admin user + initial data seed
├── public/
│   └── fonts/                        # Self-hosted fonts
├── styles/
│   └── globals.css
├── tailwind.config.ts
└── next.config.ts
```

---

## 27. SEO

- `generateMetadata()` in each page file.
- Product pages: title = `{productName} - {brandName} | {storeName}`, description from ProductTranslation.
- Homepage: static SEO in FR and AR.
- `/sitemap.xml`: generated dynamically via Next.js route.
- `/robots.txt`: allow all except `/admin`.
- OG image: static store logo or Cloudinary OG image.
- Canonical URLs with locale prefix.
- `hreflang` alternate links in `<head>` for AR/FR pages.
- JSON-LD Product schema on product detail pages.

---

## 28. Accessibility

- All images have descriptive `alt` attributes (locale-appropriate).
- Color contrast: all text passes WCAG AA (gold on ivory tested — adjust if needed, `#C9A84C` on `#FAFAF7` = ~3.1:1, acceptable for large text; use `#A07830` for small text on ivory).
- Focus rings visible on all interactive elements (Tailwind `focus-visible:ring`).
- Form labels associated with inputs via `htmlFor`/`id`.
- Cart drawer uses `aria-modal="true"` and traps focus.
- Language switcher announces locale change to screen readers.
- Semantic HTML throughout: `<nav>`, `<main>`, `<header>`, `<footer>`, `<article>` for product cards.
- Keyboard navigable variant selector (arrow keys).

---

## 29. Security Considerations

- Admin routes protected by middleware session check.
- All admin API routes verify session server-side before any DB operation.
- Prisma parameterized queries — no raw SQL, no injection risk.
- Image uploads validated: MIME type, file size (max 5MB), extension whitelist (jpg, jpeg, png, webp).
- Order API: rate-limited via Next.js middleware (simple: check IP, max 10 orders/hour — implemented with in-memory store or `upstash/ratelimit` if Redis available).
- No sensitive data in localStorage (only product IDs, quantities, prices — prices re-validated server-side).
- HTTPS enforced (platform level).
- `Content-Security-Policy` header added via `next.config.ts` (allow Cloudinary image domain).
- Admin password never logged.

---

## 30. Error Handling

- **API errors:** All API routes return `{ error: string }` with appropriate HTTP status.
- **404:** Custom `not-found.tsx` page — elegant, on-brand, with "Retour à l'accueil" button.
- **500:** Custom `error.tsx` — minimal apology, no stack traces exposed.
- **Cart item unavailable:** Warning banner in cart if a variant is now out of stock. Item not automatically removed — customer decides.
- **Order submission failure:** Toast error. Form data preserved. Specific message for server vs validation errors.
- **Image upload failure:** Toast error. Retry button.
- **Admin form errors:** Inline per-field error messages via react-hook-form + zod.
- **Empty states:** Every list/grid has a designed empty state — not a blank page.

---

## 31. Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=<random 32-char secret>
NEXTAUTH_URL=https://yourdomain.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Admin seed (used only in seed script)
ADMIN_EMAIL=admin@yourstore.com
ADMIN_PASSWORD=<strong password>
```

---

## 32. Implementation Phases

**Phase 1 — Foundation (build first)**
1. Project scaffolding, Tailwind config, design tokens, fonts
2. Prisma schema + database connection
3. Seed script (admin user + sample data)
4. i18n setup (next-intl, middleware, translation files)
5. Admin login + session

**Phase 2 — Storefront Core**
6. Header + Footer + Navigation
7. Product listing page + Product card component
8. Filtering and sorting
9. Product detail page + image gallery + variant selector
10. Cart (localStorage + context + drawer)

**Phase 3 — Checkout & Orders**
11. Checkout form + validation
12. Order API route
13. Order confirmation page

**Phase 4 — Admin Dashboard**
14. Admin layout + sidebar
15. Dashboard stats widgets
16. Product CRUD + image upload
17. Variant management
18. Order management + status updates
19. Promotion management
20. Settings page

**Phase 5 — Polish & SEO**
21. Homepage hero + featured/new arrivals sections
22. Brand marquee + promotional banner section
23. Animations (Framer Motion)
24. Announcement banner
25. SEO metadata + sitemap
26. Mobile QA + RTL QA
27. Accessibility pass
28. Error pages

---

## 33. Future Enhancements (Out of Scope)

- WhatsApp checkout integration
- Customer order tracking via phone number lookup
- Email/SMS order notifications
- Product reviews and ratings
- Wishlist / favorites
- Advanced analytics
- Multi-currency
- Delivcery fee calculation by wilaya
- Inventory reorder alerts via email
- Barcode/QR scanning for admin stock updates
- Product bundles or gift sets
- Loyalty program

---

*End of specification. This document defines the complete scope. Lovable should not invent any feature, field, route, or behavior not described here. When a minor implementation detail is not specified, prefer the simplest standard approach consistent with the stack and design vision described above.*