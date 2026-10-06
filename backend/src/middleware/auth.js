import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { logger } from '../lib/logger.js';

export async function verifyAuthToken(req, res, next) {
  if (!supabaseAdmin) {
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

    // Query profiles table for role and org membership
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, name, phone, zone, org_id')
      .eq('id', user.id)
      .maybeSingle();

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || user.app_metadata?.role || user.user_metadata?.role || 'salesperson',
      name: profile?.name || user.email?.split('@')[0],
      phone: profile?.phone,
      zone: profile?.zone,
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
