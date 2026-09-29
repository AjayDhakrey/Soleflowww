import { supabase } from '../lib/supabase';
import { NotificationItem } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_NOTIFICATIONS } from '../data/mockData';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export function mapNotificationRow(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    title: row.title,
    time: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    desc: row.description,
    category: (row.category || 'alert') as NotificationItem['category'],
    read: row.is_read,
    linkTab: row.link_tab || undefined,
  };
}

export const notificationsService = {
  async fetchNotifications(): Promise<NotificationItem[]> {
    if (!supabase) return MOCK_NOTIFICATIONS;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw parseSupabaseError(error);
      if (!data || data.length === 0) return MOCK_NOTIFICATIONS;
      return data.map(mapNotificationRow);
    } catch (err) {
      console.warn('Error fetching notifications from Supabase:', err);
      return MOCK_NOTIFICATIONS;
    }
  },

  async markAsRead(id: string): Promise<boolean> {
    if (!supabase) return true;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw parseSupabaseError(error);
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  },

  async markAllAsRead(): Promise<boolean> {
    if (!supabase) return true;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw parseSupabaseError(error);
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  },
};
