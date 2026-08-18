# Theme & Design System

The design system lives in `src/theme/`:

| Module | Contents |
| --- | --- |
| `colors.ts` | Brand palette + gradients |
| `typography.ts` | Font stack & heading weights |
| `animations.ts` | Keyframes + transition curves |
| `theme.ts` | `createTheme` factory for light/dark + component overrides |

## Brand

- **Primary** — Indigo `#6D5DF6` (`#8E80FF` light, `#5443D4` dark)
- **Secondary** — Teal `#14B8A6`
- **Gradient** — `linear-gradient(135deg, #6D5DF6, #43C6C0)` (buttons, cards, hero)
- **Type** — Inter with tight display tracking (`-0.02em`…`-0.03em`)
- **Radius** — 12 (shape) / 16 (cards, paper) / 999 (pills)
- **Elevation** — 25-step soft shadow scale tuned per mode

## Modes

`light`, `dark` and `system` are supported and persisted in the Redux `theme`
slice (redux-persist). `system` resolves via `prefers-color-scheme` and reflects
`data-theme` on `<html>` for global CSS hooks.

### Using theme tokens in `sx`

```tsx
<Box sx={{ bgcolor: 'background.paper', color: 'text.primary', boxShadow: 6 }} />
<Box sx={{ background: (t) => t.custom.gradients.brand }} />
<Box sx={{ transition: (t) => t.custom.transition('spring') }} />
```

## Component Overrides

Global polish is applied through `theme.components`:

- **Button** — contained buttons get the brand gradient, soft shadow and a
  1px hover lift; rounded, uppercase-free, weight 600.
- **Cards / Paper** — radius 16, hairline border, smooth hover transitions.
- **Outlined inputs** — radius 12 with a soft focus ring (`0 0 0 4px` primary 15%).
- **Tabs** — pill indicator; **Chips** — pill radius; **Dialogs** — radius 20.
- **Table headers** — small, uppercase, letter-spaced.
- **Backdrop** — blurred; **Tooltip** — compact, rounded.

## Animations

CSS keyframes (`fadeIn`, `fadeInUp`, `scaleIn`, `float`, `shimmer`, …) are
exported from `src/theme/animations.ts` and used via Emotion `sx`. Framer Motion
is used for scroll-reveal and entrance choreography on marketing surfaces
(e.g. the landing page). `prefers-reduced-motion` is respected globally.
