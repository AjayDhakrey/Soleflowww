import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Order, OrderItem, Organization } from '../../types';
import { useAuth } from '../../auth/AuthProvider';
import {
  DEFAULT_RECEIPT_COMPANY,
  ReceiptCompanyInfo,
  ReceiptCustomerExtras,
  amountInWordsINR,
  formatINR,
} from '../payments/ReceiptTemplate';

/* =========================================================================
   ShoeConnect — Wholesale Order Tax Invoice & Consignment Receipt Template
   - <OrderInvoiceTemplate /> : The printable Tax Invoice / Consignment Receipt
   - <InvoicePreviewModal />  : Preview Modal + Download (PDF / Word) + Print
   - exportInvoiceToWord()    : Word (.doc) exporter with preset filename
   - generateInvoiceFileName(): Clean, filesystem-safe pregenerated filename
   ========================================================================= */

export interface OrderInvoiceTemplateProps {
  order: Order;
  company?: Partial<ReceiptCompanyInfo>;
  customer?: ReceiptCustomerExtras;
  generatedAt?: Date;
}

export function generateInvoiceFileName(
  order?: Order | null,
  customer?: ReceiptCustomerExtras
): string {
  if (!order) return 'SoleFlow_Wholesale_Invoice';

  const orderNo = (order.id || 'ORD').replace(/[^a-zA-Z0-9_-]/g, '');
  const rawCustomer = order.customerName || 'Store';
  const cleanCustomer = rawCustomer
    .replace(/__AUDIT_TEST__/g, '')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 18) || 'Store';

  const amountNum = Number(order.netPayable ?? order.subtotal ?? 0);
  let amountStr = 'Rs0';
  if (amountNum >= 100000) {
    const inLakh = amountNum / 100000;
    amountStr = `Rs${inLakh % 1 === 0 ? inLakh : inLakh.toFixed(2).replace(/\.?0+$/, '')}L`;
  } else if (amountNum >= 1000) {
    const inK = amountNum / 1000;
    amountStr = `Rs${inK % 1 === 0 ? inK : inK.toFixed(1).replace(/\.?0+$/, '')}K`;
  } else if (amountNum > 0) {
    amountStr = `Rs${Math.round(amountNum)}`;
  }

  let dateStr = '';
  if (order.orderDate && order.orderDate !== 'Today') {
    const d = new Date(order.orderDate);
    if (!Number.isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '');
    } else {
      dateStr = order.orderDate.replace(/[^a-zA-Z0-9]/g, '');
    }
  }
  if (!dateStr) {
    const now = new Date();
    dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '');
  }

  return ['Invoice', orderNo, cleanCustomer, amountStr, dateStr].filter(Boolean).join('_');
}

/**
 * Company identity comes from the signed-in user's real organization —
 * nothing fabricated prints on documents (same pattern as useReceiptData).
 */
function buildOrgCompanyInfo(org: Organization | null | undefined): ReceiptCompanyInfo {
  return {
    ...DEFAULT_RECEIPT_COMPANY,
    brandName: org?.name || 'SoleFlow',
    legalName: org?.name || '',
    tagline: '',
    address: [org?.city, org?.state].filter(Boolean).join(', '),
    gstin: org?.gstin || '',
    phone: org?.phone || '',
    logoUrl: '/assets/images/shoeconnect-logo.png',
  };
}

