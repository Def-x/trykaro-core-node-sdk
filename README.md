# `@defx/storefront-core`

The official TypeScript SDK and shared core logic for Defx multi-store ecommerce storefronts.

[![npm version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://www.npmjs.com/package/@defx/storefront-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

---

## Features

- 🛒 **Headless Ecommerce State**: Reactive hooks for carts, line items, user addresses, currencies, and variant options (`useCart`, `useAddToCart`, `useVariantSelection`).
- ⚡ **Server-Ready API Helpers**: Framework-agnostic async actions for products, carts, orders, and taxes (`@defx/storefront-core/actions`).
- 💳 **Plug-and-Play Payment Gateways**: Modular payment gateway registry supporting **Stripe** (`@defx/storefront-core/stripe`), **PhonePe** (`@defx/storefront-core/phonepe`), and **Razorpay**.
- 📊 **Tree-shakeable Telemetry & Analytics**: Isolated sub-bundles for **GA4 / Google Tag Manager**, **Meta Pixel**, and **PostHog**.
- 🛡️ **Full Type Safety**: Complete `.d.ts` definitions for every public method, domain entity, and prop contract.

---

## Installation

```bash
yarn add @defx/storefront-core
```

### Peer Dependencies
Install the required and optional peer dependencies based on the features you use:

```bash
yarn add react react-dom lodash
# Optional / gateway-specific:
yarn add @stripe/stripe-js @stripe/react-stripe-js posthog-js js-cookie lucide-react
```

---

## Quickstart

### 1. Setup `<CoreProvider>`
Wrap your application root or client provider tree with `CoreProvider`:

```tsx
import React from "react";
import { CoreProvider } from "@defx/storefront-core";
import type { FrameworkAdapter } from "@defx/storefront-core";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

// Optional adapter for Next.js server cookie reading & ISR revalidation
const nextjsAdapter: FrameworkAdapter = {
  getServerToken: async () => {
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value ?? null;
  },
  revalidateTag: async (tag: string) => {
    revalidateTag(tag);
  },
};

export function AppProviders({ children, orgData }) {
  return (
    <CoreProvider
      adapter={nextjsAdapter}
      config={{
        storeId: process.env.NEXT_PUBLIC_ORGANIZATION_ID,
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        currency: "INR",
        locale: "en-IN",
      }}
      orgData={orgData}
    >
      {children}
    </CoreProvider>
  );
}
```

---

## Subpath Imports

The SDK is organized into tree-shakeable entry points:

### 1. Root Bundle (`@defx/storefront-core`)
Provides the core context provider, custom hooks, and pre-built storefront components:
```tsx
import { 
  CoreProvider, 
  useCart, 
  useAddToCart, 
  useCurrencyFormat, 
  useVariantSelection,
  ViewCart,
  CartPage 
} from "@defx/storefront-core";
```

### 2. Actions Sub-bundle (`@defx/storefront-core/actions`)
Contains pure async fetch helpers. Completely safe to run in Server Components, Route Handlers, or Node.js background jobs:
```tsx
import { 
  getProductsAction, 
  getProductByIdAction, 
  getCartAction 
} from "@defx/storefront-core/actions";

export default async function ProductPage({ params }) {
  const product = await getProductByIdAction(params.id);
  return <div>{product.name}</div>;
}
```

### 3. Payment Gateway Plugins
Import payment modules in your app layout or providers to register gateways via side-effects:

#### Stripe:
```tsx
// Enables Stripe payment element in checkout
import "@defx/storefront-core/stripe";
```

#### PhonePe:
```tsx
// Enables PhonePe checkout redirect flow
import { registerPhonePeGateway } from "@defx/storefront-core/phonepe";
```

### 4. Tree-Shakeable Analytics Sub-bundles
Import analytics utilities without pulling the entire UI bundle:
```tsx
import { trackAddToCart, trackPurchase } from "@defx/storefront-core/analytics/gtm";
import { trackMetaAddToCart } from "@defx/storefront-core/analytics/meta";
import { devLogger, initDeveloperPostHog } from "@defx/storefront-core/analytics/posthog";
```

---

## Available Hooks

| Hook | Description |
|---|---|
| `useCore()` | Access global context state (`cart`, `config`, `auth`, `region`, `adapter`). |
| `useCart()` | Read and mutate the active cart state. |
| `useAddToCart()` | Complete cart mutation lifecycle (`handleAddToCart`, `handleDecreaseQty`, `handleDeleteLineItem`, selling units). |
| `useCurrencyFormat()` | Region and locale-aware money formatting. |
| `useVariantSelection(product)` | Derive selected variants, inventory availability, swatches, and images. |
| `useAddresses()` | Access user addresses and address mutations. |
| `useAuth()` | Read authentication state, current user, and tokens. |
| `useLogout()` | Safe multi-platform logout handler. |

---

## Development & Testing

```bash
# Build the SDK (ESM + .d.ts)
yarn build

# Watch mode during development
yarn dev

# Run Vitest unit tests
yarn test

# Type-check TypeScript sources
yarn type-check
```

---

## License

Proprietary © Defx E-Commerce Technologies.
