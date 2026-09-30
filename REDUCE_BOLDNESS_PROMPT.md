# Master Prompt — Reduce Boldness Everywhere (SoleFlow)

Paste the box below into Lovable as ONE message. Attach the screenshot of the Follow-ups header/KPI cards.

```
Text across the app is still far too bold (see screenshot: the page title "Follow-ups & Buyer Reminders", KPI values like "4 Tasks", KPI labels, and the "Add Follow-up" button all look heavy). Make ALL text across the whole project noticeably lighter.

Do NOT rely on editing hundreds of className strings one by one — that was tried and left most text bold. Fix it CENTRALLY with the steps below so every page changes at once. Do NOT change any text content, layout, colors, spacing, icons, logic, data, routes, or handlers.

STEP 1 — Load only light weights (frontend/index.html)
Replace the Google Fonts <link> so it loads ONLY weights 300, 400 and 500:
  https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500&family=Inter:wght@300;400;500&display=swap
Do not load 600, 700, or 800 anywhere (check index.html, index.css, and any @import).

STEP 2 — Remap Tailwind's weight utilities globally (frontend/src/index.css, Tailwind v4)
Directly after `@import "tailwindcss";` add (or merge into the existing @theme block):

  @theme {
    --font-weight-thin: 300;
    --font-weight-extralight: 300;
    --font-weight-light: 300;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 500;
    --font-weight-bold: 500;
    --font-weight-extrabold: 500;
    --font-weight-black: 500;
  }

This makes font-semibold, font-bold, font-extrabold and font-black all render at 500 (medium) everywhere, without touching component files.

STEP 3 — Stop the browser from faking bold (frontend/src/index.css)
  html, body { font-synthesis: none; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  body { font-weight: 400; }
  h1, h2, h3, h4, h5, h6, b, strong, th, button, label, legend { font-weight: 500; }

STEP 4 — Remove hard-coded heavy weights
Search frontend/src for any of these and change them to 500 (or 400 for body text):
  font-weight: 600 / 700 / 800 / 900 / bold / bolder in CSS
  style={{ fontWeight: ... }} with 600+ in JSX
  font-[600], font-[700], font-[800], font-[900] arbitrary classes
  Chart/recharts label props with fontWeight 600+
  Any font-weight inside the landing page CSS

STEP 5 — Weight by role (fine-tune the most visible places)
  Page titles (e.g. "Follow-ups & Buyer Reminders")  500, 28px, letter-spacing -0.01em
  KPI values ("4 Tasks", "₹92,920")                  500, 26px
  Card / section / modal titles                      500, 18px
  Brand name in sidebar / top bar                    500
  KPI labels ("Total Reminders")                     400, 14px, secondary gray
  KPI captions ("Retailer interaction tasks")        400, 13px, muted gray
  Page descriptions                                  400, 15px, secondary gray
  Buttons ("Add Follow-up")                          500, 15px
  Record names in tables/cards                       500
  Everything else (table cells, sidebar items, inputs, badges, notes) 400
  Nothing anywhere above 500.

STEP 6 — Soften text color slightly
Use slate tones instead of near-black so text feels lighter:
  Titles & values #1E293B · labels & descriptions #475569 · captions #64748B
  Dark mode: #E2E8F0 · #CBD5E1 · #94A3B8
Keep readable contrast; don't go lighter than these.

STEP 7 — Verify
- In the browser, check computed font-weight on: the page title, a KPI value, a KPI label, the "Add Follow-up" button, a sidebar item, a table cell. Report each value — none may be above 500.
- Confirm the network tab loads no 600/700/800 font files.
- Check Dashboard, Clients, Designs, Orders, Payments, Follow-ups, Reports, Settings, Login, and one modal in light and dark mode.
- Confirm no text content changed. List the files you edited.
```

---

## If it still looks bold after this

Plus Jakarta Sans is a naturally chunky font at large sizes. Send this follow-up to Lovable:

```
Switch the app font to Inter (weights 300, 400, 500 only) everywhere, keep all the weight rules from the previous change, and make page titles and KPI values weight 500. Don't change anything else.
```
