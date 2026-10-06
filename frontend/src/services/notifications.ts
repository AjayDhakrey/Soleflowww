import {supabase, isDemoModeActive} from '../lib/supabase';
import { NotificationItem } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export function mapNotificationRow(row: any): NotificationItem {
  return {
    id: row.id,
    title: row.title,
    time: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
    desc: row.body || row.description || '',
    category: (row.type || row.category || 'alert') as NotificationItem['category'],
    read: row.read_at !== null && row.read_at !== undefined ? true : Boolean(row.is_read),
    linkTab: row.link_tab || undefined,
  };
}

export const notificationsService = {
  async fetchNotifications(): Promise<NotificationItem[]> {
    if (!supabase || isDemoModeActive) return [];

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw parseSupabaseError(error);
      if (!data || data.length === 0) return [];
      return data.map(mapNotificationRow);
    } catch (err) {
      console.warn('Error fetching notifications from Supabase:', err);
      return [];
    }
  },

  async markAsRead(id: string): Promise<boolean> {
    if (!supabase || isDemoModeActive) return true;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw parseSupabaseError(error);
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  },

  async markAllAsRead(): Promise<boolean> {
    if (!supabase || isDemoModeActive) return true;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .is('read_at', null);

      if (error) throw parseSupabaseError(error);
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  },
};

