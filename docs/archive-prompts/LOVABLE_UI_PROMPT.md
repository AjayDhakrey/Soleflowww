# Lovable UI Master Prompt — SoleFlow (Shoe Trade CRM)

How to use:
1. Paste **Part A** into Lovable → Project Settings → **Knowledge** (so every prompt follows it). If you can't find Knowledge, send Part A as your first chat message.
2. Then send the **Part B prompts one at a time**, in order. Check the preview after each one before sending the next.
3. Use **Part C** to review each screen.

---

## PART A — Design rules (paste into Knowledge)

```
You are a senior product designer and front-end engineer redesigning the UI of SoleFlow, a B2B CRM for a shoe trading company in India (Trader/Admin and Salesman roles; clients, designs, orders, manufacturers, payments). Users are busy business owners and field salesmen. The UI must look like a calm, professional tool built by a small, careful product team — in the spirit of Linear, Stripe Dashboard, and Notion. It must NOT look AI-generated or template-made.

SCOPE — PRESENTATION ONLY
- Change only styling, layout, spacing, and on-screen copy.
- Do NOT change or remove: data fetching, Supabase calls, AppContext functions, state, event handlers, routes, props, types, form validation, permissions, or any feature. Every button and action that exists today must still exist and work.
- Do NOT rename exported components or files. Do NOT add new libraries unless asked.
- Removing decorative markup, extra wrapper divs, and redundant text is allowed. Removing functionality is not.

VISUAL SYSTEM
- Font: Inter only (400, 500, 600). Never use font-bold above 600, never font-black or font-extrabold. Use `tabular-nums` for all numbers and amounts.
- Type scale: 12 / 13 / 14 / 16 / 20 / 24 px. Body 14px. Page title 20–24px, weight 600. No text smaller than 12px.
- Case: sentence case everywhere. No ALL-CAPS labels, no letter-spaced "eyebrow" pills above headings.
- Color: neutral zinc/slate grays + ONE accent (a deep blue, e.g. #2563EB) used only for primary buttons, links, focus rings, and the active nav item. Background white (#FFFFFF) with page surface #FAFAFA. Borders #E4E4E7 at 1px.
- Status colors (only for status, never decoration): green = paid/delivered, amber = pending/attention, red = overdue/failed, gray = draft/archived, blue = active/info. Show status as a small colored dot + plain text, or a subtle tinted badge (tinted background, no border, 12px, weight 500).
- Radius: 6px for inputs/buttons/badges, 8px for cards/modals. Never rounded-2xl or rounded-3xl (except avatars = full).
- Shadows: none on cards — use a 1px border. Only popovers, dropdowns, and modals get a single soft shadow.
- No gradients, no glassmorphism/backdrop-blur, no glow, no colored shadows, no neon, no noise textures.
- Icons: use icons throughout the app so users can recognise things at a glance — but as a strict, consistent system, not decoration (see ICON SYSTEM below).
- No emoji anywhere. No sparkle ✨ / rocket / magic icons. No "AI-powered" wording.
- Spacing: 4px base grid (4, 8, 12, 16, 24, 32, 48). Page padding 24px desktop, 16px mobile. Consistent 16px gap between cards.
- Motion: only 150ms ease-out for hover/focus/open/close. No bouncing, scaling cards on hover, pulsing, floating, or entrance animations on dashboards.
- Dark mode: keep it; mirror the same system with zinc-950 background, zinc-900 surfaces, zinc-800 borders.

LAYOUT
- App shell: left sidebar 240px (collapsible to 64px icons), plain white, items = icon + label, active item = light gray background + accent text. Top bar 56px: page title on the left, global search (⌘K) in the center/right, notifications bell, avatar menu. Nothing else.
- Page structure: title row (title left, max 2 actions right: one primary, one secondary) → optional filter bar → content. No subtitle under the page title unless it carries real information.
- KPI cards: label (13px gray) → value (24px, 600, tabular-nums) → optional one-line change ("+12% vs last month" in green/red, 12px). Whole card clickable. Nothing else in the card.
- Tables are the default for lists on desktop: 44px rows, left-aligned text, right-aligned numbers, sticky header, subtle row hover, zebra striping off. Row click opens the record. Actions in a "⋯" menu at row end.
- On mobile, tables become simple stacked list rows (primary text, secondary text, value on the right). Bottom nav with 5 items max.
- Forms: one column, labels above inputs, 36px input height, helper text only when essential, errors in red below the field. Primary button bottom-right in modals.
- Empty states: one short line + one button. No illustrations.
- Loading: skeleton blocks matching the final layout. No spinners in the middle of a page.

COPY RULES (this is what makes it feel human-made)
- Labels 1–3 words. Buttons are verbs: "New order", "Record payment", "Share", "Save", "Cancel".
- Remove: greetings ("Good morning, Ajay"), marketing taglines, explanatory paragraphs on app screens, "Welcome to your dashboard", "Here's an overview of…", "Seamlessly / effortlessly / unlock / empower / supercharge / streamline / elevate / leverage / cutting-edge / next-generation / all-in-one".
- No duplicated meaning: not "+ New Order" with a plus icon (pick one), not a title and a subtitle saying the same thing.
- Numbers in Indian format: ₹2,30,000 in tables; compact ₹2.3L only on KPI cards. Dates "28 Sep 2026".
- Keep domain words the business uses: Client, Design, Order, Manufacturer, Payment, Outstanding, Collection, Follow-up, Salesman, Carton, Pairs.
- Errors say what happened and what to do: "Phone number is required." "Amount can't exceed the ₹1,60,000 due."

BEFORE FINISHING ANY CHANGE
- Every existing action, modal, and route still works.
- No new console errors. Build passes.
- Check both light and dark mode and a 375px mobile width.
```

