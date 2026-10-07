import React from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../auth/AuthProvider';

const mocks = vi.hoisted(() => ({ signIn: vi.fn(), mode: vi.fn(), profile: vi.fn() }));
vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: () => true,
  setDemoModeActive: mocks.mode,
  supabase: {
    auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }), signInWithPassword: mocks.signIn },
    from: (table: string) => ({ select: () => ({ eq: () => ({ single: () => mocks.profile(table) }) }) }),
  },
}));
let auth: ReturnType<typeof useAuth>;
function Probe() { auth = useAuth(); return null; }
beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); vi.stubEnv('VITE_DEMO_MODE', 'true'); });
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });
async function mount() { render(<AuthProvider><Probe /></AuthProvider>); await waitFor(() => expect(auth.isLoading).toBe(false)); }

it('does not convert a failed password login into a successful demo session', async () => {
  mocks.signIn.mockResolvedValue({ data: {}, error: { message: 'Database error querying schema' } });
  await mount();
  await act(async () => { expect(await auth.signIn('admin@soleflow.com', 'test')).toEqual({ success: false, error: 'Database error querying schema' }); });
  expect(auth.isLoggedIn).toBe(false);
  expect(auth.isDemoAccount).toBe(false);
});

it('allows role changes only inside an explicitly selected sample workspace', async () => {
  vi.stubEnv('VITE_DEMO_MODE', 'false'); await mount();
  await act(async () => { auth.quickDemoLogin('admin'); });
  await act(async () => { auth.switchDemoRole('salesperson'); });
  expect(auth.role).toBe('salesperson'); expect(auth.hasRealSession).toBe(false);
  expect(JSON.parse(localStorage.getItem('soleflow_auth_session')!).user.is_demo_account).toBe(true);
});

it('uses database persistence for a real login even when demos are enabled in the build', async () => {
  mocks.signIn.mockResolvedValue({ data: { user: { id: 'real-user', email: 'owner@example.com' } }, error: null });
  mocks.profile.mockImplementation(async (table: string) => ({ data: table === 'profiles' ? { id: 'real-user', full_name: 'Owner', role: 'admin', org_id: 'org-real' } : { id: 'org-real', name: 'Real business' }, error: null }));
  await mount(); await act(async () => { await auth.signIn('owner@example.com', 'test'); });
  expect(auth.hasRealSession).toBe(true); expect(mocks.mode).toHaveBeenLastCalledWith(false);
  await act(async () => { auth.switchDemoRole('salesperson'); });
  expect(auth.role).toBe('admin'); expect(auth.user?.id).toBe('real-user');
});
