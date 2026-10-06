import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { verifyAuthToken } from '../middleware/auth.js';
import { viewModeGuard } from '../middleware/viewModeGuard.js';

export const reportsRouter = Router();

reportsRouter.use(verifyAuthToken);
reportsRouter.use(viewModeGuard);

// Helper to log view export
async function logViewExport(req, reportName) {
  if (req.viewSession && supabaseAdmin) {
    try {
      await supabaseAdmin.from('super_admin_access_log').insert({
        admin_id: req.user.id,
        org_id: req.viewSession.orgId,
        action: 'VIEW_EXPORT',
        record_type: 'report_csv',
        record_id: reportName,
      });
    } catch (e) {
      // Non-blocking
    }
  }
}

// Sales CSV Stream
reportsRouter.get('/sales/csv', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res
        .status(503)
        .json({ error: 'Server not configured: missing SUPABASE_SERVICE_ROLE_KEY' });
    }

    let query = supabaseAdmin.from('v_order_financials').select('*');

    // Scope to viewed org if in view mode, else to the requester's own org.
    // (The service-role key bypasses RLS, so tenant scoping is enforced here.)
    const orgScope = req.viewSession?.orgId || req.user.orgId;
    if (orgScope) {
      query = query.eq('org_id', orgScope);
    } else if (req.user.role === 'salesperson') {
      query = query.eq('salesperson_id', req.user.id);
    }

    const { data: orders } = await query;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="soleflow_sales_report.csv"');

    // Header row
    res.write('Order ID,Client ID,Order Date,Total Pairs,Total Cartons,Subtotal,GST,Net Payable,Total Paid,Balance Due,Status\n');

    if (orders && orders.length > 0) {
      for (const o of orders) {
        res.write(
          `"${o.order_id}","${o.client_id}","${o.order_date}",${o.total_pairs},${o.total_cartons},${o.subtotal},${o.gst_amount},${o.net_payable},${o.total_paid},${o.balance_due},"${o.status}"\n`
        );
      }
    }

    res.end();
    await logViewExport(req, 'sales_csv');
  } catch (err) {
    next(err);
  }
});

// Receivables Ageing CSV Stream
reportsRouter.get('/receivables/csv', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res
        .status(503)
        .json({ error: 'Server not configured: missing SUPABASE_SERVICE_ROLE_KEY' });
    }

    let query = supabaseAdmin.from('v_receivables').select('*');

    const orgScope = req.viewSession?.orgId || req.user.orgId;
    if (orgScope) {
      query = query.eq('org_id', orgScope);
    } else if (req.user.role === 'salesperson') {
      query = query.eq('salesperson_id', req.user.id);
    }

    const { data: receivables } = await query;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="soleflow_receivables_ageing.csv"');

    res.write('Client Name,Phone,City,Salesperson,Total Business,Total Paid,Total Outstanding,0-30 Days,31-60 Days,61-90 Days,90+ Days,Status\n');

    if (receivables && receivables.length > 0) {
      for (const r of receivables) {
        res.write(
          `"${r.client_name}","${r.phone}","${r.city}","${r.salesperson_name || 'Unassigned'}",${r.total_business},${r.total_paid},${r.total_outstanding},${r.bucket_0_30},${r.bucket_31_60},${r.bucket_61_90},${r.bucket_90_plus},"${r.status}"\n`
        );
      }
    }

    res.end();
    await logViewExport(req, 'receivables_csv');
  } catch (err) {
    next(err);
  }
});
