# Master Prompt — Fix UI Visibility / Contrast (SoleFlow)

Paste everything inside the box below into Lovable as ONE message. Attach the broken screenshot (Follow-ups page) to it.

```
The UI has a serious visibility bug. On the Follow-ups page (screenshot attached) the page title is invisible, the breadcrumb current item is almost invisible, the "Add Follow-up" button blends into the background, dark cards sit on a white page, and grey text sits on grey boxes. Fix this across the WHOLE app.

DO NOT change any content: keep every page, heading, label, KPI, card, button, field, data value, and text exactly as it is. DO NOT change logic, data fetching, Supabase calls, AppContext, routes, handlers, or permissions. Only fix theming, colors, and contrast.

ROOT CAUSE (verified in the code — fix this first)
1. The project uses Tailwind CSS v4. There is no dark-mode variant configured in frontend/src/index.css, so every `dark:` class (500+ of them) activates from the operating system's dark-mode setting, not from the app's own theme toggle.
2. The app shell in App.tsx hard-codes `bg-white` on `.app-shell`, the content wrapper, and `<main>`, so the page stays white while the components switch to dark styles → white text on white, dark cards on white.
3. `isDarkMode` from AppContext is read in App.tsx but never applied to the document.

STEP 1 — Make dark mode controlled by the app, not the OS
- In frontend/src/index.css, directly after `@import "tailwindcss";`, add:
    @custom-variant dark (&:where(.dark, .dark *));
- In App.tsx (or AppContext), add an effect that toggles the class on <html>:
    useEffect(() => {
      document.documentElement.classList.toggle('dark', isDarkMode);
      document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
    }, [isDarkMode]);
- Default theme is LIGHT unless the user switched it with the in-app toggle.

STEP 2 — One set of theme tokens, used everywhere
- In index.css define semantic CSS variables for :root (light) and .dark, and map them in `@theme` so Tailwind utilities exist (bg-background, bg-surface, bg-muted, text-foreground, text-muted-foreground, border-border, bg-primary, text-primary-foreground, etc.):
    Light: background #F8FAFC · surface #FFFFFF · muted #F1F5F9 · border #E2E8F0 · foreground #0F172A · muted-foreground #475569 · subtle-foreground #64748B · primary #2563EB · primary-foreground #FFFFFF
    Dark:  background #0B1220 · surface #111827 · muted #1F2937 · border #334155 · foreground #F8FAFC · muted-foreground #CBD5E1 · subtle-foreground #94A3B8 · primary #3B82F6 · primary-foreground #FFFFFF
- Replace hard-coded shell colors in App.tsx, Sidebar, Header, MobileBottomNav (bg-white, bg-zinc-950, bg-slate-900, text-white, text-zinc-900…) with these tokens. The sidebar, top bar, page, and cards must ALWAYS be in the same theme — never a dark sidebar/cards with a white page or vice versa.
- In pages and components, fix any element whose light and dark colors don't pair correctly. Every text color must have a background it is readable on in BOTH themes. Prefer tokens over raw slate/zinc classes; where a raw class stays, it must have a correct `dark:` pair.

STEP 3 — Contrast rules (WCAG AA, non-negotiable)
- Body text and labels: contrast ≥ 4.5:1 against their actual background.
- Large text (≥ 24px or ≥ 19px bold), icons, input borders, and button outlines: ≥ 3:1.
- Never use a text color lighter than subtle-foreground (#64748B light / #94A3B8 dark) for anything the user must read — this includes breadcrumbs, captions, notes, placeholders, and KPI sub-labels.
- Breadcrumb: parent in muted-foreground, CURRENT page in foreground (it is currently almost invisible).
- Page title: foreground color, always visible in both themes.
- Buttons:
    Primary → bg-primary + white text.
    Secondary → surface background + 1px border-border + foreground text (the "Add Follow-up" button currently has no visible edge — fix it).
    Buttons inside cards must be clearly distinct from the card background.
- Nested boxes (e.g. the follow-up subject box inside a card) must use `muted` on top of `surface` so they are visibly different but text stays foreground.
- Italic notes: muted-foreground, not lighter.
- Status badges must be readable in both themes: light = tinted bg (e.g. amber-50) + dark text (amber-700); dark = 15% tinted bg + light text (amber-300). Same pattern for green/red/blue/slate.
- KPI cards: icon bubble tinted, label muted-foreground, value foreground, caption muted-foreground.
- Focus rings visible in both themes (2px primary at 40% opacity).
- Placeholder text ≥ 4.5:1 is not required, but must be at least subtle-foreground.

STEP 4 — Fix these specific issues from the screenshot
- Follow-ups page: title "Follow-ups" missing/invisible → visible foreground heading above the description.
- Breadcrumb "Follow-ups" nearly invisible → foreground.
- "Add Follow-up" button → proper primary (it's the main action) or bordered secondary.
- KPI cards and follow-up cards must use `surface` so in light mode they are WHITE cards with borders on the light page, and in dark mode dark cards on the dark page — never dark cards on a white page.
- Date chip ("Today • 11:00 AM"), "Pending" badge, "Call Shop" and "Mark Done" buttons: readable and distinct in both themes.
- Top bar and sidebar: follow the current theme (light in light mode). The "New" button, search box (including the ⌘K hint), bell, and user chip must all have visible borders and readable text.
- Sidebar group labels (OVERVIEW, SALES & VISITS…) readable: subtle-foreground minimum.

STEP 5 — Sweep every screen
Apply Steps 2–4 to: AdminDashboard, SalesDashboard, CustomersPage, DesignsPage, OrdersPage, PaymentsPage, CollectionsPage, FollowUpsPage, VisitsPage, SalesTeamPage, ManufacturersPage, ReportsPage, NotificationsPage, AuditLogPage, SettingsPage, LoginPage, and all modals (AddCustomerModal, CreateOrderWizardModal, RecordPaymentModal, ShareLookbookModal, DesignSharesModal, DemoWalkthroughModal), plus toasts, dropdowns, tooltips, and empty states. Charts in ReportsPage: axis labels and legends readable in both themes.

STEP 6 — Verify before you finish
Test all four combinations and confirm every page is readable:
  1. Computer in LIGHT mode + app toggle LIGHT
  2. Computer in DARK mode + app toggle LIGHT   ← this is the case that is broken now
  3. Computer in LIGHT mode + app toggle DARK
  4. Computer in DARK mode + app toggle DARK
For each: no invisible text, no white-on-white or dark-on-dark, sidebar/header/page/cards in the same theme, all buttons have visible edges, all text meets the contrast rules. Also check 375px mobile width. Then list every file you changed and confirm no text content or logic was changed.
```

---

## Quick check after Lovable finishes

- [ ] Follow-ups page shows its title
- [ ] Breadcrumb current page is readable
- [ ] Light mode: white cards on a light grey page, dark text everywhere
- [ ] Dark mode (app toggle): everything dark together — sidebar, header, page, cards
- [ ] Changing your computer's dark/light setting no longer breaks the app
- [ ] Every button has a visible edge; every badge is readable
- [ ] No text, KPIs, or buttons were removed or reworded