---

## PART B — Prompts to send one by one

**Prompt 1 — Foundation**
```
Apply the design rules from Knowledge to the global foundation only: set Inter as the only font (weights 400/500/600), define the color, radius, border, and spacing tokens in index.css as CSS variables for light and dark mode, and remove global gradients, blur, and decorative animations from index.css except the ones used by the landing page hero. Don't touch page components yet. Show me what changed.
```

**Prompt 2 — App shell**
```
Redesign the Sidebar, Header, and MobileBottomNav using the Knowledge rules: plain white sidebar 240px collapsible to 64px, icon + label items, subtle active state; 56px top bar with page title, ⌘K search, notifications, avatar menu; mobile bottom nav with max 5 items per role. Remove role badges, taglines, and decorative elements. Keep every navigation item, handler, and role-based visibility exactly as it works today.
```

**Prompt 3 — Shared components**
```
Create simple reusable UI components in src/components/ui and use them only where the markup is equivalent: Button (primary, secondary, ghost, danger; sm/md), Badge/StatusDot (using the status color rules), Card (1px border, 8px radius, no shadow), KpiCard (label, value, optional change line, whole card clickable), Table (sticky header, 44px rows, right-aligned numbers), EmptyState (one line + one button), Skeleton, PageHeader (title + max 2 actions). Don't change any logic.
```

**Prompt 4 — Trader dashboard**
```
Redesign AdminDashboard: page title "Dashboard" (remove the greeting and the "Trader Portal" pill), actions "Record payment" (secondary) and "New order" (primary). A row of KpiCards (Active clients, Open orders, Order value, Outstanding, Overdue, Collections today). Below: a two-column layout — left "Recent orders" table, right "Overdue clients" list; then "Recent payments". Remove colored icon bubbles, explanatory text, and any section that repeats information already shown. Keep all click-through navigation.
```

**Prompt 5 — Salesman dashboard**
```
Redesign SalesDashboard the same way: title "Today", KPIs (My clients, Open orders, Follow-ups due, To collect), then "Follow-ups due today" list and "My recent orders". Mobile-first: on 375px width it should read as a clean vertical list with the primary action "New order" reachable in one tap.
```

**Prompt 6 — Clients**
```
Redesign CustomersPage and AddCustomerModal. List: search + filters (salesman, city, status) in one row, then a Table with columns Client, City, Salesman, Orders, Outstanding (right-aligned), Last order. Client detail: header with name, city · salesman · status, actions "New order" and "Edit"; a 4-number summary (Orders, Business, Paid, Outstanding); tabs Orders | Payments | Designs | Notes | Activity. Modal: single-column form, only essential helper text.
```

