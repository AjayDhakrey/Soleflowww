import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
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
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isSalesperson: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  authError: string | null;
  isDemoMode: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;
  switchDemoRole: (role: UserRole) => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'soleflow_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isConfigured = isSupabaseConfigured();
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !isConfigured;

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('admin');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Helper to map DB profile to App User model
  const mapProfileToUser = (prof: UserProfile): User => ({
    id: prof.id,
    name: prof.name,
    email: prof.email,
    role: prof.role,
    avatar: prof.avatar_url || (prof.role === 'admin' ? MOCK_USERS.admin.avatar : MOCK_USERS.salesperson.avatar),
    initials: prof.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase(),
    roleLabel: prof.role_label || (prof.role === 'admin' ? 'Trader Admin' : 'Field Sales Rep'),
    phone: prof.phone || undefined,
    zone: prof.zone || undefined,
  });

  // Load profile from Supabase profiles table
  const fetchUserProfile = async (userId: string, email: string): Promise<UserProfile> => {
    if (!supabase) {
      const fallbackRole: UserRole = email.includes('sales') ? 'salesperson' : 'admin';
      return {
        id: userId,
        email,
        name: email.split('@')[0],
        role: fallbackRole,
      };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        // Fallback: check email prefix or metadata
        const determinedRole: UserRole =
          email.toLowerCase().includes('sales') || email === 'sales@soleflow.com' ? 'salesperson' : 'admin';
        return {
          id: userId,
          email,
          name: email.split('@')[0],
          role: determinedRole,
        };
      }

      return data as UserProfile;
    } catch (err) {
      console.error('Error loading profile from Supabase:', err);
      const determinedRole: UserRole = email.includes('sales') ? 'salesperson' : 'admin';
      return {
        id: userId,
        email,
        name: email.split('@')[0],
        role: determinedRole,
      };
    }
  };

  // Initial Auth Check
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      setIsLoading(true);

      // 1. If Supabase is active, check active Supabase Auth session
      if (supabase && !isDemoMode) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const userEmail = session.user.email || 'user@soleflow.com';
            const prof = await fetchUserProfile(session.user.id, userEmail);
            if (isMounted) {
              setProfile(prof);
              setRole(prof.role);
              setUser(mapProfileToUser(prof));
            }
          }
        } catch (e) {
          console.error('Error initializing auth:', e);
        }
      }

      // 2. Check local stored session fallback (for demo mode or cached login)
      if (isMounted && !user) {
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
              });
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
          const prof = await fetchUserProfile(session.user.id, email);
          setProfile(prof);
          setRole(prof.role);
          setUser(mapProfileToUser(prof));
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({ isLoggedIn: true, role: prof.role, email: prof.email, userId: prof.id })
          );
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
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
  }, [isDemoMode]);

  // Sign In implementation
  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    setIsLoading(true);

    try {
      // 1. If real Supabase client is configured, attempt Supabase Auth
      if (supabase && !isDemoMode) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        });

        if (error) {
          // If Supabase auth fails and demo credentials were typed, allow demo login with clear note
          if (
            (email === 'admin@soleflow.com' && pass === 'admin123') ||
            (email === 'sales@soleflow.com' && pass === 'sales123')
          ) {
            console.warn('Supabase Auth error; falling back to demo session:', error.message);
            const demoRole: UserRole = email.includes('sales') ? 'salesperson' : 'admin';
            const demoUser = demoRole === 'salesperson' ? MOCK_USERS.salesperson : MOCK_USERS.admin;
            setUser(demoUser);
            setRole(demoRole);
            setProfile({
              id: demoUser.id,
              email: demoUser.email,
              name: demoUser.name,
              role: demoRole,
            });
            localStorage.setItem(
              AUTH_STORAGE_KEY,
              JSON.stringify({ isLoggedIn: true, role: demoRole, email: demoUser.email })
            );
            setIsLoading(false);
            return { success: true };
          }

          setAuthError(error.message);
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const userEmail = data.user.email || email;
          const prof = await fetchUserProfile(data.user.id, userEmail);
          setProfile(prof);
          setRole(prof.role);
          setUser(mapProfileToUser(prof));
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({ isLoggedIn: true, role: prof.role, email: prof.email, userId: prof.id })
          );
          setIsLoading(false);
          return { success: true };
        }
      }

      // 2. Demo mode / Mock credentials authentication
      let assignedRole: UserRole = 'admin';
      if (email === 'sales@soleflow.com' || email.toLowerCase().includes('sales')) {
        assignedRole = 'salesperson';
      }

      const activeUser = assignedRole === 'salesperson' ? MOCK_USERS.salesperson : MOCK_USERS.admin;
      setUser(activeUser);
      setRole(assignedRole);
      setProfile({
        id: activeUser.id,
        email: activeUser.email,
        name: activeUser.name,
        role: assignedRole,
      });

      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ isLoggedIn: true, role: assignedRole, email: activeUser.email })
      );

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      console.error('Sign in unexpected error:', err);
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
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsLoading(false);
  };

  // Reset password email trigger
  const resetPasswordForEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/#auth/reset`,
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

  // Demo role switch
  const switchDemoRole = (newRole: UserRole) => {
    const newUser = newRole === 'admin' ? MOCK_USERS.admin : MOCK_USERS.salesperson;
    setUser(newUser);
    setRole(newRole);
    setProfile({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newRole,
    });
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ isLoggedIn: true, role: newRole, email: newUser.email })
    );
  };

  const clearAuthError = () => setAuthError(null);

  const value: AuthContextType = {
    user,
    profile,
    role,
    isAdmin: role === 'admin',
    isSalesperson: role === 'salesperson',
    isLoggedIn: Boolean(user),
    isLoading,
    authError,
    isDemoMode,
    signIn,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    switchDemoRole,
    clearAuthError,
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
