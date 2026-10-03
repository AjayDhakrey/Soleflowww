# MASTER PROMPT — Text Must Stay Inside Boxes at Any Zoom (ShoeConnect / SoleFlow)

> Paste everything below into your AI coding tool with the project open.

---

You are a senior front-end engineer (React + Tailwind). Fix text overflowing its cards/boxes when the browser is zoomed in (125%–200%) or the window is narrow, **across the whole project**, and keep all text clearly readable from 50% to 200% zoom.

## Hard rules
1. **Only ADD code. Never delete existing code.** Prefer adding/overriding Tailwind classes and adding shared components/utilities. Mark replaced class strings `// DEPRECATED:` in a comment if you swap a whole block.
2. Keep the current clean, minimal, icon-led look (see `LOVABLE_CLEAN_UI_PROMPT.md`, `TYPOGRAPHY_PROMPT.md`). No redesign — only layout robustness and readability.
3. Never hide important values. Numbers/amounts must always be fully visible; only secondary labels may be shortened with an ellipsis + tooltip.

## The bug (example: Orders KPI cards — "4 Batches", "₹19.56L")
At 150%+ zoom the big value and the word "Batches" spill outside the card, and labels collapse to "Tot…", "In …", "Re…".
Root causes found in `components/orders/OrdersKpiCards.tsx` (same pattern exists in all `*KpiCards.tsx`):
- `truncate` is put on a **flex** container (`<p className="... truncate flex items-baseline gap-1.5">`) — `text-overflow: ellipsis` does nothing on a flex box, so its children overflow.
- Big fixed font sizes (`text-2xl`, `text-3xl`, `text-[54px]` …) don't shrink with card width.
- Fixed-size icon (`w-14 h-14 sm:w-16 sm:h-16 shrink-0`) + header row with arrow button eat the width; at zoom the text column gets ~60px.
- Grid jumps to 4 columns at `xl` based on the viewport, not on the card's own width.

## STEP 1 — Global foundations (`frontend/src/index.css`, `index.html`)
- `index.html` viewport: `<meta name="viewport" content="width=device-width, initial-scale=1">` (no `maximum-scale`, no `user-scalable=no` — users must be able to zoom).
- Add to `index.css`:
  ```css
  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
  *, *::before, *::after { min-width: 0; }            /* flex/grid children can shrink */
  body { overflow-x: hidden; }
  .text-fluid-kpi   { font-size: clamp(1.125rem, 0.9rem + 1.2cqi, 1.75rem); line-height: 1.15; }
  .text-fluid-title { font-size: clamp(1rem, 0.9rem + 0.6cqi, 1.375rem); line-height: 1.25; }
  .text-fluid-label { font-size: clamp(0.75rem, 0.7rem + 0.25cqi, 0.8125rem); line-height: 1.3; }
  .wrap-anywhere { overflow-wrap: anywhere; word-break: break-word; }
  .card-cq { container-type: inline-size; }
  ```
- Minimum readable sizes: **no text below 11px** anywhere. Replace usages of `text-[9px]` / `text-[10px]` with `text-[11px]` (add the new class next to old; old marked deprecated). Body text ≥ 13px, secondary ≥ 11px, KPI value ≥ 18px.
- Use `rem`-based sizes only (Tailwind defaults) — no `px` font sizes in inline styles, so browser zoom and OS font-size both scale.

## STEP 2 — One robust KPI card (`components/ui/KpiCard.tsx`)
Create/extend a shared `KpiCard` (keep the old API working) with this structure:
```tsx
<div className="card-cq rounded-2xl p-4 flex flex-col @[220px]:flex-row items-start @[220px]:items-center gap-3 overflow-hidden min-w-0">
  <Icon className="w-10 h-10 @[260px]:w-14 @[260px]:h-14 shrink-0" />
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between gap-2 min-w-0">
      <span className="text-fluid-label font-medium truncate" title={label}>{label}</span>
      {onClick && <ChevronButton className="shrink-0" />}
    </div>
    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0 min-w-0">
      <span className="text-fluid-kpi font-bold tabular-nums whitespace-nowrap">{value}</span>
      {unit && <span className="text-sm font-semibold whitespace-nowrap">{unit}</span>}
    </div>
    {hint && <p className="text-fluid-label text-muted line-clamp-2 wrap-anywhere" title={hint}>{hint}</p>}
  </div>
</div>
```
Rules it encodes:
- `truncate` only on **block/inline-block single-line text**, never on a flex container.
- Value + unit use `flex-wrap` so "Batches" drops to the next line instead of overflowing.
- Labels: `truncate` + `title` tooltip. Hints: `line-clamp-2`.
- Container queries make the card adapt to **its own width**, so zoom works. This project uses **Tailwind v4** — container queries are built in: put `@container` on the card (instead of / in addition to `.card-cq`) and use `@[220px]:` / `@min-[260px]:` variants. No plugin needed.
- Big money values: format compactly (₹19.56L, ₹1.2Cr) via `utils/formatters.ts`; full value in `title` tooltip.


