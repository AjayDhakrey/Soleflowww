import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PaymentReceipt } from '../../types';

/* =========================================================================
   ShoeConnect — Payment Receipt Template
   - <ReceiptTemplate />      : the printable receipt (always white, theme-independent)
   - <ReceiptPreviewModal />  : preview + Print / Save as PDF
   - amountInWordsINR()       : Indian-system amount in words (Lakh / Crore)
   ========================================================================= */

export interface ReceiptCompanyInfo {
  brandName: string;
  legalName?: string;
  tagline?: string;
  address?: string;
  gstin?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
}

export interface ReceiptCustomerExtras {
  customerCode?: string;
  gstin?: string;
  phone?: string;
  address?: string;
}

export type ReceiptStatus = 'Received' | 'Verified' | 'Cheque Pending' | 'Reversed';

export function mapPaymentStatusToReceiptStatus(status?: string): ReceiptStatus {
  if (!status) return 'Received';
  const s = status.toLowerCase();
  if (s === 'verified') return 'Verified';
  if (s === 'pending_clearance' || s === 'cheque pending' || s === 'pending') return 'Cheque Pending';
  if (s === 'bounced' || s === 'reversed') return 'Reversed';
  return 'Received';
}

export interface ReceiptTemplateProps {
  receipt: PaymentReceipt;
  company?: Partial<ReceiptCompanyInfo>;
  customer?: ReceiptCustomerExtras;
  status?: ReceiptStatus;
  /** When the receipt was generated/printed. Defaults to now. */
  generatedAt?: Date;
}

export const DEFAULT_RECEIPT_COMPANY: ReceiptCompanyInfo = {
  brandName: 'ShoeConnect',
  legalName: 'SoleFlow Footwear Trading Ltd.',
  tagline: 'Step Towards Better Tomorrow',
  address: 'Agra Mandi Dock 4, Hing Ki Mandi, Agra, Uttar Pradesh',
  gstin: '09AAACS4412M1Z0',
  phone: '',
  email: '',
  logoUrl: '/assets/images/shoeconnect-logo.png',
};

/* ------------------------------- Helpers -------------------------------- */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function belowHundred(n: number): string {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
}

function belowThousand(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return [h ? `${ONES[h]} Hundred` : '', r ? belowHundred(r) : ''].filter(Boolean).join(' ');
}

function integerInWords(n: number): string {
  if (n === 0) return 'Zero';
  const parts: string[] = [];
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  if (crore) parts.push(`${integerInWords(crore)} Crore`);
  if (lakh) parts.push(`${belowHundred(lakh)} Lakh`);
  if (thousand) parts.push(`${belowHundred(thousand)} Thousand`);
  if (rest) parts.push(belowThousand(rest));
  return parts.join(' ');
}

/** 150000.5 → "Rupees One Lakh Fifty Thousand and Fifty Paise Only" */
export function amountInWordsINR(amount: number): string {
  const safe = Math.max(0, Number.isFinite(amount) ? amount : 0);
  const rupees = Math.floor(safe);
  const paise = Math.round((safe - rupees) * 100);
  let words = `Rupees ${integerInWords(rupees)}`;
  if (paise > 0) words += ` and ${belowHundred(paise)} Paise`;
  return `${words} Only`;
}

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export const formatINR = (n: number) => inr.format(Number.isFinite(n) ? n : 0);

