# State Management

## Redux Toolkit + Redux Persist

The store (`src/store/index.ts`) combines six slices and persists `auth`,
`theme` and `settings` to localStorage under the `skill-root` key.

| Slice | Purpose | Persisted |
| --- | --- | --- |
| `auth` | tokens, current user, status, error, rememberMe | ✅ (respects rememberMe) |
| `user` | profile + async profile thunks | ❌ |
| `theme` | `light` / `dark` / `system` | ✅ |
| `notifications` | in-app notifications + unread count | ❌ |
| `settings` | language, timezone, notification preferences | ✅ |
| `loading` | global request / page loading flags | ❌ |

### Typed hooks

```ts
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const unread = useAppSelector(selectUnreadCount);
const dispatch = useAppDispatch();
```

### Selectors

Memoization-friendly selectors live in `src/store/selectors/index.ts`
(e.g. `selectIsAuthenticated`, `selectHasRole(roles)`, `selectResolvedThemeMode`).

### Async thunks

Auth flows (`login`, `register`, `logout`, `fetchCurrentUser`) and user profile
flows use `createAsyncThunk` with a `{ rejectValue: string }` payload — errors
are normalized through `normalizeError()`.

### Auth lifecycle

1. `login`/`register` → thunk → `authService` → fulfilled applies credentials.
2. The store **subscribes** to auth changes and mirrors tokens into the
   `tokenManager` used by the axios interceptor.
3. On a 401, the axios client refreshes tokens (single-flight queue) and retries;
   on failure it dispatches `clearCredentials` and redirects to `/login?expired=true`.
4. On app load, redux-persist rehydrates the session (if `rememberMe` was on),
   restoring the user to the authenticated state.

## Server state (TanStack Query)

`QueryProvider` configures a `QueryClient` with `staleTime: 5m`, `retry: 1` and
`refetchOnWindowFocus: false`. Future feature data (mentors, sessions, wallet
transactions) should use `useQuery`/`useMutation`; Redux remains the home for
app-level UI/session state.

## Local state

- React Hook Form + Zod own all form state.
- `useLocalStorage`, `useToggle`, `useDebounce` cover ephemeral UI needs.
