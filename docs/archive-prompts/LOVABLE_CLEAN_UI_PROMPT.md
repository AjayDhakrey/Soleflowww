# Lovable Master Prompt — Clean UI (reference style) for SoleFlow

This replaces LOVABLE_UI_PROMPT.md. Use this one.

How to use:
1. In Lovable, paste **Part A** into Project Settings → **Knowledge** (or send it as your first message).
2. Attach your 3 reference screenshots to the **first** prompt in Part B. Screenshots are for style only.
3. Send the Part B prompts **one at a time**. Check the preview after each one.
4. Review every screen with Part C.

---

## PART A — Design rules (paste into Knowledge)

```
ROLE
You are a senior product designer + front-end engineer. Restyle the SoleFlow app (Shoe Trade CRM: clients, designs, orders, manufacturers, payments, sales team; Trader/Admin and Salesman roles) into a clean, light, professional admin UI that matches the attached reference screenshots.

THE SCREENSHOTS ARE STYLE REFERENCE ONLY
- Copy their look: layout, spacing, colors, card style, icons, typography, tables, badges, empty states.
- Do NOT copy their content. Never add school, students, admissions, staff, payroll, fees, "EduNex", or any text from the screenshots.

CONTENT MUST STAY THE SAME
- Keep every existing page, heading, label, KPI, table column, button, filter, modal, form field, data value, and piece of text exactly as it is in my project. Only move it into the new visual structure.
- Do not invent new copy, features, KPIs, or columns. The only new text allowed: breadcrumbs made from existing page names, and sidebar group labels made from existing nav items.
- Do NOT change logic: data fetching, Supabase calls, AppContext, state, handlers, routes, props, types, validation, permissions. Every action must still work exactly as before.
- Do not rename exported components or files. Do not add libraries (use existing Tailwind + lucide-react).

FONT & TYPE
- Font: "Plus Jakarta Sans" (already used in the project), fallback Inter/system.
- Page title: 30–32px, weight 700, slate-900, tight tracking.
- Page subtitle (only where the page already has description text): 16px, weight 400, slate-500, max one line on desktop.
- Card/section title: 18–20px, weight 700. Body: 15px. Secondary text: 14px slate-500.
- Sidebar group labels: 12px, weight 600, UPPERCASE, letter-spacing 0.08em, slate-500.
- Numbers use tabular-nums. KPI values 28px weight 700.
- Never use font-black or font-extrabold.

COLORS (light theme)
- Page background: #F8FAFC (slate-50). Surfaces (sidebar, cards, panels, inputs): #FFFFFF.
- Borders: #E2E8F0 (slate-200), 1px. Dividers inside tables: #EEF2F6.
- Text: #0F172A primary, #475569 secondary, #64748B muted.
- Primary: soft blue #4F8EF7 (hover #3B7BEA), used for primary button, active nav, links, focus rings.
- Pastel icon-bubble backgrounds + icon colors:
    blue   bg #EEF4FF  icon #3B82F6
    green  bg #E8F7EE  icon #16A34A
    red    bg #FDECEC  icon #EF4444
    amber  bg #FEF6E4  icon #D97706
    violet bg #F3EEFF  icon #7C3AED (designs/catalogue)
- Status badges (pill, tinted bg, no border, 14px weight 500):
    Info/Ready/Active → blue-50 bg, blue-600 text
    Success/Paid/Delivered/Converted → green-50 bg, green-700 text, with a small leading dot
    Pending/Review/On hold → amber-50 bg, amber-700 text
    Overdue/Failed/Cancelled → red-50 bg, red-600 text
    Draft/Archived/Inactive → slate-100 bg, slate-600 text
- No gradients, no glassmorphism/backdrop-blur, no glow, no colored shadows, no emoji.
- Dark mode: keep it working; mirror the same structure with slate-950 background, slate-900 surfaces, slate-800 borders, and 15%-opacity versions of the pastel bubbles.

SHAPE, SPACING, SHADOW
- Radius: 12px for inputs, buttons, nav items, chips; 16–20px for cards and panels; full for avatars, icon bubbles, and pill badges.
- Spacing: 8px grid. Page padding 32px desktop, 16px mobile. 20–24px gap between cards. Card padding 24px.
- Shadows: almost none. Cards use the 1px border plus at most `0 1px 2px rgba(15,23,42,0.04)`. Dropdowns/modals: one soft shadow.
- Motion: 150ms ease on hover/focus only. No bouncing, scaling, floating, or entrance animations.

ICONS
- lucide-react only, outline, stroke 1.75. 20px in sidebar/buttons/inputs, 24px inside KPI bubbles.
- One concept = one icon everywhere. Define in src/lib/icons.ts:
  Dashboard LayoutDashboard · Clients Users · Client Store · Designs Footprints · Orders ShoppingBag · Items Package · Manufacturers Factory · Sales team UserRound · Payments IndianRupee · Receivables/Outstanding Wallet · Collections HandCoins · Follow-ups CalendarClock · Visits MapPin · Reports BarChart3 · Notifications Bell · Audit log History · Settings Settings · Search Search · Share Share2 · WhatsApp MessageCircle · Add Plus · Edit Pencil · Export Download · Filter SlidersHorizontal · More MoreHorizontal · Approved CheckCircle2 · Pending Hourglass · Overdue AlertTriangle · Dispatched Truck · Delivered PackageCheck · Date Calendar.

APP SHELL (match reference)
- Sidebar: white, 280px, right border slate-200, full height, own scroll.
  • Top: brand block — 56px rounded-xl logo tile with border, app/business name (18px, 700) and a small second line (existing session/role/company text).
  • Nav grouped under uppercase group labels (group my EXISTING nav items logically, e.g. Overview · Sales · Catalogue & Orders · Finance · Team · Admin — keep role-based visibility exactly as now).
  • Item: 48px tall, 20px icon (primary blue) + 16px label (weight 500, slate-700), 12px radius. Active: bg #EEF4FF, text slate-900 weight 600, full-width pill.
  • Bottom: user card — rounded-2xl border, avatar circle with initials (blue-50 bg, blue text), name (weight 600), role (14px slate-500), kebab menu (existing logout/settings actions).
  • Collapsible to icons-only on smaller screens; drawer on mobile.
- Top bar: 72px, white, bottom border.
  • Left: current business/app name (18px, 700) + second line (existing session/period/role text, 14px slate-500).
  • Center: global search input, ~520px wide, 48px tall, rounded-xl, border, search icon left, existing placeholder text.
  • Right: notification bell in a 44px round bordered button with a small red count badge; user chip (rounded-full border: avatar initials + name + role).

PAGE LAYOUT (match reference)
1. Breadcrumb: 14px, slate-500, "Parent / Current", current in slate-700.
2. Title row: title (+ existing subtitle below) on the left; actions on the right — at most one primary (filled blue, white text, leading icon) and one or two secondary (white, border, leading icon). Buttons 48px tall, 12px radius, 16px weight 500.
3. KPI row: 4 cards per row on desktop (2 on tablet, 1–2 on mobile). Each card: 56px round pastel icon bubble on the left; right side label (15px slate-600), value (28px bold), optional existing caption (14px slate-500). Truncate long labels with an ellipsis and a tooltip. Whole card clickable (keep existing onClick/navigation).
4. Main panel: one white rounded-2xl bordered card containing:
   • Optional panel header: title (20px bold) + one-line caption, and a right-side pill chip with icon (e.g. date).
   • Filter bar: search input (with icon) + select dropdowns (48px, rounded-xl, border, chevron) in one row, wrapping on small screens.
   • Table or content.

TABLES (match reference)
- Header row: no background, 15px weight 500, slate-500, bottom border.
- Rows: 72–80px tall, divider between rows, subtle slate-50 hover, whole row clickable if it already opens something.
- First column: 44px avatar circle (image if available, else initials on blue-50) + primary text (16–17px weight 500) + secondary line (14px slate-500; IDs/reference numbers may use the existing accent color).
- IDs and codes in a monospace font, 14px, slate-600.
- Money: right-aligned, tabular-nums, ₹ with Indian grouping; the key total column in weight 700.
- Tags (e.g. category/department): soft slate/blue pill. Status: pill badge per the status rules.
- Last column: "⋯" icon button for row actions (existing actions only).
- Never clip content: wrap in horizontal scroll on small screens, and give the status column enough min-width so badges are never cut off.
- On mobile (<640px) rows become stacked list items: avatar, primary text, secondary text, amount/status on the right.

EMPTY STATES (match reference)
- Centered inside the panel: 88px rounded-2xl slate-100 tile with a 32px slate-500 icon, title (20px, 600), and the existing description (15px slate-500, max 2 lines, centered). Keep existing buttons if any.

FORMS & MODALS
- Modal: white, 20px radius, 24px padding, title 20px bold, close icon top-right.
- Inputs 48px, rounded-xl, border slate-200, focus ring primary blue 2px at 30% opacity; labels 14px weight 500 above inputs; errors 13px red below.
- Footer: secondary "Cancel" left of primary action, right-aligned.

LANDING & LOGIN
- Login: centered white card (rounded-2xl, border) on slate-50, logo tile + name on top, existing fields and buttons restyled to the input/button rules.
- Landing page: keep all sections and text; restyle with the same fonts, colors, radius, and buttons; remove gradients/blur/glow effects only.

QUALITY BAR BEFORE FINISHING ANY STEP
- All existing text/data/actions still present and working.
- Matches the reference look: pastel icon bubbles, rounded-2xl white cards on slate-50, grouped sidebar, clean table.
- Light mode, dark mode, 1440px, 1024px, and 375px widths all look correct; nothing overflows or is clipped.
- No console errors; build passes.
```

