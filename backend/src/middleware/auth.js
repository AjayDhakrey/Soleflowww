import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { logger } from '../lib/logger.js';

export async function verifyAuthToken(req, res, next) {
  if (!supabaseAdmin) {
    // In local development or when service key is not configured, permit requests as admin
    if (process.env.NODE_ENV !== 'production' || process.env.VITE_DEMO_MODE === 'true' || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      req.user = {
        id: 'admin-dev-user',
        email: 'admin@soleflow.com',
        role: 'admin',
        name: 'Trader Admin',
        orgId: 'ff415366-0239-4fa2-b7f6-dec643136aa3',
      };
      return next();
    }
    return res
      .status(503)
      .json({ error: 'Server not configured: missing SUPABASE_SERVICE_ROLE_KEY' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      logger.warn({ error }, 'Invalid or expired auth token');
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    // Query profiles table for role and org membership using valid columns
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name, phone, org_id, sales_team_id')
      .eq('id', user.id)
      .maybeSingle();

    let userZone = user.user_metadata?.zone || null;
    let userCluster = user.user_metadata?.cluster || null;

    if (!userZone && supabaseAdmin) {
      const { data: salesRep } = await supabaseAdmin
        .from('sales_team')
        .select('zone, cluster')
        .eq('id', profile?.sales_team_id || user.id)
        .maybeSingle();
      if (salesRep) {
        userZone = salesRep.zone;
        userCluster = salesRep.cluster;
      }
    }

    req.user = {
      id: user.id,
      salesTeamId: profile?.sales_team_id || user.id,
      email: user.email,
      role: profile?.role || user.app_metadata?.role || user.user_metadata?.role || 'salesperson',
      name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0],
      phone: profile?.phone || user.user_metadata?.phone,
      zone: userZone,
      cluster: userCluster,
      orgId: profile?.org_id || null,
    };

    next();
  } catch (err) {
    logger.error({ err }, 'Exception while verifying auth token');
    return res.status(500).json({ error: 'Failed to verify session' });
  }
}

export function requireRole(allowedRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];

    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        error: `Forbidden: Requires [${roles.join(', ')}] role. Current role: ${req.user.role}`,
      });
    }

    next();
  };
}
