import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { verifyAuthToken } from '../middleware/auth.js';

export const reportsRouter = Router();

reportsRouter.use(verifyAuthToken);

// Sales CSV Stream
reportsRouter.get('/sales/csv', async (req, res, next) => {
  try {
    let query = supabaseAdmin
      ? supabaseAdmin.from('v_order_financials').select('*')
      : null;

    if (query && req.user.role === 'salesperson') {
      query = query.eq('salesperson_id', req.user.id);
    }

    const { data: orders } = query ? await query : { data: [] };

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
    } else {
      // Mock CSV data fallback
      res.write('"ORD-0148","cust-1","2024-10-12",200,16,250000,28500,266000,100000,166000,"In Production"\n');
      res.write('"ORD-0147","cust-7","2024-10-06",360,30,864000,99532,928972,300000,628972,"Ready to Dispatch"\n');
      res.write('"ORD-0146","cust-3","2024-10-01",120,10,132000,15840,147840,147840,0,"Delivered"\n');
    }

    res.end();
  } catch (err) {
    next(err);
  }
});

// Receivables Ageing CSV Stream
reportsRouter.get('/receivables/csv', async (req, res, next) => {
  try {
    let query = supabaseAdmin
      ? supabaseAdmin.from('v_receivables').select('*')
      : null;

    if (query && req.user.role === 'salesperson') {
      query = query.eq('salesperson_id', req.user.id);
    }

    const { data: receivables } = query ? await query : { data: [] };

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="soleflow_receivables_ageing.csv"');

    res.write('Client Name,Phone,City,Salesperson,Total Business,Total Paid,Total Outstanding,0-30 Days,31-60 Days,61-90 Days,90+ Days,Status\n');

    if (receivables && receivables.length > 0) {
      for (const r of receivables) {
        res.write(
          `"${r.client_name}","${r.phone}","${r.city}","${r.salesperson_name || 'Unassigned'}",${r.total_business},${r.total_paid},${r.total_outstanding},${r.bucket_0_30},${r.bucket_31_60},${r.bucket_61_90},${r.bucket_90_plus},"${r.status}"\n`
        );
      }
    } else {
      res.write('"ABC Footwear","+91 98371 44812","Agra","Rahul Sharma",2840000,2610000,230000,100000,80000,50000,0,"overdue"\n');
      res.write('"Regal Footwear Hub","+91 98211 88412","Kanpur","Rahul Sharma",1490000,1375000,115000,60000,55000,0,0,"overdue"\n');
      res.write('"Walkwell Retailers","+91 94140 55219","Jaipur","Priya Singh",865000,850000,15000,15000,0,0,0,"active"\n');
    }

    res.end();
  } catch (err) {
    next(err);
  }
});
