# Master Prompt — Time-of-Day Greeting with Live Sun/Moon Icon (ShoeConnect)

Paste the box below into Lovable as ONE message.

```
The dashboard greeting is hard-coded. "Good morning, {currentUser.name}" with a ☀️ emoji appears in:
- frontend/src/pages/admin/AdminDashboard.tsx (plus a static "Live Operations" badge)
- frontend/src/pages/customers/CustomersPage.tsx
- frontend/src/pages/sales/SalesDashboard.tsx (uses 👞)
Make the greeting and its icon change automatically with the time of day, in real time, and make the status badge show the real live-connection status.

ASSETS (already in the project — use these, don't generate new ones)
frontend/public/assets/images/greeting/morning.svg     – rising soft-yellow sun over horizon
frontend/public/assets/images/greeting/afternoon.svg   – bright hot orange sun with full rays
frontend/public/assets/images/greeting/evening.svg     – light orange setting sun with birds
frontend/public/assets/images/greeting/night.svg       – crescent moon with stars
They work on both light and dark backgrounds.

STEP 1 — Time-of-day hook: src/hooks/useTimeOfDay.ts
- Use the Indian timezone (Asia/Kolkata) via Intl.DateTimeFormat(..., { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }), so it's correct for every user.
- Periods:
    morning   05:00 – 11:59  → "Good morning"
    afternoon 12:00 – 16:59  → "Good afternoon"
    evening   17:00 – 20:59  → "Good evening"
    night     21:00 – 04:59  → "Good night"  (between 00:00 and 04:59 show "Working late")
- Returns { period, greeting, iconSrc, iconAlt, now, dateLabel } where dateLabel is e.g. "Wednesday, 30 Sept 2026".
- Real-time updates without polling every second:
    • schedule a setTimeout exactly to the next period boundary (and to the next midnight for dateLabel), then reschedule
    • also re-check on window focus and document 'visibilitychange' (laptop wake / tab switch)
    • clean up timers on unmount
- Export pure helpers getTimeOfDay(date) and msUntilNextBoundary(date) for tests.

STEP 2 — Reusable component: src/components/common/TimeGreeting.tsx
Props: name: string, subtitle?: string, showStatus?: boolean.
- Icon: <img src={iconSrc} alt={iconAlt} width 32–36px (28px on mobile)>, decorative size matching the current emoji spot.
- When the period changes, cross-fade the old and new icon (300ms) and fade the greeting text; respect prefers-reduced-motion (no animation).
- Subtle idle animation only if motion is allowed: morning/afternoon icon rotates rays very slowly or gently pulses glow (8–12s loop); night stars twinkle softly. Keep it calm, never distracting.
- Title: "{greeting}, {name}" using the current page title style (keep existing font weights/sizes).
- Subtitle line: "{dateLabel} • {subtitle}" — pass each page's existing subtitle text unchanged.
- Preload all 4 SVGs once (new Image().src) so switching never flickers.

STEP 3 — Real live status badge (replaces the static "Live Operations")
- Show the Supabase Realtime connection state from the existing realtime subscription (hooks/useRealtime.ts):
    connected   → green dot (gentle pulse) "Live"
    connecting / reconnecting → amber dot "Reconnecting…"
    offline (navigator.onLine false or channel closed/error) → grey/red dot "Offline"
- Next to it, a muted "Updated {relative time}" that shows when dashboard data was last refreshed (react-query dataUpdatedAt of the dashboard/overview query), updating every 30s ("just now", "2 min ago").
- In demo mode show a neutral "Demo data" badge instead.
- Badge text must be readable in light and dark mode.

STEP 4 — Use it everywhere
- Replace the hard-coded header block in AdminDashboard (keep "Live Operations" position → now the real status badge), CustomersPage, and SalesDashboard with <TimeGreeting name={currentUser.name} subtitle={<that page's existing subtitle>} showStatus />.
- Remove the ☀️ / 👞 emojis. Do not change anything else on those pages.

STEP 5 — Verify
- Unit tests for getTimeOfDay at 04:59, 05:00, 11:59, 12:00, 16:59, 17:00, 20:59, 21:00, 00:30 (Asia/Kolkata), and msUntilNextBoundary.
- Manually: temporarily mock the clock (e.g. ?debugTime=18:59:50 query param in development only) and confirm the greeting and icon switch from afternoon/evening at the boundary without reloading; remove or dev-guard the debug param.
- Turn off Wi-Fi → badge shows Offline; back on → Reconnecting… then Live.
- Light/dark mode, 375px mobile, reduced motion all look correct. List files changed.
```

---

## What you'll see

| Time (India) | Greeting | Icon |
|---|---|---|
| 5 AM – 12 PM | Good morning, Ajay Sharma | soft rising sun |
| 12 PM – 5 PM | Good afternoon, Ajay Sharma | bright hot sun |
| 5 PM – 9 PM | Good evening, Ajay Sharma | orange setting sun |
| 9 PM – 5 AM | Good night / Working late | moon and stars |

The badge next to it shows **Live**, **Reconnecting…** or **Offline**, plus **Updated 2 min ago**.