function formatDate(value: string | Date | undefined): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value); // legacy text dates like "Today"
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(d: Date): string {
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Generates an informative, clean, filesystem-safe filename for downloading/printing receipts.
 * Format: Receipt_[ReceiptNo]_[StoreName]_[Amount]_[Date]
 * Example: "Receipt_SF-REC-1049_ABC-Footwear_Rs1.5L_30Sep2026"
 */
export function generateReceiptFileName(receipt?: PaymentReceipt | null, customer?: ReceiptCustomerExtras): string {
  if (!receipt) return 'SoleFlow_Payment_Receipt';

  // 1. Clean Receipt Number
  const recNo = (receipt.receiptNumber || `REC-${(receipt.id || '').slice(-5)}`)
    .replace(/[^a-zA-Z0-9_-]/g, '');

  // 2. Clean Customer / Store Name (max 18 chars)
  const rawCustomer = receipt.customerName || 'Customer';
  const cleanCustomer = rawCustomer
    .replace(/__AUDIT_TEST__/g, '')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 18) || 'Store';

  // 3. Compact Amount (e.g. Rs1.5L, Rs35K, or Rs5000)
  const amountNum = Number(receipt.paymentAmount || 0);
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

  // 4. Compact Date (e.g. 30Sep2026 or from Date object)
  let dateStr = '';
  if (receipt.paymentDate && receipt.paymentDate !== 'Today') {
    const d = new Date(receipt.paymentDate);
    if (!Number.isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '');
    } else {
      dateStr = receipt.paymentDate.replace(/[^a-zA-Z0-9]/g, '');
    }
  }
  if (!dateStr) {
    const now = new Date();
    dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '');
  }

  const parts = ['Receipt', recNo, cleanCustomer, amountStr, dateStr].filter(Boolean);
  return parts.join('_');
}

/**
 * Generates an informative, clean, filesystem-safe filename for order invoices.
 * Format: Invoice_[OrderId]_[StoreName]_[Amount]_[Date]
 * Example: "Invoice_ORD-0148_ABC-Footwear_Rs2.66L_12Oct2026"
 */
export function generateInvoiceFileName(order?: { id?: string; customerName?: string; netPayable?: number; subtotal?: number } | null): string {
  if (!order) return 'SoleFlow_Wholesale_Invoice';

  const orderNo = (order.id || 'ORD').replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanCustomer = (order.customerName || 'Store')
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

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '');

  return ['Invoice', orderNo, cleanCustomer, amountStr, dateStr].filter(Boolean).join('_');
}

/* --------------------------- Scoped styles ------------------------------ */
/* Plain CSS (not Tailwind) so the receipt looks identical in light/dark
   mode, on screen and on paper. All classes are prefixed with "rcpt-". */

