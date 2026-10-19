# Master Prompt — Connect the Receipt Template (View / Print / PDF / Share)

Paste the box below into Lovable as ONE message.

```
The receipt template already exists at frontend/src/components/payments/ReceiptTemplate.tsx (exports ReceiptTemplate, ReceiptPreviewModal, amountInWordsINR, formatINR, DEFAULT_RECEIPT_COMPANY) with the logo at frontend/public/assets/images/shoeconnect-logo.png. It is NOT used anywhere yet. Connect it across the app so any payment's receipt can be viewed, printed, saved as PDF, and shared.

RULES
- Do not redesign the receipt. Only additive changes to ReceiptTemplate.tsx (e.g. a new status) are allowed; keep its scoped CSS and print rules.
- Receipt data must be the REAL saved payment from the database — never fake/fallback values.
- Keep the app's current design system for buttons/menus; support light + dark mode (the receipt itself stays white).

STEP 1 — Real receipt numbers
- In components/payments/RecordPaymentModal.tsx, stop generating the receipt number on the client (`SF-REC-${Math.floor(10000 + Math.random() * 90000)}`). Use the receipt number, payment id, amounts before/after and date returned by the record_payment RPC.
- Remove the placeholder phone fallback '+91 98000 00000' — use the client's real phone or omit it.

STEP 2 — Status mapping (additive change in ReceiptTemplate.tsx)
- Extend ReceiptStatus with 'Cheque Pending' (amber badge; add a line "Cheque payment subject to realisation").
- Map payment status: recorded → 'Received', verified → 'Verified', pending_clearance → 'Cheque Pending', reversed/bounced → 'Reversed' (shows the watermark).

STEP 3 — Company & customer details
- Build the `company` prop from the saved company profile in Settings (brand name, legal name, tagline, address, GSTIN, phone, email, logo). Fall back to DEFAULT_RECEIPT_COMPANY only for fields not yet saved.
- Build the `customer` prop from the customer record: customer code/ID, GSTIN, phone, address.
- Create a small hook `useReceiptData(paymentId)` that loads the payment + customer + company and returns props for ReceiptTemplate. Handle loading and "receipt not found / no access".

STEP 4 — Where users can open a receipt
1. Right after recording a payment (RecordPaymentModal success screen, including from Collections → Collect): primary button "View receipt" (opens ReceiptPreviewModal), plus "Print", "Send on WhatsApp", and "Done". Keep the existing success summary.
2. Payments page: every payment row gets a Receipt action (FileText icon) → opens ReceiptPreviewModal; row "⋯" menu gets "View receipt", "Print receipt", "Copy receipt link".
3. Customer detail page → Payments tab and Ledger tab: a receipt icon on each payment row.
4. Order detail / Order Inspect drawer: list of payments against the order, each with a receipt icon.
5. Notifications for "payment recorded": clicking opens the receipt.

STEP 5 — Dedicated receipt page (for reprint & sharing)
- Route /receipts/:paymentId (inside the logged-in app, same permission rules: admin all, salesman only own clients). Renders only the receipt centered on a light grey background with a small toolbar: Back, Print / Save as PDF, Send on WhatsApp, Copy link.
- `?print=1` opens the browser print dialog automatically once the receipt and logo have loaded.
- Page title = `Receipt-<receiptNumber>` so "Save as PDF" uses that file name.

STEP 6 — Print / PDF / Share behaviour
- Print / Save as PDF uses window.print(); only the receipt prints (the template's print CSS already hides everything else) on one A4 page with background colours.
- Wait for the logo image to finish loading before calling print.
- "Send on WhatsApp": open https://wa.me/<customer phone without +/spaces>?text=<encoded message> with: business name, receipt number, amount, date, method, balance outstanding, and the receipt page link.
- Optional (only if simple): "Download PDF" button using the existing print flow; don't add heavy PDF libraries.

STEP 7 — Verify
- Record a UPI payment → success screen → View receipt shows the DB receipt number, correct amounts before/after, amount in words, customer and company details, "Received" badge.
- Print → exactly one A4 page with only the receipt; Save as PDF file name is Receipt-<number>.pdf.
- Open the same receipt from Payments page, customer Payments tab, and /receipts/<id>?print=1 — identical content.
- Cheque payment shows "Cheque Pending"; a reversed payment shows the REVERSED watermark.
- Salesman cannot open another salesman's client's receipt.
- Works on mobile (receipt readable, WhatsApp share opens). No console errors. List the files changed.
```

---

## After Lovable finishes — how to print a receipt

1. **Right after collecting:** Collect (or Record payment) → Save → click **View receipt** → **Print / Save as PDF**.
2. **Any old payment:** Payments page → click the receipt icon on the row → **Print / Save as PDF**.
3. **From a customer:** open the customer → Payments tab → receipt icon.
4. In the print window, choose your printer, or choose **Save as PDF** as the destination. Keep paper size **A4** and turn on **Background graphics**, so the coloured bar and badge print.
