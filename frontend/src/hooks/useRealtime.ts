import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase, isDemoModeActive } from '../lib/supabase';
import { useEffectiveOrgId } from '../context/ViewModeContext';
import { mapSalesmanRow } from '../services/salesmen';
import { mapClientRowToCustomer } from '../services/clients';
import { mapFollowUpRow } from '../services/followUps';
import { mapFieldVisitRow } from '../services/visits';
import {
  Salesperson,
  Customer,
  Order,
  PaymentReceipt,
  FollowUpItem,
  FieldVisitItem,
  NotificationItem,
} from '../types';

export interface UseRealtimeSubscriptionsOptions {
  userId?: string | null;
  userRole?: string | null;
  userName?: string | null;
  onNotification?: (msg: string) => void;
  setSalesTeam?: React.Dispatch<React.SetStateAction<Salesperson[]>>;
  setCustomers?: React.Dispatch<React.SetStateAction<Customer[]>>;
  setOrders?: React.Dispatch<React.SetStateAction<Order[]>>;
  setPayments?: React.Dispatch<React.SetStateAction<PaymentReceipt[]>>;
  setFollowUps?: React.Dispatch<React.SetStateAction<FollowUpItem[]>>;
  setFieldVisits?: React.Dispatch<React.SetStateAction<FieldVisitItem[]>>;
  setNotifications?: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
}