export const RECEIPT_CSS = `
.rcpt{--rc-navy:#0B2A5B;--rc-blue:#1D5FD1;--rc-gold:#C98E1A;--rc-ink:#1E293B;--rc-muted:#64748B;--rc-line:#E2E8F0;--rc-soft:#F8FAFC;
  width:100%;max-width:794px;margin:0 auto;background:#fff;color:var(--rc-ink);font-family:'Plus Jakarta Sans',Inter,system-ui,sans-serif;
  font-size:13px;line-height:1.5;font-weight:400;-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;
  border:1px solid var(--rc-line);border-radius:14px;overflow:hidden;position:relative}
.rcpt *{box-sizing:border-box}
.rcpt-band{height:6px;background:linear-gradient(90deg,var(--rc-navy) 0%,var(--rc-blue) 70%,var(--rc-gold) 70%,var(--rc-gold) 100%)}
.rcpt-body{padding:32px 36px 28px}
.rcpt-head{display:flex;justify-content:space-between;gap:24px;align-items:flex-start}
.rcpt-brand{display:flex;gap:14px;align-items:center;min-width:0}
.rcpt-logo{width:64px;height:64px;object-fit:contain;flex-shrink:0}
.rcpt-brandname{font-size:22px;font-weight:600;color:var(--rc-navy);letter-spacing:-.01em;line-height:1.2}
.rcpt-tagline{font-size:12px;color:var(--rc-gold);font-weight:500}
.rcpt-company{font-size:12px;color:var(--rc-muted);margin-top:10px;line-height:1.6}
.rcpt-company b{font-weight:500;color:var(--rc-ink)}
.rcpt-title{text-align:right;flex-shrink:0}
.rcpt-title h1{margin:0;font-size:20px;font-weight:600;color:var(--rc-navy);letter-spacing:.06em}
.rcpt-meta{margin-top:8px;font-size:12px;color:var(--rc-muted);display:grid;grid-template-columns:auto auto;gap:2px 12px;justify-content:end}
.rcpt-meta span:nth-child(even){color:var(--rc-ink);font-weight:500;text-align:right;font-variant-numeric:tabular-nums}
.rcpt-status{display:inline-flex;align-items:center;gap:6px;margin-top:10px;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:500}
.rcpt-status i{width:6px;height:6px;border-radius:50%;display:inline-block}
.rcpt-status.received{background:#EFF6FF;color:#1D4ED8}.rcpt-status.received i{background:#3B82F6}
.rcpt-status.verified{background:#ECFDF5;color:#047857}.rcpt-status.verified i{background:#10B981}
.rcpt-status.cheque-pending,.rcpt-status.cheque_pending{background:#FEF3C7;color:#B45309}.rcpt-status.cheque-pending i,.rcpt-status.cheque_pending i{background:#F59E0B}
.rcpt-status.reversed{background:#FEF2F2;color:#B91C1C}.rcpt-status.reversed i{background:#EF4444}
.rcpt-rule{height:1px;background:var(--rc-line);margin:22px 0}
.rcpt-label{font-size:11px;color:var(--rc-muted);text-transform:uppercase;letter-spacing:.08em;font-weight:500;margin-bottom:6px}
.rcpt-grid2{display:grid;grid-template-columns:1.2fr 1fr;gap:24px}
.rcpt-party{font-size:16px;font-weight:600;color:var(--rc-ink)}
.rcpt-small{font-size:12px;color:var(--rc-muted);line-height:1.6}
.rcpt-small b{font-weight:500;color:var(--rc-ink)}
.rcpt-table{width:100%;border-collapse:collapse;margin-top:4px}
.rcpt-table th{font-size:11px;font-weight:500;color:var(--rc-muted);text-transform:uppercase;letter-spacing:.06em;text-align:left;padding:10px 12px;background:var(--rc-soft);border-bottom:1px solid var(--rc-line)}
.rcpt-table td{padding:12px;border-bottom:1px solid var(--rc-line);vertical-align:top}
.rcpt-table .num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.rcpt-mono{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;font-size:12px}
.rcpt-amount{margin-top:18px;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:16px 20px;border-radius:12px;background:#F5F8FF;border:1px solid #DBE6FB}
.rcpt-amount .big{font-size:26px;font-weight:600;color:var(--rc-navy);font-variant-numeric:tabular-nums;white-space:nowrap}
.rcpt-words{font-size:12px;color:var(--rc-ink);font-style:italic;max-width:60%}
.rcpt-summary{margin-top:18px;margin-left:auto;width:320px;font-variant-numeric:tabular-nums}
.rcpt-summary div{display:flex;justify-content:space-between;padding:6px 0;font-size:13px}
.rcpt-summary div span:first-child{color:var(--rc-muted)}
.rcpt-summary .paid span:last-child{color:#047857;font-weight:500}
.rcpt-summary .due{border-top:1px solid var(--rc-line);margin-top:4px;padding-top:10px}
.rcpt-summary .due span{font-weight:600;color:var(--rc-ink)!important;font-size:14px}
.rcpt-notes{margin-top:18px;padding:12px 14px;border-left:3px solid var(--rc-gold);background:#FFFBF0;border-radius:0 8px 8px 0;font-size:12px}
.rcpt-foot{margin-top:28px;display:flex;justify-content:space-between;align-items:flex-end;gap:24px}
.rcpt-sign{text-align:center;min-width:220px}
.rcpt-sign .line{border-top:1px solid var(--rc-ink);margin-top:44px;padding-top:6px;font-size:12px;font-weight:500}
.rcpt-sign .for{font-size:11px;color:var(--rc-muted)}
.rcpt-legal{margin-top:22px;padding-top:12px;border-top:1px dashed var(--rc-line);font-size:11px;color:var(--rc-muted);display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
.rcpt-watermark{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;font-size:96px;font-weight:600;color:rgba(239,68,68,.10);transform:rotate(-24deg);letter-spacing:.1em}
@media (max-width:640px){.rcpt-body{padding:20px}.rcpt-head,.rcpt-foot{flex-direction:column}.rcpt-title{text-align:left}.rcpt-meta{justify-content:start}
  .rcpt-grid2{grid-template-columns:1fr}.rcpt-summary{width:100%}.rcpt-amount{flex-direction:column;align-items:flex-start}.rcpt-words{max-width:100%}}
@media print{
  @page{size:A4;margin:12mm}
  body *{visibility:hidden!important}
  #rcpt-print-root,#rcpt-print-root *{visibility:visible!important}
  #rcpt-print-root{position:absolute;left:0;top:0;width:100%}
  .rcpt{border:none;border-radius:0;max-width:none}
  .rcpt-noprint{display:none!important}
}
`;

