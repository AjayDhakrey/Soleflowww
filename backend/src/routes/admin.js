import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { verifyAuthToken, requireRole } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';

export const adminRouter = Router();

// Require admin privilege for all admin endpoints
adminRouter.use(verifyAuthToken, requireRole('admin'));

// DEPRECATED: Old user invite endpoint without multi-tenant org_invites integration
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
      // Upsert profile with real schema columns
      await supabaseAdmin.from('profiles').upsert({
        id: authUser.user.id,
        email,
        full_name: name || email.split('@')[0],
        role,
        phone: phone || null,
        is_active: true,
      });

      // If salesperson, upsert into sales_team table
      if (role === 'salesperson') {
        await supabaseAdmin.from('sales_team').upsert({
          id: authUser.user.id,
          user_id: authUser.user.id,
          name: name || email.split('@')[0],
          phone: phone || '+91 98000 00000',
          email,
          zone: zone || 'North Zone',
          cluster: cluster || 'Agra & Kanpur Clusters',
          status: 'In Market',
          roleTitle: 'Field Sales Rep',
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

// Multi-tenant Org Member Invite endpoint
adminRouter.post('/invite', async (req, res, next) => {
  try {
    const { email, role = 'salesperson', name, phone, orgId } = req.body;
    const callerUser = req.user;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Determine target org
    let targetOrgId = orgId;
    if (!targetOrgId && callerUser?.id && supabaseAdmin) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('org_id, is_super_admin')
        .eq('id', callerUser.id)
        .single();
      
      if (profile) {
        targetOrgId = profile.org_id;
      }
    }

    if (!supabaseAdmin) {
      return res.status(200).json({
        success: true,
        message: `[Demo Mode] Simulated invite sent to ${email}`,
        token: 'demo-token-' + Date.now(),
        orgId: targetOrgId || 'demo-org',
      });
    }

    if (!targetOrgId) {
      return res.status(400).json({ error: 'No active organization found for caller.' });
    }

    // Insert into org_invites
    const { data: inviteRow, error: inviteDbError } = await supabaseAdmin
      .from('org_invites')
      .insert({
        org_id: targetOrgId,
        email: email.trim().toLowerCase(),
        role: role === 'admin' ? 'admin' : 'salesperson',
        invited_by: callerUser?.id || null,
      })
      .select('id, token, org_id, email, role, expires_at')
      .single();

    if (inviteDbError) {
      return res.status(400).json({ error: inviteDbError.message });
    }

    const appOrigin = process.env.APP_URL || 'http://localhost:3000';
    const inviteRedirectUrl = `${appOrigin}/?invite=${inviteRow.token}`;

    const { data: authInvite, error: authInviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        invite_token: inviteRow.token,
        full_name: name || email.split('@')[0],
        phone: phone || null,
      },
      redirectTo: inviteRedirectUrl,
    });

    if (authInviteError) {
      logger.warn({ error: authInviteError.message }, 'Supabase auth email dispatch failed; invite token generated in db');
    }

    logger.info({ email, orgId: targetOrgId, inviteId: inviteRow.id }, 'Org member invite generated');
    return res.status(200).json({
      success: true,
      message: `Invite generated successfully for ${email}`,
      invite: inviteRow,
      inviteUrl: inviteRedirectUrl,
    });
  } catch (err) {
    next(err);
  }
});

