import { supabase } from '../lib/supabase';
import { AuditEvent } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_AUDIT_LOGS } from '../data/mockData';

export type ActivityEventRow = Database['public']['Tables']['activity_events']['Row'];

export function mapActivityRow(row: ActivityEventRow): AuditEvent {
  const details = typeof row.details === 'object' && row.details !== null ? row.details : {};
  return {
    id: row.id,
    actor: row.actor_name || 'User',
    actorRole: (row.actor_role as AuditEvent['actorRole']) || 'Trader / Admin',
    action: row.action,
    recordType: (row.entity_type as AuditEvent['recordType']) || 'Client',
    recordId: row.entity_id,
    recordTitle: row.entity_title || row.entity_id,
    oldValue: (details as any).oldValue || undefined,
    newValue: (details as any).newValue || row.action,
    timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    source: (row.source as AuditEvent['source']) || 'Web App',
  };
}

export const activityService = {
  async fetchActivityEvents(filters?: { entityType?: string; entityId?: string; limit?: number }): Promise<AuditEvent[]> {
    if (!supabase) return MOCK_AUDIT_LOGS;

    try {
      let query = supabase
        .from('activity_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 50);

      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters?.entityId) {
        query = query.eq('entity_id', filters.entityId);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);

      if (!data || data.length === 0) return MOCK_AUDIT_LOGS;
      return data.map(mapActivityRow);
    } catch (err) {
      console.warn('Error fetching activity events from Supabase:', err);
      return MOCK_AUDIT_LOGS;
    }
  },

  async logActivityEvent(event: Partial<ActivityEventRow>): Promise<boolean> {
    if (!supabase) return true;

    try {
      const { error } = await supabase.from('activity_events').insert([
        {
          entity_type: event.entity_type || 'General',
          entity_id: event.entity_id || 'ID-0',
          action: event.action || 'Updated',
          actor_name: event.actor_name || 'System',
          actor_role: event.actor_role || 'System',
          entity_title: event.entity_title || 'Record',
          details: (event.details || {}) as any,
          source: event.source || 'Web App',
        },
      ]);

      if (error) throw parseSupabaseError(error);
      return true;
    } catch (err) {
      console.error('Error logging activity event:', err);
      return false;
    }
  },
};