/* ----------------------------- Component -------------------------------- */

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({
  receipt,
  company,
  customer,
  status = 'Received',
  generatedAt,
}) => {
  const co: ReceiptCompanyInfo = { ...DEFAULT_RECEIPT_COMPANY, ...company };
  const printedAt = generatedAt ?? new Date();
  const hasOrder = Boolean(receipt.orderNumber || receipt.orderId);
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="rcpt" role="document" aria-label={`Payment receipt ${receipt.receiptNumber}`}>
      <style>{RECEIPT_CSS}</style>
      {status === 'Reversed' && <div className="rcpt-watermark">REVERSED</div>}
      <div className="rcpt-band" />
      <div className="rcpt-body">
        {/* Header */}
        <div className="rcpt-head">
          <div>
            <div className="rcpt-brand">
              {co.logoUrl && (
                <img
                  className="rcpt-logo"
                  src={co.logoUrl}
                  alt={`${co.brandName} logo`}
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                />
              )}
              <div>
                <div className="rcpt-brandname">{co.brandName}</div>
                {co.tagline && <div className="rcpt-tagline">{co.tagline}</div>}
              </div>
            </div>
            <div className="rcpt-company">
              {co.legalName && <div><b>{co.legalName}</b></div>}
              {co.address && <div>{co.address}</div>}
              <div>
                {[co.gstin && `GSTIN: ${co.gstin}`, co.phone && `Ph: ${co.phone}`, co.email]
                  .filter(Boolean)
                  .join('  •  ')}
              </div>
            </div>
          </div>

          <div className="rcpt-title">
            <h1>PAYMENT RECEIPT</h1>
            <div className="rcpt-meta">
              <span>Receipt No.</span><span className="rcpt-mono">{receipt.receiptNumber}</span>
              <span>Date</span><span>{formatDate(receipt.paymentDate)}</span>
              {hasOrder && (<><span>Order</span><span className="rcpt-mono">{receipt.orderNumber || receipt.orderId}</span></>)}
            </div>
            <div className={`rcpt-status ${statusClass}`}><i />{status}</div>
          </div>
        </div>

        <div className="rcpt-rule" />

        {/* Parties */}
        <div className="rcpt-grid2">
          <div>
            <div className="rcpt-label">Received from</div>
            <div className="rcpt-party">{receipt.customerName}</div>
            <div className="rcpt-small">
              {customer?.address || receipt.customerCity}
              {customer?.customerCode || receipt.customerId ? (
                <div>Customer ID: <b className="rcpt-mono">{customer?.customerCode || receipt.customerId}</b></div>
              ) : null}
              {customer?.gstin && <div>GSTIN: <b>{customer.gstin}</b></div>}
              {customer?.phone && <div>Phone: <b>{customer.phone}</b></div>}
            </div>
          </div>
          <div>
            <div className="rcpt-label">Payment details</div>
            <div className="rcpt-small">
              <div>Method: <b>{receipt.paymentMethod}</b></div>
              <div>Reference / UTR: <b className="rcpt-mono">{receipt.utrRef || '—'}</b></div>
              <div>Collected by: <b>{receipt.collectedBy || '—'}</b></div>
            </div>
          </div>
        </div>

        {/* Line table */}
        <div style={{ marginTop: 22 }}>
          <table className="rcpt-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Description</th>
                <th>Mode</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  {hasOrder
                    ? <>Payment received against order <span className="rcpt-mono">{receipt.orderNumber || receipt.orderId}</span></>
                    : 'Payment received on account'}
                </td>
                <td>{receipt.paymentMethod}</td>
                <td className="num">{formatINR(receipt.paymentAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount + words */}
        <div className="rcpt-amount">
          <div className="rcpt-words">{amountInWordsINR(receipt.paymentAmount)}</div>
          <div className="big">{formatINR(receipt.paymentAmount)}</div>
        </div>

        {/* Account summary */}
        <div className="rcpt-summary">
          <div><span>Balance before payment</span><span>{formatINR(receipt.amountDueBefore)}</span></div>
          <div className="paid"><span>Amount received</span><span>− {formatINR(receipt.paymentAmount)}</span></div>
          <div className="due"><span>Balance outstanding</span><span>{formatINR(receipt.amountDueAfter)}</span></div>
        </div>

        {receipt.notes && (
          <div className="rcpt-notes"><b style={{ fontWeight: 500 }}>Note:</b> {receipt.notes}</div>
        )}

        {/* Footer */}
        <div className="rcpt-foot">
          <div className="rcpt-small" style={{ maxWidth: 380 }}>
            Thank you for your business. Cheque payments are subject to realisation.
            Please quote the receipt number for any queries.
          </div>
          <div className="rcpt-sign">
            <div className="for">For {co.legalName || co.brandName}</div>
            <div className="line">Authorised Signatory</div>
          </div>
        </div>

        <div className="rcpt-legal">
          <span>This is a computer-generated receipt and does not require a physical signature.</span>
          <span>Generated {formatDateTime(printedAt)}</span>
        </div>
      </div>
    </div>
  );
};

