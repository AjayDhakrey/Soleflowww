import { supabase, toValidOrgId, isValidUuid } from '../lib/supabase';
import { NotificationItem } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_NOTIFICATIONS } from '../data/mockData';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];

/**
 * Format timestamp into human-readable relative string: "Just now", "5m ago", "2h ago", "Yesterday", etc.
 */
export function formatNotificationTime(dateStr?: string | null): string {
  if (!dateStr) return 'Just now';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = Date.now();
    const diffMs = now - d.getTime();
    if (diffMs < 0 || diffMs < 45 * 1000) return 'Just now';
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return 'Just now';
  }
}

/**
 * Safely maps database rows, payload changes, or local objects to the typed NotificationItem.
 */
export function mapNotificationRow(row: any): NotificationItem {
  if (!row) {
    return {
      id: `notif-${Date.now()}`,
      title: 'Alert',
      time: 'Just now',
      desc: '',
      category: 'alert',
      read: false,
    };
  }

  const typeStr = String(row.type || row.category || '').toLowerCase();
  const recordTypeStr = String(row.record_type || '').toLowerCase();
  let category: NotificationItem['category'] = 'alert';
  let linkTab: string | undefined = row.link_tab || undefined;

  if (typeStr.includes('design') || recordTypeStr === 'design') {
    category = 'design';
    linkTab = 'designs';
  } else if (typeStr.includes('pay') || typeStr.includes('cheque') || recordTypeStr === 'payment') {
    category = 'payment';
    linkTab = 'payments';
  } else if (typeStr.includes('order') || recordTypeStr === 'order') {
    category = 'order';
    linkTab = 'orders';
  } else if (typeStr.includes('stop') || typeStr.includes('visit') || recordTypeStr === 'visit') {
    category = 'visit';
    linkTab = 'visits';
  } else if (typeStr.includes('factory')) {
    category = 'factory';
    linkTab = 'manufacturers';
  }

  // Determine read status from read_at, is_read, or local cache
  let isRead = Boolean(row.read_at !== null && row.read_at !== undefined ? true : Boolean(row.is_read || row.read));
  const rawId = String(row.id || '');
  if (!isRead && rawId) {
    try {
      const readSet = new Set<string>(JSON.parse(localStorage.getItem('soleflow_read_notifications') || '[]'));
      if (readSet.has(rawId)) isRead = true;
    } catch {}
  }

  return {
    id: rawId || `notif-${Date.now()}`,
    title: row.title || 'System Notification',
    time: formatNotificationTime(row.created_at || row.time),
    desc: row.body || row.description || row.desc || '',
    category,
    read: isRead,
    linkTab: linkTab || row.linkTab,
  };
}

