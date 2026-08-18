# Enterprise Admin Portal

The Skill Infinity Admin Portal is an enterprise-grade control plane for
platform administrators — inspired by Stripe Dashboard, Linear, Datadog and
Vercel. It exposes every operational surface of the platform behind a single
premium interface backed by the `admin-service` microservice.

## Modules

| Module | Route | Highlights |
| --- | --- | --- |
| Executive Dashboard | `/admin` | KPI grid, growth snapshot, revenue trend, user mix, platform health, quick actions, live activity feed |
| Platform Analytics | `/admin/analytics` | Revenue & user growth, traffic sources, session statistics, performance radar, learning heatmap, community engagement |
| User Management | `/admin/users` | Advanced table, role/status/spend filters, bulk actions, user profile drawer, suspend/activate/delete |
| Mentor Management | `/admin/mentors` | Approval queue with verification scores, all-mentors table, top mentors, approve/reject dialogs |
| Session Management | `/admin/sessions` | Live/upcoming/completed/cancelled/rescheduled, revenue & duration KPIs, session details drawer |
| Payments | `/admin/payments` | Transactions, refunds (approve/reject), subscriptions, coupons, revenue trend |
| Wallet Management | `/admin/wallet` | Credits issued/outstanding, rewards, bonuses, refunds, transaction ledger |
| Review Moderation | `/admin/reviews` | Review queue, reports, helpful votes, ratings distribution, approve/reject |
| Support Center | `/admin/support` | Ticket queue, priorities, assignment, reply composer, ticket timeline drawer |
| Announcements | `/admin/announcements` | Builder with target audience, scheduling, templates, broadcast |
| Reports | `/admin/reports` | Report catalog, generate + CSV/EXCEL/PDF export, schedule & health widgets |
| Platform Settings | `/admin/settings` | Category navigation, live editing with unsaved indicators, maintenance mode |
| Feature Flags | `/admin/feature-flags` | Enable/disable, rollout %, environment, description |
| Audit Logs | `/admin/audit-logs` | Timeline of privileged actions with category filters |
| System Monitoring | `/admin/monitoring` | Service status grid, CPU/memory/storage, response time, error rate, 30s polling |

## Folder Layout

```
src/
├── pages/admin/            # 16 route pages (lazy-loaded)
├── components/admin/       # Admin-only reusable components
│   ├── KpiCard.tsx         # Animated executive KPI with sparkline + delta
│   ├── ChartCard.tsx       # Framed chart panel with entrance animation
│   ├── AdvancedDataTable.tsx  # Search, sort, pagination, select, bulk, CSV export
│   ├── FilterDrawer.tsx    # Slide-in filter panel (chips, multi-select, ranges)
│   ├── UserDrawer.tsx      # User profile drawer (stats + timeline)
│   ├── ApprovalDialog.tsx  # Mentor approve/reject dialog
│   ├── AuditTimeline.tsx   # Vertical audit event timeline
│   ├── ActivityFeed.tsx    # Live admin activity feed
│   ├── DashboardWidget.tsx # Generic dashboard widget shell
│   ├── AnimatedProgress.tsx# Animated progress bar
│   ├── Sparkline.tsx       # Tiny inline chart
│   ├── RoleBadge.tsx       # Role → colored chip
│   ├── AdminSidebar.tsx    # Grouped premium sidebar
│   ├── AdminCommandPalette.tsx  # Ctrl+K command palette
│   └── AdminSkeleton.tsx   # Shimmer loading states
├── features/admin/         # Offline-first data layer
│   ├── data.ts             # Seed data mirroring admin-service DTOs
│   ├── queryKeys.ts        # React Query key factory
│   └── hooks.ts            # useQuery/useMutation hooks with optimistic updates
├── types/admin.ts          # Domain types mirroring backend DTOs
└── services/admin.service.ts  # axios calls to admin-service endpoints
```

## Data & Offline-First Strategy

Every hook prefers the live `admin-service` API through React Query and falls
back to curated seed data when the backend is unreachable:

```ts
const { dashboard, isLoading, isOffline } = useAdminDashboardQuery();
// dashboard = API result ?? seedDashboard, isOffline = request failed
```

- Queries are cached with sensible `staleTime`; monitoring and dashboard poll
  (60s / 30s `refetchInterval`).
- Mutations (user status, refunds, moderation, announcements, settings,
  feature flags, mentor approvals) apply **optimistic updates** to the query
  cache and the seed arrays, then reconcile with the server response.
- Pages render a `<StatusBadge>` / header note when `isOffline` so operators
  always know they are viewing cached data.

## API Surface

All endpoints live under `API_ENDPOINTS.ADMIN` in `src/constants/api.ts` and
are called by `adminService`. The service mirrors the `admin-service`
controller:

- `GET /admin/dashboard` — executive dashboard aggregate
- `GET /admin/analytics` — platform analytics
- `GET /admin/users` / `PATCH /admin/users/{id}/status`
- `GET /admin/mentors` / `POST /admin/mentors/{id}/approve` / `reject`
- `GET /admin/payments/analytics`, refunds management
- `GET /admin/support/tickets` / `POST .../tickets/{id}/reply`
- `GET /admin/settings`, `PATCH /admin/settings`
- `GET /admin/feature-flags`, `PATCH /admin/feature-flags`
- `GET /admin/audit-logs`
- Announcements create/read

## Design Language

- **Executive KPI cards** — gradient icon tiles, ambient corner glow, animated
  count-up (`AnimatedNumber`), delta chips, and sparklines.
- **Charts** — all built in-house on SVG + framer-motion (area, line, bar,
  stacked bar, donut, heatmap, radar, sparkline) so every chart animates in.
- **Micro-interactions** — card lift on hover, staggered entrance animations,
  animated progress, drawer/dialog transitions via `AnimatePresence`.
- **Command palette** — `Ctrl+K` opens navigation search over every admin
  module.
- **Loading** — shimmer skeletons replace spinners on every admin page.
- **Empty/error states** — premium empty states with helpful actions and
  offline notices.

## Testing

Admin tests live in `src/test/admin*.test.tsx` and cover:

- Executive dashboard widgets, KPIs, health, quick actions
- Analytics chart panels and KPIs
- User management (search, filters, drawer)
- Mentor management (approval queue, tabs, dialog)
- Payments (tabs, refunds, search)
- Settings (categories, live editing, unsaved state)
- Reports (catalog, schedule, generate + formats)
- Reusable components (KpiCard, RoleBadge, AnimatedProgress, ActivityFeed, …)

Run them with:

```bash
cd frontend
npx vitest run src/test/admin
```

## Routing & Guards

All admin routes are nested under the `ADMIN` path, lazy-loaded, and wrapped in
the `AdminLayout` (grouped sidebar + command palette). Routes are registered in
`src/routes/AppRouter.tsx`; path constants live in `src/constants/routes.ts`;
nav groups in `src/constants/navigation.tsx`.
