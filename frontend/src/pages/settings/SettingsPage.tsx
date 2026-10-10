import React, { useState, useEffect } from 'react';
import { useApp, ThemePreference } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthProvider';
import { Icons } from '../../lib/icons';
import {
  PageHeader,
  Panel,
  Button,
} from '../../components/ui';
import {
  Sun,
  Moon,
  Monitor,
  Check,
  Users,
  UserPlus,
  Mail,
  Phone,
  Shield,
  Trash2,
  Send,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {supabase, isDemoModeActive} from '../../lib/supabase';
import { OrgInvite, UserRole } from '../../types';
import { CreateSalesRepresentativeModal } from '../../components/team/CreateSalesRepresentativeModal';

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
}

export const SettingsPage: React.FC = () => {
  const {
    currentUser,
    switchRole,
    showToast,
    themePreference,
    setThemePreference,
  } = useApp();

  const { org, orgId, isAdmin, isSuperAdmin, isDemoAccount, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'theme'>('general');

  // Firm Info (initialized from the real organization record; empty when unknown)
  const [companyName, setCompanyName] = useState(org?.name || '');
  const [gstin, setGstin] = useState(org?.gstin || '');
  const [hubCity, setHubCity] = useState(org?.city || '');
  const [orgState, setOrgState] = useState(org?.state || '');
  useEffect(() => {
    setCompanyName(org?.name || ''); setGstin(org?.gstin || '');
    setHubCity(org?.city || ''); setOrgState(org?.state || '');
  }, [org]);

  // Team Management
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [invites, setInvites] = useState<OrgInvite[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const loadTeamData = async () => {
    if (!isAdmin && !isSuperAdmin) return;
    setIsLoadingTeam(true);

    if (!supabase || isDemoModeActive) {
      const savedUsers = JSON.parse(localStorage.getItem('soleflow_created_users') || '[]');
      const localList: MemberItem[] = [
        {
          id: 'user-admin',
          name: 'Ajay Sharma',
          email: 'admin@soleflow.com',
          role: 'admin',
          phone: '+91 98765 43210',
          is_active: true,
        },
        {
          id: 'user-sales',
          name: 'Rahul Sharma',
          email: 'sales@soleflow.com',
          role: 'salesperson',
          phone: '+91 98231 04412',
          is_active: true,
        },
        ...savedUsers.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone,
          is_active: true,
        })),
      ];
      setMembers(localList);
      setInvites([]);
      setIsLoadingTeam(false);
      return;
    }

    try {
      // 1. Load active profiles
      let profilesQuery = supabase.from('profiles').select('*');
      if (orgId && !isSuperAdmin) {
        profilesQuery = profilesQuery.eq('org_id', orgId);
      }
      const { data: profData } = await profilesQuery;
      const loadedMembers = profData
        ? profData.map((p: any) => ({
            id: p.id,
            name: p.full_name || p.name || p.email.split('@')[0],
            email: p.email,
            role: (p.role as UserRole) || 'salesperson',
            phone: p.phone,
            is_active: p.is_active !== false,
          }))
        : [];

      // Merge any locally created members that might not have populated yet
      try {
        const savedUsers = JSON.parse(localStorage.getItem('soleflow_created_users') || '[]');
        savedUsers.forEach((su: any) => {
          if (!loadedMembers.some((m: any) => m.email.toLowerCase() === su.email.toLowerCase())) {
            loadedMembers.push({
              id: su.id,
              name: su.name,
              email: su.email,
              role: su.role,
              phone: su.phone,
              is_active: true,
            });
          }
        });
      } catch (e) {}

      setMembers(loadedMembers);

      // 2. Load pending invites
      let invitesQuery = supabase.from('org_invites').select('*').is('accepted_at', null);
      if (orgId && !isSuperAdmin) {
        invitesQuery = invitesQuery.eq('org_id', orgId);
      }
      const { data: invData } = await invitesQuery;
      if (invData) {
        setInvites(invData as OrgInvite[]);
      }
    } catch (err) {
      console.error('Error loading team data:', err);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'team') {
      loadTeamData();
    }
  }, [activeTab, orgId]);

  const handleRevokeInvite = async (inviteId: string) => {
    if (!supabase || isDemoModeActive) {
      showToast('Database not configured — invites cannot be revoked.');
      return;
    }

    try {
      const { error } = await supabase.from('org_invites').delete().eq('id', inviteId).select('id').single();
      if (error) {
        showToast(`Failed: ${error.message}`);
      } else {
        showToast('Invite revoked successfully');
        loadTeamData();
      }
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    }
  };

  const handleToggleMemberActive = async (memberId: string, currentStatus: boolean) => {
    if (memberId === currentUser.id) {
      showToast('You cannot deactivate your own account.');
      return;
    }

    const nextStatus = !currentStatus;
    if (!supabase || isDemoModeActive) {
      showToast('Database not configured — member status cannot be changed.');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: nextStatus })
        .eq('id', memberId).select('id').single();

      if (error) {
        showToast(`Failed: ${error.message}`);
      } else {
        showToast(`Member ${nextStatus ? 'Activated' : 'Deactivated'}`);
        loadTeamData();
      }
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase || isDemoModeActive) {
      showToast('Firm profile settings updated (demo session).');
      return;
    }

    const targetOrgId = org?.id || orgId;
    if (!targetOrgId) {
      showToast('No organization is linked to your account.');
      return;
    }

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: companyName,
          gstin: gstin || null,
          city: hubCity || null,
          state: orgState || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetOrgId).select('id').single();

      if (error) {
        showToast(`Failed: ${error.message}`);
        return;
      }

      showToast('Business firm settings updated successfully.');
      await refreshProfile();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleSelectTheme = (pref: ThemePreference) => {
    setThemePreference(pref);
    showToast(`Theme updated to ${pref.charAt(0).toUpperCase() + pref.slice(1)}`);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto pb-24 md:pb-12 bg-background text-foreground animate-in fade-in duration-200">
      
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: currentUser.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard' },
          { label: 'Settings' },
        ]}
        title={currentUser.role === 'admin' ? 'Workspace & Firm Settings' : 'User Profile & Settings'}
        subtitle={
          currentUser.role === 'admin'
            ? 'Manage legal business identity, team members, access roles, and appearance preferences.'
            : 'Manage your personal profile, display theme, and workspace options.'
        }
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-primary text-white shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Firm Profile
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'team'
                ? 'bg-primary text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Users size={14} />
            <span>Team & Salespeople</span>
            {invites.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-900 rounded-full text-[10px] font-bold">
                {invites.length}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'theme'
              ? 'bg-primary text-white shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Appearance
        </button>
      </div>

      {/* TAB 1: GENERAL FIRM SETTINGS */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="space-y-6">
          {currentUser.role === 'admin' && (
            <Panel
              title="Registered Business Profile"
              subtitle="Business name and GST details applied to invoices and bilty notes"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      Business / Firm Legal Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      GSTIN / Tax ID
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      className="w-full h-12 px-4 text-sm font-mono bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={hubCity}
                      onChange={(e) => setHubCity(e.target.value)}
                      className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={orgState}
                      onChange={(e) => setOrgState(e.target.value)}
                      className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {/* Role Switcher Demo */}
{isDemoAccount && (          <Panel
            title="Active Session Role"
            subtitle="Switch between wholesale trader administrative control and field representative view"
          >
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Currently signed in as <strong className="text-foreground">{currentUser.name}</strong> ({currentUser.roleLabel}).
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Button
                  type="button"
                  variant={currentUser.role === 'admin' ? 'primary' : 'secondary'}
                  onClick={() => switchRole('admin')}
                >
                  Trader / Admin View
                </Button>
                <Button
                  type="button"
                  variant={currentUser.role === 'salesperson' ? 'primary' : 'secondary'}
                  onClick={() => switchRole('salesperson')}
                >
                  Salesperson Portal View
                </Button>
              </div>
            </div>
          </Panel>)}

          <div className="flex justify-end">
            <Button type="submit" variant="primary" icon={Icons.Check}>
              Save Changes
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: TEAM MANAGEMENT */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-foreground">Team Workspace Members</h3>
              <p className="text-xs text-muted-foreground">
                Invite salespeople and managers to collaborate in {org?.name || 'your firm'}.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              icon={UserPlus}
              onClick={() => setIsInviteModalOpen(true)}
            >
              + Add Member & Set Login Credentials
            </Button>
          </div>

          {/* Pending Invites List */}
          {invites.length > 0 && (
            <Panel title="Pending Invitations" subtitle="Invited team members who haven't accepted yet">
              <div className="divide-y divide-border/60">
                {invites.map((inv) => (
                  <div key={inv.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                        <Mail size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{inv.email}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">
                          Role: {inv.role} • Expires: {new Date(inv.expires_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRevokeInvite(inv.id)}
                        className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Active Members List */}
          <Panel title="Active Members" subtitle="Verified users with workspace access">
            <div className="divide-y divide-border/60">
              {isLoadingTeam ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Loading team members...
                </div>
              ) : members.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No active members found.
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-foreground">{member.name}</p>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              member.role === 'admin'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {member.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          member.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {member.is_active ? 'Active' : 'Disabled'}
                      </span>

                      {member.id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => handleToggleMemberActive(member.id, member.is_active)}
                          className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          {member.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 3: THEME */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          <Panel
            title="Appearance & Theme"
            subtitle="Select your preferred workspace theme across desktop and mobile devices"
          >
            <div
              role="radiogroup"
              aria-label="Theme preference"
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1"
            >
              {/* Light Theme */}
              <div
                role="radio"
                aria-checked={themePreference === 'light'}
                tabIndex={themePreference === 'light' ? 0 : -1}
                onClick={() => handleSelectTheme('light')}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all text-left bg-surface focus:outline-none ${
                  themePreference === 'light'
                    ? 'border-2 border-primary shadow-xs'
                    : 'border border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between mt-1 px-1">
                  <div className="flex items-center gap-2">
                    <Sun size={17} className={themePreference === 'light' ? 'text-primary' : 'text-muted-foreground'} />
                    <span className="text-sm font-semibold text-foreground">Light</span>
                  </div>
                  {themePreference === 'light' && <Check size={14} className="text-primary" />}
                </div>
              </div>

              {/* Dark Theme */}
              <div
                role="radio"
                aria-checked={themePreference === 'dark'}
                tabIndex={themePreference === 'dark' ? 0 : -1}
                onClick={() => handleSelectTheme('dark')}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all text-left bg-surface focus:outline-none ${
                  themePreference === 'dark'
                    ? 'border-2 border-primary shadow-xs'
                    : 'border border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between mt-1 px-1">
                  <div className="flex items-center gap-2">
                    <Moon size={17} className={themePreference === 'dark' ? 'text-primary' : 'text-muted-foreground'} />
                    <span className="text-sm font-semibold text-foreground">Dark</span>
                  </div>
                  {themePreference === 'dark' && <Check size={14} className="text-primary" />}
                </div>
              </div>

              {/* System Theme */}
              <div
                role="radio"
                aria-checked={themePreference === 'system'}
                tabIndex={themePreference === 'system' ? 0 : -1}
                onClick={() => handleSelectTheme('system')}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all text-left bg-surface focus:outline-none ${
                  themePreference === 'system'
                    ? 'border-2 border-primary shadow-xs'
                    : 'border border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between mt-1 px-1">
                  <div className="flex items-center gap-2">
                    <Monitor size={17} className={themePreference === 'system' ? 'text-primary' : 'text-muted-foreground'} />
                    <span className="text-sm font-semibold text-foreground">System</span>
                  </div>
                  {themePreference === 'system' && <Check size={14} className="text-primary" />}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* Add Member & Set Login Credentials Modal */}
      <CreateSalesRepresentativeModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          loadTeamData();
        }}
        defaultRole="salesperson"
        onSuccess={() => {
          loadTeamData();
        }}
      />

    </div>
  );
};
