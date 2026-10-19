# Master Prompt — Light / Dark Mode Switch + Visibility in Both Themes (SoleFlow)

Paste the box below into Lovable as ONE message.

```
Add a working Light / Dark mode switch in the Appearance section of Profile & Settings, and make sure ALL content is clearly visible in both themes across the whole app.

Do NOT change any other text content, layout, features, data, routes, or logic. Build on what already exists — do not create a second theme system.

WHAT ALREADY EXISTS (reuse it)
- AppContext already has `isDarkMode`, `toggleDarkMode`, and saves to localStorage key `soleflow_dark_mode`.
- App.tsx already toggles the `dark` class on <html> and sets `color-scheme`.
- index.css already has `@custom-variant dark (&:where(.dark, .dark *));`
- Semantic tokens already exist and are used in places: bg-surface, bg-muted, text-foreground, text-muted-foreground, border-border.
- pages/settings/SettingsPage.tsx has an "Appearance & Theme" Panel that is currently hard-coded to show "Pure White Light Theme — Active" with no way to change it.

PART 1 — THEME STATE
- Extend AppContext (keep isDarkMode and toggleDarkMode working for existing code):
    themePreference: 'light' | 'dark' | 'system'
    setThemePreference(pref)
    isDarkMode = themePreference === 'dark' || (themePreference === 'system' && OS prefers dark)
- Save to localStorage key `soleflow_theme` ('light' | 'dark' | 'system'). Migrate the old `soleflow_dark_mode` value once ('true' → 'dark', otherwise 'light').
- Default for new users: 'light'.
- For 'system', listen to `window.matchMedia('(prefers-color-scheme: dark)')` changes and update live.
- toggleDarkMode() keeps working: it switches between 'light' and 'dark'.
- Prevent a white flash on load: add a tiny inline <script> in frontend/index.html <head> that reads `soleflow_theme` and adds the `dark` class to <html> before React renders. Wrap in try/catch.
- Optional, if the user is logged in with Supabase and a `profiles` table exists: also save the preference to a `theme` column so it follows the user across devices. If the column doesn't exist, skip this — don't create migrations for it.

PART 2 — APPEARANCE SECTION (Settings / Profile)
Replace the content of the existing "Appearance & Theme" Panel (keep the Panel, title and subtitle) with a theme picker:
- Three selectable option cards in a row (stack on mobile): Light (Sun icon), Dark (Moon icon), System (Monitor icon).
- Each card shows a small mini-preview of the app in that theme (a tiny sidebar bar + header bar + two content blocks drawn with divs), the label underneath, and a check/radio indicator on the selected one.
- Selected card: 2px primary border + primary check icon. Others: 1px border-border, hover:bg-muted.
- Clicking a card applies the theme instantly (no save button) and shows a small toast "Theme updated".
- Accessible: implemented as a radiogroup (role="radiogroup", each card role="radio" with aria-checked), keyboard arrows + Enter/Space work, visible focus ring.
- Make sure the Appearance section is reachable by BOTH roles: Admin via /admin/settings and Salesman via /sales/profile (the "Profile & Settings" menu item routes salesmen to /sales/profile — if that page doesn't show Appearance, add the same Appearance panel there).
- Also add a quick toggle in the header profile dropdown (components/layout/Header.tsx), above "Profile & Settings": a row "Dark mode" with Moon icon and a small switch on the right bound to isDarkMode. Keep all existing menu items.

PART 3 — VISIBILITY IN BOTH THEMES (whole app)
Theme tokens in index.css (:root = light, .dark = dark). Keep existing token names; make sure these values exist:
  Light: background #F8FAFC · surface #FFFFFF · muted #F1F5F9 · border #E2E8F0 · foreground #1E293B · muted-foreground #475569 · subtle-foreground #64748B · primary #2563EB
  Dark:  background #0B1220 · surface #111827 · muted #1F2937 · border #334155 · foreground #E2E8F0 · muted-foreground #CBD5E1 · subtle-foreground #94A3B8 · primary #3B82F6
Then sweep EVERY file in frontend/src/pages and frontend/src/components:
- Find hard-coded colors that have no dark pair and switch them to tokens (or add the correct dark: variant):
    bg-white, bg-slate-50, bg-zinc-50, bg-gray-50, bg-slate-100, bg-zinc-100
    text-black, text-slate-900, text-zinc-900, text-gray-900, text-slate-800, text-zinc-800, text-slate-700, text-zinc-700, text-slate-600, text-zinc-600, text-slate-500, text-zinc-500
    border-slate-200, border-zinc-200, border-gray-200, divide-slate-100, divide-zinc-100
    Example to fix: the current Appearance panel itself uses text-zinc-900 / bg-zinc-100 with no dark pair.
- App shell (App.tsx wrappers, Sidebar, Header, MobileBottomNav, <main>) must use bg-background / bg-surface — sidebar, header, page and cards always in the SAME theme.
- Status badges, KPI icon bubbles, chips: light = tinted bg (e.g. amber-50) + dark text (amber-700); dark = 15% tint (e.g. amber-500/15) + light text (amber-300). Same for green, red, blue, violet, slate.
- Primary buttons: bg-primary + white text in both themes. Secondary buttons: bg-surface + border-border + text-foreground.
- Inputs, selects, textareas, date pickers: bg-surface, text-foreground, border-border, placeholder subtle-foreground; native controls follow `color-scheme`.
- Tables: header text muted-foreground, row dividers border-border, row hover bg-muted.
- Modals, dropdowns, toasts, tooltips, popovers: bg-surface + border-border + readable text; overlays use black/50 in light, black/70 in dark.
- Charts (ReportsPage and dashboards): axis labels, grid lines, legends and tooltips use theme colors so they're readable in both themes.
- Images/logos: add a subtle surface background or border where a transparent logo would disappear on dark.
- Shadows: soften in dark mode (use borders instead).
- Scrollbar thumb visible in both themes.
- The public landing page may stay light-only; the Login page and every in-app screen must support both themes.

CONTRAST RULES (WCAG AA)
- Normal text ≥ 4.5:1 against its actual background; large text, icons, borders of inputs/buttons ≥ 3:1.
- No readable text lighter than subtle-foreground in either theme.
- No white-on-white, dark-on-dark, or grey-on-grey anywhere.

PART 4 — VERIFY BEFORE FINISHING
- Switch Light → Dark → System from Settings and from the header toggle: the whole app changes instantly, preference survives a page refresh and logout/login, and there's no white flash on load.
- With System selected, changing the computer's theme updates the app live.
- Go through every screen in BOTH themes and confirm all text, icons, badges, buttons, inputs, tables, charts, modals, toasts and empty states are clearly visible: Dashboard (admin + salesman), Clients (list + detail), Designs, Orders (list + detail + create wizard), Payments, Record Payment modal, Collections, Follow-ups, Visits, Sales Team, Manufacturers, Reports, Notifications, Audit Log, Settings/Profile, Login.
- Check 375px mobile width in both themes.
- List every file changed and every hard-coded color you replaced.
```

---

## Quick check after Lovable finishes

- [ ] Settings → Appearance shows Light / Dark / System cards with previews
- [ ] Profile menu has a Dark mode switch
- [ ] Choice is remembered after refresh and logout/login
- [ ] No white flash when the page loads in dark mode
- [ ] Salesman can also change the theme
- [ ] Every page readable in both themes: text, badges, buttons, inputs, charts, modals
- [ ] Sidebar, header, page and cards always match the same theme
