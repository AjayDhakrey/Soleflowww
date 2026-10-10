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
      return res.status(503).json({ error: 'Server not configured' });
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
          phone: phone || null,
          email,
          zone: zone || null,
          cluster: cluster || null,
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
      return res.status(503).json({ error: 'Server not configured' });
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

// Direct Team Member Creation with login credentials (Login ID & Password)
adminRouter.post('/users/create', async (req, res, next) => {
  try {
    const {
      email,
      password,
      name,
      role = 'salesperson',
      phone,
      zone,
      cluster,
      monthlyTarget,
      commissionRate,
      orgId,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email (Login ID) and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const callerUser = req.user;
    let targetOrgId = orgId || callerUser?.orgId || 'ff415366-0239-4fa2-b7f6-dec643136aa3';

    // If server does not have live supabaseAdmin configured, return local mock response
    if (!supabaseAdmin) {
      logger.info({ email: cleanEmail, role }, 'Registered member locally (Supabase service key not configured)');
      return res.status(200).json({
        success: true,
        message: `Account created for ${cleanEmail}`,
        user: {
          id: `rep-${Date.now()}`,
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0],
          role,
          phone: phone || null,
          zone: zone || 'Agra Hub',
        },
      });
    }

    if (!targetOrgId && callerUser?.id) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('org_id')
        .eq('id', callerUser.id)
        .maybeSingle();
      if (profile?.org_id) targetOrgId = profile.org_id;
    }

    let authUserId = null;
    let authUserObj = null;

    // Create user in Supabase Auth with auto-confirmed email so they can log in immediately
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: name || cleanEmail.split('@')[0],
        role,
        phone: phone || null,
        zone: zone || null,
        cluster: cluster || null,
      },
    });

    if (createError) {
      // If user already exists in auth, update their password
      if (
        createError.message?.toLowerCase().includes('already') ||
        createError.message?.toLowerCase().includes('exists')
      ) {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existing = listData?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
        if (existing) {
          authUserId = existing.id;
          authUserObj = existing;
          await supabaseAdmin.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: true,
            user_metadata: {
              full_name: name || cleanEmail.split('@')[0],
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
      authUserObj = createData.user;
    }

    // Upsert into profiles table
    await supabaseAdmin.from('profiles').upsert({
      id: authUserId,
      email: cleanEmail,
      full_name: name || cleanEmail.split('@')[0],
      role,
      phone: phone || null,
      zone: zone || null,
      cluster: cluster || null,
      org_id: targetOrgId || null,
      is_active: true,
    });

    // If salesperson, upsert into sales_team table
    if (role === 'salesperson') {
      await supabaseAdmin.from('sales_team').upsert({
        id: authUserId,
        user_id: authUserId,
        name: name || cleanEmail.split('@')[0],
        phone: phone || null,
        email: cleanEmail,
        zone: zone || 'Agra Hub',
        cluster: cluster || zone || 'Agra Hub',
        emp_id: `SF-REP-${Math.floor(100 + Math.random() * 900)}`,
        monthly_target: Number(monthlyTarget || 1500000),
        commission_rate: Number(commissionRate || 3.5),
        status: 'In Market',
        role_title: 'Field Sales Rep',
        org_id: targetOrgId || null,
      });
    }

    logger.info({ email: cleanEmail, role, userId: authUserId }, 'Admin created new user account with login credentials');

    return res.status(200).json({
      success: true,
      message: `User account created successfully for ${cleanEmail}`,
      user: {
        id: authUserId,
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        role,
        phone: phone || null,
        zone: zone || null,
      },
    });
  } catch (err) {
    next(err);
  }
});