## STEP 3 — Apply everywhere
Migrate every KPI/stat card to the shared `KpiCard` (or apply the same rules in place):
`components/*/*KpiCards.tsx` (Orders, Customers, CustomerProfile, Designs, Manufacturers, Notifications, Payments, Reports, Collections, FollowUps, SalesTeam, Visits, Admin Audit, Dashboard Overview), `pages/admin/AdminDashboard.tsx`, `pages/sales/SalesDashboard.tsx`, `pages/customers/insights/*`, `pages/reports/ReportsPage.tsx`, `pages/manufacturers/ManufacturersPage.tsx`, `components/demo/DemoWalkthroughModal.tsx`, `pages/landing/*`.

KPI grids: replace viewport-only column jumps with auto-fit:
`grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-4` — cards wrap to fewer columns automatically when zoomed.

Then sweep the rest of the UI with these checks (search the codebase):
| Pattern to find | Fix |
|---|---|
| `truncate` on an element that also has `flex` / `inline-flex` / `grid` | move `truncate` to the inner text `<span>` and add `min-w-0` to it and its flex parent |
| flex row with text child but no `min-w-0` | add `min-w-0` to the text child and `shrink-0` to icons/buttons |
| `whitespace-nowrap` on long text (names, addresses, descriptions) | `truncate` + `title`, or `line-clamp-2` |
| `text-3xl`/`4xl`/`5xl`/`text-[54px]` inside cards | `text-fluid-kpi` / `text-fluid-title` |
| fixed widths `w-[NNNpx]`, `min-w-[NNNpx]` on text containers | `max-w-full`, `w-full`, or `minmax()` grid |
| tables | wrap in `overflow-x-auto`, add `whitespace-nowrap` only on numeric/date cells, `max-w-[16rem] truncate` on long text cells |
| badges/chips/tags | `max-w-full truncate` + `title` |
| buttons with icon + label | `inline-flex min-w-0` and label `truncate`; icon `shrink-0` |
| modals/drawers | `max-h-[90dvh] overflow-y-auto`, `w-[min(100%-2rem,48rem)]` |
| Sidebar/Header | labels `truncate`; header actions collapse into a menu below 1024px container width |

## STEP 4 — Test
1. Playwright `frontend/e2e/zoom-overflow.spec.ts`: for every main route (Dashboard, Customers, Customer detail, Orders, Designs, Manufacturers, Payments, Collections, Sales Team, Visits, Follow-ups, Discounts, Notifications, Reports, Audit Log, Settings, Login), at viewport widths 1440, 1024, 768, 390 and with `document.documentElement.style.zoom` = 1, 1.5, 2:
   - assert no element whose `scrollWidth > clientWidth + 1` **and** has visible overflow (i.e. not `overflow:hidden/auto` and not an ellipsis element) inside cards (`[class*="rounded-2xl"]`, `[class*="rounded-xl"]`);
   - assert `document.documentElement.scrollWidth <= window.innerWidth` (no horizontal page scroll);
   - assert computed font-size of all visible text ≥ 11px;
   - save screenshots to `docs/zoom-screens/<route>-<width>-<zoom>.png`.
2. Manual: Chrome zoom 50%, 100%, 150%, 200% and Windows display scaling 125%/150% on Dashboard + Orders — every card's text is inside its box and readable.
3. `npx tsc --noEmit -p frontend` → 0 errors.
4. Write `docs/ZOOM_FIX_REPORT.md`: files changed, before/after screenshots of the Orders KPI row at 150% and 200%.
