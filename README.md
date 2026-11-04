# `@defx/storefront-core`

The official TypeScript SDK and shared core logic for Defx multi-store ecommerce storefronts.

[![npm version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://www.npmjs.com/package/@defx/storefront-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

---

## Features

- 🛒 **Headless Ecommerce State**: Reactive hooks for carts, line items, user addresses, currencies, and variant options (`useCart`, `useAddToCart`, `useVariantSelection`).
- ⚡ **Server-Ready API Helpers**: Framework-agnostic async actions for products, carts, orders, and taxes (`@defx/storefront-core/actions`).
- 🔐 **Dual Authentication System**:
  - **Own Phone OTP Auth (`useOtpStoreAuth`)**: Direct Defx `/api/login` and `/api/verify` flow with JWT cookie management and auto profile hydration.
  - **Clerk Auth (`useClerkStoreAuth`, `<ClerkStoreProvider>`)**: Full session exchange against Defx backend with zero boilerplate per storefront project.
- 💳 **Plug-and-Play Payment Gateways**: Modular payment gateway registry supporting **Stripe** (`@defx/storefront-core/stripe`), **PhonePe** (`@defx/storefront-core/phonepe`), and **Razorpay**, plus **`usePaymentGateway()`** for automatic detection.
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
# Optional based on feature usage:
yarn add @clerk/nextjs @stripe/stripe-js @stripe/react-stripe-js posthog-js js-cookie lucide-react
```

---

## Authentication Setup

### Strategy A: Own Phone OTP Authentication (Recommended for Indian Storefronts)
Connects directly with your Defx backend OTP service:

```tsx
import { CoreProvider, useOtpStoreAuth } from "@defx/storefront-core";

export function Providers({ children }) {
  const auth = useOtpStoreAuth();

  return (
    <CoreProvider
      config={{
        storeId: process.env.NEXT_PUBLIC_ORGANIZATION_ID,
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        authType: "own",
      }}
      auth={auth}
    >
      {children}
    </CoreProvider>
  );
}
```

### Strategy B: Clerk Authentication
Pre-wired session exchange with zero duplicate glue code:

```tsx
import { ClerkStoreProvider } from "@defx/storefront-core";

export function Providers({ children }) {
  return (
    <ClerkStoreProvider
      config={{
        storeId: process.env.NEXT_PUBLIC_ORGANIZATION_ID,
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
      }}
    >
      {children}
    </ClerkStoreProvider>
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
  ClerkStoreProvider,
  useCart, 
  useAddToCart, 
  useAuth,
  useOtpStoreAuth,
  useClerkStoreAuth,
  usePaymentGateway,
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
  getCartAction,
  loginUser,
  verifyOtp
} from "@defx/storefront-core/actions";

export default async function ProductPage({ params }) {
  const product = await getProductByIdAction(params.id);
  return <div>{product.name}</div>;
}
```

### 3. Payment Gateway Plugins & Detection
Import payment modules to register gateways via side-effects or use automatic detection:

```tsx
import { usePaymentGateway } from "@defx/storefront-core";

export function CheckoutButton() {
  const { gatewayLabel, isPhonePe, isRazorpay, isStripe } = usePaymentGateway();
  return <button>Pay via {gatewayLabel}</button>;
}
```

---

## Available Hooks

| Hook | Description |
|---|---|
| `useCore()` | Access global context state (`cart`, `config`, `auth`, `region`, `adapter`). |
| `useCart()` | Read and mutate the active cart state. |
| `useAddToCart()` | Complete cart mutation lifecycle (`handleAddToCart`, `handleDecreaseQty`, `handleDeleteLineItem`, selling units). |
| `useAuth()` | Read authentication state, current user, tokens, and modal triggers. |
| `useOtpStoreAuth()` | Built-in Defx backend Phone OTP authentication lifecycle. |
| `useClerkStoreAuth()` | Clerk session synchronization with Defx backend token exchange. |
| `usePaymentGateway()` | Automatically resolves the active payment gateway from organization metadata. |
| `useCurrencyFormat()` | Region and locale-aware money formatting (`₹`). |
| `useVariantSelection(product)` | Derive selected variants, inventory availability, swatches, and images. |
| `useAddresses()` | Access user addresses and address mutations. |
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
