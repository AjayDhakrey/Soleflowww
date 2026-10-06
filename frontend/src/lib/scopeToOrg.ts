/**
 * Helper to scope Supabase queries strictly to the effective organization ID.
 * When orgId is present, appends .eq('org_id', orgId).
 */
export function scopeToOrg<T>(query: T, orgId: string | null | undefined): T {
  if (!orgId) return query;
  if (query && typeof (query as any).eq === 'function') {
    return (query as any).eq('org_id', orgId);
  }
  return query;
}