/* ------------------------- Preview + Print modal ------------------------ */

export interface ReceiptPreviewModalProps extends ReceiptTemplateProps {
  open: boolean;
  onClose: () => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({ open, onClose, ...props }) => {
  const suggestedFileName = generateReceiptFileName(props.receipt, props.customer);
  const [isDownloading, setIsDownloading] = React.useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prevTitle = document.title;
    document.title = suggestedFileName; // becomes the default PDF file name when saving via print
    return () => {
      window.removeEventListener('keydown', onKey);
      document.title = prevTitle;
    };
  }, [open, onClose, suggestedFileName]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('rcpt-print-root');
    if (!element) return;

    setIsDownloading(true);
    try {
      // @ts-ignore
      const html2pdfModule = (await import('html2pdf.js')).default || (await import('html2pdf.js'));
      const opt = {
        margin: [8, 8, 8, 8],
        filename: `${suggestedFileName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
      await html2pdfModule().set(opt).from(element).save();
    } catch (err) {
      console.warn('html2pdf direct download fallback to window.print():', err);
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
      aria-label={`Receipt ${props.receipt.receiptNumber}`}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,.65)', backdropFilter: 'blur(4px)', overflowY: 'auto', padding: '24px 12px' }}
      onClick={onClose}
    >
      <div style={{ maxWidth: 820, margin: '0 auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="rcpt-noprint" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
          {/* Pregenerated File Name Chip */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(255,255,255,0.95)', borderRadius: 10, border: '1px solid rgba(226,232,240,0.8)', fontSize: 12, color: '#334155' }}>
            <span style={{ fontWeight: 600, color: '#0B2A5B' }}>📄 Preset Name:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1D5FD1' }}>{suggestedFileName}.pdf</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {/* Primary Button: Directly downloads PDF so Windows File Explorer has the prefilled name */}
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadPDF}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 10, background: '#1D5FD1', color: '#fff', fontWeight: 600, fontSize: 13, border: 0, cursor: isDownloading ? 'wait' : 'pointer', boxShadow: '0 2px 6px rgba(29,95,209,0.35)', opacity: isDownloading ? 0.85 : 1 }}
              title="Saves PDF directly with pre-generated filename auto-filled"
            >
              <span>{isDownloading ? '⏳ Generating PDF...' : '💾 Print / Save as PDF'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                document.title = suggestedFileName;
                window.print();
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#F1F5F9', color: '#334155', fontWeight: 600, fontSize: 13, border: '1px solid #CBD5E1', cursor: 'pointer' }}
              title="Send to physical printer or system print dialog"
            >
              <span>🖨️ Printer</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: 10, background: '#fff', color: '#1E293B', fontWeight: 600, fontSize: 13, border: '1px solid #E2E8F0', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
        <div id="rcpt-print-root">
          <ReceiptTemplate {...props} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReceiptTemplate;
