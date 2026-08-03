# Routing

The route tree is declared in `src/routes/AppRouter.tsx`. All pages are
lazy-loaded; layouts are eager.

## Layouts & Guards

| Route group | Layout | Guard |
| --- | --- | --- |
| `/`, `/mentors` | `MainLayout` (marketing header/footer) | — |
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email` | `AuthLayout` (split screen) | `GuestGuard` (redirects to `/dashboard` when signed in) |
| `/dashboard`, `/profile`, `/community`, `/sessions`, `/wallet`, `/notifications`, `/settings`, `/mentor/dashboard` | `DashboardLayout` (sidebar + header) | `AuthGuard` |
| `/mentor/dashboard` | `DashboardLayout` | `RoleGuard` — `ROLE_MENTOR` |
| `/admin` | `AdminLayout` | `RoleGuard` — `ROLE_ADMIN` |
| `/unauthorized`, `*` | `ErrorLayout` | — |

## Guards

- **AuthGuard** — redirects to `/login` with `state.from` so users land back
  where they left off.
- **GuestGuard** — prevents authenticated users from visiting auth pages.
- **RoleGuard** — checks the user's roles; redirects to `/unauthorized`.

## Constants

All paths live in `src/constants/routes.ts` (`ROUTES`) — never hard-code paths.
Sidebar navigation is configured in `src/constants/navigation.tsx` and is
**role-aware** (each `NavItem` can declare `roles`), supports nested children and
auto-expands the section matching the active route.
