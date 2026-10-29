# Changelog

All notable changes to `@defx/storefront-core` are documented here.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] — 2026-10-28

### 🚀 Breaking Changes

- **TypeScript-first SDK**: All source files converted from `.js` / `.jsx` to `.ts` / `.tsx`. Full `.d.ts` declaration files are now emitted in the `dist/` folder.
- **`posthog-js` externalised**: Previously bundled via `noExternal`, now a peer dependency. Consumers that use PostHog telemetry must add `posthog-js` as a direct dependency.
- **`js-cookie` externalised**: Now a peer dependency (optional). Consumers using `useLogout` with cookie cleanup must add `js-cookie` as a direct dependency.
- **Analytics sub-bundles**: GTM, Meta Pixel, and PostHog helpers are available as dedicated tree-shakeable sub-bundles:
  - `@defx/storefront-core/analytics/gtm`
  - `@defx/storefront-core/analytics/meta`
  - `@defx/storefront-core/analytics/posthog`
  - Old imports from the root `@defx/storefront-core` still work via re-exports.
- **`"use client"` banner removed from all bundles**: The `actions` bundle no longer has `"use client"` — it is now correctly server-compatible without the directive. Per-file `"use client"` directives are present only on client-only component and hook files.
- **`Hello` component removed from public API**: The debug `Hello` component is no longer exported from the root index.

### ✨ New Features

- **Full TypeScript types**: All public APIs are fully typed. Import types via:
  ```ts
  import type { StorefrontConfig, AuthState, StorefrontActions, FrameworkAdapter } from "@defx/storefront-core";
  ```
- **`FrameworkAdapter` interface**: New optional `adapter` prop on `CoreProvider` for injecting framework-specific server utilities (Next.js `cookies()`, `revalidateTag()`, etc.).
- **`src/types/` directory**: Public type contracts for Cart, Auth, Config, Actions, Analytics, and Adapters.
- **`src/utils/request.ts`**: Shared, consolidated request utilities (`buildHeaders`, `requestJson`, `buildQueryString`, etc.) — eliminates the duplicate `buildHeaders` that existed in both action files.
- **Vitest test infrastructure**: `vitest.config.ts` added. Run tests with `yarn test`.
- **Changesets**: Release management via `@changesets/cli`. Run `yarn changeset` to create a changeset.
- **`sideEffects` field**: `stripe.js` and `phonepe.js` are declared as side-effect modules, ensuring bundlers never tree-shake them.

### 🔧 Internal Changes

- `tsup.config.js` → `tsup.config.ts` with `dts: true`
- `tsconfig.json`: Added `allowJs`, `declaration`, `declarationDir`, `jsx: react-jsx`
- `gateways/registry.js` → `gateways/registry.ts` with proper React types
- Analytics re-export barrel files added in `src/analytics/`

### 📦 Migration Guide (`sbs-store-frontend`)

See the [SDK Conversion Plan](./docs/sdk-plan.md) for full migration steps. Key changes:

1. Update dependency: `"@defx/storefront-core": "^2.0.0"`
2. Add peer deps: `yarn add posthog-js js-cookie`
3. Pass `apiBaseUrl` and `storeId` explicitly in `<CoreProvider config={...}>`
4. Create a `nextjsAdapter` and pass it as the `adapter` prop
5. Update analytics imports to sub-bundle paths (optional — old paths still work)

---

## [1.2.3-beta.4] — 2026-10-01

Initial beta release with:
- `CoreProvider` context with dependency-injected actions, auth, and toast
- React hooks: `useCart`, `useAddToCart`, `useAuth`, `useLogout`, `useCurrencyFormat`, `useVariantSelection`, `useAddresses`, `useCartInfo`, `useLikedProducts`
- Cart, Account, Auth, Order, UI components
- GTM / GA4, Meta Pixel, PostHog analytics
- Stripe and PhonePe payment gateway plug-ins
- Third-party script injection (ContentSquare, Hotjar, Microsoft Clarity)

