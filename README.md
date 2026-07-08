<div align="center">

# ✦ RIVAAZ ✦

### Enduring Elegance — A Headless Luxury Indian Fashion Storefront

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![Shopify](https://img.shields.io/badge/Shopify-Storefront_API-7AB55C?logo=shopify)](https://shopify.dev/docs/api/storefront)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud_Storage-3FCF8E?logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel)](https://vercel.com/)

**[Live Demo →](https://sehajmvp.vercel.app)**

</div>

---

## Overview

**Rivaaz** is a fully headless luxury e-commerce storefront for premium Indian fashion — suits, shawls, sherwanis, and couture — built on **Next.js 16** with **Shopify's Storefront API** as the commerce backend. It features a signature dark glassmorphic design language, AI-powered virtual try-on via **Google Gemini**, and persistent cloud storage through **Supabase**.

The app is designed as a production-grade, high-performance storefront that connects to a real Shopify store and gracefully falls back to mock data when API credentials are missing.

---

## ✨ Key Features

### 🛍️ Commerce (Shopify Headless)
- **Full product catalog** — fetched live from Shopify's Storefront GraphQL API
- **Collection & product pages** with variant selection (color, size), image galleries, and dynamic pricing
- **Product recommendations** — powered by Shopify's `productRecommendations` query on every product page
- **Cart system** — full CRUD via Storefront API cart mutations (create, add, update, remove lines) with cookie-based persistence
- **Checkout redirect** — seamless handoff to Shopify's hosted checkout via `cart.checkoutUrl`
- **Multi-market / International pricing** — `@inContext(country)` directive injected into every GraphQL query; buyer country detected via Vercel geo headers or manual selection, stored in a cookie

### 🔍 Search & Discovery
- **Predictive search modal** — instant typeahead suggestions (products + collections) via Shopify's `predictiveSearch` query, with debounced input and keyboard navigation
- **Dedicated search page** (`/search`) — full-text product search with wildcard prefix matching and a sidebar of dynamic Shopify filters (price range, tags, availability)
- **Tag-based navigation** — New Arrivals, Bestsellers, Trending pages driven by Shopify product tags (`/tags/[tag]`), with automatic `#` prefix handling
- **Smart OR-based tag filtering** — selecting multiple tags uses query-string `OR` logic instead of Shopify's default `AND`, so results are additive

### 👗 AI Virtual Try-On (Gemini Vision)
- **Photo upload & management** — users upload up to 2 reference photos, stored persistently in Supabase Cloud Storage (with localStorage fallback for guests)
- **AI-powered try-on generation** — sends the user's photo + product image to Google Gemini's multimodal vision API, which composites the garment onto the user
- **Stylist consultation chat** — after a try-on, users can chat with an AI stylist (Gemini) for personalized advice on fabric care, occasion styling, jewelry pairings, and more
- **Gallery of saved looks** — try-on results are saved to a personal gallery in Supabase with full CRUD

### 👤 Customer Accounts
- **Shopify Customer Account API (OAuth 2.0 + PKCE)** — secure, headless authentication without exposing any admin credentials
- **Full profile dashboard** — order history, saved addresses (CRUD), profile editing, and saved try-on looks
- **Guest-to-user migration** — when a guest signs in, their locally saved photos and looks are automatically synced to their authenticated Supabase profile

### 🎨 Design
- **Dark glassmorphic bento layout** — every section uses frosted-glass panels (`backdrop-filter: blur`) with subtle borders and hover transitions
- **Playfair Display + Inter** typography pairing via `next/font/google`
- **Color variant swatches** — overlaid on product card thumbnails; hovering a swatch dynamically swaps the product image to that variant
- **Auto-cycling hero gallery** — top 5 products rotate every 5 seconds with crossfade transitions
- **Fully responsive** — mobile-first layouts across all pages

### 📊 Analytics
- **Shopify analytics integration** — page views, product views, and add-to-cart events sent to Shopify's Monorail analytics endpoint via `@shopify/hydrogen-react`

---

## 🏗️ Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── layout.js                 # Root layout (providers, navbar, footer, cart drawer)
│   ├── page.js                   # Homepage — hero + product grid
│   ├── globals.css               # Design tokens & glassmorphic utilities
│   ├── products/[handle]/        # Product detail page (SSR)
│   ├── collections/[handle]/     # Collection page with filters (SSR)
│   ├── collections/all/          # All products page
│   ├── search/                   # Dedicated search results page
│   ├── tags/[tag]/               # Tag-based product listing
│   ├── profile/                  # Customer dashboard (client-side)
│   ├── account/callback/         # Shopify OAuth callback handler
│   └── api/
│       ├── search/               # Predictive search API route
│       ├── try-on/               # Gemini vision try-on API route
│       ├── stylist-chat/         # Gemini stylist chat API route
│       ├── product/              # Product data API route
│       └── revalidate/           # ISR revalidation webhook
│
├── components/
│   ├── Analytics/                # Shopify analytics provider wrapper
│   ├── BrandEthos/               # Brand story section
│   ├── Cart/                     # Cart drawer (slide-out)
│   ├── CollectionFilters/        # Sidebar filter UI (price, tags, availability)
│   ├── Footer/                   # Site footer with newsletter
│   ├── Hero/                     # Auto-cycling hero with product gallery
│   ├── Navbar/                   # Glassmorphic navbar with search, cart, profile
│   ├── Product/                  # ProductClient + ProductDetail
│   ├── ProductCard/              # Product card with color swatches & try-on badge
│   ├── Search/                   # Search modal with typeahead
│   ├── StylistChat/              # AI stylist chat widget
│   └── TryOn/                    # Virtual try-on modal + saved look viewer
│
├── context/
│   ├── AuthContext.js            # Authentication state (Shopify OAuth + Google)
│   ├── CartContext.js            # Cart state & mutations
│   └── CountryContext.js         # Multi-market country selector
│
├── hooks/
│   └── useAnalytics.js           # Shopify analytics event hook
│
├── lib/
│   ├── shopify/
│   │   ├── config.js             # Store domain, tokens, feature flags
│   │   ├── client.js             # shopifyFetch — GraphQL client with @inContext
│   │   ├── queries.js            # All Storefront API queries
│   │   ├── mutations.js          # Cart mutations
│   │   ├── fragments.js          # Shared GraphQL fragments
│   │   ├── cart-actions.js       # Server actions for cart CRUD
│   │   ├── customer.js           # Storefront customer API helpers
│   │   ├── customer-account-oauth.js  # OAuth 2.0 + PKCE flow
│   │   ├── customer-account-queries.js # Customer Account API queries
│   │   ├── mockData.js           # Fallback mock products & collections
│   │   └── mockCart.js           # Fallback mock cart (cookie-based)
│   ├── supabase/
│   │   └── client.js             # Supabase browser client
│   └── tryon/
│       └── gallery-service.js    # Photo & gallery CRUD (Supabase + localStorage)
│
├── proxy.js                      # Middleware for geo-detection & country cookie
└── supabase_schema.sql           # Database migration for try-on tables
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (tested with 25.x)
- **npm** 9+
- A **Shopify** store with a [Storefront API access token](https://shopify.dev/docs/api/usage/authentication#access-tokens-for-the-storefront-api)
- *(Optional)* A **Google Gemini API key** for AI try-on & stylist chat
- *(Optional)* A **Supabase** project for persistent photo/gallery storage

### Installation

```bash
# Clone the repository
git clone https://github.com/nandan1717/sehajmvp.git
cd sehajmvp

# Install dependencies
npm install
```

### Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `SHOPIFY_STORE_DOMAIN` | ✅ | Your Shopify store domain (e.g. `your-store.myshopify.com`) |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | ✅ | Storefront API access token |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | ✅ | Same as above (client-side access) |
| `NEXT_PUBLIC_SHOPIFY_CLIENT_ID` | For auth | Shopify Customer Account API client ID |
| `NEXT_PUBLIC_SHOPIFY_SHOP_ID` | For auth | Numeric Shopify Shop ID |
| `NEXT_PUBLIC_APP_URL` | For auth | Your deployed app URL |
| `GEMINI_API_KEY` | For AI | Google Gemini API key |
| `NEXT_PUBLIC_SUPABASE_URL` | For storage | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For storage | Supabase anonymous key |

> **Note:** The app works without optional variables — AI features and cloud storage will simply be unavailable, and the storefront will use mock data if Shopify credentials are missing.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | JavaScript (ES Modules) |
| **Styling** | CSS Modules + Vanilla CSS (glassmorphic design system) |
| **Commerce** | Shopify Storefront API (GraphQL) |
| **Auth** | Shopify Customer Account API (OAuth 2.0 + PKCE) |
| **AI** | Google Gemini API (`@google/genai`) — multimodal vision + chat |
| **Storage** | Supabase (PostgreSQL + Storage) with localStorage fallback |
| **Analytics** | `@shopify/hydrogen-react` (Shopify Monorail) |
| **Fonts** | Playfair Display + Inter (Google Fonts via `next/font`) |
| **Deployment** | Vercel |

---

## 🌍 Multi-Market Support

Rivaaz supports international pricing through Shopify Markets:

- **Automatic geo-detection** via Vercel's `x-vercel-ip-country` header
- **Manual country selector** (India, US, Canada, UK, Australia, UAE, Singapore)
- **`@inContext` directive** automatically injected into all Storefront API queries
- **Cart buyer identity** updated when the user switches countries
- **Currency formatting** adapts to the selected region

---

## 🤖 AI Features

### Virtual Try-On
The try-on system uses Google Gemini's multimodal vision capabilities:
1. User uploads a reference photo of themselves
2. Selects a product and clicks "Try On"
3. The API route sends both images to Gemini with a specialized prompt
4. Gemini generates a composite image of the user wearing the garment
5. Results are saved to the user's gallery (Supabase or localStorage)

### AI Stylist Chat
After a try-on session, users can have a conversation with an AI stylist powered by Gemini. The stylist is contextually aware of:
- The specific product being viewed
- Indian textile knowledge (silk, georgette, zardozi, chikankari, etc.)
- Styling advice for occasions, jewelry, footwear, and more

---

## 📦 Shopify Setup

To connect your own Shopify store:

1. Create a [Custom App](https://shopify.dev/docs/apps/getting-started/create) in your Shopify admin
2. Enable **Storefront API** access with the following scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_customers`
   - `unauthenticated_write_customers`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_write_checkouts`
3. Copy the Storefront Access Token to your `.env.local`
4. *(For customer accounts)* Set up a [Customer Account API](https://shopify.dev/docs/api/customer) client and configure the OAuth redirect URI to `{YOUR_APP_URL}/account/callback`

### Product Tags
The navbar uses Shopify product tags to power dynamic navigation:
- Tag products with `new-arrivals` → appears on the **New Arrivals** page
- Tag products with `bestsellers` → appears on the **Bestsellers** page
- Tag products with `trending` → appears on the **Trending** page

---

## 🗄️ Supabase Setup (Optional)

If you want persistent cloud storage for try-on photos and gallery:

1. Create a [Supabase project](https://supabase.com/dashboard)
2. Run the migration in [`supabase_schema.sql`](./supabase_schema.sql) against your database
3. Add your Supabase URL and anon key to `.env.local`

The schema creates two tables with Row Level Security:
- `tryon_photos` — user reference photos (max 2 per user)
- `tryon_gallery` — saved AI try-on looks with product metadata

---

## 🚢 Deployment

The app is optimized for **Vercel**:

```bash
# Deploy to Vercel
npx vercel
```

Set all environment variables in Vercel's dashboard under **Settings → Environment Variables**.

The middleware (`proxy.js`) automatically detects the buyer's country from Vercel's geo headers for international pricing.

---

## 📄 License

Private project. All rights reserved.

---

<div align="center">

**Built with ♥ for Rivaaz**

*Enduring Elegance*

</div>
