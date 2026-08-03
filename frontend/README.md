# Skill Infinity — Frontend

Enterprise-grade React frontend for the Skill Infinity platform — "Where Knowledge Creates Value".

## Tech Stack

| Layer | Technology |
| --- | --- |
| UI | React 19, TypeScript (strict), Vite 8 |
| Design System | Material UI (MUI) v9, Emotion, Framer Motion |
| State | Redux Toolkit, Redux Persist |
| Server State | TanStack Query |
| Forms | React Hook Form + Zod 4 |
| HTTP | Axios (interceptors, refresh queue, retry) |
| Real-time | Socket.IO client (architecture-ready) |
| Utilities | Day.js, React Hot Toast, React Icons |
| Quality | Oxlint, Prettier, Vitest, Testing Library |

## Getting Started

```bash
npm install
npm run dev          # http://localhost:3000
```

### Scripts

```bash
npm run dev          # Vite dev server (proxies /api → gateway :8080, /socket.io → :8090)
npm run build        # Type-check + production build
npm run preview      # Preview the production build
npm run lint         # Oxlint
npm run test         # Vitest (single run)
npm run test:watch   # Vitest (watch)
npm run typecheck    # tsc -b
npm run format       # Prettier
```

## Environment

Copy nothing — sensible defaults are provided:

- `.env.development` — API gateway at `http://localhost:8080/api/v1`, Socket.IO at `:8090`
- `.env.production` — relative `/api/v1` (proxied via nginx) + production WebSocket URL

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL for all REST calls |
| `VITE_WS_URL` / `VITE_SOCKET_URL` | Socket.IO endpoint |
| `VITE_API_TIMEOUT` | Request timeout (ms) |
| `VITE_APP_ENV` / `VITE_APP_NAME` / `VITE_APP_VERSION` | Metadata |

## Project Structure

```
src/
  api/          Axios client, token manager, interceptors & refresh queue
  components/   common/ (header, sidebar, footer…), ui/, feedback/, form/
  config/       Runtime environment configuration
  constants/    Routes, endpoints, roles, storage keys, navigation
  contexts/     Theme context (light / dark / system)
  features/     Feature-first modules (auth forms + zod schemas)
  guards/       AuthGuard, GuestGuard, RoleGuard
  hooks/        useApi, useAuth, useDebounce, useLocalStorage, …
  layouts/      Main, Public, Dashboard, Admin, Auth, Error
  pages/        Route-level pages (lazy loaded)
  providers/    Store, Query, composed AppProviders
  routes/       AppRouter with lazy routes + guards
  services/     Domain API services (auth, user)
  socket/       Socket.IO preparation layer
  store/        Redux slices, selectors, typed hooks, persistence
  styles/       Global CSS
  theme/        Design system (colors, typography, components, animations)
  types/        Shared TypeScript types (API, auth, user, common)
  utils/        storage, formatters, validators, error handling, toasts
```

## Documentation

- [Architecture Guide](docs/architecture.md)
- [Theme & Design System](docs/theme.md)
- [Routing](docs/routing.md)
- [State Management](docs/state-management.md)

## Authentication

The identity-service contract is fully mirrored:

- `POST /auth/login` → `{ email, password }` → `AuthResponse`
- `POST /auth/register`, `POST /auth/refresh`, `POST /auth/logout`
- `POST /auth/forgot-password?email=`, `POST /auth/reset-password?token=&newPassword=`
- Roles: `ROLE_LEARNER`, `ROLE_MENTOR`, `ROLE_ADMIN`

JWT handling: access token attached via request interceptor; a single-flight
refresh queue retries queued requests after a 401; failed refresh clears the
session and redirects to `/login?expired=true`. Session persistence respects
the **Remember Me** toggle (nothing is persisted when disabled).
