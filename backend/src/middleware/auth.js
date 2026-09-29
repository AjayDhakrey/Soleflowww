import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { logger } from '../lib/logger.js';

export async function verifyAuthToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In local demo mode, allow fallback header or demo user
    if (process.env.VITE_DEMO_MODE === 'true' || !supabaseAdmin) {
      req.user = {
        id: 'user-admin',
        email: 'admin@soleflow.com',
        role: req.headers['x-demo-role'] || 'admin',
      };
      return next();
    }
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  if (!supabaseAdmin) {
    req.user = {
      id: 'user-admin',
      email: 'admin@soleflow.com',
      role: 'admin',
    };
    return next();
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      logger.warn({ error }, 'Invalid or expired auth token');
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    // Query profiles table for role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, name, phone, zone')
      .eq('id', user.id)
      .maybeSingle();

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || user.app_metadata?.role || user.user_metadata?.role || 'salesperson',
      name: profile?.name || user.email?.split('@')[0],
      phone: profile?.phone,
      zone: profile?.zone,
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
