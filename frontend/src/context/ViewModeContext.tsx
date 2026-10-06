import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';

export interface ViewModeState {
  viewOrgId: string | null;
  viewOrgName: string | null;
  isReadOnly: boolean;
  sessionStartedAt: string | null;
  enterViewMode: (orgId: string, orgName: string) => Promise<void>;
  exitViewMode: () => Promise<void>;
}

const ViewModeContext = createContext<ViewModeState | undefined>(undefined);

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSuperAdmin, setActiveOrgId, org: userOrg, hasRealSession } = useAuth();
  const [viewOrgId, setViewOrgId] = useState<string | null>(null);
  const [viewOrgName, setViewOrgName] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);

  // Restore active view session on mount/refresh.
  // Demo sessions have no real JWT — view-mode RPCs are for real sessions only.
  const restoreSession = useCallback(async () => {
    if (!isSuperAdmin || !hasRealSession) {
      setViewOrgId(null);
      setViewOrgName(null);
      setSessionStartedAt(null);
      return;
    }

    if (!supabase) {
      const saved = localStorage.getItem('soleflow_view_mode_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setViewOrgId(parsed.orgId);
          setViewOrgName(parsed.orgName);
          setSessionStartedAt(parsed.startedAt);
          setActiveOrgId(parsed.orgId);
        } catch {
          localStorage.removeItem('soleflow_view_mode_session');
        }
      }
      return;
    }

    try {
      const { data, error } = await supabase.rpc('current_view_session');
      if (error || !data || data.length === 0) {
        setViewOrgId(null);
        setViewOrgName(null);
        setSessionStartedAt(null);
        localStorage.removeItem('soleflow_view_mode_session');
        return;
      }

      const active = data[0];
      setViewOrgId(active.org_id);
      setViewOrgName(active.org_name);
      setSessionStartedAt(active.started_at);
      setActiveOrgId(active.org_id);
      localStorage.setItem(
        'soleflow_view_mode_session',
        JSON.stringify({
          orgId: active.org_id,
          orgName: active.org_name,
          startedAt: active.started_at,
        })
      );
    } catch {
      // Fallback
    }
  }, [isSuperAdmin, hasRealSession, setActiveOrgId]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const enterViewMode = useCallback(
    async (orgId: string, orgName: string) => {
      if (!isSuperAdmin || !hasRealSession) return;

      if (supabase) {
        try {
          await supabase.rpc('start_view_session', { p_org: orgId });
        } catch (e) {
          console.error('Error starting DB view session:', e);
        }
      }

      const nowStr = new Date().toISOString();
      setViewOrgId(orgId);
      setViewOrgName(orgName);
      setSessionStartedAt(nowStr);
      setActiveOrgId(orgId);

      localStorage.setItem(
        'soleflow_view_mode_session',
        JSON.stringify({
          orgId,
          orgName,
          startedAt: nowStr,
        })
      );
    },
    [isSuperAdmin, hasRealSession, setActiveOrgId]
  );

  const exitViewMode = useCallback(async () => {
    if (supabase && isSuperAdmin && hasRealSession) {
      try {
        await supabase.rpc('end_view_session');
      } catch (e) {
        console.error('Error ending DB view session:', e);
      }
    }

    setViewOrgId(null);
    setViewOrgName(null);
    setSessionStartedAt(null);
    setActiveOrgId(null);
    localStorage.removeItem('soleflow_view_mode_session');
  }, [isSuperAdmin, hasRealSession, setActiveOrgId]);

  const value: ViewModeState = {
    viewOrgId,
    viewOrgName,
    isReadOnly: Boolean(viewOrgId),
    sessionStartedAt,
    enterViewMode,
    exitViewMode,
  };

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
};

export function useViewMode(): ViewModeState {
  const ctx = useContext(ViewModeContext);
  if (!ctx) {
    return {
      viewOrgId: null,
      viewOrgName: null,
      isReadOnly: false,
      sessionStartedAt: null,
      enterViewMode: async () => {},
      exitViewMode: async () => {},
    };
  }
  return ctx;
}

/**
 * Returns true if current UI is in Super Admin read-only view mode.
 */
export function useReadOnly(): boolean {
  const { isReadOnly } = useViewMode();
  return isReadOnly;
}

/**
 * Returns the effective organization ID to scope all queries and mutations:
 * - If in view mode, returns the viewed account's orgId.
 * - Otherwise returns the user's logged-in profile orgId (never null/mixed for super admins).
 */
export function useEffectiveOrgId(): string | null {
  const { viewOrgId } = useViewMode();
  const { orgId, org } = useAuth();
  if (viewOrgId) return viewOrgId;
  return orgId || org?.id || null;
}
