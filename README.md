# Rivaaz — Headless Shopify Storefront

A Next.js headless ecommerce storefront for Indian wear, powered by the Shopify Storefront API.

## Features

- Product catalog (home, product detail, collections)
- Shopping cart with add/update/remove
- Shopify hosted checkout for payments (when configured)
- Mock data fallback for local development without Shopify credentials

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Shopify

1. Create a [Shopify store](https://www.shopify.com/) (or use an existing one).
2. In **Shopify Admin → Settings → Apps and sales channels → Develop apps**, create a custom app.
3. Configure **Storefront API** scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
4. Install the app and copy the **Storefront API access token**.
5. Publish products to the **Online Store** or **Headless** sales channel.

### 3. Environment variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpss_xxxxxxxxxxxxxxxx
```

> Without these variables, the store runs in **demo mode** with mock products. Cart works locally but checkout is disabled.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How checkout works

This is a headless storefront — payments are handled by **Shopify's hosted checkout**:

1. Customer adds items to cart
2. Clicks **Proceed to Checkout**
3. Redirects to `cart.checkoutUrl` (Shopify checkout page)
4. Shopify processes payment, shipping, and tax

No custom payment integration is required for standard use.

## Project structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # UI components (Navbar, Cart, Product, etc.)
├── context/                # Cart React context
└── lib/shopify/            # Storefront API client, queries, mutations, cart actions
```

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start development server |
| `npm run build`| Production build         |
| `npm run start`| Start production server  |
| `npm run lint` | Run ESLint               |

## Note on sehajmvp/

The `sehajmvp/` directory is a separate Shopify Admin app (merchant-side product management). It is not part of the customer storefront.
