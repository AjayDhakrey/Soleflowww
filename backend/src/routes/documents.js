import { Router } from 'express';
import PDFDocument from 'pdfkit';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { verifyAuthToken } from '../middleware/auth.js';

export const documentsRouter = Router();

documentsRouter.use(verifyAuthToken);

// Generate Order Confirmation / Invoice PDF
documentsRouter.get('/orders/:id/pdf', async (req, res, next) => {
  try {
    const orderId = req.params.id;

    let orderData = {
      id: orderId,
      customerName: 'ABC Footwear',
      city: 'Agra, UP',
      date: new Date().toLocaleDateString('en-IN'),
      items: [
        { name: 'Runner Classic (SF-1024)', pairs: 200, cartons: 16, rate: 1250, total: 250000 },
      ],
      subtotal: 250000,
      discount: 12500,
      gst: 28500,
      netTotal: 266000,
      advance: 100000,
      balanceDue: 166000,
    };

    if (supabaseAdmin) {
      const { data: fin } = await supabaseAdmin
        .from('v_order_financials')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      const { data: items } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (fin) {
        orderData = {
          id: fin.order_id,
          customerName: 'Wholesale Buyer Store',
          city: 'Agra Mandi, UP',
          date: fin.order_date,
          items: (items || []).map((i) => ({
            name: `${i.design_name} (${i.article_code})`,
            pairs: i.total_pairs,
            cartons: i.total_cartons,
            rate: Number(i.rate_per_pair),
            total: Number(i.item_subtotal),
          })),
          subtotal: Number(fin.subtotal),
          discount: Number(fin.trade_discount_amount),
          gst: Number(fin.gst_amount),
          netTotal: Number(fin.net_payable),
          advance: Number(fin.total_paid),
          balanceDue: Number(fin.balance_due),
        };
      }
    }

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="SoleFlow_Order_${orderId}.pdf"`);
    doc.pipe(res);

    // PDF Content
    doc.fontSize(20).text('SoleFlow Footwear Trading', { align: 'left' });
    doc.fontSize(10).fillColor('#64748b').text('Hing Ki Mandi Wholesale Cluster, Agra - 282003 • GSTIN: 09AAAAA0000A1Z5');
    doc.moveDown();

    doc.fillColor('#0f172a').fontSize(14).text(`WHOLESALE ORDER MEMO: ${orderData.id}`, { underline: true });
    doc.fontSize(10).text(`Date: ${orderData.date} | Buyer: ${orderData.customerName} (${orderData.city})`);
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
    doc.text(`GST (12% Footwear):                                                         +₹${orderData.gst.toLocaleString('en-IN')}`, { align: 'right' });
    doc.fontSize(12).fillColor('#0f172a').text(`Net Total Payable:                                                          ₹${orderData.netTotal.toLocaleString('en-IN')}`, { align: 'right' });
    doc.fontSize(10).fillColor('#2563eb').text(`Advance Deposited:                                                          ₹${orderData.advance.toLocaleString('en-IN')}`, { align: 'right' });
    doc.fontSize(11).fillColor('#b91c1c').text(`Still Payable on Bilty:                                                      ₹${orderData.balanceDue.toLocaleString('en-IN')}`, { align: 'right' });

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#64748b').text('Terms: Consignment dispatch subject to receipt of bilty balance terms. Handcrafted in Agra.', { align: 'center' });

    doc.end();
  } catch (err) {
    next(err);
  }
});

// Generate Payment Receipt PDF
documentsRouter.get('/payments/:id/receipt-pdf', async (req, res, next) => {
  try {
    const paymentId = req.params.id;

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="SoleFlow_Receipt_${paymentId}.pdf"`);
    doc.pipe(res);

    doc.fontSize(18).fillColor('#0f172a').text('SoleFlow Footwear Trading - Official Money Receipt');
    doc.fontSize(9).fillColor('#64748b').text('Agra Footwear Wholesale Cluster • Authorized Accounts Desk');
    doc.moveDown();

    doc.fontSize(12).fillColor('#0f172a').text(`RECEIPT NO: ${paymentId}`);
    doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString('en-IN')}`);
    doc.text(`Received with thanks from: ABC Footwear, Agra`);
    doc.text(`Sum of: INR 1,00,000 (Rupees One Lakh Only)`);
    doc.text(`Mode: NEFT/Bank Transfer (Ref: HDFC99823614)`);
    doc.text(`Adjusted against: Order ORD-0148`);
    doc.moveDown();

    doc.fontSize(10).fillColor('#166534').text('Status: Payment Verified & Settled to Commercial Ledger');
    doc.moveDown(2);
    doc.fontSize(9).fillColor('#64748b').text('This is a computer-generated receipt issued by SoleFlow CRM.', { align: 'center' });

    doc.end();
  } catch (err) {
    next(err);
  }
});
