import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Organization } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_USERS } from '../data/mockData';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  role_label?: string | null;
  phone?: string | null;
  zone?: string | null;
  cluster?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
  org_id?: string | null;
  is_super_admin?: boolean;
  is_demo_account?: boolean;
}

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  businessName: string;
  city?: string;
  gstin?: string;
  inviteToken?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  org: Organization | null;
  orgId: string | null;
  activeOrgId: string | null;
  setActiveOrgId: (id: string | null) => void;
  isSuperAdmin: boolean;
  isDemoAccount: boolean;
  isAdmin: boolean;
  isSalesperson: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  authError: string | null;
  isDemoMode: boolean;
  allowDemo: boolean;
  hasRealSession: boolean;
  canManageCatalog: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  signUp: (params: SignUpParams) => Promise<{ success: boolean; needsEmailVerification?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;
  switchDemoRole: (role: UserRole) => void;
  quickDemoLogin: (demoRole: 'superadmin' | 'admin' | 'salesperson') => { success: boolean; role?: UserRole };
  clearAuthError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'soleflow_auth_session';

export const getAppOrigin = (): string => {
  const customSiteUrl = (
    import.meta.env.VITE_SITE_URL ||
    import.meta.env.VITE_APP_URL ||
    import.meta.env.NEXT_PUBLIC_SITE_URL
  ) as string;

  if (customSiteUrl) {
    return customSiteUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    if (!window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
      return window.location.origin;
    }
  }

  if (import.meta.env.VITE_VERCEL_URL) {
    return `https://${import.meta.env.VITE_VERCEL_URL}`;
  }

  return 'https://soleflowww.vercel.app';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isConfigured = isSupabaseConfigured();
  const allowDemo = import.meta.env.VITE_DEMO_MODE === 'true';
  const isDemoMode = allowDemo || !isConfigured;

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  // DEPRECATED: const [role, setRole] = useState<UserRole>('admin');
  const [role, setRole] = useState<UserRole>('salesperson');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasRealSession, setHasRealSession] = useState<boolean>(false);

  // Helper to map DB profile to App User model
  const mapProfileToUser = (prof: UserProfile): User => {
    const rawName = prof.name || (prof.email ? prof.email.split('@')[0] : '') || (prof.role === 'admin' ? 'Trader Admin' : 'Field Sales Rep');
    const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const initials = displayName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'SF';

    return {
      id: prof.id,
      name: displayName,
      email: prof.email || `${prof.role || 'user'}@soleflow.com`,
      role: prof.role || 'salesperson',
      avatar: prof.avatar_url || (prof.role === 'admin' ? MOCK_USERS.admin.avatar : MOCK_USERS.salesperson.avatar),
      initials,
      roleLabel: prof.is_super_admin ? 'Platform Owner' : (prof.role_label || (prof.role === 'admin' ? 'Trader Admin' : 'Field Sales Rep')),
      phone: prof.phone || undefined,
      zone: prof.zone || undefined,
      org_id: prof.org_id || undefined,
      orgId: prof.org_id || undefined,
      isSuperAdmin: prof.is_super_admin,
      is_super_admin: prof.is_super_admin,
      isDemoAccount: prof.is_demo_account,
      is_demo_account: prof.is_demo_account,
    };
  };

  // Load profile from Supabase profiles table
  const fetchUserProfile = async (userId: string, email: string): Promise<{ profile: UserProfile; organization: Organization | null }> => {
    const fallbackRole: UserRole =
      email.toLowerCase().includes('admin') || email === 'soleflow.admin@gmail.com' ? 'admin' : 'salesperson';
    const fallbackName = fallbackRole === 'admin' ? 'Vikram Malhotra' : 'Rahul Sharma';

    const fallbackOrg: Organization = {
      id: 'default-org-uuid',
      name: 'SoleFlow Footwear',
      status: 'active',
      is_demo: false,
    };

    if (!supabase) {
      return {
        profile: {
          id: userId,
          email,
          name: fallbackName,
          role: fallbackRole,
          org_id: fallbackOrg.id,
          is_super_admin: false,
          is_demo_account: false,
        },
        organization: fallbackOrg,
      };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        return {
          profile: {
            id: userId,
            email,
            name: fallbackName,
            role: fallbackRole,
            org_id: fallbackOrg.id,
            is_super_admin: false,
            is_demo_account: false,
          },
          organization: fallbackOrg,
        };
      }

      const assignedRole: UserRole = (data.role as UserRole) || fallbackRole;
      const assignedName = (data as any).name || (data as any).full_name || fallbackName;
      const userOrgId = data.org_id || null;

      let loadedOrg: Organization | null = null;
      if (userOrgId) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', userOrgId)
          .maybeSingle();
        
        if (orgData) {
          loadedOrg = orgData as Organization;
        }
      }

      return {
        profile: {
          id: data.id || userId,
          email: email || (data as any).email,
          name: assignedName,
          role: assignedRole,
          role_label: assignedRole === 'admin' ? 'Trader Admin' : 'Field Sales Rep',
          phone: data.phone,
          zone: data.zone,
          avatar_url: (data as any).avatar_url,
          org_id: userOrgId,
          is_super_admin: Boolean((data as any).is_super_admin),
          is_demo_account: Boolean((data as any).is_demo_account),
        },
        organization: loadedOrg,
      };
    } catch (err) {
      console.error('Error loading profile from Supabase:', err);
      return {
        profile: {
          id: userId,
          email,
          name: fallbackName,
          role: fallbackRole,
          org_id: fallbackOrg.id,
          is_super_admin: false,
          is_demo_account: false,
        },
        organization: fallbackOrg,
      };
    }
  };


  // Initial Auth Check
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      setIsLoading(true);

      // 1. If Supabase is active, check active Supabase Auth session
      if (supabase && isConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const userEmail = session.user.email || 'user@soleflow.com';
            const { profile: prof, organization: userOrg } = await fetchUserProfile(session.user.id, userEmail);
            if (isMounted) {
              setProfile(prof);
              setOrg(userOrg);
              setRole(prof.role);
              setUser(mapProfileToUser(prof));
              setHasRealSession(true);
            }
          } else {
            if (isMounted) setHasRealSession(false);
          }
        } catch (e) {
          console.error('Error initializing auth:', e);
          if (isMounted) setHasRealSession(false);
        }
      }

      // 2. Check local stored session fallback (for demo mode only)
      if (isMounted && !user && allowDemo) {
        try {
          const stored = localStorage.getItem(AUTH_STORAGE_KEY);
          if (stored) {
            const data = JSON.parse(stored);
            if (data && data.isLoggedIn) {
              const activeRole: UserRole = data.role === 'salesperson' ? 'salesperson' : 'admin';
              const activeUser = activeRole === 'salesperson' ? MOCK_USERS.salesperson : MOCK_USERS.admin;
              setUser(activeUser);
              setRole(activeRole);
              setProfile({
                id: activeUser.id,
                email: activeUser.email,
                name: activeUser.name,
                role: activeRole,
                org_id: 'demo-org-uuid',
                is_super_admin: false,
                is_demo_account: true,
              });
              setOrg({
                id: 'demo-org-uuid',
                name: 'Demo Footwear Traders',
                status: 'active',
                is_demo: true,
              });
              setHasRealSession(false);
            }
          }
        } catch (err) {
          console.warn('Failed to parse local stored session:', err);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen to Supabase Auth state changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const email = session.user.email || 'user@soleflow.com';
          const { profile: prof, organization: userOrg } = await fetchUserProfile(session.user.id, email);
          setProfile(prof);
          setOrg(userOrg);
          setRole(prof.role);
          setUser(mapProfileToUser(prof));
          setHasRealSession(true);
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({ isLoggedIn: true, role: prof.role, email: prof.email, userId: prof.id })
          );
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setOrg(null);
          setActiveOrgId(null);
          setHasRealSession(false);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [isDemoMode, isConfigured, allowDemo]);

  const refreshProfile = async () => {
    if (!supabase || !profile?.id) return;
    try {
      const { profile: updatedProf, organization: updatedOrg } = await fetchUserProfile(profile.id, profile.email);
      setProfile(updatedProf);
      setOrg(updatedOrg);
      setRole(updatedProf.role);
      setUser(mapProfileToUser(updatedProf));
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  // Sign Up implementation
  const signUp = async (params: SignUpParams): Promise<{ success: boolean; needsEmailVerification?: boolean; error?: string }> => {
    setAuthError(null);
    setIsLoading(true);

    try {
      if (!supabase || !isConfigured) {
        if (allowDemo) {
          const mockOrg: Organization = {
            id: 'mock-new-org-' + Date.now(),
            name: params.businessName,
            phone: params.phone,
            city: params.city || 'Agra',
            state: 'Uttar Pradesh',
            gstin: params.gstin,
            status: 'active',
            is_demo: false,
          };
          const mockUser: User = {
            id: 'mock-user-' + Date.now(),
            name: params.fullName,
            email: params.email,
            role: 'admin',
            avatar: MOCK_USERS.admin.avatar,
            initials: params.fullName.substring(0, 2).toUpperCase(),
            roleLabel: 'Trader Admin',
            phone: params.phone,
            org_id: mockOrg.id,
            orgId: mockOrg.id,
          };
          setUser(mockUser);
          setOrg(mockOrg);
          setRole('admin');
          setProfile({
            id: mockUser.id,
            email: params.email,
            name: params.fullName,
            role: 'admin',
            org_id: mockOrg.id,
            phone: params.phone,
          });
          setIsLoading(false);
          return { success: true, needsEmailVerification: false };
        }
        setIsLoading(false);
        return { success: false, error: 'Database service is not configured.' };
      }

      const appOrigin = getAppOrigin();
      const { data, error } = await supabase.auth.signUp({
        email: params.email.trim(),
        password: params.password,
        options: {
          data: {
            full_name: params.fullName,
            phone: params.phone,
            business_name: params.businessName,
            city: params.city || 'Agra',
            gstin: params.gstin || '',
            invite_token: params.inviteToken || null,
          },
          emailRedirectTo: `${appOrigin}/#login`,
        },
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      const needsEmailVerification = !data.session && Boolean(data.user && !data.user.confirmed_at);

      if (data.user && data.session) {
        const { profile: prof, organization: userOrg } = await fetchUserProfile(data.user.id, params.email);
        setProfile(prof);
        setOrg(userOrg);
        setRole(prof.role);
        setUser(mapProfileToUser(prof));
        setHasRealSession(true);
      }

      setIsLoading(false);
      return { success: true, needsEmailVerification };
    } catch (err: any) {
      console.error('Sign up error:', err);
      const msg = err?.message || 'Failed to create account.';
      setAuthError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  // Quick Instant Demo Login
  const quickDemoLogin = (demoRole: 'superadmin' | 'admin' | 'salesperson') => {
    setAuthError(null);
    setIsLoading(false);

    const isSuper = demoRole === 'superadmin';
    const assignedRole: UserRole = demoRole === 'salesperson' ? 'salesperson' : 'admin';
    const demoEmail = isSuper
      ? 'superadmin@soleflow.com'
      : assignedRole === 'salesperson'
      ? 'sales@soleflow.com'
      : 'admin@soleflow.com';
    const demoName = isSuper
      ? 'Platform Super Admin'
      : assignedRole === 'salesperson'
      ? 'Rahul Sharma'
      : 'Vikram Malhotra';
    const baseUser = assignedRole === 'salesperson' ? MOCK_USERS.salesperson : MOCK_USERS.admin;

    const demoUser: User = {
      ...baseUser,
      id: isSuper ? 'superadmin-demo-uuid' : baseUser.id,
      name: demoName,
      email: demoEmail,
      role: assignedRole,
      isSuperAdmin: isSuper,
      is_super_admin: isSuper,
      isDemoAccount: true,
      is_demo_account: true,
      org_id: 'demo-org-uuid',
      orgId: 'demo-org-uuid',
    };

    setUser(demoUser);
    setRole(assignedRole);
    setProfile({
      id: demoUser.id,
      email: demoEmail,
      name: demoName,
      role: assignedRole,
      is_super_admin: isSuper,
      is_demo_account: true,
      org_id: 'demo-org-uuid',
    });
    setOrg({
      id: 'demo-org-uuid',
      name: isSuper ? 'Demo Platform View (All Businesses)' : 'Demo Footwear Traders',
      status: 'active',
      is_demo: true,
    });
    setHasRealSession(false);

    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ isLoggedIn: true, role: assignedRole, email: demoEmail, isSuperAdmin: isSuper, user: demoUser })
      );
    } catch (e) {
      console.warn('LocalStorage save session warning:', e);
    }

    return { success: true, role: assignedRole };
  };

  // Sign In implementation
  const signIn = async (email: string, pass: string): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    setAuthError(null);
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const isDemoEmail =
      normalizedEmail === 'admin@soleflow.com' ||
      normalizedEmail === 'sales@soleflow.com' ||
      normalizedEmail === 'superadmin@soleflow.com' ||
      normalizedEmail.includes('soleflow.com');

    try {
      // 1. If real Supabase client is configured, attempt Supabase Auth
      if (supabase && isConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        });

        if (error) {
          // If Supabase auth fails and this is a demo email, fall back to instant demo session
          if (isDemoEmail) {
            console.warn('Supabase Auth demo account error; activating demo mode:', error.message);
            const roleForDemo: 'superadmin' | 'admin' | 'salesperson' = normalizedEmail.includes('super')
              ? 'superadmin'
              : normalizedEmail.includes('sales')
              ? 'salesperson'
              : 'admin';
            return quickDemoLogin(roleForDemo);
          }

          setAuthError(error.message);
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const userEmail = data.user.email || email;
          const { profile: prof, organization: userOrg } = await fetchUserProfile(data.user.id, userEmail);
          setProfile(prof);
          setOrg(userOrg);
          setRole(prof.role);
          setUser(mapProfileToUser(prof));
          setHasRealSession(true);
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({ isLoggedIn: true, role: prof.role, email: prof.email, userId: prof.id })
          );
          setIsLoading(false);
          return { success: true, role: prof.role };
        }
      }

      // 2. Offline / Demo mode fallback
      if (isDemoEmail) {
        const roleForDemo: 'superadmin' | 'admin' | 'salesperson' = normalizedEmail.includes('super')
          ? 'superadmin'
          : normalizedEmail.includes('sales')
          ? 'salesperson'
          : 'admin';
        return quickDemoLogin(roleForDemo);
      }

      setAuthError('Authentication failed.');
      setIsLoading(false);
      return { success: false, error: 'Authentication failed. Please check your credentials.' };
    } catch (err: any) {
      console.error('Sign in unexpected error:', err);
      if (isDemoEmail) {
        const roleForDemo: 'superadmin' | 'admin' | 'salesperson' = normalizedEmail.includes('super')
          ? 'superadmin'
          : normalizedEmail.includes('sales')
          ? 'salesperson'
          : 'admin';
        return quickDemoLogin(roleForDemo);
      }
      const msg = err?.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  // Sign Out implementation
  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Error signing out of Supabase:', e);
      }
    }
    setUser(null);
    setProfile(null);
    setOrg(null);
    setActiveOrgId(null);
    setHasRealSession(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.hash = '#login';
    setIsLoading(false);
  };

  // Reset password email trigger
  const resetPasswordForEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (supabase) {
      try {
        const appOrigin = getAppOrigin();
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${appOrigin}/#auth/reset`,
        });
        if (error) {
          return { success: false, message: error.message };
        }
        return { success: true, message: 'Password reset link sent to your email address.' };
      } catch (err: any) {
        return { success: false, message: err?.message || 'Failed to send password reset email' };
      }
    }
    return { success: true, message: 'Demo mode: Password reset email simulated.' };
  };

  // Update password
  const updatePassword = async (newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          return { success: false, message: error.message };
        }
        return { success: true, message: 'Password updated successfully. You can now login.' };
      } catch (err: any) {
        return { success: false, message: err?.message || 'Failed to update password' };
      }
    }
    return { success: true, message: 'Demo mode: Password updated successfully.' };
  };

  // Demo role switch (strictly restricted to demo mode)
  const switchDemoRole = (newRole: UserRole) => {
    if (!allowDemo) {
      console.warn('Role switching is only permitted in Demo Mode.');
      return;
    }
    const newUser = newRole === 'admin' ? MOCK_USERS.admin : MOCK_USERS.salesperson;
    setUser(newUser);
    setRole(newRole);
    setProfile({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newRole,
      org_id: 'demo-org-uuid',
      is_demo_account: true,
    });
    setOrg({
      id: 'demo-org-uuid',
      name: 'Demo Footwear Traders',
      status: 'active',
      is_demo: true,
    });
    setHasRealSession(false);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ isLoggedIn: true, role: newRole, email: newUser.email })
    );
  };

  const clearAuthError = () => setAuthError(null);

  const isSuperAdmin = Boolean(profile?.is_super_admin || user?.is_super_admin);
  const isDemoAccount = Boolean(profile?.is_demo_account || user?.is_demo_account);
  const isAdminRole = isSuperAdmin || role === 'admin' || profile?.role === 'admin' || user?.role === 'admin';
  const canManageCatalog = isAdminRole;

  const value: AuthContextType = {
    user,
    profile,
    role,
    org,
    orgId: org?.id || profile?.org_id || null,
    activeOrgId,
    setActiveOrgId,
    isSuperAdmin,
    isDemoAccount,
    isAdmin: isAdminRole,
    isSalesperson: !isAdminRole,
    canManageCatalog,
    hasRealSession,
    allowDemo,
    isLoggedIn: Boolean(user),
    isLoading,
    authError,
    isDemoMode,
    signIn,
    signUp,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    switchDemoRole,
    quickDemoLogin,
    clearAuthError,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
