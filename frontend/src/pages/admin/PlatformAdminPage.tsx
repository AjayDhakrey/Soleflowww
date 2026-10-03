import React, { useState, useEffect } from 'react';
import {
  Shield,
  Building2,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Ban,
  RotateCcw,
  Plus,
  ArrowUpDown,
  Filter,
  BarChart3,
  Calendar,
  Lock,
  Mail,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { Organization } from '../../types';

interface OrgDetail extends Organization {
  user_count?: number;
  customer_count?: number;
  order_count?: number;
  total_volume?: number;
  owner_email?: string;
}

export const PlatformAdminPage: React.FC = () => {
  const { isSuperAdmin, activeOrgId, setActiveOrgId, isDemoAccount } = useAuth();
  const { showToast } = useApp();

  const [orgs, setOrgs] = useState<OrgDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgCity, setNewOrgCity] = useState('Agra');

  const loadOrganizations = async () => {
    setIsLoading(true);
    if (!supabase) {
      // Mock demo data
      const mockList: OrgDetail[] = [
        {
          id: 'demo-org-uuid',
          name: 'Demo Footwear Traders',
          phone: '+91 98765 43210',
          city: 'Agra',
          state: 'Uttar Pradesh',
          gstin: '09DEMO0000A1Z1',
          status: 'active',
          is_demo: true,
          created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
          user_count: 3,
          customer_count: 18,
          order_count: 42,
          total_volume: 2840000,
          owner_email: 'admin@soleflow.com',
        },
        {
          id: 'demo-org-2',
          name: 'Demo Shoe Mart',
          phone: '+91 98765 12345',
          city: 'Kanpur',
          state: 'Uttar Pradesh',
          gstin: '09DEMO0000A1Z2',
          status: 'active',
          is_demo: true,
          created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
          user_count: 2,
          customer_count: 12,
          order_count: 26,
          total_volume: 1450000,
          owner_email: 'kanpur@shoemart.com',
        },
      ];
      setOrgs(mockList);
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase.from('organizations').select('*').order('created_at', { ascending: false });
      
      // If demo super admin, only show demo orgs
      if (isDemoAccount) {
        query = query.eq('is_demo', true);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error loading orgs:', error);
        showToast('Error loading organizations');
      } else if (data) {
        setOrgs(data as OrgDetail[]);
      }
    } catch (err) {
      console.error('Unexpected error loading orgs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, [isSuperAdmin, isDemoAccount]);

  const handleToggleStatus = async (orgId: string, currentStatus: string) => {
    if (isDemoAccount) {
      showToast('Demo super admin cannot modify organization active status');
      return;
    }

    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!supabase) {
      setOrgs((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, status: nextStatus } : o))
      );
      showToast(`Business ${nextStatus === 'active' ? 'Reactivated' : 'Suspended'}`);
      return;
    }

    try {
      const { error } = await supabase
        .from('organizations')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', orgId);

      if (error) {
        showToast(`Failed: ${error.message}`);
      } else {
        showToast(`Business ${nextStatus === 'active' ? 'Reactivated' : 'Suspended'}`);
        loadOrganizations();
      }
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    }
  };

  const handleSwitchToOrg = (orgId: string, orgName: string) => {
    setActiveOrgId(orgId);
    showToast(`Switched active workspace to: ${orgName}`);
  };

  const handleResetToAll = () => {
    setActiveOrgId(null);
    showToast('Viewing all businesses overview');
  };

  const filteredOrgs = orgs.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.city && org.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (org.gstin && org.gstin.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-xl text-slate-800 mb-2">Access Denied</h2>
        <p className="text-sm text-slate-500 max-w-md">
          Platform Owner & Super Admin privileges are required to view this console.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-200">
      
      {/* Header with Title & Overview Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Platform Admin Console
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                  Multi-Tenant
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage, isolate, and audit all independent business organizations across the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Global Active Context Bar */}
        <div className="flex items-center gap-2">
          {activeOrgId ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>
                Managing: {orgs.find((o) => o.id === activeOrgId)?.name || 'Selected Business'}
              </span>
              <button
                type="button"
                onClick={handleResetToAll}
                className="ml-2 text-xs text-amber-900 hover:text-amber-950 underline cursor-pointer"
              >
                Clear (View All)
              </button>
            </div>
          ) : (
            <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              Viewing: All Platform Businesses
            </div>
          )}
        </div>
      </div>

      {/* KPI Highlight Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Accounts</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-slate-900">{orgs.length}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">Independent workspaces</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Tenants</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-emerald-600">
            {orgs.filter((o) => o.status === 'active').length}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600/80 font-medium">Operational & verified</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suspended</span>
            <Ban className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-rose-600">
            {orgs.filter((o) => o.status === 'suspended').length}
          </div>
          <div className="mt-1 text-[11px] text-rose-500/80 font-medium">Access blocked</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Demo Tenants</span>
            <Shield className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-amber-600">
            {orgs.filter((o) => o.is_demo).length}
          </div>
          <div className="mt-1 text-[11px] text-amber-600/80 font-medium">Fenced demo environments</div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search business name, city, GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#1E6FF6]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'active' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('suspended')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'suspended' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              Suspended
            </button>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Business / Organization</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">GSTIN</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading platform organizations...
                  </td>
                </tr>
              ) : filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No organizations match your filters.
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((organization) => {
                  const isCurrentlyActive = activeOrgId === organization.id;
                  return (
                    <tr
                      key={organization.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isCurrentlyActive ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {organization.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {organization.name}
                              {organization.is_demo && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                                  DEMO
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              ID: {organization.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {organization.city || 'Agra'}, {organization.state || 'UP'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {organization.gstin || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {organization.created_at
                          ? new Date(organization.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            organization.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              organization.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {organization.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Manage / Switch Business Button */}
                          <button
                            type="button"
                            onClick={() => handleSwitchToOrg(organization.id, organization.name)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isCurrentlyActive
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                            title="Switch active session into this organization"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{isCurrentlyActive ? 'Active' : 'Manage'}</span>
                          </button>

                          {/* Suspend / Reactivate Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(organization.id, organization.status)}
                            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                              organization.status === 'active'
                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={organization.status === 'active' ? 'Suspend Business' : 'Reactivate Business'}
                          >
                            {organization.status === 'active' ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
