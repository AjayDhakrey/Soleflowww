# Master Prompt — Order "Inspect" Panel with Images (SoleFlow)

Paste the box below into Lovable as ONE message.

```
In the Orders page, clicking "Inspect" in an order's actions must open an Inspect panel showing that order's complete information WITH product images. Implement it as described below.

Do NOT remove or change any existing text, columns, actions, the existing order detail view, data, routes, or logic other than what's listed here. Follow the app's current design system (bg-surface, text-foreground, text-muted-foreground, border-border, bg-muted, rounded-2xl cards, lucide icons, current font weights) and make it fully readable in BOTH light and dark mode.

CONTEXT (verified in the code)
- File: frontend/src/pages/orders/OrdersPage.tsx
- `handleInspect(orderItem: OrderDisplayItem)` currently does `orders.find(o => o.id === orderItem.id) || orders[0]` and switches to the full detail view.
- The table is rendered from `DEFAULT_ORDERS_DISPLAY` (a hard-coded display list), so its IDs may not match real orders, and the `|| orders[0]` fallback silently opens the WRONG order.
- Types in frontend/src/types/index.ts: `Order` (customer, salesperson, items, pairs, cartons, subtotal, discount, GST, netPayable, advanceDeposited, balanceDue, manufacturer, expectedDelivery, paymentStatus, status, orderDate, batchNumber, timeline) and `OrderItem` (designId, designName, articleCode, image, ratePerPair, sizeBreakdown, totalPairs, totalCartons, loosePairs, itemSubtotal). Designs (`ShoeDesign`) also have `image`.

STEP 1 — Fix the data source and the wrong-order bug
- Build the table rows from the real `orders` array in AppContext (map each Order to the existing OrderDisplayItem shape so the table looks the same). Keep DEFAULT_ORDERS_DISPLAY in the file and use it ONLY when `orders` is empty (demo fallback), marked with a `// demo fallback` comment.
- Remove the `|| orders[0]` fallback. If the order can't be found, show a toast "Order not found" and don't open anything.

STEP 2 — Inspect panel (new component)
Create frontend/src/components/orders/OrderInspectDrawer.tsx:
- Props: `order: Order | null`, `open: boolean`, `onClose()`, `onOpenFullDetail(order)`.
- Desktop: right-side slide-over drawer, 560px wide, full height, bg-surface, border-l border-border, soft shadow, 200ms slide-in. Mobile (<640px): full-screen sheet.
- Backdrop: black/40 (black/60 in dark). Close on backdrop click, Esc key, and an X button. Focus is trapped inside while open and returns to the Inspect button on close. role="dialog", aria-modal="true", aria-labelledby the title.
- Body scrolls; header and footer stay fixed.
- Update the URL to `?inspect=<orderId>` while open so it can be shared/refreshed; opening the page with that param opens the drawer. Browser Back closes it.

STEP 3 — Content of the Inspect panel (top to bottom)
1. Header: order ID (e.g. ORD-2026-0148, monospace), status badge (reuse the page's existing status badge function), payment status badge, order date. X close button top-right.
2. Image gallery (the main new part):
   - Large main image (aspect-square or 4:3, object-contain, bg-muted, rounded-xl) of the selected item's `image`.
   - Thumbnail strip below with one thumbnail per order item (64px, rounded-lg); selected thumbnail has a 2px primary ring. Click or ←/→ keys to switch.
   - Caption under the main image: design name, article code (monospace), rate per pair.
   - Click the main image → fullscreen lightbox (black/90 background, image centered, prev/next arrows, Esc to close, counter "2 / 5").
   - Missing/broken image: show a neutral placeholder tile with a Footprints icon and the article code — never a broken-image icon. If an item has no image, try the matching design's image from `designs` by designId.
   - Lazy-load images (loading="lazy"), with a skeleton shimmer until loaded.
3. Client & team card: client business name, contact person (propName), city/state, salesperson name. Client name and salesperson are links to their pages if those routes exist.
4. Items table (one row per OrderItem): thumbnail (40px), design name + article code, size breakdown shown as small chips (e.g. "6×12 7×24 8×24"), pairs, cartons (+ loose pairs), rate/pair, item subtotal (right-aligned, tabular-nums). Clicking a row selects that item in the gallery.
5. Money summary (right-aligned, ₹ with Indian grouping, tabular-nums): Subtotal, Trade discount (x%), Taxable, GST (x%), Net payable (emphasized), Advance deposited (green), Balance due (red if > 0 and overdue, otherwise foreground).
6. Fulfilment card: manufacturer name + plant, batch number, expected delivery date, total pairs and cartons.
7. Timeline: vertical list from `order.timeline` — status icon, step name, date/time, actor/note if present; completed steps in foreground, upcoming steps muted.
8. Empty sections: if a section has no data, show one muted line (e.g. "No manufacturer assigned yet") instead of hiding it.

STEP 4 — Footer actions (sticky at the bottom of the drawer)
- "Open full details" (secondary) → calls the existing detail view logic (setSelectedOrder + setViewMode('detail')) and closes the drawer.
- "Print" (secondary, Printer icon) → window.print() with a print stylesheet that shows only the drawer content (images included).
- Keep permission rules: only show actions the current role is already allowed to perform on this page (e.g. status updates) — do not add new powers.

STEP 5 — Wire it up
- In OrdersPage, add state `inspectOrderId` and change `handleInspect` to open the drawer (instead of jumping straight to the full detail view). The row click / other existing buttons keep their current behavior.
- The Inspect action exists both in the table row (around line 364) and in the actions menu (around line 441) — both must open the drawer for the correct order.
- Add an Eye icon (lucide) before the "Inspect" label if not already present.

STEP 6 — Quality checks before finishing
- Clicking Inspect on EVERY row opens the drawer for exactly that order (check at least 3 different orders).
- Images show for each item; switching thumbnails works; lightbox works; broken image URL shows the placeholder.
- Keyboard: Tab through, Esc closes, focus returns to the Inspect button.
- Works and is readable in light and dark mode, at 1440px and 375px.
- URL ?inspect= works on refresh; Back button closes the drawer.
- No console errors; no existing content or behavior removed. List the files changed.
```

---

## Quick check after Lovable finishes

- [ ] Inspect opens a side panel for the exact order you clicked (not the first order)
- [ ] Big product image + thumbnails for every item; click to enlarge
- [ ] Client, items with sizes, money summary, manufacturer, timeline all shown
- [ ] "Open full details" still opens the old detail page
- [ ] Esc / X / clicking outside closes it
- [ ] Readable in light and dark mode, works on mobile