function formatDate(value: string | Date | undefined): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(d: Date): string {
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Export invoice as formatted Microsoft Word document (.doc)
 */
export function exportInvoiceToWord(
  order: Order,
  company?: Partial<ReceiptCompanyInfo>,
  customer?: ReceiptCustomerExtras,
  fileName?: string
) {
  const co = { ...DEFAULT_RECEIPT_COMPANY, ...(company || {}) };
  const nameToSave = fileName || generateInvoiceFileName(order, customer);
  const items = order.items && order.items.length > 0 ? order.items : [];

  const itemsRows = items
    .map(
      (item, idx) => `
    <tr>
      <td style="padding: 7pt; border-bottom: 1pt solid #E2E8F0; text-align: center;">${idx + 1}</td>
      <td style="padding: 7pt; border-bottom: 1pt solid #E2E8F0;">
        <strong>${item.designName || 'Footwear Article'}</strong><br/>
        <span style="font-size: 8.5pt; color: #64748B; font-family: monospace;">Art: ${item.articleCode || '—'}</span>
      </td>
      <td style="padding: 7pt; border-bottom: 1pt solid #E2E8F0; font-size: 9pt;">
        ${
          item.sizeBreakdown && item.sizeBreakdown.length > 0
            ? item.sizeBreakdown.map((s) => `${s.size}×${s.pairs}`).join(', ')
            : 'Standard Size Assortment'
        }
      </td>
      <td style="padding: 7pt; border-bottom: 1pt solid #E2E8F0; text-align: center;">
        <strong>${item.totalPairs || order.pairsCount || 0}</strong> Prs
      </td>
      <td style="padding: 7pt; border-bottom: 1pt solid #E2E8F0; text-align: right;">
        ${formatINR(item.ratePerPair || order.wholesaleRate || 0)}
      </td>
      <td style="padding: 7pt; border-bottom: 1pt solid #E2E8F0; text-align: right; font-weight: bold;">
        ${formatINR(item.itemSubtotal || order.subtotal || 0)}
      </td>
    </tr>
  `
    )
    .join('');

  const wordHtml = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="utf-8">
    <title>${nameToSave}</title>
    <!--[if gte mso 9]>
    <xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
      @page { size: A4 portrait; margin: 15mm; }
      body { font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif; font-size: 10pt; color: #1E293B; line-height: 1.45; background: #FFFFFF; }
      .head-table { width: 100%; border-bottom: 2pt solid #0B2A5B; padding-bottom: 10pt; margin-bottom: 12pt; }
      .brand-title { font-size: 18pt; font-weight: bold; color: #0B2A5B; }
      .brand-tag { font-size: 9.5pt; color: #C98E1A; font-weight: bold; }
      .doc-title { font-size: 16pt; font-weight: bold; color: #0B2A5B; text-align: right; }
      .meta-text { font-size: 9pt; color: #64748B; text-align: right; }
      .parties-table { width: 100%; margin-bottom: 12pt; }
      .party-box { width: 50%; vertical-align: top; padding: 8pt; background: #F8FAFC; border: 1pt solid #E2E8F0; border-radius: 4pt; }
      .party-label { font-size: 8pt; font-weight: bold; color: #64748B; text-transform: uppercase; }
      .party-name { font-size: 11pt; font-weight: bold; color: #0F172A; margin: 2pt 0; }
      .line-table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
      .line-table th { background: #0B2A5B; color: #FFFFFF; padding: 6pt 7pt; font-size: 9pt; text-align: left; }
      .amount-banner { background: #0B2A5B; color: #FFFFFF; padding: 10pt 14pt; margin-bottom: 12pt; border-radius: 4pt; }
      .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
      .summary-table td { padding: 4pt 8pt; border-bottom: 1pt solid #F1F5F9; font-size: 9.5pt; }
      .footer-table { width: 100%; margin-top: 20pt; border-top: 1pt solid #E2E8F0; padding-top: 10pt; }
    </style>
  </head>
  <body>
    <table class="head-table">
      <tr>
        <td style="vertical-align: top;">
          <div class="brand-title">${co.brandName}</div>
          <div class="brand-tag">${co.tagline || 'Footwear Wholesale Trading'}</div>
          <div style="font-size: 8.5pt; color: #64748B; margin-top: 3pt;">
            ${co.legalName || ''}<br/>
            ${co.address || ''}<br/>
            ${co.gstin ? `GSTIN: ${co.gstin}` : ''}
          </div>
        </td>
        <td style="vertical-align: top; text-align: right;">
          <div class="doc-title">TAX INVOICE / CONSIGNMENT</div>
          <div class="meta-text" style="margin-top: 3pt;">
            Invoice / Order No: <strong>${order.id}</strong><br/>
            Order Date: <strong>${order.orderDate || 'Today'}</strong><br/>
            Target Dispatch: <strong>${order.expectedDelivery || 'Scheduled'}</strong><br/>
            Status: <strong>${order.status}</strong>
          </div>
        </td>
      </tr>
    </table>

    <table class="parties-table">
      <tr>
        <td class="party-box" style="margin-right: 6pt;">
          <div class="party-label">Billed &amp; Consigned To (Retailer)</div>
          <div class="party-name">${order.customerName}</div>
          <div style="font-size: 8.5pt; color: #475569;">
            ${order.propName ? `Prop: <strong>${order.propName}</strong><br/>` : ''}
            ${customer?.address || `${order.customerCity}, ${order.customerState}`}<br/>
            ${customer?.gstin ? `GSTIN: <strong>${customer.gstin}</strong><br/>` : ''}
            ${customer?.phone ? `Phone: <strong>${customer.phone}</strong><br/>` : ''}
            Customer ID: <span style="font-family: monospace;">${order.customerId}</span>
          </div>
        </td>
        <td class="party-box">
          <div class="party-label">Factory &amp; Route Logistics</div>
          <div class="party-name">${order.manufacturerName || '—'}</div>
          <div style="font-size: 8.5pt; color: #475569;">
            Plant: ${order.manufacturerPlant || '—'}<br/>
            Assigned Rep: <strong>${order.salespersonName || 'Unassigned'}</strong><br/>
            Payment Status: <strong>${order.paymentStatus || '—'}</strong><br/>
            Batch Code: <span style="font-family: monospace;">${order.batchNumber || order.id}</span>
          </div>
        </td>
      </tr>
    </table>

    <table class="line-table">
      <thead>
        <tr>
          <th style="width: 30pt; text-align: center;">#</th>
          <th>Article &amp; Style</th>
          <th>Size Matrix</th>
          <th style="text-align: center;">Pairs</th>
          <th style="text-align: right;">Rate (₹)</th>
          <th style="text-align: right;">Subtotal (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <table style="width: 100%; margin-bottom: 12pt;">
      <tr>
        <td style="width: 55%; vertical-align: top; padding-right: 12pt;">
          <div style="background: #F8FAFC; border: 1pt solid #E2E8F0; padding: 8pt; border-radius: 4pt; font-size: 8.5pt; color: #475569;">
            <strong style="color: #0B2A5B;">Amount in Words:</strong><br/>
            <em>${amountInWordsINR(order.netPayable || order.subtotal || 0)}</em>
          </div>
          <div style="margin-top: 8pt; font-size: 8pt; color: #64748B;">
            <strong>Terms &amp; Conditions:</strong><br/>
            1. Goods once inspected and sold are subject to manufacturer standard defect warranty.<br/>
            2. Payment balance to be cleared as per trade terms prior to Bilty discharge.<br/>
            3. Subject to Agra jurisdiction only.
          </div>
        </td>
        <td style="width: 45%; vertical-align: top;">
          <table class="summary-table">
            <tr><td>Gross Subtotal</td><td style="text-align: right; font-weight: bold;">${formatINR(order.subtotal || 0)}</td></tr>
            ${order.tradeDiscountAmount ? `<tr><td style="color: #059669;">Trade Discount (${order.tradeDiscountPercent || 0}%)</td><td style="text-align: right; color: #059669;">− ${formatINR(order.tradeDiscountAmount)}</td></tr>` : ''}
            <tr><td>Taxable Value</td><td style="text-align: right;">${formatINR(order.taxableSubtotal || order.subtotal || 0)}</td></tr>
            <tr><td>GST (${order.gstPercent || 12}%)</td><td style="text-align: right;">+ ${formatINR(order.gstAmount || 0)}</td></tr>
            <tr style="background: #EFF6FF;"><td style="font-weight: bold; color: #1D5FD1; font-size: 11pt;">Net Payable</td><td style="text-align: right; font-weight: bold; color: #1D5FD1; font-size: 11pt;">${formatINR(order.netPayable || order.subtotal || 0)}</td></tr>
            <tr><td style="color: #059669;">Advance Deposited</td><td style="text-align: right; color: #059669;">− ${formatINR(order.advanceDeposited || 0)}</td></tr>
            <tr style="background: #FEF2F2;"><td style="font-weight: bold; color: #DC2626;">Balance Due Ledger</td><td style="text-align: right; font-weight: bold; color: #DC2626;">${formatINR(order.balanceDue || 0)}</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <table class="footer-table">
      <tr>
        <td style="width: 50%; font-size: 8.5pt; color: #64748B;">
          Customer / Consignee Receiver Seal &amp; Signature
        </td>
        <td style="width: 50%; text-align: right; font-size: 8.5pt; color: #0F172A;">
          For <strong>${co.legalName || co.brandName}</strong><br/><br/><br/>
          <strong>Authorised Signatory</strong>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nameToSave}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const INVOICE_CSS = `
:root {
  --inv-navy: #0B2A5B;
  --inv-gold: #C98E1A;
  --inv-ink: #0F172A;
  --inv-muted: #64748B;
  --inv-line: #E2E8F0;
  --inv-soft: #F8FAFC;
}

.inv-doc {
  background: #FFFFFF !important;
  color: var(--inv-ink) !important;
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  padding: 0;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--inv-line);
  font-family: var(--font-sans, "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif);
  box-sizing: border-box;
}

.inv-doc * {
  box-sizing: border-box;
}

.inv-band {
  height: 8px;
  background: linear-gradient(90deg, var(--inv-navy) 0%, #1D5FD1 65%, var(--inv-gold) 100%);
}

.inv-body {
  padding: 32px 36px;
}

.inv-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.inv-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.inv-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  background: #EFF6FF;
  border: 1px solid #DBEAFE;
}

.inv-brandname {
  font-family: var(--font-display, "Sora", ui-sans-serif, system-ui, sans-serif);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--inv-navy);
  line-height: 1.1;
}

.inv-tagline {
  font-size: 11px;
  font-weight: 600;
  color: var(--inv-gold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 3px;
}

.inv-company {
  margin-top: 10px;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--inv-muted);
}

.inv-title-box {
  text-align: right;
}

.inv-title-box h1 {
  font-family: var(--font-display, "Sora", ui-sans-serif, system-ui, sans-serif);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--inv-navy);
  margin: 0;
}

.inv-title-box .sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--inv-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 2px;
}

.inv-meta-grid {
  display: grid;
  grid-template-columns: auto auto;
  gap: 3px 12px;
  font-size: 12px;
  margin-top: 8px;
  text-align: right;
  justify-content: end;
}

.inv-meta-grid .label {
  color: var(--inv-muted);
}

.inv-meta-grid .val {
  font-weight: 700;
  color: var(--inv-ink);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.inv-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  margin-top: 8px;
  background: #EFF6FF;
  color: #1D5FD1;
  border: 1px solid #DBEAFE;
}

.inv-rule {
  height: 1px;
  background: var(--inv-line);
  margin: 20px 0;
}

.inv-parties {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.inv-party-card {
  background: var(--inv-soft);
  border: 1px solid var(--inv-line);
  border-radius: 12px;
  padding: 14px 16px;
}

.inv-party-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--inv-muted);
  margin-bottom: 4px;
}

.inv-party-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--inv-ink);
  margin-bottom: 4px;
}

.inv-party-details {
  font-size: 11.5px;
  color: #475569;
  line-height: 1.45;
}

.inv-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 18px;
  font-size: 12px;
}

.inv-table th {
  background: #0B2A5B;
  color: #FFFFFF;
  font-weight: 600;
  padding: 10px 12px;
  text-align: left;
  font-size: 11.5px;
  letter-spacing: 0.02em;
}

.inv-table th:first-child {
  border-top-left-radius: 8px;
}

.inv-table th:last-child {
  border-top-right-radius: 8px;
  text-align: right;
}

.inv-table th.num {
  text-align: right;
}

.inv-table th.center {
  text-align: center;
}

.inv-table td {
  padding: 12px;
  border-bottom: 1px solid var(--inv-line);
  vertical-align: top;
  color: var(--inv-ink);
}

.inv-table td.num {
  text-align: right;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.inv-table td.center {
  text-align: center;
}

.inv-bottom-split {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 20px;
  margin-top: 18px;
  align-items: start;
}

.inv-words-box {
  background: var(--inv-soft);
  border: 1px solid var(--inv-line);
  border-radius: 10px;
  padding: 12px 14px;
}

.inv-words-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--inv-navy);
  letter-spacing: 0.05em;
}

.inv-words-val {
  font-size: 11.5px;
  font-weight: 600;
  color: #334155;
  margin-top: 3px;
  line-height: 1.4;
  font-style: italic;
}

.inv-terms {
  margin-top: 14px;
  font-size: 10.5px;
  color: var(--inv-muted);
  line-height: 1.45;
}

.inv-terms strong {
  color: #334155;
}

.inv-summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.inv-summary-table tr td {
  padding: 6px 10px;
  border-bottom: 1px solid #F1F5F9;
}

.inv-summary-table tr td:last-child {
  text-align: right;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
}

.inv-summary-table tr.total-row {
  background: #EFF6FF;
  border-radius: 6px;
}

.inv-summary-table tr.total-row td {
  padding: 8px 10px;
  font-size: 13.5px;
  font-weight: 800;
  color: #1D5FD1;
  border-bottom: none;
}

.inv-summary-table tr.balance-row {
  background: #FEF2F2;
}

.inv-summary-table tr.balance-row td {
  padding: 7px 10px;
  font-size: 12.5px;
  font-weight: 800;
  color: #DC2626;
  border-bottom: none;
}

.inv-foot {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid var(--inv-line);
}

.inv-sign {
  text-align: right;
}

.inv-sign .for {
  font-size: 10.5px;
  color: var(--inv-muted);
}

.inv-sign .line {
  margin-top: 36px;
  padding-top: 4px;
  border-top: 1px solid #94A3B8;
  font-size: 11px;
  font-weight: 700;
  color: var(--inv-ink);
  min-width: 160px;
}

.inv-legal {
  margin-top: 16px;
  padding-top: 10px;
  border-top: 1px dashed var(--inv-line);
  font-size: 10px;
  color: var(--inv-muted);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 10mm;
  }
  body * {
    visibility: hidden !important;
  }
  #invoice-print-root, #invoice-print-root * {
    visibility: visible !important;
  }
  #invoice-print-root {
    position: absolute;
    left: 0;
    top: 0;
    width: 100% !important;
    background: #FFFFFF !important;
  }
  .inv-doc {
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
  }
  .inv-noprint {
    display: none !important;
  }
}
`;

export const OrderInvoiceTemplate: React.FC<OrderInvoiceTemplateProps> = ({
  order,
  company,
  customer,
  generatedAt,
}) => {
  const { org } = useAuth();
  const co: ReceiptCompanyInfo = { ...buildOrgCompanyInfo(org), ...company };
  const printedAt = generatedAt ?? new Date();
  const items = order.items && order.items.length > 0 ? order.items : [];

  return (
    <div className="inv-doc" role="document" aria-label={`Invoice for order ${order.id}`}>
      <style>{INVOICE_CSS}</style>
      <div className="inv-band" />
      <div className="inv-body">
        {/* Header */}
        <div className="inv-head">
          <div>
            <div className="inv-brand">
              {co.logoUrl && (
                <img
                  className="inv-logo"
                  src={co.logoUrl}
                  alt={`${co.brandName} logo`}
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                />
              )}
              <div>
                <div className="inv-brandname">{co.brandName}</div>
                {co.tagline && <div className="inv-tagline">{co.tagline}</div>}
              </div>
            </div>
            <div className="inv-company">
              {co.legalName && <div><strong>{co.legalName}</strong></div>}
              {co.address && <div>{co.address}</div>}
              <div>
                {[co.gstin && `GSTIN: ${co.gstin}`, co.phone && `Ph: ${co.phone}`, co.email]
                  .filter(Boolean)
                  .join('  •  ')}
              </div>
            </div>
          </div>

          <div className="inv-title-box">
            <h1>TAX INVOICE</h1>
            <div className="sub">Wholesale Consignment</div>
            <div className="inv-meta-grid">
              <span className="label">Invoice / Order</span>
              <span className="val">{order.id}</span>
              <span className="label">Order Date</span>
              <span>{formatDate(order.orderDate)}</span>
              <span className="label">Target Dispatch</span>
              <span>{formatDate(order.expectedDelivery)}</span>
              {order.batchNumber && (
                <>
                  <span className="label">Batch Code</span>
                  <span className="val">{order.batchNumber}</span>
                </>
              )}
            </div>
            <div className="inv-badge">{order.status}</div>
          </div>
        </div>

        <div className="inv-rule" />

        {/* Parties */}
        <div className="inv-parties">
          <div className="inv-party-card">
            <div className="inv-party-label">Billed &amp; Consigned To (Retailer)</div>
            <div className="inv-party-name">{order.customerName}</div>
            <div className="inv-party-details">
              {order.propName && <div>Proprietor: <strong>{order.propName}</strong></div>}
              <div>{customer?.address || `${order.customerCity}, ${order.customerState}`}</div>
              {customer?.gstin && <div>GSTIN: <strong>{customer.gstin}</strong></div>}
              {customer?.phone && <div>Phone: <strong>{customer.phone}</strong></div>}
              <div>Customer Code: <strong style={{ fontFamily: 'monospace' }}>{order.customerId}</strong></div>
            </div>
          </div>

          <div className="inv-party-card">
            <div className="inv-party-label">Foundry &amp; Commercial Terms</div>
            <div className="inv-party-name">{order.manufacturerName || '—'}</div>
            <div className="inv-party-details">
              <div>Manufacturing Plant: <strong>{order.manufacturerPlant || '—'}</strong></div>
              <div>Sales Representative: <strong>{order.salespersonName || 'Unassigned'}</strong></div>
              <div>Payment Status: <strong>{order.paymentStatus || '—'}</strong></div>
              <div>Total Consignment Units: <strong>{order.pairsCount || 0} Pairs ({order.cartonsCount || 0} Ctns)</strong></div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="inv-table">
          <thead>
            <tr>
              <th style={{ width: 32 }} className="center">#</th>
              <th>Article &amp; Style Name</th>
              <th>Size Matrix Ratio</th>
              <th className="center">Pairs</th>
              <th className="num">Rate / Pr</th>
              <th className="num">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, idx) => (
                <tr key={idx}>
                  <td className="center" style={{ color: 'var(--inv-muted)' }}>{idx + 1}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--inv-navy)' }}>{item.designName || 'Footwear Model'}</div>
                    <div style={{ fontSize: 11, color: 'var(--inv-muted)', fontFamily: 'monospace', marginTop: 2 }}>
                      Art: {item.articleCode || '—'}
                    </div>
                  </td>
                  <td style={{ fontSize: 11.5 }}>
                    {item.sizeBreakdown && item.sizeBreakdown.length > 0 ? (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {item.sizeBreakdown.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            style={{
                              background: '#F1F5F9',
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              fontSize: 11,
                            }}
                          >
                            {s.size}×{s.pairs}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--inv-muted)' }}>Standard Assortment</span>
                    )}
                  </td>
                  <td className="center" style={{ fontWeight: 700 }}>
                    {item.totalPairs || 0}
                  </td>
                  <td className="num">{formatINR(item.ratePerPair || 0)}</td>
                  <td className="num" style={{ fontWeight: 700 }}>{formatINR(item.itemSubtotal || 0)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="center">1</td>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--inv-navy)' }}>Consignment Lot ({order.id})</div>
                  <div style={{ fontSize: 11, color: 'var(--inv-muted)' }}>Wholesale Footwear Batch</div>
                </td>
                <td>Standard Assortment</td>
                <td className="center" style={{ fontWeight: 700 }}>{order.pairsCount || 0}</td>
                <td className="num">{formatINR(order.wholesaleRate || 0)}</td>
                <td className="num" style={{ fontWeight: 700 }}>{formatINR(order.subtotal || 0)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Bottom Financial & Words Section */}
        <div className="inv-bottom-split">
          <div>
            <div className="inv-words-box">
              <div className="inv-words-label">Invoice Amount in Words</div>
              <div className="inv-words-val">
                {amountInWordsINR(order.netPayable ?? order.subtotal ?? 0)}
              </div>
            </div>

            <div className="inv-terms">
              <strong>Terms &amp; Conditions:</strong>
              <ol style={{ margin: '4px 0 0 16px', padding: 0 }}>
                <li>Consignment is dispatched against approved trade bilty and transport documentation.</li>
                <li>Factory defect claims must be notified within 7 days of delivery receipt.</li>
                <li>Agra Mandi jurisdiction applies to all financial and trade disputes.</li>
              </ol>
            </div>
          </div>

          <div>
            <table className="inv-summary-table">
              <tbody>
                <tr>
                  <td>Gross Wholesale Subtotal</td>
                  <td>{formatINR(order.subtotal || 0)}</td>
                </tr>
                {order.tradeDiscountAmount ? (
                  <tr>
                    <td style={{ color: '#059669' }}>
                      Trade Discount ({order.tradeDiscountPercent || 0}%)
                    </td>
                    <td style={{ color: '#059669' }}>
                      − {formatINR(order.tradeDiscountAmount)}
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <td>Taxable Value</td>
                  <td>{formatINR(order.taxableSubtotal ?? order.subtotal ?? 0)}</td>
                </tr>
                <tr>
                  <td>GST ({order.gstPercent || 12}%)</td>
                  <td>+ {formatINR(order.gstAmount || 0)}</td>
                </tr>
                <tr className="total-row">
                  <td>Net Payable Invoice</td>
                  <td>{formatINR(order.netPayable ?? order.subtotal ?? 0)}</td>
                </tr>
                <tr>
                  <td style={{ color: '#059669' }}>Advance Deposited</td>
                  <td style={{ color: '#059669' }}>
                    − {formatINR(order.advanceDeposited || 0)}
                  </td>
                </tr>
                <tr className="balance-row">
                  <td>Balance Due Ledger</td>
                  <td>{formatINR(order.balanceDue || 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer & Signatures */}
        <div className="inv-foot">
          <div style={{ fontSize: 11, color: 'var(--inv-muted)', maxWidth: 360, lineHeight: 1.45 }}>
            Thank you for partnering with SoleFlow. Please quote Invoice No.{' '}
            <strong style={{ fontFamily: 'monospace' }}>{order.id}</strong> on all ledger settlement vouchers.
          </div>

          <div className="inv-sign">
            <div className="for">For {co.legalName || co.brandName}</div>
            <div className="line">Authorised Signatory</div>
          </div>
        </div>

        <div className="inv-legal">
          <span>This is an authentic computer-generated Wholesale Tax Invoice.</span>
          <span>Generated: {formatDateTime(printedAt)}</span>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   Invoice Preview Modal Component with PDF/Word Export & Clean Print
   ========================================================================= */

export interface InvoicePreviewModalProps extends OrderInvoiceTemplateProps {
  open: boolean;
  onClose: () => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  open,
  onClose,
  ...props
}) => {
  const { org } = useAuth();
  const [fileFormat, setFileFormat] = useState<'pdf' | 'word'>('pdf');
  const [isDownloading, setIsDownloading] = useState(false);

  const suggestedBaseName = generateInvoiceFileName(props.order, props.customer);
  const currentExtension = fileFormat === 'pdf' ? 'pdf' : 'doc';
  const fullFileName = `${suggestedBaseName}.${currentExtension}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prevTitle = document.title;
    document.title = suggestedBaseName;
    return () => {
      window.removeEventListener('keydown', onKey);
      document.title = prevTitle;
    };
  }, [open, onClose, suggestedBaseName]);

  const handleDownload = async () => {
    if (fileFormat === 'word') {
      exportInvoiceToWord(
        props.order,
        { ...buildOrgCompanyInfo(org), ...props.company },
        props.customer,
        suggestedBaseName
      );
      return;
    }

    const element = document.getElementById('invoice-print-root');
    if (!element) return;

    setIsDownloading(true);
    try {
      // @ts-ignore
      const html2pdfModule = (await import('html2pdf.js')).default || (await import('html2pdf.js'));
      const opt = {
        margin: [8, 8, 8, 8] as [number, number, number, number],
        filename: `${suggestedBaseName}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      };
      await html2pdfModule().set(opt).from(element).save();
    } catch (err) {
      console.warn('html2pdf fallback to print:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Invoice ${props.order.id}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15,23,42,.75)',
        backdropFilter: 'blur(5px)',
        overflowY: 'auto',
        padding: '24px 12px',
      }}
      onClick={onClose}
    >
      <div style={{ maxWidth: 840, margin: '0 auto' }} onClick={(e) => e.stopPropagation()}>
        {/* Top Floating Control Bar */}
        <div
          className="inv-noprint"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            marginBottom: 16,
          }}
        >
          {/* Preset File Name Chip */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 10,
              border: '1px solid rgba(226,232,240,0.9)',
              fontSize: 12,
              color: '#334155',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <span style={{ fontWeight: 700, color: '#0B2A5B' }}>📄 Preset:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1D5FD1' }}>
              {fullFileName}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            {/* Format Switcher: PDF (Default) / Word (.doc) */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.95)',
                padding: '2px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
              }}
            >
              <button
                type="button"
                onClick={() => setFileFormat('pdf')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 0,
                  fontSize: 12,
                  fontWeight: fileFormat === 'pdf' ? 700 : 500,
                  background: fileFormat === 'pdf' ? '#1D5FD1' : 'transparent',
                  color: fileFormat === 'pdf' ? '#fff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                PDF (Default)
              </button>
              <button
                type="button"
                onClick={() => setFileFormat('word')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 0,
                  fontSize: 12,
                  fontWeight: fileFormat === 'word' ? 700 : 500,
                  background: fileFormat === 'word' ? '#2563EB' : 'transparent',
                  color: fileFormat === 'word' ? '#fff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Word (.doc)
              </button>
            </div>

            {/* Primary Action Button: "Download" */}
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 20px',
                borderRadius: 10,
                background: '#1D5FD1',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                border: 0,
                cursor: isDownloading ? 'wait' : 'pointer',
                boxShadow: '0 2px 6px rgba(29,95,209,0.35)',
                opacity: isDownloading ? 0.85 : 1,
              }}
              title={`Download invoice as ${fileFormat.toUpperCase()} with pre-filled filename`}
            >
              <span>{isDownloading ? '⏳ Generating...' : '⬇️ Download'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => {
                document.title = suggestedBaseName;
                window.print();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                background: '#F1F5F9',
                color: '#334155',
                fontWeight: 600,
                fontSize: 13,
                border: '1px solid #CBD5E1',
                cursor: 'pointer',
              }}
              title="Send to physical printer"
            >
              <span>🖨️ Print</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                background: '#fff',
                color: '#1E293B',
                fontWeight: 600,
                fontSize: 13,
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Root Area */}
        <div id="invoice-print-root">
          <OrderInvoiceTemplate {...props} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OrderInvoiceTemplate;