---

## PART B — Prompts (send one at a time)

**1 — Foundation** *(attach the 3 screenshots here)*
```
These screenshots are a STYLE REFERENCE ONLY — do not copy any of their text or school-related content. Following the Knowledge rules, set up the foundation: Plus Jakarta Sans, color tokens (including pastel bubble pairs and status badge colors) as CSS variables for light and dark mode in index.css, radius/spacing tokens, and src/lib/icons.ts with the icon map. Remove global gradients, blur, and glow styles (keep landing-page video/media). Don't restyle pages yet.
```

**2 — Shared components**
```
Create reusable components in src/components/ui matching the reference: Button (primary/secondary/ghost, 48px, 12px radius, leading icon), IconBubble (56px pastel circle, color prop), KpiCard (IconBubble + label + value + optional caption, clickable), Panel (white rounded-2xl bordered card with optional header + right chip), FilterBar, SearchInput, Select, Table (header/rows/avatar cell/money cell/actions cell), StatusBadge, Tag, Avatar (image or initials), EmptyState, Breadcrumbs, PageHeader (breadcrumb + title + existing subtitle + actions). No logic changes.
```

**3 — App shell**
```
Restyle Sidebar, Header, and MobileBottomNav to match the reference: brand block at top of the sidebar, nav grouped under uppercase group labels (group my existing items; keep role visibility), active item as a light-blue pill, user card at the bottom with the existing menu actions; top bar with business name + second line on the left, wide search in the center, round bell with count badge and user chip on the right. Keep every nav item, label, route, and handler.
```