export const notificationsService = {
  /**
   * Fetches notifications from Supabase, merges with localStorage notifications, and layers read state.
   */
  async fetchNotifications(orgId?: string, userRole?: string, userId?: string): Promise<NotificationItem[]> {
    let cloudItems: NotificationItem[] = [];

    if (supabase) {
      try {
        let query = supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(40);

        if (orgId) {
          const validOrg = toValidOrgId(orgId);
          query = query.or(`org_id.eq.${validOrg},org_id.is.null`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          cloudItems = data.map(mapNotificationRow);
        }
      } catch (err) {
        console.warn('Supabase fetchNotifications warning:', err);
      }
    }

    // LocalStorage notifications (for offline/demo or locally dispatched events)
    let localItems: NotificationItem[] = [];
    try {
      const raw = localStorage.getItem('soleflow_notifications');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          localItems = parsed.map(mapNotificationRow);
        }
      }
    } catch {}

    // Read status overlay from localStorage
    let readIds = new Set<string>();
    try {
      readIds = new Set(JSON.parse(localStorage.getItem('soleflow_read_notifications') || '[]'));
    } catch {}

    // Merge: localItems + cloudItems (deduping by ID)
    const seenIds = new Set<string>();
    const merged: NotificationItem[] = [];

    for (const item of [...localItems, ...cloudItems]) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        merged.push({
          ...item,
          read: item.read || readIds.has(item.id),
        });
      }
    }

    // Include mock notifications as baseline if missing
    for (const m of MOCK_NOTIFICATIONS) {
      if (!seenIds.has(m.id)) {
        seenIds.add(m.id);
        merged.push({
          ...m,
          read: m.read || readIds.has(m.id),
        });
      }
    }

    return merged;
  },

  /**
   * Creates a notification in Supabase and persists to localStorage with instant UI dispatch.
   */
  async createNotification(input: {
    title: string;
    desc: string;
    category?: NotificationItem['category'];
    linkTab?: string;
    org_id?: string;
    recipient_role?: 'admin' | 'salesperson' | 'all';
    user_id?: string;
    record_type?: string;
    record_id?: string;
  }): Promise<NotificationItem> {
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const notifItem: NotificationItem = {
      id: notifId,
      title: input.title,
      time: 'Just now',
      desc: input.desc,
      category: input.category || 'alert',
      read: false,
      linkTab: input.linkTab,
    };

    // 1. Save to localStorage
    try {
      const stored: NotificationItem[] = JSON.parse(localStorage.getItem('soleflow_notifications') || '[]');
      stored.unshift(notifItem);
      localStorage.setItem('soleflow_notifications', JSON.stringify(stored.slice(0, 50)));
    } catch (e) {
      console.warn('LocalStorage save notification warning:', e);
    }

    // 2. Dispatch custom event for immediate in-page reactivity
    try {
      window.dispatchEvent(new CustomEvent('soleflow-new-notification', { detail: notifItem }));
    } catch {}

    // 3. Save to Supabase if configured
    if (supabase) {
      try {
        const payload: any = {
          title: input.title,
          body: input.desc,
          type: input.category || 'alert',
          recipient_role: input.recipient_role || 'all',
          created_at: nowIso,
        };
        if (input.org_id) payload.org_id = toValidOrgId(input.org_id);
        if (input.user_id) payload.user_id = input.user_id;
        if (input.record_type) payload.record_type = input.record_type;
        if (input.record_id) payload.record_id = input.record_id;

        const { data, error } = await supabase.from('notifications').insert(payload).select().maybeSingle();
        if (!error && data) {
          notifItem.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase insert notification warning:', err);
      }
    }

    return notifItem;
  },

  /**
   * Marks a notification as read locally and in Supabase.
   */
  async markAsRead(id: string): Promise<boolean> {
    // 1. Save to localStorage read set
    try {
      const readSet = new Set<string>(JSON.parse(localStorage.getItem('soleflow_read_notifications') || '[]'));
      readSet.add(id);
      localStorage.setItem('soleflow_read_notifications', JSON.stringify(Array.from(readSet)));
    } catch {}

    // 2. Update local notifications list
    try {
      const stored: NotificationItem[] = JSON.parse(localStorage.getItem('soleflow_notifications') || '[]');
      const updated = stored.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem('soleflow_notifications', JSON.stringify(updated));
    } catch {}

    // 3. Update Supabase if it's a UUID and supabase is active
    if (supabase && isValidUuid(id)) {
      try {
        await supabase
          .from('notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase markAsRead warning:', err);
      }
    }

    return true;
  },

  /**
   * Marks all notifications as read locally and in Supabase.
   */
  async markAllAsRead(allIds?: string[]): Promise<boolean> {
    // 1. Save all IDs to localStorage read set
    try {
      const readSet = new Set<string>(JSON.parse(localStorage.getItem('soleflow_read_notifications') || '[]'));
      if (allIds && allIds.length > 0) {
        allIds.forEach((id) => readSet.add(id));
      }
      localStorage.setItem('soleflow_read_notifications', JSON.stringify(Array.from(readSet)));
    } catch {}

    // 2. Update local notifications list
    try {
      const stored: NotificationItem[] = JSON.parse(localStorage.getItem('soleflow_notifications') || '[]');
      const updated = stored.map((n) => ({ ...n, read: true }));
      localStorage.setItem('soleflow_notifications', JSON.stringify(updated));
    } catch {}

    // 3. Update Supabase
    if (supabase) {
      try {
        await supabase
          .from('notifications')
          .update({ read_at: new Date().toISOString() })
          .is('read_at', null);
      } catch (err) {
        console.warn('Supabase markAllAsRead warning:', err);
      }
    }

    return true;
  },
};
