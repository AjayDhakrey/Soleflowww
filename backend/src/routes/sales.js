import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { verifyAuthToken, requireRole } from '../middleware/auth.js';
import { viewModeGuard } from '../middleware/viewModeGuard.js';
import { logger } from '../lib/logger.js';

export const salesRouter = Router();

// 1. All sales team routes require authenticated user
salesRouter.use(verifyAuthToken);
salesRouter.use(viewModeGuard);

/**
 * Helper to map DB row to frontend salesperson structure
 */
function formatSalesperson(row, perf) {
  return {
    id: row.id,
    userId: row.user_id || row.id,
    name: row.name,
    roleTitle: row.roleTitle || 'Field Sales Rep',
    photo: row.photo || '',
    zone: row.zone || '',
    cluster: row.cluster || row.zone || '',
    phone: row.phone || '',
    email: row.email || '',
    empId: row.empId || '',
    monthlyTarget: Number(perf?.monthly_target ?? row.monthlyTarget ?? 0),
    bookedThisMonth: Number(perf?.total_booked_value ?? row.bookedThisMonth ?? 0),
    commissionRate: Number(row.commissionRate ?? 0),
    commissionAccrued: Number(row.commissionAccrued ?? 0),
    collectionDue: Number(perf?.total_outstanding ?? row.collectionDue ?? 0),
    assignedAccountsCount: Number(perf?.assigned_clients_count ?? row.assignedAccountsCount ?? 0),
    todayVisitsDone: Number(row.todayVisitsDone ?? 0),
    todayVisitsTotal: Number(row.todayVisitsTotal ?? 0),
    chequesTodayAmount: Number(row.chequesTodayAmount ?? 0),
    status: row.status || 'In Market',
    assignedKit: row.assignedKit || '',
    kitVerifiedDate: row.kitVerifiedDate || '',
    tasksChecklist: Array.isArray(row.tasksChecklist) ? row.tasksChecklist : [],
    orgId: row.org_id,
  };
}

/**
 * GET /api/sales-team
 * List all active sales team members in current tenant organization
 */
salesRouter.get('/', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(200).json({
        salesTeam: [],
        message: 'Supabase admin service key not configured',
      });
    }

    const orgScope = req.viewSession?.orgId || req.user.orgId;
    let query = supabaseAdmin
      .from('sales_team')
      .select('*')
      .is('archived_at', null)
      .order('name', { ascending: true });

    if (orgScope) {
      query = query.eq('org_id', orgScope);
    }

    const { data: teamRows, error: teamError } = await query;

    if (teamError) {
      logger.error({ error: teamError }, 'Failed to fetch sales team');
      return res.status(400).json({ error: teamError.message });
    }

    // Fetch performance metrics
    let perfQuery = supabaseAdmin.from('v_salesman_performance').select('*');
    if (orgScope) {
      perfQuery = perfQuery.eq('org_id', orgScope);
    }
    const { data: perfRows } = await perfQuery;

    const formattedTeam = (teamRows || []).map((row) => {
      const perf = (perfRows || []).find((p) => p.salesman_id === row.id);
      return formatSalesperson(row, perf);
    });

    return res.status(200).json({ salesTeam: formattedTeam });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/sales-team/routes/export
 * Export field route manifest for all representatives as CSV
 */
