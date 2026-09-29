import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { verifyAuthToken, requireRole } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';

export const adminRouter = Router();

// Require admin privilege for all admin endpoints
adminRouter.use(verifyAuthToken, requireRole('admin'));

adminRouter.post('/users/invite', async (req, res, next) => {
  try {
    const { email, role = 'salesperson', name, phone, zone, cluster } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!supabaseAdmin) {
      return res.status(200).json({
        success: true,
        message: `[Demo Mode] Simulated user invite email dispatched to ${email}`,
        user: {
          id: `user-sim-${Date.now()}`,
          email,
          role,
          name: name || email.split('@')[0],
        },
      });
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        name,
        role,
        phone,
        zone,
        cluster,
      },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (authUser?.user) {
      // Upsert profile
      await supabaseAdmin.from('profiles').upsert({
        id: authUser.user.id,
        email,
        name: name || email.split('@')[0],
        role,
        role_label: role === 'admin' ? 'Trader Admin' : 'Field Sales Rep',
        phone,
        zone,
        cluster,
        is_active: true,
      });

      // If salesperson, upsert into salesmen table
      if (role === 'salesperson') {
        await supabaseAdmin.from('salesmen').upsert({
          id: authUser.user.id,
          name: name || email.split('@')[0],
          phone: phone || '+91 98000 00000',
          email,
          zone: zone || 'North Zone',
          cluster: cluster || 'Agra & Kanpur Clusters',
          status: 'In Market',
        });
      }
    }

    logger.info({ email, role }, 'Admin user invitation successful');
    return res.status(200).json({
      success: true,
      message: `User invite sent to ${email}`,
      user: authUser.user,
    });
  } catch (err) {
    next(err);
  }
});
