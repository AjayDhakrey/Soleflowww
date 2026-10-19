# Master Prompt — Light, Low-Boldness Typography (SoleFlow)

Paste the box below into Lovable as ONE message and attach the reference screenshot (style reference only).

```
Update the typography of the WHOLE app to match the attached reference: soft, light, low-boldness text with calm slate colors. The screenshot is a STYLE REFERENCE ONLY — do not copy any of its text (no school, students, admissions, EduNex).

DO NOT change any content, layout, spacing, colors of backgrounds/cards, icons, logic, data, routes, or handlers. Keep every piece of text exactly as it is. Change ONLY font family, font weight, font size, letter-spacing, line-height, and TEXT color.

1. FONT
- Font family: "Plus Jakarta Sans" (fallback: Inter, system-ui, sans-serif). Load only weights 400, 500, 600 from Google Fonts. Remove loading of 700/800.
- Global base in index.css:
    html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
    body { font-weight: 400; line-height: 1.5; color: var(--text-primary); }
    h1,h2,h3,h4,h5,h6 { font-weight: 600; }
    b, strong, th { font-weight: 500; }
- Monospace (IDs, codes, reference numbers only): ui-monospace, "SF Mono", Menlo, Consolas; weight 400.

2. WEIGHT RULES (the most important part)
- Default for ALL text: 400 (regular).
- 500 (medium): person/client/record names in tables and lists, active sidebar item, button labels, tab labels, table header labels, badge text, input values.
- 600 (semibold): page titles, card/section titles, brand name in the sidebar/top bar, KPI numbers, modal titles.
- NEVER use 700, 800, or 900 anywhere.
- Replace across every file in frontend/src:
    font-black      → font-semibold
    font-extrabold  → font-semibold
    font-bold       → font-semibold on titles/headings/KPI values/brand; font-medium everywhere else (labels, buttons, table cells, badges, chips, small text)
    font-semibold on body text, captions, labels, descriptions, sidebar items, table cells → font-normal or font-medium per the rules above
- Small text (≤ 14px) must never be heavier than 500.

3. SIZE & SPACING SCALE (match the reference)
    Brand name (sidebar/top bar)     18px  600  line-height 1.3
    Page title                       30px  600  tracking -0.01em
    Page description                 16px  400
    Card / section / modal title     18px  600
    KPI label                        15px  400
    KPI value                        28px  600  tabular-nums
    Body text, table cells           15–16px 400
    Record name in table/list        16px  500
    Secondary line under a name      14px  400
    Table header                     15px  400
    Buttons                          15px  500
    Inputs & placeholders            15px  400
    Sidebar item                     16px  400 (active 500)
    Sidebar group label              12px  500  UPPERCASE  tracking 0.08em
    Breadcrumb                       14px  400
    Badges / chips                   13–14px 500
    Captions, helper, timestamps     13px  400
- Replace text-[10px] and text-[11px] with 12px minimum (text-xs). Nothing smaller than 12px.
- Remove extra-tight or extra-wide tracking (tracking-tighter, tracking-widest) except the sidebar group label rule above.
- Uppercase ONLY for sidebar group labels. Everything else in normal/sentence case as it is written now.

4. TEXT COLORS (soft slate, never pure black)
Light mode:
    Primary text (titles, names, values, table cells)   #1E293B  (slate-800)
    Secondary text (labels, descriptions, table headers, sidebar items)  #475569 (slate-600)
    Muted text (captions, breadcrumb parent, placeholders, timestamps)   #64748B (slate-500)
    Sidebar group labels                                  #64748B
    Links / accent text                                   #3B82F6 (blue-500)
    Positive reference text (e.g. IDs shown in green)     #16A34A
Dark mode:
    Primary #E2E8F0 · Secondary #CBD5E1 · Muted #94A3B8 · Accent #60A5FA
- Define these as CSS variables (--text-primary, --text-secondary, --text-muted, --text-accent) for light and dark, and use them instead of text-black, text-slate-900, text-zinc-900, text-gray-900.
- Keep contrast readable: never use a color lighter than the muted value for text a user must read.

5. NUMBERS
- All amounts, counts, dates, and IDs: `font-variant-numeric: tabular-nums`.
- Amounts keep ₹ and Indian grouping as they are now. The emphasized total column (e.g. net/total amount) uses 600; other amounts 400.

6. APPLY EVERYWHERE
Sidebar, Header, MobileBottomNav, AdminDashboard, SalesDashboard, CustomersPage, DesignsPage, OrdersPage, PaymentsPage, CollectionsPage, FollowUpsPage, VisitsPage, SalesTeamPage, ManufacturersPage, ReportsPage, NotificationsPage, AuditLogPage, SettingsPage, LoginPage, LandingPage, and all modals, toasts, dropdowns, tooltips, empty states, and chart labels.

7. VERIFY BEFORE FINISHING
- Search the codebase: zero occurrences of font-black, font-extrabold, font-bold, text-[10px], text-[11px].
- font-semibold appears only on titles, brand name, KPI values, emphasized totals.
- Every page still shows exactly the same text, just lighter.
- Check light mode, dark mode, and 375px mobile width.
- List the files changed.
```

---

## Quick check after Lovable finishes

- [ ] Text looks light and calm, like the reference; nothing looks heavy or "shouty"
- [ ] Only titles, brand name, and big KPI numbers are semi-bold
- [ ] Names in tables are medium; everything else is regular
- [ ] Text is dark slate, not pure black; labels are grey
- [ ] No tiny 10–11px text anywhere
- [ ] All text still readable in dark mode
- [ ] No text was changed or removed