salesRouter.get('/routes/export', async (req, res, next) => {
  try {
    const orgScope = req.viewSession?.orgId || req.user.orgId;
    let query = supabaseAdmin
      ? supabaseAdmin.from('sales_team').select('*').is('archived_at', null)
      : null;

    if (query && orgScope) {
      query = query.eq('org_id', orgScope);
    }
    if (query && req.user.role === 'salesperson') {
      const salesmanId = req.user.salesTeamId || req.user.id;
      query = query.eq('id', salesmanId);
    }

    let team = [];
    if (query) {
      const { data } = await query;
      team = data || [];
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="soleflow_field_routes_${new Date().toISOString().slice(0, 10)}.csv"`
    );

    res.write('Rep Name,Emp ID,Zone,Cluster,Phone,Kit Assigned,Rep Status,Stop Time,Stop Type,Stop Title,Stop Details,Completed,GPS Verified\n');

    for (const rep of team) {
      const tasks = Array.isArray(rep.tasksChecklist) ? rep.tasksChecklist : [];
      if (tasks.length === 0) {
        res.write(
          `"${rep.name}","${rep.empId || ''}","${rep.zone || ''}","${rep.cluster || ''}","${rep.phone || ''}","${rep.assignedKit || ''}","${rep.status || ''}","-","-","No stops scheduled","-","NO","NO"\n`
        );
      } else {
        for (const t of tasks) {
          res.write(
            `"${rep.name}","${rep.empId || ''}","${rep.zone || ''}","${rep.cluster || ''}","${rep.phone || ''}","${rep.assignedKit || ''}","${rep.status || ''}","${t.time || ''}","${t.type || 'visit'}","${(t.title || '').replace(/"/g, '""')}","${(t.description || '').replace(/"/g, '""')}",${t.completed ? 'YES' : 'NO'},${t.verifiedGps ? 'YES' : 'NO'}\n`
          );
        }
      }
    }

    res.end();
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/sales-team/:id
 * Retrieve details for a specific sales team member
 */
salesRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Server not configured' });
    }

    const orgScope = req.viewSession?.orgId || req.user.orgId;
    let query = supabaseAdmin
      .from('sales_team')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (orgScope) {
      query = query.eq('org_id', orgScope);
    }

    const { data: row, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Sales representative not found' });
    }

    const { data: perf } = await supabaseAdmin
      .from('v_salesman_performance')
      .select('*')
      .eq('salesman_id', id)
      .maybeSingle();

    return res.status(200).json({ salesperson: formatSalesperson(row, perf) });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/sales-team
 * Create a new sales team member with login credentials (Admin only)
 */
salesRouter.post('/', requireRole('admin'), async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      zone,
      cluster,
      monthlyTarget,
      commissionRate,
      role = 'salesperson',
      orgId,
    } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const callerUser = req.user;
    const targetOrgId = orgId || req.viewSession?.orgId || callerUser?.orgId || '00000000-0000-0000-0000-000000000001';

    if (!supabaseAdmin || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(200).json({
        success: true,
        message: `Registered salesperson locally for ${cleanEmail}`,
        user: {
          id: `rep-${Date.now()}`,
          name: name.trim(),
          email: cleanEmail,
          zone: zone || 'Agra Hub',
        },
      });
    }

    let authUserId = null;

    if (password) {
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name.trim(),
          role,
          phone: phone || null,
          zone: zone || null,
          cluster: cluster || null,
        },
      });

      if (createError) {
        if (createError.message?.toLowerCase().includes('already') || createError.message?.toLowerCase().includes('exists')) {
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const existing = listData?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
          if (existing) {
            authUserId = existing.id;
            await supabaseAdmin.auth.admin.updateUserById(existing.id, {
              password,
              email_confirm: true,
              user_metadata: {
                full_name: name.trim(),
                role,
                phone: phone || null,
                zone: zone || null,
              },
            });
          } else {
            return res.status(400).json({ error: createError.message });
          }
        } else {
          return res.status(400).json({ error: createError.message });
        }
      } else {
        authUserId = createData.user.id;
      }
    } else {
      authUserId = `rep-${Date.now()}`;
    }

    // Upsert into profiles table
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: authUserId,
      email: cleanEmail,
      full_name: name.trim(),
      role,
      phone: phone || null,
      sales_team_id: authUserId,
      org_id: targetOrgId,
      is_active: true,
    });

    if (profileError) {
      logger.error({ error: profileError }, 'Error upserting profile in sales router');
    }

    // Upsert into sales_team table with exact schema columns
    const { error: teamError } = await supabaseAdmin.from('sales_team').upsert({
      id: authUserId,
      user_id: authUserId,
      name: name.trim(),
      phone: phone || null,
      email: cleanEmail,
      zone: zone || 'Agra Hub',
      cluster: cluster || zone || 'Agra Hub',
      "empId": `SF-REP-${Math.floor(100 + Math.random() * 900)}`,
      "monthlyTarget": Number(monthlyTarget || 1500000),
      "commissionRate": Number(commissionRate || 3.5),
      status: 'In Market',
      "roleTitle": 'Field Sales Rep',
      org_id: targetOrgId,
    });

    if (teamError) {
      logger.error({ error: teamError }, 'Error upserting sales_team row');
      return res.status(400).json({ error: teamError.message });
    }

    logger.info({ email: cleanEmail, id: authUserId }, 'Sales representative created successfully');
    return res.status(201).json({
      success: true,
      message: `Sales representative created for ${name.trim()}`,
      salesperson: {
        id: authUserId,
        name: name.trim(),
        email: cleanEmail,
        zone: zone || 'Agra Hub',
        roleTitle: 'Field Sales Rep',
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/sales-team/:id
 * Update salesperson details or tasks (Admin or self)
 */
salesRouter.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const caller = req.user;

    // Check authorization: admin or the salesperson themselves
    if (caller.role !== 'admin' && caller.id !== id && caller.salesTeamId !== id) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own profile' });
    }

    if (!supabaseAdmin) {
      return res.status(200).json({ success: true, message: 'Updated locally' });
    }

    const {
      name,
      phone,
      zone,
      cluster,
      monthlyTarget,
      commissionRate,
      status,
      tasksChecklist,
      assignedKit,
    } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (zone !== undefined) updates.zone = zone;
    if (cluster !== undefined) updates.cluster = cluster;
    if (status !== undefined) updates.status = status;
    if (assignedKit !== undefined) updates.assignedKit = assignedKit;
    if (monthlyTarget !== undefined) updates['monthlyTarget'] = Number(monthlyTarget);
    if (commissionRate !== undefined) updates['commissionRate'] = Number(commissionRate);
    if (tasksChecklist !== undefined) updates['tasksChecklist'] = tasksChecklist;

    const { data: updated, error } = await supabaseAdmin
      .from('sales_team')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, salesperson: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/sales-team/:id/tasks
 * Dispatch a new task/stop to a salesperson route
 */
salesRouter.post('/:id/tasks', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, time, type = 'visit', badge = 'Route Stop' } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (!supabaseAdmin) {
      return res.status(200).json({ success: true, message: 'Dispatched task locally' });
    }

    // Get current checklist
    const { data: current, error: getErr } = await supabaseAdmin
      .from('sales_team')
      .select('"tasksChecklist"')
      .eq('id', id)
      .maybeSingle();

    if (getErr || !current) {
      return res.status(404).json({ error: 'Sales representative not found' });
    }

    const currentTasks = Array.isArray(current.tasksChecklist) ? current.tasksChecklist : [];
    const newTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description || 'Dispatched via Admin Field Console',
      time: time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      type,
      badge,
      badgeColor: type === 'cheque' ? 'emerald' : type === 'visit' ? 'blue' : 'amber',
      completed: false,
      verifiedGps: false,
    };

    const updatedTasks = [...currentTasks, newTask];

    const { error: updateErr } = await supabaseAdmin
      .from('sales_team')
      .update({ "tasksChecklist": updatedTasks })
      .eq('id', id);

    if (updateErr) {
      return res.status(400).json({ error: updateErr.message });
    }

    return res.status(201).json({ success: true, task: newTask, tasksChecklist: updatedTasks });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/sales-team/:id/tasks/:taskId
 * Toggle or complete a task on a sales representative route
 */
salesRouter.patch('/:id/tasks/:taskId', async (req, res, next) => {
  try {
    const { id, taskId } = req.params;
    const { completed } = req.body;

    if (!supabaseAdmin) {
      return res.status(200).json({ success: true });
    }

    const { data: current, error: getErr } = await supabaseAdmin
      .from('sales_team')
      .select('"tasksChecklist"')
      .eq('id', id)
      .maybeSingle();

    if (getErr || !current) {
      return res.status(404).json({ error: 'Sales representative not found' });
    }

    const currentTasks = Array.isArray(current.tasksChecklist) ? current.tasksChecklist : [];
    const updatedTasks = currentTasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: completed !== undefined ? Boolean(completed) : !t.completed,
          completedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    const { error: updateErr } = await supabaseAdmin
      .from('sales_team')
      .update({ "tasksChecklist": updatedTasks })
      .eq('id', id);

    if (updateErr) {
      return res.status(400).json({ error: updateErr.message });
    }

    return res.status(200).json({ success: true, tasksChecklist: updatedTasks });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/sales-team/:id
 * Soft delete / archive sales representative (Admin only)
 */
salesRouter.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!supabaseAdmin) {
      return res.status(200).json({ success: true });
    }

    const { error } = await supabaseAdmin
      .from('sales_team')
      .update({ archived_at: new Date().toISOString(), status: 'Inactive' })
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, message: 'Sales representative archived' });
  } catch (err) {
    next(err);
  }
});

