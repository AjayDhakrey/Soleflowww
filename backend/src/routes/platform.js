import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { verifyAuthToken, requireRole } from '../middleware/auth.js';
import { viewModeGuard } from '../middleware/viewModeGuard.js';
import { logger } from '../lib/logger.js';

export const platformRouter = Router();

// Super Admin / Platform routes require authenticated super admin
platformRouter.use(verifyAuthToken);

// Middleware checking is_super_admin
async function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  if (!supabaseAdmin) {
    return res
      .status(503)
      .json({ error: 'Server not configured: missing SUPABASE_SERVICE_ROLE_KEY' });
  }

  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_super_admin, is_demo_account')
      .eq('id', req.user.id)
      .maybeSingle();

    if (!profile?.is_super_admin && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Super Admin privileges required' });
    }

    req.isSuperAdmin = Boolean(profile?.is_super_admin);
    req.isDemoAccount = Boolean(profile?.is_demo_account);
    next();
  } catch (err) {
    next(err);
  }
}

platformRouter.use(requireSuperAdmin);
platformRouter.use(viewModeGuard);

/**
 * GET /api/platform/accounts
 * Returns full accounts overview across all organizations.
 */
platformRouter.get('/accounts', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Server not configured' });
    }

    const { data, error } = await supabaseAdmin.rpc('platform_accounts_overview');

    if (error) {
      logger.error({ error }, 'Failed to fetch platform accounts overview');
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ accounts: data || [] });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/platform/accounts/:orgId/timeline
 * Returns timeline activity logs for an organization.
 */
platformRouter.get('/accounts/:orgId/timeline', async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 50;

    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Server not configured' });
    }

    const { data, error } = await supabaseAdmin.rpc('platform_account_timeline', {
      p_org: orgId,
      p_limit: limit,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ timeline: data || [] });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/platform/view-mode/start
 * Starts a read-only view session for target organization.
 */
platformRouter.post('/view-mode/start', async (req, res, next) => {
  try {
    const { orgId } = req.body;
    if (!orgId) {
      return res.status(400).json({ error: 'orgId is required' });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Server not configured' });
    }

    const { data: sessionId, error } = await supabaseAdmin.rpc('start_view_session', {
      p_org: orgId,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info({ adminId: req.user.id, orgId, sessionId }, 'Super Admin View Session Started');
    return res.status(200).json({ success: true, sessionId, orgId });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/platform/view-mode/end
 * Ends the current active view session.
 */
platformRouter.post('/view-mode/end', async (req, res, next) => {
  try {
    if (supabaseAdmin) {
      await supabaseAdmin.rpc('end_view_session');
    }

    logger.info({ adminId: req.user?.id }, 'Super Admin View Session Ended');
    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/platform/view-mode/current
 * Restores active view session on page reload.
 */
platformRouter.get('/view-mode/current', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(200).json({ session: null });
    }

    const { data, error } = await supabaseAdmin.rpc('current_view_session');
    if (error || !data || data.length === 0) {
      return res.status(200).json({ session: null });
    }

    return res.status(200).json({ session: data[0] });
  } catch (err) {
    next(err);
  }
});