export function useRealtimeSubscriptions(
  optionsOrUserId?: UseRealtimeSubscriptionsOptions | string | null,
  legacyOnNotification?: (msg: string) => void
) {
  const queryClient = useQueryClient();
  const effectiveOrgId = useEffectiveOrgId();

  const options: UseRealtimeSubscriptionsOptions =
    typeof optionsOrUserId === 'object' && optionsOrUserId !== null
      ? optionsOrUserId
      : {
          userId: typeof optionsOrUserId === 'string' ? optionsOrUserId : undefined,
          onNotification: legacyOnNotification,
        };

  const {
    userId,
    userRole,
    userName,
    onNotification,
    setSalesTeam,
    setCustomers,
    setOrders,
    setPayments,
    setFollowUps,
    setFieldVisits,
    setNotifications,
  } = options;

  useEffect(() => {
    if (!supabase || isDemoModeActive) return;

    const filterClause = effectiveOrgId ? `org_id=eq.${effectiveOrgId}` : undefined;
    const channelId = `soleflow-live-sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const syncChannel = supabase
      .channel(channelId)
      // 1. Sales Team Updates (tasks checklist, route stops, targets, status from Trader)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales_team',
          ...(filterClause ? { filter: filterClause } : {}),
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['sales_team'] });
          queryClient.invalidateQueries({ queryKey: ['salesmen'] });
          queryClient.invalidateQueries({ queryKey: ['salesTeam'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });

          if (payload.new && setSalesTeam) {
            const updatedRep = mapSalesmanRow(payload.new);
            setSalesTeam((prev) => {
              const exists = prev.some((r) => r.id === updatedRep.id);
              if (exists) {
                return prev.map((r) => (r.id === updatedRep.id ? { ...r, ...updatedRep } : r));
              }
              return [updatedRep, ...prev];
            });
          }

          if (userRole === 'salesperson' && onNotification) {
            onNotification('📌 Trader updated route stops & task checklist');
          }
        }
      )
      // 2. Customer & Salesman Assignment Updates
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          ...(filterClause ? { filter: filterClause } : {}),
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['customers'] });
          queryClient.invalidateQueries({ queryKey: ['clients'] });
          queryClient.invalidateQueries({ queryKey: ['receivables'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const mappedCust = mapClientRowToCustomer(payload.new);
            if (setCustomers) {
              setCustomers((prev) => {
                const exists = prev.some((c) => c.id === mappedCust.id);
                if (exists) {
                  return prev.map((c) => (c.id === mappedCust.id ? { ...c, ...mappedCust } : c));
                }
                return [mappedCust, ...prev];
              });
            }

            if (onNotification) {
              const name = (payload.new as any)?.businessName || 'Client';
              onNotification(`👥 Client updated: ${name}`);
            }
          } else if (payload.eventType === 'DELETE' && (payload.old as any)?.id) {
            const delId = (payload.old as any).id;
            if (setCustomers) {
              setCustomers((prev) => prev.filter((c) => c.id !== delId));
            }
          }
        }
      )
      // 3. Orders Updates (Status changes, Confirmations, Dispatch)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          ...(filterClause ? { filter: filterClause } : {}),
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['receivables'] });
          queryClient.invalidateQueries({ queryKey: ['clients'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order;
            if (setOrders) {
              setOrders((prev) => {
                const exists = prev.some((o) => o.id === updatedOrder.id);
                if (exists) {
                  return prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
                }
                return [updatedOrder, ...prev];
              });
            }

            if (onNotification) {
              const id = (payload.new as any)?.id || 'Order';
              const status = (payload.new as any)?.status || 'Updated';
              onNotification(`📦 Order ${id} is now ${status}`);
            }
          } else if (payload.eventType === 'DELETE' && (payload.old as any)?.id) {
            const delId = (payload.old as any).id;
            if (setOrders) {
              setOrders((prev) => prev.filter((o) => o.id !== delId));
            }
          }
        }
      )
      // 4. Special Trade Margin / Discount Request Authorizations
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discount_requests',
          ...(filterClause ? { filter: filterClause } : {}),
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['discount_requests'] });
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['receivables'] });

          if (onNotification && payload.new) {
            const req = payload.new as any;
            const statusStr = req.status ? req.status.toUpperCase() : 'UPDATED';
            onNotification(`🏷️ Special discount for ${req.order_id || 'Order'} was ${statusStr}`);
          }
        }
      )
      // 5. Follow-ups
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follow_ups',
          ...(filterClause ? { filter: filterClause } : {}),
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['follow_ups'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });

          if (payload.new && setFollowUps) {
            const mapped = mapFollowUpRow(payload.new);
            setFollowUps((prev) => {
              const exists = prev.some((f) => f.id === mapped.id);
              if (exists) {
                return prev.map((f) => (f.id === mapped.id ? { ...f, ...mapped } : f));
              }
              return [mapped, ...prev];
            });
          }
        }
      )
      // 6. Field Visits
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'field_visits',
          ...(filterClause ? { filter: filterClause } : {}),
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['field_visits'] });
          queryClient.invalidateQueries({ queryKey: ['visits'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });

          if (payload.new && setFieldVisits) {
            const mapped = mapFieldVisitRow(payload.new);
            setFieldVisits((prev) => {
              const exists = prev.some((v) => v.id === mapped.id);
              if (exists) {
                return prev.map((v) => (v.id === mapped.id ? { ...v, ...mapped } : v));
              }
              return [mapped, ...prev];
            });
          }
        }
      )
      // 7. Payments & Collections
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          ...(filterClause ? { filter: filterClause } : {}),
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['payments'] });
          queryClient.invalidateQueries({ queryKey: ['receivables'] });
          queryClient.invalidateQueries({ queryKey: ['clients'] });
          queryClient.invalidateQueries({ queryKey: ['customers'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });

          if (payload.new && setPayments) {
            const pay = payload.new as PaymentReceipt;
            setPayments((prev) => {
              const exists = prev.some((p) => p.id === pay.id);
              if (exists) {
                return prev.map((p) => (p.id === pay.id ? { ...p, ...pay } : p));
              }
              return [pay, ...prev];
            });
          }

          if (onNotification && payload.new) {
            const payAmt = Number((payload.new as any).paymentAmount || 0);
            onNotification(`💰 Payment recorded: ₹${payAmt.toLocaleString('en-IN')}`);
          }
        }
      )
      // 8. Notifications table
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          ...(filterClause ? { filter: filterClause } : {}),
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          if (payload.new && setNotifications) {
            const notif = payload.new as NotificationItem;
            setNotifications((prev) => [notif, ...prev]);
          }
          if (onNotification) {
            onNotification(`🔔 ${(payload.new as any)?.title || 'New Notification'}: ${(payload.new as any)?.message || ''}`);
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(syncChannel);
      }
    };
  }, [
    queryClient,
    effectiveOrgId,
    userId,
    userRole,
    userName,
    onNotification,
    setSalesTeam,
    setCustomers,
    setOrders,
    setPayments,
    setFollowUps,
    setFieldVisits,
    setNotifications,
  ]);
}
