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
    }
    
    // When called by a sales team representative, filter specifically to their assigned orders
    if (req.user.role === 'salesperson') {
      const salesmanId = req.user.salesTeamId || req.user.id;
      query = query.eq('salesman_id', salesmanId);
    }

    const { data: orders } = await query;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="soleflow_sales_report.csv"');

    // Header row
    res.write('Order ID,Client Name,Salesperson,Order Date,Net Payable,Paid Verified,Outstanding,Payment Status,Order Status\n');

    if (orders && orders.length > 0) {
      for (const o of orders) {
        const orderDate = o.order_date_at
          ? new Date(o.order_date_at).toLocaleDateString('en-IN')
          : (o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '');
        res.write(
          `"${o.order_id}","${o.client_name || ''}","${o.salesman_name || 'Direct'}","${orderDate}",${o.net_payable ?? 0},${o.paid_verified ?? 0},${o.outstanding ?? 0},"${o.payment_status || 'Unpaid'}","${o.order_status || 'Draft'}"\n`
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
    }

    // When called by a sales team representative, filter specifically to their clients
    if (req.user.role === 'salesperson') {
      const salesmanId = req.user.salesTeamId || req.user.id;
      query = query.eq('salesman_id', salesmanId);
    }

    const { data: receivables } = await query;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="soleflow_receivables_ageing.csv"');

    res.write('Client Name,Salesperson,Total Invoiced,Total Paid,Amount Due,0-30 Days,31-60 Days,61-90 Days,90+ Days,Max Age Days\n');

    if (receivables && receivables.length > 0) {
      for (const r of receivables) {
        res.write(
          `"${r.client_name || ''}","${r.salesman_name || 'Unassigned'}",${r.total_invoiced ?? 0},${r.total_paid ?? 0},${r.amount_due ?? 0},${r.bucket_0_30 ?? 0},${r.bucket_31_60 ?? 0},${r.bucket_61_90 ?? 0},${r.bucket_90_plus ?? 0},${r.max_age_days ?? 0}\n`
        );
      }
    }

    res.end();
    await logViewExport(req, 'receivables_csv');
  } catch (err) {
    next(err);
  }
});
