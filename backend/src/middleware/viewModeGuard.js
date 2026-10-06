import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { logger } from '../lib/logger.js';

/**
 * Middleware to enforce read-only boundary during Super Admin View Mode.
 * If an active view session exists for the calling super admin, all write operations
 * (POST, PUT, PATCH, DELETE) are rejected with HTTP 403 { error: 'READ_ONLY_VIEW_MODE' }.
 */
export async function viewModeGuard(req, res, next) {
  // Safe read methods are permitted
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  if (!req.user || !supabaseAdmin) {
    return next();
  }

  try {
    // Check if user is a super admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_super_admin')
      .eq('id', req.user.id)
      .maybeSingle();

    if (!profile?.is_super_admin) {
      return next();
    }

    // Check for open view session (< 8 hours old)
    const { data: session } = await supabaseAdmin
      .from('super_admin_view_sessions')
      .select('id, org_id, started_at')
      .eq('admin_id', req.user.id)
      .is('ended_at', null)
      .gt('started_at', new Date(Date.now() - 8 * 3600 * 1000).toISOString())
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (session) {
      req.viewSession = {
        sessionId: session.id,
        orgId: session.org_id,
        startedAt: session.started_at,
      };

      if (!safeMethods.includes(req.method)) {
        logger.warn(
          { adminId: req.user.id, orgId: session.org_id, path: req.path, method: req.method },
          'Blocked write request during Super Admin Read-Only View Mode'
        );
        return res.status(403).json({
          error: 'READ_ONLY_VIEW_MODE',
          message: 'This account is currently opened in Read-Only View Mode. No modifications are permitted.',
        });
      }
    }

    next();
  } catch (err) {
    logger.error({ err }, 'Error in viewModeGuard middleware');
    next(err);
  }
}
