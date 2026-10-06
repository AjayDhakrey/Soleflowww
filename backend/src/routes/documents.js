import { Router } from 'express';
import PDFDocument from 'pdfkit';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { verifyAuthToken } from '../middleware/auth.js';
import { viewModeGuard } from '../middleware/viewModeGuard.js';

export const documentsRouter = Router();

documentsRouter.use(verifyAuthToken);
documentsRouter.use(viewModeGuard);

// Helper to log view export
async function logViewExport(req, docType, docId) {
  if (req.viewSession && supabaseAdmin) {
    try {
      await supabaseAdmin.from('super_admin_access_log').insert({
        admin_id: req.user.id,
        org_id: req.viewSession.orgId,
        action: 'VIEW_EXPORT',
        record_type: docType,
        record_id: docId,
      });
    } catch (e) {
      // Non-blocking log
    }
  }
}

// Helper to read a value from a row regardless of camelCase/snake_case column naming
function pick(row, keys) {
  for (const key of keys) {
    if (row && row[key] !== undefined && row[key] !== null) return row[key];
  }
  return null;
}

// Generate Order Confirmation / Invoice PDF
documentsRouter.get('/orders/:id/pdf', async (req, res, next) => {
  try {
    const orderId = req.params.id;

    if (!supabaseAdmin) {
      return res
        .status(503)
        .json({ error: 'Server not configured: missing SUPABASE_SERVICE_ROLE_KEY' });
    }

    const { data: fin } = await supabaseAdmin
      .from('v_order_financials')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (!fin) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    // Real issuing business identity via the order's org
    let org = null;
    if (fin.org_id) {
      const { data } = await supabaseAdmin
        .from('organizations')
        .select('name,gstin,city,state,phone')
        .eq('id', fin.org_id)
        .maybeSingle();
      org = data || null;
    }

    // Real buyer details from the client record
    let client = null;
    if (fin.client_id) {
      const { data } = await supabaseAdmin
        .from('customers')
        .select('"businessName",city')
        .eq('id', fin.client_id)
        .maybeSingle();
      client = data || null;
    }

    const orderData = {
      id: fin.order_id,
      customerName: fin.client_name || client?.businessName || '',
      city: client?.city || '',
      date: fin.order_date || (fin.order_date_at ? new Date(fin.order_date_at).toLocaleDateString('en-IN') : ''),
      items: (items || []).map((i) => ({
        name: `${i.design_name || i.name || ''} (${i.article_code || i.articleCode || ''})`,
        pairs: i.total_pairs ?? i.qty_pairs ?? 0,
        cartons: i.total_cartons ?? i.qty_cartons ?? 0,
        rate: Number(i.rate_per_pair || i.rate || 0),
        total: Number(i.item_subtotal || i.line_total || 0),
      })),
      subtotal: Number(fin.subtotal || 0),
      discount: Number(fin.trade_discount_amount || 0),
      gst: Number(fin.gst_amount || 0),
      netTotal: Number(fin.net_payable || 0),
      advance: Number(fin.total_paid || fin.paid_verified || 0),
      balanceDue: Number(fin.balance_due || fin.outstanding || 0),
    };

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="SoleFlow_Order_${orderId}.pdf"`);
    doc.pipe(res);

    // PDF Content
    doc.fontSize(20).text(org?.name || 'SoleFlow', { align: 'left' });
    const orgSubtitle = [
      [org?.city, org?.state].filter(Boolean).join(' - '),
      org?.phone ? `Phone: ${org.phone}` : null,
      org?.gstin ? `GSTIN: ${org.gstin}` : null,
    ]
      .filter(Boolean)
      .join(' • ');
    doc.fontSize(10).fillColor('#64748b').text(orgSubtitle || ' ');
    doc.moveDown();

    doc.fillColor('#0f172a').fontSize(14).text(`WHOLESALE ORDER MEMO: ${orderData.id}`, { underline: true });
    doc.fontSize(10).text(
      `Date: ${orderData.date} | Buyer: ${orderData.customerName}${orderData.city ? ` (${orderData.city})` : ''}`
    );
    doc.moveDown();

    // Items table header
    doc.fontSize(10).fillColor('#1e293b').text('Item Description                               Pairs    Cartons    Rate (₹)    Amount (₹)');
    doc.text('--------------------------------------------------------------------------------------------------');

    for (const item of orderData.items) {
      doc.text(
        `${item.name.padEnd(35)} ${String(item.pairs).padStart(5)} ${String(item.cartons).padStart(8)} ${String(item.rate).padStart(10)} ${String(item.total).padStart(12)}`
      );
    }
    doc.text('--------------------------------------------------------------------------------------------------');
    doc.moveDown();

    // Financial totals
    doc.text(`Subtotal:                                                                    ₹${orderData.subtotal.toLocaleString('en-IN')}`, { align: 'right' });
    doc.text(`Trade Discount:                                                             -₹${orderData.discount.toLocaleString('en-IN')}`, { align: 'right' });
    doc.text(`GST:                                                                        +₹${orderData.gst.toLocaleString('en-IN')}`, { align: 'right' });
    doc.fontSize(12).fillColor('#0f172a').text(`Net Total Payable:                                                          ₹${orderData.netTotal.toLocaleString('en-IN')}`, { align: 'right' });
    doc.fontSize(10).fillColor('#2563eb').text(`Advance Deposited:                                                          ₹${orderData.advance.toLocaleString('en-IN')}`, { align: 'right' });
    doc.fontSize(11).fillColor('#b91c1c').text(`Still Payable on Bilty:                                                      ₹${orderData.balanceDue.toLocaleString('en-IN')}`, { align: 'right' });

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#64748b').text('Terms: Consignment dispatch subject to receipt of bilty balance terms.', { align: 'center' });

    doc.end();
    await logViewExport(req, 'orders_pdf', orderId);
  } catch (err) {
    next(err);
  }
});

// Generate Payment Receipt PDF
documentsRouter.get('/payments/:id/receipt-pdf', async (req, res, next) => {
  try {
    const paymentId = req.params.id;

    if (!supabaseAdmin) {
      return res
        .status(503)
        .json({ error: 'Server not configured: missing SUPABASE_SERVICE_ROLE_KEY' });
    }

    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .maybeSingle();

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const customerId = pick(payment, ['customerId', 'customer_id']);

    // Real client details for the "received from" block
    let client = null;
    if (customerId) {
      const { data } = await supabaseAdmin
        .from('customers')
        .select('"businessName",city,state')
        .eq('id', customerId)
        .maybeSingle();
      client = data || null;
    }

    // Real issuing business details for the letterhead
    const orgId = pick(payment, ['org_id']);
    let org = null;
    if (orgId) {
      const { data } = await supabaseAdmin
        .from('organizations')
        .select('name,gstin,city,state,phone')
        .eq('id', orgId)
        .maybeSingle();
      org = data || null;
    }

    const receiptNo = pick(payment, ['receiptNumber', 'receipt_number']) || paymentId;
    const rawDate = pick(payment, ['paymentDate', 'payment_date_at', 'payment_date']) || payment.created_at;
    const paymentDate = rawDate ? new Date(rawDate).toLocaleDateString('en-IN') : '';
    const clientName = pick(payment, ['customerName']) || client?.businessName || customerId || '';
    const clientLocation = [client?.city, client?.state].filter(Boolean).join(', ');
    const amount = Number(pick(payment, ['paymentAmount', 'payment_amount', 'amount']) || 0);
    const method = pick(payment, ['paymentMethod', 'payment_method', 'method']) || '';
    const utrRef = pick(payment, ['utrRef', 'utr_ref', 'reference_no', 'reference']);
    const orderRef = pick(payment, ['orderNumber', 'order_number']) || pick(payment, ['orderId', 'order_id']);
    const amountDueBefore = pick(payment, ['amountDueBefore', 'amount_due_before']);
    const amountDueAfter = pick(payment, ['amountDueAfter', 'amount_due_after']);
    const paymentStatus = pick(payment, ['status']) || 'recorded';

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="SoleFlow_Receipt_${paymentId}.pdf"`);
    doc.pipe(res);

    doc.fontSize(18).fillColor('#0f172a').text(`${org?.name || 'SoleFlow'} - Official Money Receipt`);
    const orgSubtitle = [
      [org?.city, org?.state].filter(Boolean).join(' - '),
      org?.phone ? `Phone: ${org.phone}` : null,
      org?.gstin ? `GSTIN: ${org.gstin}` : null,
    ]
      .filter(Boolean)
      .join(' • ');
    doc.fontSize(9).fillColor('#64748b').text(orgSubtitle || 'Authorized Accounts Desk');
    doc.moveDown();

    doc.fontSize(12).fillColor('#0f172a').text(`RECEIPT NO: ${receiptNo}`);
    doc.fontSize(10).text(`Date: ${paymentDate}`);
    doc.text(`Received with thanks from: ${clientName}${clientLocation ? `, ${clientLocation}` : ''}`);
    doc.text(`Sum of: INR ${amount.toLocaleString('en-IN')}`);
    doc.text(`Mode: ${method || 'Not specified'}${utrRef ? ` (Ref: ${utrRef})` : ''}`);
    if (orderRef) {
      doc.text(`Adjusted against: Order ${orderRef}`);
    }
    if (amountDueBefore !== null) {
      doc.text(`Balance before this payment: INR ${Number(amountDueBefore).toLocaleString('en-IN')}`);
    }
    if (amountDueAfter !== null) {
      doc.text(`Balance after this payment: INR ${Number(amountDueAfter).toLocaleString('en-IN')}`);
    }
    doc.moveDown();

    doc.fontSize(10).fillColor('#166534').text(`Status: ${paymentStatus}`);
    doc.moveDown(2);
    doc.fontSize(9).fillColor('#64748b').text('This is a computer-generated receipt issued by SoleFlow CRM.', { align: 'center' });

    doc.end();
    await logViewExport(req, 'payments_pdf', paymentId);
  } catch (err) {
    next(err);
  }
});
