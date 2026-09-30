import { supabase } from '../lib/supabase';
import { AuditEvent } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_AUDIT_LOGS } from '../data/mockData';

export type ActivityEventRow = Database['public']['Tables']['activity_events']['Row'];

export function mapActivityRow(row: any): AuditEvent {
  const metadata = typeof row.metadata === 'object' && row.metadata !== null ? row.metadata : {};
  return {
    id: row.id,
    actor: row.actor || row.actor_name || 'User',
    actorRole: (row.actorRole || row.actor_role || metadata.actorRole || 'Trader / Admin') as AuditEvent['actorRole'],
    action: row.action,
    recordType: (row.record_type || row.recordType || row.entity_type || 'Client') as AuditEvent['recordType'],
    recordId: row.record_id || row.recordId || row.entity_id || '',
    recordTitle: row.summary || row.recordTitle || row.entity_title || row.record_id || 'Record',
    oldValue: row.oldValue || metadata.oldValue || undefined,
    newValue: row.newValue || metadata.newValue || row.summary || row.action,
    timestamp: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (row.timestamp || 'Now'),
    source: (row.source || metadata.source || 'Web App') as AuditEvent['source'],
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
        query = query.eq('record_type', filters.entityType);
      }
      if (filters?.entityId) {
        query = query.eq('record_id', filters.entityId);
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

  async logActivityEvent(event: any): Promise<boolean> {
    if (!supabase) return true;

    try {
      const { error } = await supabase.from('activity_events').insert([
        {
          actor: event.actor || event.actor_name || 'System User',
          actor_id: event.actor_id || null,
          action: event.action || 'Updated',
          record_type: event.record_type || event.recordType || event.entity_type || 'General',
          record_id: event.record_id || event.recordId || event.entity_id || 'ID-0',
          client_id: event.client_id || event.clientId || null,
          order_id: event.order_id || event.orderId || null,
          design_id: event.design_id || event.designId || null,
          payment_id: event.payment_id || event.paymentId || null,
          manufacturer_id: event.manufacturer_id || event.manufacturerId || null,
          salesman_id: event.salesman_id || event.salesmanId || null,
          summary: event.summary || event.recordTitle || event.entity_title || `${event.action || 'Action'} on ${event.record_type || 'Record'}`,
          metadata: event.metadata || event.details || {},
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

