# Architecture Guide

## Overview

Skill Infinity's frontend is a feature-first React 19 application that talks to a
Spring Cloud microservices backend through the API Gateway (`:8080`).

```
Browser
  │
  └── REST ──► Axios client ──► API Gateway ──► identity-service / user-service / …
                    │
                    ├── request interceptor  → attach `Bearer <accessToken>`
                    └── response interceptor → 401 → refresh queue → retry
```

## Layering & Rules

| Layer | Responsibility | May import |
| --- | --- | --- |
| `pages/` | Route components, composition, page state | features, components, hooks |
| `features/` | Feature modules (forms + schemas) | services, components, hooks |
| `components/` | Reusable UI (common / ui / feedback / form) | hooks, utils, theme |
| `hooks/` | Custom hooks | store, services, utils |
| `services/` | API calls per domain | api, types |
| `api/` | Axios client + token manager | config, constants, types |
| `store/` | Redux slices / selectors / typed hooks | services, types |
| `utils/` | Pure helpers | constants, types |
| `theme/` | Design system | — |
| `types/` | Shared TypeScript types | — |

Direction rule: `pages → features → components → services → api`. Nothing
imports upward.

## Key Decisions

### Axios with a single-flight refresh queue
- Access tokens are read from a small `tokenManager` (localStorage) — **no
  circular dependency** between the client and the store.
- On a 401 (non-auth endpoints), one request performs the refresh; concurrent
  requests queue and retry with the new token.
- The refresh call uses a bare `axios.post` so interceptors are never re-entered.
- On refresh failure: tokens cleared, `clearCredentials` dispatched, redirect to
  `/login?expired=true`.

### Redux for app state, TanStack Query for server state
- Redux persists `auth`, `theme` and `settings` via redux-persist.
- `Remember Me` is honored: when disabled, the auth slice is never persisted.
- TanStack Query is configured with sane defaults (staleTime 5 min, retry 1,
  no window-focus refetch) for future server-data features.

### Route-level code splitting
Every page is loaded with `React.lazy` + `Suspense`, producing per-page chunks.

## Security Notes

- **JWT storage** — access & refresh tokens live in `localStorage` (via the
  `tokenManager`). This is the standard SPA tradeoff: it keeps the app
  stateless and simple, but tokens are readable by any injected script. If a
  stricter posture is needed later, move to `httpOnly` cookies with CSRF
  protection (the refresh flow would then drop the manual refresh call).
- **Redirects** — session expiry always redirects to the constant `/login`
  path; no user input is ever used in a redirect target.

### MUI v9 compatibility layer
MUI v9 removed several shorthand props (`Typography.fontWeight`,
`Stack.alignItems`, `ListItemText.primaryTypographyProps`, …). The project ships
thin wrappers (`@/components/ui/Typography`, `@/components/ui/Stack`) that restore
the ergonomic API and forward the values into `sx`, so business pages stay clean.

## Adding a New Page (Day 12+)

1. Create `src/pages/MyPage.tsx` with a named export.
2. Register the route in `src/routes/AppRouter.tsx` inside the right layout +
   guard (lazy load it).
3. Add the path constant to `src/constants/routes.ts`.
4. Add the sidebar entry to `src/constants/navigation.tsx` (with `roles` if needed).
5. Domain API calls go in `src/services/*.service.ts`.
