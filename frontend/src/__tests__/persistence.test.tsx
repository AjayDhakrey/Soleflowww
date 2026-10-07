import React from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProvider, useApp } from '../context/AppContext';

const mocks = vi.hoisted(() => ({
  auth: { hasRealSession: true, isLoggedIn: true, isDemoAccount: false, user: { id: 'user-a', name: 'Owner', role: 'admin' }, profile: { org_id: 'org-a' } },
  customers: vi.fn(), orders: vi.fn(), payments: vi.fn(), salesTeam: vi.fn(), updateSalesman: vi.fn(), empty: vi.fn(), createClient: vi.fn(), createOrder: vi.fn(), recordPayment: vi.fn(), createFollowUp: vi.fn(), completeFollowUp: vi.fn(),
}));
vi.mock('../auth/AuthProvider', () => ({ useAuth: () => mocks.auth }));
vi.mock('../context/ViewModeContext', () => ({ useEffectiveOrgId: () => mocks.auth.profile.org_id, useReadOnly: () => false }));
vi.mock('../lib/supabase', () => ({ isSupabaseConfigured: () => true, supabaseApi: { getCustomers: mocks.customers, getOrders: mocks.orders, getPayments: mocks.payments, getAuditLogs: mocks.empty, getDesignShares: mocks.empty, getManufacturers: mocks.empty, getSalesTeam: mocks.salesTeam } }));
vi.mock('../services/salesmen', () => ({ salesmenService: { updateSalesman: mocks.updateSalesman } }));
vi.mock('../services/clients', () => ({ clientsService: { createClient: mocks.createClient }, mapClientRowToCustomer: (row: any) => row }));
vi.mock('../services/orders', () => ({ ordersService: { createOrderDraft: mocks.createOrder } }));
vi.mock('../services/payments', () => ({ paymentsService: { recordPayment: mocks.recordPayment } }));
vi.mock('../services/designs', () => ({ designsService: { fetchDesigns: mocks.empty } }));
vi.mock('../services/followUps', () => ({ followUpsService: { fetchFollowUps: mocks.empty, createFollowUp: mocks.createFollowUp, completeFollowUp: mocks.completeFollowUp }, mapFollowUpRow: (row: any) => row }));
vi.mock('../services/visits', () => ({ visitsService: { fetchVisits: mocks.empty } }));
vi.mock('../services/notifications', () => ({ notificationsService: { fetchNotifications: mocks.empty } }));
let app: ReturnType<typeof useApp>;
function Probe() { app = useApp(); return <span>{app.customers.length} customers</span>; }
function mount() { return render(<QueryClientProvider client={new QueryClient()}><AppProvider><Probe /></AppProvider></QueryClientProvider>); }
beforeEach(() => {
  vi.clearAllMocks(); localStorage.clear();
  mocks.auth.hasRealSession = true; mocks.auth.isDemoAccount = false;
  mocks.auth.user.id = 'user-a'; mocks.auth.profile.org_id = 'org-a';
  mocks.empty.mockResolvedValue([]); mocks.customers.mockResolvedValue([]); mocks.orders.mockResolvedValue([]); mocks.payments.mockResolvedValue([]);
  mocks.salesTeam.mockResolvedValue([]);
});
afterEach(cleanup);
describe('Account data persistence', () => {
  it('keeps the real account identity when a role switch is attempted', async () => {
    mount(); await waitFor(() => expect(app.currentUser.id).toBe('user-a'));
    await act(async () => { app.switchRole('salesperson'); });
    expect(app.currentUser.id).toBe('user-a'); expect(localStorage.getItem('soleflow_auth_session')).toBeNull();
  });
  it('persists a dispatched route stop before updating the checklist and restores it on reload', async () => {
    mocks.salesTeam.mockResolvedValue([{ id: 'rep-a', tasksChecklist: [] }]);
    mocks.updateSalesman.mockResolvedValue({ success: true });
    const view = mount(); await waitFor(() => expect(app.salesTeam.length).toBe(1));
    const task = { id: 'stop-a', title: 'Visit saved store', completed: false } as any;
    await act(async () => { expect(await app.addSalesTask('rep-a', task)).toBe(true); });
    expect(mocks.updateSalesman).toHaveBeenCalledWith('rep-a', { tasksChecklist: [task] });
    expect(app.salesTeam[0].tasksChecklist).toEqual([task]);
    view.unmount(); mocks.salesTeam.mockResolvedValue([{ id: 'rep-a', tasksChecklist: [task] }]); mount();
    await waitFor(() => expect(app.salesTeam[0]?.tasksChecklist).toEqual([task]));
  });
  it('does not show a dispatched stop when the database rejects it', async () => {
    mocks.salesTeam.mockResolvedValue([{ id: 'rep-a', tasksChecklist: [] }]);
    mocks.updateSalesman.mockResolvedValue({ success: false, error: 'Write denied' });
    mount(); await waitFor(() => expect(app.salesTeam.length).toBe(1));
    await act(async () => { expect(await app.addSalesTask('rep-a', { id: 'stop-a' } as any)).toBe(false); });
    expect(app.salesTeam[0].tasksChecklist).toEqual([]);
  });
  it('uses the saved database ID and reloads the customer after remount', async () => {
    const customer = { id: 'database-client-id', businessName: 'Saved store' };
    mocks.createClient.mockResolvedValue({ success: true, data: customer });
    const view = mount();
    await act(async () => { expect(await app.addCustomer({ businessName: 'Saved store' })).toBe(true); });
    expect(app.customers[0].id).toBe('database-client-id');
    view.unmount(); mocks.customers.mockResolvedValue([customer]); mount();
    await waitFor(() => expect(app.customers[0]?.id).toBe('database-client-id'));
    expect(mocks.customers).toHaveBeenCalledWith('org-a');
  });
  it('does not add a failed customer save to state', async () => {
    mocks.createClient.mockResolvedValue({ success: false, error: 'Database unavailable' }); mount();
    await act(async () => { expect(await app.addCustomer({ businessName: 'Unsaved' })).toBe(false); });
    expect(app.customers).toEqual([]); expect(app.toastMessage).toBe('Database unavailable');
  });
  it('rejects failed payments without showing a successful receipt', async () => {
    mocks.recordPayment.mockResolvedValue({ success: false, error: 'Payment rejected' }); mount();
    await act(async () => { await expect(app.recordPayment({ customerId: 'client-a', paymentAmount: 100 })).rejects.toThrow('Payment rejected'); });
    expect(app.payments).toEqual([]);
  });
  it('returns the server receipt and keeps its ID across reload', async () => {
    const receipt = { id: 'db-payment', receiptNumber: 'SF-REC-123', paymentAmount: 100, customerId: 'client-a', status: 'verified' };
    mocks.recordPayment.mockResolvedValue({ success: true, data: receipt }); const view = mount();
    await act(async () => { expect((await app.recordPayment({ customerId: 'client-a', paymentAmount: 100 })).receiptNumber).toBe('SF-REC-123'); });
    view.unmount(); mocks.payments.mockResolvedValue([receipt]); mount();
    await waitFor(() => expect(app.payments[0]?.id).toBe('db-payment'));
  });
  it('completes a follow-up using the UUID assigned by the database', async () => {
    mocks.createFollowUp.mockResolvedValue({ success: true, data: { id: 'database-followup-uuid', status: 'today' } });
    mocks.completeFollowUp.mockResolvedValue({ success: true }); mount();
    await act(async () => { await app.addFollowUp({ customerId: 'client-a' }); });
    await act(async () => { await app.completeFollowUp(app.followUps[0].id); });
    expect(mocks.completeFollowUp).toHaveBeenCalledWith('database-followup-uuid');
    expect(app.followUps[0].status).toBe('completed');
  });
  it('does not show fixtures in an empty real account', async () => {
    mount(); await waitFor(() => expect(mocks.customers).toHaveBeenCalled());
    expect(app.customers).toEqual([]); expect(app.orders).toEqual([]); expect(app.followUps).toEqual([]);
  });
});