**Prompt 7 — Designs**
```
Redesign DesignsPage, ShareLookbookModal, and DesignSharesModal. Catalogue: clean image grid, image on top with neutral gray background, below it design code (12px gray), name (14px, 500), price per pair, sizes. Actions appear on hover (desktop) or via a "⋯" menu (mobile). Selection uses a simple checkbox in the image corner with a bottom action bar "3 selected · Share · Add to order". No badges like "Hot", "Trending", margin/velocity badges unless they're real data — show at most one small tag.
```

**Prompt 8 — Orders**
```
Redesign OrdersPage and CreateOrderWizardModal. List: status filter as simple tabs (All, Review, In production, Dispatched, Delivered, Overdue) + Table (Order, Client, Salesman, Pairs, Amount, Due, Status, Date). Order detail: header (order number, client, status), items table, a totals block right-aligned (Subtotal, Discount, GST, Total, Paid, Due), a horizontal status stepper with plain text steps, manufacturer and delivery in a small side panel. Wizard: 3 clear steps (Client → Items → Review) with a simple step indicator; no decorative illustrations.
```

**Prompt 9 — Payments, Collections, Receivables**
```
Redesign PaymentsPage, RecordPaymentModal, and CollectionsPage. Payments table: Receipt, Client, Order, Amount, Method, Reference, Date, Status. Receivables: 4 KpiCards (Outstanding, Due this week, Overdue, Collected this month) + table with age shown as plain text ("21 days"), red only when overdue. Payment modal: Client, Order, Amount (large, tabular-nums), Method (segmented control: Cash, UPI, Bank, Cheque), Reference, Date, Notes. Show "Due after this payment: ₹X" as one quiet line.
```

**Prompt 10 — Remaining screens**
```
Apply the same rules to ManufacturersPage, SalesTeamPage, FollowUpsPage, VisitsPage, NotificationsPage, ReportsPage, AuditLogPage, and SettingsPage. Reports: simple line/bar charts in the accent color plus grays, no 3D, no gradients, a date range picker top-right. Audit log: dense table (Time, User, Action, Record, Change). Settings: left list of sections, right a single form panel. Notifications: simple list, unread = small blue dot, no cards.
```

**Prompt 11 — Login**
```
Redesign LoginPage: centered 360px card on a plain #FAFAFA background, small logo wordmark "SoleFlow", title "Sign in", email, password, "Forgot password?" link, full-width primary button. No split-screen image, no testimonials, no feature bullets, no gradient. Keep the existing login logic and demo accounts behaviour.
```

**Prompt 12 — Landing page**
```
Simplify LandingPage (keep the file and working links). Structure: top nav (logo, "Sign in" link, "Book a demo" button) → hero with one headline (max 8 words, e.g. "Orders, designs and payments in one place"), one sentence below, one primary button, then a real product screenshot of the dashboard → three short feature rows (Clients & designs, Orders & manufacturers, Payments & outstanding), each one line of text + screenshot → simple footer. Remove floating animations, stat counters, gradient text, badges, emoji, fake testimonials/logos, and filler sections. Keep the hero video only if it shows the real product; otherwise replace with a screenshot. Remove the WholesaleCalculator from the landing page view only if it isn't linked elsewhere — otherwise move it below the features, restyled plainly.
```

**Prompt 13 — Final polish pass**
```
Do a consistency pass across all screens: find and fix any remaining font-black/extrabold, rounded-2xl/3xl, backdrop-blur, gradients, colored shadows, emoji, ALL-CAPS labels, text smaller than 12px, duplicate icons+symbols in buttons, and paragraphs of explanatory copy. Make sure every page uses PageHeader, Card, Table, Button, and Badge consistently. Verify light mode, dark mode, and 375px mobile. List anything you couldn't fix.
```

---

## PART C — Review checklist (check each screen)

- [ ] Could a user tell what this page is for in 3 seconds?
- [ ] Only one primary (blue) button visible on the page
- [ ] No greeting, tagline, or explanatory paragraph
- [ ] No gradients, blur, glow, emoji, sparkle icons
- [ ] Headings weight 600 max; no ALL-CAPS labels
- [ ] Numbers right-aligned, Indian ₹ format
- [ ] Status shown with the same colors everywhere
- [ ] Cards have borders, not shadows
- [ ] Works in dark mode and at 375px width
- [ ] Every button that existed before still works