**4 — Dashboards**
```
Restyle AdminDashboard and SalesDashboard using PageHeader, KpiCard rows (4 per row, pastel bubbles with a different color per KPI meaning: blue neutral counts, green positive/paid, amber pending, red overdue), and Panels for each existing section with clean tables/lists. Keep all existing text, KPIs, sections, and click behavior exactly.
```

**5 — Clients**
```
Restyle CustomersPage (list + client detail) and AddCustomerModal: PageHeader with existing title and actions, KPI row from existing summary numbers, Panel with FilterBar (existing search and filters) and Table with avatar-initials first column. Detail view: header, existing summary numbers as KpiCards, existing tabs as clean underline tabs, each tab's content in a Panel. Modal per the form rules. Content unchanged.
```

**6 — Designs**
```
Restyle DesignsPage, ShareLookbookModal, and DesignSharesModal: catalogue as a grid of white rounded-2xl cards (image area on slate-50, then code in mono, name, price, sizes, existing badges as Tags), existing selection and share actions kept; FilterBar at the top. Use violet bubbles for design-related KPIs. Content unchanged.
```

**7 — Orders**
```
Restyle OrdersPage and CreateOrderWizardModal: PageHeader, KPI row, Panel with FilterBar and Table (IDs in mono, amounts right-aligned, status pills). Order detail sections (items, totals, timeline, manufacturer) each in a Panel; timeline as a clean vertical list with status icons. Wizard steps as a simple numbered stepper. Content unchanged.
```

**8 — Payments & collections**
```
Restyle PaymentsPage, RecordPaymentModal, and CollectionsPage like the reference payroll screen: PageHeader with Export (secondary) and primary action, KPI row with pastel bubbles, Panel with header + right-side date chip, FilterBar, and Table with right-aligned bold totals and status pills. Content unchanged.
```

**9 — Remaining screens**
```
Apply the same system to ManufacturersPage, SalesTeamPage, FollowUpsPage, VisitsPage, NotificationsPage, ReportsPage, AuditLogPage, and SettingsPage. Use EmptyState exactly like the reference wherever a list can be empty. Reports charts: blue primary + pastel secondary colors, no gradients. Content unchanged.
```

**10 — Login & landing**
```
Restyle LoginPage and LandingPage per the Knowledge rules: same fonts, colors, radius, buttons, and inputs; remove gradients/blur/glow. Keep all sections, text, media, and links.
```

**11 — Final consistency pass**
```
Review every screen against the reference style and Knowledge rules. Fix: inconsistent radius, extra shadows, gradients/blur, font-black/extrabold, icons not from src/lib/icons.ts, KPI cards without bubbles, clipped table cells or badges, missing breadcrumbs, and any text that was changed, added, or removed compared to the original project. Check light/dark and 1440/1024/375 widths. List anything left.
```

---

## PART C — Review checklist

- [ ] All original text, KPIs, columns, buttons, and data are still there, unchanged
- [ ] No school/EduNex content anywhere
- [ ] White rounded cards on a light gray page, thin borders, almost no shadow
- [ ] KPI cards: pastel icon circle + label + big number
- [ ] Sidebar grouped with uppercase labels, blue pill for the active page, user card at the bottom
- [ ] Top bar: name + second line, wide search, bell with count, user chip
- [ ] Breadcrumb above every page title
- [ ] Tables: avatar first column, mono IDs, right-aligned money, pill statuses, "⋯" actions, nothing cut off
- [ ] Empty states: icon tile + title + description, centered
- [ ] Works in dark mode and on mobile
- [ ] Every button and link still works
