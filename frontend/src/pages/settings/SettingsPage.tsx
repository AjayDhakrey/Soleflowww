import React, { useState, useEffect, useMemo } from 'react';
import { useApp, ThemePreference } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthProvider';
import { Icons } from '../../lib/icons';
import { PageHeader, Button } from '../../components/ui';
import {
  Building2,
  Users,
  UserPlus,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Sun,
  Moon,
  Monitor,
  Check,
  Search,
  Copy,
  FileText,
  Landmark,
  MapPin,
  Sparkles,
  RefreshCw,
  Sliders,
  Save,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Laptop,
  Palette,
  CreditCard,
  CheckCheck,
  User,
  Target,
  Percent,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  ShoppingBag,
  Home,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, isDemoModeActive } from '../../lib/supabase';
import { OrgInvite, UserRole } from '../../types';
import { CreateSalesRepresentativeModal } from '../../components/team/CreateSalesRepresentativeModal';

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  zone?: string;
}

interface WholesalePreferences {
  invoicePrefix: string;
  defaultCreditDays: number;
  defaultTaxRate: string;
  defaultMoqCarton: number;
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  upiId: string;
  biltyDisclaimer: string;
  marketHub: string;
  orgPhone: string;
}

const DEFAULT_PREFERENCES: WholesalePreferences = {
  invoicePrefix: 'SF-2026/',
  defaultCreditDays: 30,
  defaultTaxRate: '12%',
  defaultMoqCarton: 12,
  bankName: 'HDFC Bank Ltd',
  bankAccountNo: '50200084920194',
  bankIfsc: 'HDFC0001248',
  upiId: 'soleflow.wholesale@hdfcbank',
  biltyDisclaimer: 'All disputes subject to Agra jurisdiction. Goods transported at buyer\'s risk. Claims within 7 days of bilty delivery.',
  marketHub: 'Agra Wholesale Footwear Cluster • Hing Ki Mandi',
  orgPhone: '+91 98970 12345',
};

export const SettingsPage: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    switchRole,
    showToast,
    themePreference,
    setThemePreference,
    customers,
    orders,
    salesTeam,
    setSalesTeam,
  } = useApp();

  const { org, orgId, isAdmin, isDemoAccount, refreshProfile, updatePassword } = useAuth();

  const isSalesperson = currentUser.role === 'salesperson';

  // Navigation tab state: adapts based on user role
  const [activeTab, setActiveTab] = useState<string>(isSalesperson ? 'profile' : 'general');

  // Firm Info (for Admin full edit, or Salesperson read reference)
  const [companyName, setCompanyName] = useState(org?.name || 'SoleFlow Footwear Wholesale');
  const [gstin, setGstin] = useState(org?.gstin || '09AAACH7409R1ZZ');
  const [hubCity, setHubCity] = useState(org?.city || 'Agra');
  const [orgState, setOrgState] = useState(org?.state || 'Uttar Pradesh');
  const [orgPhone, setOrgPhone] = useState(org?.phone || '+91 98970 12345');
  const [copiedGstin, setCopiedGstin] = useState(false);
  const [copiedOrgId, setCopiedOrgId] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Salesperson Personal Profile State
  const matchingRep = useMemo(() => {
    return salesTeam.find(
      (s) =>
        (currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        s.id === currentUser.id
    );
  }, [salesTeam, currentUser]);

  const [repName, setRepName] = useState(currentUser.name || 'Sales Representative');
  const [repPhone, setRepPhone] = useState(currentUser.phone || matchingRep?.phone || '+91 98231 04412');
  const [repZone, setRepZone] = useState(currentUser.zone || (matchingRep as any)?.territory || matchingRep?.zone || 'Hing Ki Mandi & Sadar Bazar');

  useEffect(() => {
    setRepName(currentUser.name || 'Sales Representative');
    setRepPhone(currentUser.phone || matchingRep?.phone || '+91 98231 04412');
    setRepZone(currentUser.zone || (matchingRep as any)?.territory || matchingRep?.zone || 'Hing Ki Mandi & Sadar Bazar');
  }, [currentUser, matchingRep]);

  // Password Update State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Wholesale Preferences state
  const [wholesalePrefs, setWholesalePrefs] = useState<WholesalePreferences>(() => {
    try {
      const stored = localStorage.getItem('soleflow_firm_preferences');
      if (stored) return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    } catch (e) {}
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    if (org) {
      setCompanyName(org.name || '');
      setGstin(org.gstin || '');
      setHubCity(org.city || '');
      setOrgState(org.state || '');
      if (org.phone) setOrgPhone(org.phone);
    }
  }, [org]);

  // Team Management State
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [invites, setInvites] = useState<OrgInvite[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [teamRoleFilter, setTeamRoleFilter] = useState<'all' | 'admin' | 'salesperson'>('all');

  const loadTeamData = async () => {
    if (!isAdmin) return;
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
          zone: 'Agra HQ • Principal',
        },
        {
          id: 'user-sales',
          name: 'Rahul Sharma',
          email: 'sales@soleflow.com',
          role: 'salesperson',
          phone: '+91 98231 04412',
          is_active: true,
          zone: 'Hing Ki Mandi & Sadar Bazar',
        },
        ...savedUsers.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone,
          is_active: u.is_active !== false,
          zone: u.zone || 'Regional Sales Area',
        })),
      ];
      setMembers(localList);
      setInvites([]);
      setIsLoadingTeam(false);
      return;
    }

    try {
      let profilesQuery = supabase.from('profiles').select('*');
      if (orgId) {
        profilesQuery = profilesQuery.eq('org_id', orgId);
      }
      const { data: profData } = await profilesQuery;
      const loadedMembers: MemberItem[] = profData
        ? profData.map((p: any) => ({
            id: p.id,
            name: p.full_name || p.name || p.email.split('@')[0],
            email: p.email,
            role: (p.role as UserRole) || 'salesperson',
            phone: p.phone,
            is_active: p.is_active !== false,
            zone: p.zone || 'Field Territory',
          }))
        : [];

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
              is_active: su.is_active !== false,
              zone: su.zone || 'Regional Sales Area',
            });
          }
        });
      } catch (e) {}

      setMembers(loadedMembers);

      let invitesQuery = supabase.from('org_invites').select('*').is('accepted_at', null);
      if (orgId) {
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
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      showToast('Invitation revoked');
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
      showToast('You cannot deactivate your own administrative account.');
      return;
    }

    const nextStatus = !currentStatus;
    if (!supabase || isDemoModeActive) {
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, is_active: nextStatus } : m))
      );
      try {
        const savedUsers = JSON.parse(localStorage.getItem('soleflow_created_users') || '[]');
        const updated = savedUsers.map((u: any) =>
          u.id === memberId ? { ...u, is_active: nextStatus } : u
        );
        localStorage.setItem('soleflow_created_users', JSON.stringify(updated));
      } catch (e) {}
      showToast(`Member ${nextStatus ? 'Activated' : 'Deactivated'} (Demo session)`);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: nextStatus })
        .eq('id', memberId)
        .select('id')
        .single();

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

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (memberId === currentUser.id) {
      showToast('You cannot remove your own administrative account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this firm workspace?`)) {
      return;
    }

    if (!supabase || isDemoModeActive) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      try {
        const savedUsers = JSON.parse(localStorage.getItem('soleflow_created_users') || '[]');
        const updated = savedUsers.filter((u: any) => u.id !== memberId && u.email !== memberId);
        localStorage.setItem('soleflow_created_users', JSON.stringify(updated));
      } catch (e) {}
      showToast(`${memberName} removed from workspace`);
      return;
    }

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', memberId);
      if (error) {
        await supabase.from('profiles').update({ is_active: false }).eq('id', memberId);
      }
      showToast(`${memberName} removed from workspace`);
      loadTeamData();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Admin Save Handler
  const handleSaveFirmSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      localStorage.setItem('soleflow_firm_preferences', JSON.stringify(wholesalePrefs));

      if (!supabase || isDemoModeActive) {
        showToast('Firm profile & wholesale defaults saved successfully.');
        setIsSaving(false);
        return;
      }

      const targetOrgId = org?.id || orgId;
      if (!targetOrgId) {
        showToast('No organization record linked to this account.');
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('organizations')
        .update({
          name: companyName,
          gstin: gstin || null,
          city: hubCity || null,
          state: orgState || null,
          phone: orgPhone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetOrgId)
        .select('id')
        .single();

      if (error) {
        showToast(`Save warning: ${error.message}`);
      } else {
        showToast('Business firm profile updated in cloud database.');
        await refreshProfile();
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Salesperson Personal Profile Save Handler
  const handleSaveSalespersonProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const updatedUser = {
        ...currentUser,
        name: repName,
        phone: repPhone,
        zone: repZone,
      };

      setCurrentUser(updatedUser);
      localStorage.setItem('soleflow_user', JSON.stringify(updatedUser));

      // Keep salesTeam state updated so all dashboards & team cards sync
      setSalesTeam((prev) =>
        prev.map((s) => {
          if (
            (currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
            s.id === currentUser.id
          ) {
            return {
              ...s,
              name: repName,
              phone: repPhone,
              territory: repZone,
            };
          }
          return s;
        })
      );

      if (supabase && !isDemoModeActive) {
        await (supabase as any)
          .from('profiles')
          .update({ name: repName, phone: repPhone, zone: repZone })
          .eq('id', currentUser.id);

        if (currentUser.email) {
          await (supabase as any)
            .from('sales_team')
            .update({ name: repName, phone: repPhone, territory: repZone })
            .eq('email', currentUser.email);
        }
      }

      showToast('Your sales representative profile has been updated.');
    } catch (err: any) {
      showToast(`Error saving profile: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Password Update Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        showToast('Password updated successfully.');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(`Failed to update password: ${res.message}`);
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCopyGstin = () => {
    if (!gstin) return;
    navigator.clipboard.writeText(gstin);
    setCopiedGstin(true);
    showToast(`Copied GSTIN: ${gstin}`);
    setTimeout(() => setCopiedGstin(false), 1500);
  };

  const handleCopyOrgId = () => {
    const idToCopy = org?.id || orgId || 'soleflow-org-primary';
    navigator.clipboard.writeText(idToCopy);
    setCopiedOrgId(true);
    showToast(`Copied Workspace ID: ${idToCopy}`);
    setTimeout(() => setCopiedOrgId(false), 1500);
  };

  const handleCopyUpi = () => {
    if (!wholesalePrefs.upiId) return;
    navigator.clipboard.writeText(wholesalePrefs.upiId);
    setCopiedUpi(true);
    showToast(`Copied Business UPI: ${wholesalePrefs.upiId}`);
    setTimeout(() => setCopiedUpi(false), 1500);
  };

  const handleSelectTheme = (pref: ThemePreference) => {
    setThemePreference(pref);
    showToast(`Appearance updated to ${pref.charAt(0).toUpperCase() + pref.slice(1)} Mode`);
  };

  // Filtered members for admin team view
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
        (m.phone && m.phone.includes(teamSearchQuery));
      const matchesRole = teamRoleFilter === 'all' || m.role === teamRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, teamSearchQuery, teamRoleFilter]);

  const teamStats = useMemo(() => {
    const total = members.length;
    const admins = members.filter((m) => m.role === 'admin').length;
    const sales = members.filter((m) => m.role === 'salesperson').length;
    const active = members.filter((m) => m.is_active).length;
    return { total, admins, sales, active, invites: invites.length };
  }, [members, invites]);

  // Sales Representative Stats
  const repStats = useMemo(() => {
    const assignedCustomers = customers.filter(
      (c) =>
        (matchingRep && (c.salespersonId === matchingRep.id || c.salespersonName === matchingRep.name || (c as any).salesperson === matchingRep.name)) ||
        c.salespersonId === currentUser.id
    ).length;

    const activeOrders = orders.filter(
      (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
    ).length;

    return {
      customersCount: assignedCustomers,
      activeOrdersCount: activeOrders,
      target: matchingRep?.monthlyTarget || 1500000,
      commission: matchingRep?.commissionRate || 3.5,
    };
  }, [customers, orders, matchingRep, currentUser]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto pb-28 md:pb-16 bg-background text-foreground animate-in fade-in duration-200">
      {/* 1. Standardized Header with Breadcrumbs */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link
            to={isSalesperson ? '/sales/dashboard' : '/admin/dashboard'}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-blue-600" />
            <span>Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{isSalesperson ? 'Representative Profile' : 'Settings'}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {isSalesperson ? 'Field Representative Profile & Settings' : 'Settings & Workspace Control'}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isSalesperson
                ? 'Manage your personal sales identity, contact phone, field territory, appearance themes, and view firm billing credentials.'
                : 'Manage legal business identity, team staff permissions, wholesale invoicing defaults, and workspace aesthetics.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Quick Status Hero Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-blue-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs shrink-0">
              {isSalesperson ? <User size={28} className="text-blue-600 dark:text-blue-400" /> : <Building2 size={28} className="text-blue-600 dark:text-blue-400" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                  {isSalesperson ? repName : companyName || 'Wholesale Firm'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                  <CheckCircle2 size={12} />
                  {isSalesperson ? 'Verified Field Agent' : 'Verified Hub'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                  {isSalesperson ? 'Field Representative' : 'Administrative Principal'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} className="text-muted-foreground" />
                  {isSalesperson ? repZone : `${hubCity}, ${orgState}`}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Phone size={12} className="text-muted-foreground" />
                  {isSalesperson ? repPhone : orgPhone}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Mail size={12} className="text-muted-foreground" />
                  {currentUser.email}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={isSalesperson ? handleSaveSalespersonProfile : handleSaveFirmSettings}
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{isSaving ? 'Saving...' : isSalesperson ? 'Save Profile' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-2xl overflow-x-auto no-scrollbar shadow-2xs">
        {/* Salesperson Tabs */}
        {isSalesperson ? (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <User size={15} />
              <span>My Profile & Territory</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('firm_reference')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'firm_reference'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Building2 size={15} />
              <span>Firm Directory & Invoicing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'theme'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Palette size={15} />
              <span>Appearance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <ShieldCheck size={15} />
              <span>Security & Password</span>
            </button>
          </>
        ) : (
          /* Admin Tabs */
          <>
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Building2 size={15} />
              <span>Firm Profile & Hub</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Users size={15} />
              <span>Team & Permissions</span>
              {teamStats.total > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'team' ? 'bg-primary-foreground/20 text-white' : 'bg-muted text-foreground'
                  }`}
                >
                  {teamStats.total}
                </span>
              )}
              {invites.length > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-400 text-slate-900 rounded-full text-[10px] font-bold">
                  +{invites.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wholesale')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'wholesale'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Sliders size={15} />
              <span>Wholesale & Invoicing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'theme'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Palette size={15} />
              <span>Appearance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <ShieldCheck size={15} />
              <span>Security & Password</span>
            </button>
          </>
        )}
      </div>

      {/* =========================================================================
          SALESPERSON VIEW - TAB: MY PROFILE & TERRITORY
         ========================================================================= */}
      {isSalesperson && activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Salesperson KPI Target Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium">Assigned Retailers</span>
                <Users size={16} className="text-primary" />
              </div>
              <p className="text-xl font-bold font-display text-foreground">{repStats.customersCount}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Active retail shops</p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium">Pipeline Orders</span>
                <ShoppingBag size={16} className="text-emerald-500" />
              </div>
              <p className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                {repStats.activeOrdersCount}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">In fulfillment</p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium">Monthly Target</span>
                <Target size={16} className="text-indigo-500" />
              </div>
              <p className="text-xl font-bold font-display text-indigo-600 dark:text-indigo-400">
                ₹{(repStats.target / 100000).toFixed(1)}L
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Target quota</p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium">Commission Rate</span>
                <Percent size={16} className="text-amber-500" />
              </div>
              <p className="text-xl font-bold font-display text-amber-600 dark:text-amber-400">
                {repStats.commission}%
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Per wholesale booking</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Representative Identity Card */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-border/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Personal Representative Identity</h3>
                    <p className="text-xs text-muted-foreground">Your contact and field credentials shown to wholesale customers</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Registered Login Email (Read Only)
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-muted/60 border border-border rounded-xl text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Managed by your wholesale firm administrator.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Representative Contact Phone (Used for WhatsApp & Call outreach)
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={repPhone}
                      onChange={(e) => setRepPhone(e.target.value)}
                      placeholder="+91 98231 04412"
                      className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Field Territory & Area Assignment Card */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-border/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Field Sales Territory & Hub</h3>
                    <p className="text-xs text-muted-foreground">Market beat zone and customer dispatch cluster</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Assigned Sales Beat / Market Zone
                  </label>
                  <input
                    type="text"
                    value={repZone}
                    onChange={(e) => setRepZone(e.target.value)}
                    placeholder="e.g. Hing Ki Mandi & Sadar Bazar Wholesale"
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Your assigned geographic beat for order collection and shop follow-ups.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Role Title</span>
                    <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px]">
                      Field Sales Representative
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Parent Wholesale Firm</span>
                    <span className="font-semibold text-foreground">{companyName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Order Booking Privileges</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 size={13} /> Enabled (Wholesale Orders)
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    icon={Icons.Check}
                    onClick={handleSaveSalespersonProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving Profile...' : 'Save Profile Changes'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SALESPERSON VIEW - TAB: FIRM DIRECTORY & BILLING INFO (REFERENCE)
         ========================================================================= */}
      {isSalesperson && activeTab === 'firm_reference' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="border-b border-border/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Wholesale Firm Billing & Remittance Reference</h3>
                  <p className="text-xs text-muted-foreground">Official business credentials to share with retail customers during field visits</p>
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-muted text-muted-foreground border border-border self-start sm:self-auto">
                Admin Managed • Read Only
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Firm Trade Name</span>
                  <span className="text-xs font-bold text-foreground">{companyName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">GSTIN</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-foreground">{gstin}</span>
                    <button
                      type="button"
                      onClick={handleCopyGstin}
                      className="p-1 rounded text-primary hover:bg-primary/10 cursor-pointer"
                      title="Copy GSTIN"
                    >
                      {copiedGstin ? <CheckCheck size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Dispatch Hub</span>
                  <span className="text-xs text-foreground">{hubCity}, {orgState}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Accounts Phone</span>
                  <span className="text-xs text-foreground font-mono">{orgPhone}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Bank Name</span>
                  <span className="text-xs font-bold text-foreground">{wholesalePrefs.bankName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Account Number</span>
                  <span className="text-xs font-mono font-bold text-foreground">{wholesalePrefs.bankAccountNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">IFSC Code</span>
                  <span className="text-xs font-mono font-bold text-foreground uppercase">{wholesalePrefs.bankIfsc}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Official UPI VPA</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-foreground">{wholesalePrefs.upiId}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1 rounded text-primary hover:bg-primary/10 cursor-pointer"
                      title="Copy UPI"
                    >
                      {copiedUpi ? <CheckCheck size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADMIN VIEW - TAB 1: FIRM PROFILE & HUB IDENTITY
         ========================================================================= */}
      {!isSalesperson && activeTab === 'general' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Legal Business Profile Card */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-border/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Legal Trade Registration</h3>
                    <p className="text-xs text-muted-foreground">Official business identity applied on bilty notes and tax invoices</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Registered Business / Trade Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Footwear Distributors Pvt Ltd"
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      GSTIN / Tax Identification Number
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyGstin}
                      className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedGstin ? <CheckCheck size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      <span>{copiedGstin ? 'Copied' : 'Copy GSTIN'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 09AAACH7409R1ZZ"
                    className="w-full h-11 px-3.5 text-xs sm:text-sm font-mono tracking-wider bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all uppercase"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Standard 15-character Goods & Services Tax Identification Number
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Hub City
                    </label>
                    <input
                      type="text"
                      value={hubCity}
                      onChange={(e) => setHubCity(e.target.value)}
                      placeholder="e.g. Agra"
                      className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={orgState}
                      onChange={(e) => setOrgState(e.target.value)}
                      placeholder="e.g. Uttar Pradesh"
                      className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Primary Trade Contact Phone
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={orgPhone}
                      onChange={(e) => setOrgPhone(e.target.value)}
                      placeholder="+91 98970 12345"
                      className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Warehouse Dispatch & Market Hub Card */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-border/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Market Cluster & Dispatch Hub</h3>
                    <p className="text-xs text-muted-foreground">Regional trading hub coordinates for freight logistics</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Wholesale Market Zone / Cluster
                  </label>
                  <input
                    type="text"
                    value={wholesalePrefs.marketHub}
                    onChange={(e) => setWholesalePrefs({ ...wholesalePrefs, marketHub: e.target.value })}
                    placeholder="e.g. Hing Ki Mandi Agra • Sadar Bazaar Delhi • Kanpur Leather Zone"
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Used to group customer delivery routes and transport agency consignments.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Workspace Tier</span>
                    <span className="px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary text-[11px]">
                      Enterprise Wholesale
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Multi-user Collaboration</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 size={13} /> Enabled
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Cloud Sync Status</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 size={13} /> Live Database
                    </span>
                  </div>
                </div>

                {/* Workspace ID */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Unique Organization ID
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyOrgId}
                      className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedOrgId ? <CheckCheck size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      <span>{copiedOrgId ? 'Copied' : 'Copy ID'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/60 border border-border font-mono text-xs text-muted-foreground select-all truncate">
                    {org?.id || orgId || 'soleflow-org-primary'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="primary"
              icon={Icons.Check}
              onClick={handleSaveFirmSettings}
              disabled={isSaving}
            >
              {isSaving ? 'Saving Changes...' : 'Save Firm Settings'}
            </Button>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADMIN VIEW - TAB 2: TEAM & ACCESS MANAGEMENT
         ========================================================================= */}
      {!isSalesperson && activeTab === 'team' && (
        <div className="space-y-6">
          {/* Team KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium">Total Staff</span>
                <Users size={16} className="text-primary" />
              </div>
              <p className="text-xl font-bold font-display text-foreground">{teamStats.total}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Workspace members</p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium">Field Sales Reps</span>
                <Sparkles size={16} className="text-emerald-500" />
              </div>
              <p className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                {teamStats.sales}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Territory agents</p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium">Administrators</span>
                <Shield size={16} className="text-indigo-500" />
              </div>
              <p className="text-xl font-bold font-display text-indigo-600 dark:text-indigo-400">
                {teamStats.admins}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Principals & Managers</p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium">Pending Invites</span>
                <Mail size={16} className="text-amber-500" />
              </div>
              <p className="text-xl font-bold font-display text-amber-600 dark:text-amber-400">
                {teamStats.invites}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Awaiting activation</p>
            </div>
          </div>

          {/* Action & Filter Toolbar */}
          <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search team member by name, phone or email..."
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-3.5 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="flex items-center gap-1 bg-background border border-border rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setTeamRoleFilter('all')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                    teamRoleFilter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setTeamRoleFilter('admin')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                    teamRoleFilter === 'admin' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setTeamRoleFilter('salesperson')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                    teamRoleFilter === 'salesperson' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sales
                </button>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              icon={UserPlus}
              onClick={() => setIsInviteModalOpen(true)}
              className="shrink-0"
            >
              + Add Member & Set Login Credentials
            </Button>
          </div>

          {/* Pending Invites List */}
          {invites.length > 0 && (
            <div className="bg-surface border border-amber-500/30 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-amber-500" />
                  <h4 className="font-semibold text-xs text-foreground">
                    Pending Outgoing Invitations ({invites.length})
                  </h4>
                </div>
                <span className="text-[11px] text-muted-foreground">Tokens expire in 7 days</span>
              </div>

              <div className="divide-y divide-border/60">
                {invites.map((inv) => (
                  <div key={inv.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                        <Mail size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{inv.email}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">
                          Invited Role: {inv.role} • Expires: {new Date(inv.expires_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevokeInvite(inv.id)}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      Revoke Invite
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Members Table */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Verified Workspace Directory</h3>
                <p className="text-xs text-muted-foreground">
                  Personnel authorized to access customer ledgers, generate wholesale orders, and view stock
                </p>
              </div>
              <button
                type="button"
                onClick={loadTeamData}
                disabled={isLoadingTeam}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Refresh team directory"
              >
                <RefreshCw size={15} className={isLoadingTeam ? 'animate-spin' : ''} />
              </button>
            </div>

            {isLoadingTeam ? (
              <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <RefreshCw size={20} className="animate-spin text-primary" />
                <span>Loading staff and salespeople...</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                <Users size={28} className="mx-auto text-muted-foreground/40" />
                <p className="font-semibold text-foreground">No team members match your criteria</p>
                <p className="text-[11px]">Try adjusting your search query or role filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                            {member.name}
                          </p>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              member.role === 'admin'
                                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {member.role === 'admin' ? 'Principal Admin' : 'Sales Representative'}
                          </span>
                          {member.id === currentUser.id && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-primary/20 text-primary">
                              You
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                          <span className="truncate">{member.email}</span>
                          {member.phone && (
                            <>
                              <span>•</span>
                              <a
                                href={`tel:${member.phone}`}
                                className="hover:text-primary transition-colors inline-flex items-center gap-1"
                              >
                                <Phone size={11} />
                                {member.phone}
                              </a>
                            </>
                          )}
                          {member.zone && (
                            <>
                              <span>•</span>
                              <span className="text-[11px] text-muted-foreground/80">{member.zone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${
                          member.is_active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {member.is_active ? 'Active' : 'Disabled'}
                      </span>

                      {member.id !== currentUser.id && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleMemberActive(member.id, member.is_active)}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
                          >
                            {member.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id, member.name)}
                            className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Remove staff member"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          ADMIN VIEW - TAB 3: WHOLESALE & INVOICING DEFAULTS
         ========================================================================= */}
      {!isSalesperson && activeTab === 'wholesale' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invoicing & Terms Card */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-border/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Wholesale Invoicing Rules</h3>
                    <p className="text-xs text-muted-foreground">Default billing series, credit terms, and GST rates</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Invoice Series Prefix
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={wholesalePrefs.invoicePrefix}
                      onChange={(e) =>
                        setWholesalePrefs({ ...wholesalePrefs, invoicePrefix: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g. SF-2026/"
                      className="w-48 h-11 px-3.5 text-xs sm:text-sm font-mono bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
                    />
                    <div className="flex-1 p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground truncate font-mono">
                      Next: <span className="font-semibold text-foreground">{wholesalePrefs.invoicePrefix}0042</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Default Credit Period Policy
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[0, 7, 15, 30, 45].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setWholesalePrefs({ ...wholesalePrefs, defaultCreditDays: days })}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                          wholesalePrefs.defaultCreditDays === days
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                            : 'bg-background border-border text-foreground hover:bg-muted'
                        }`}
                      >
                        {days === 0 ? 'COD / Cash' : `${days} Days`}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Applied automatically to new retail orders when customer credit limit is clean.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Standard Footwear GST Rate
                    </label>
                    <select
                      value={wholesalePrefs.defaultTaxRate}
                      onChange={(e) => setWholesalePrefs({ ...wholesalePrefs, defaultTaxRate: e.target.value })}
                      className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="5%">5% GST (MRP &lt; ₹1,000)</option>
                      <option value="12%">12% GST (Standard Footwear)</option>
                      <option value="18%">18% GST (Leather / Luxury)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Standard Carton MOQ (Pairs)
                    </label>
                    <select
                      value={wholesalePrefs.defaultMoqCarton}
                      onChange={(e) =>
                        setWholesalePrefs({ ...wholesalePrefs, defaultMoqCarton: Number(e.target.value) })
                      }
                      className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value={12}>12 Pairs / Carton</option>
                      <option value={24}>24 Pairs / Carton</option>
                      <option value={36}>36 Pairs / Carton</option>
                      <option value={48}>48 Pairs / Carton</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Bilty / Transport Carrier Dispatch Disclaimer
                  </label>
                  <textarea
                    rows={3}
                    value={wholesalePrefs.biltyDisclaimer}
                    onChange={(e) => setWholesalePrefs({ ...wholesalePrefs, biltyDisclaimer: e.target.value })}
                    placeholder="Enter standard disclaimer printed on consignments and invoices..."
                    className="w-full p-3 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Bank Coordinates & UPI for Printing */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-border/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Landmark size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Banking & Remittance Coordinates</h3>
                    <p className="text-xs text-muted-foreground">Account and UPI VPA printed on invoice footers for payment remittance</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Principal Bank Name
                  </label>
                  <input
                    type="text"
                    value={wholesalePrefs.bankName}
                    onChange={(e) => setWholesalePrefs({ ...wholesalePrefs, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank Ltd"
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Current Account Number
                    </label>
                    <input
                      type="text"
                      value={wholesalePrefs.bankAccountNo}
                      onChange={(e) => setWholesalePrefs({ ...wholesalePrefs, bankAccountNo: e.target.value })}
                      placeholder="e.g. 50200084920194"
                      className="w-full h-11 px-3.5 text-xs sm:text-sm font-mono bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={wholesalePrefs.bankIfsc}
                      onChange={(e) => setWholesalePrefs({ ...wholesalePrefs, bankIfsc: e.target.value.toUpperCase() })}
                      placeholder="e.g. HDFC0001248"
                      className="w-full h-11 px-3.5 text-xs sm:text-sm font-mono uppercase bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Business UPI VPA / QR ID
                  </label>
                  <div className="relative">
                    <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={wholesalePrefs.upiId}
                      onChange={(e) => setWholesalePrefs({ ...wholesalePrefs, upiId: e.target.value })}
                      placeholder="e.g. soleflow.wholesale@hdfcbank"
                      className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm font-mono bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Invoice Footer Live Preview
                  </span>
                  <div className="p-3 bg-background rounded-lg border border-border/60 text-xs space-y-1">
                    <p className="font-semibold text-foreground">{companyName}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Bank: {wholesalePrefs.bankName} • A/C: {wholesalePrefs.bankAccountNo} • IFSC: {wholesalePrefs.bankIfsc}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      UPI ID: {wholesalePrefs.upiId}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="primary"
              icon={Icons.Check}
              onClick={handleSaveFirmSettings}
              disabled={isSaving}
            >
              {isSaving ? 'Saving Changes...' : 'Save Wholesale Defaults'}
            </Button>
          </div>
        </div>
      )}

      {/* =========================================================================
          COMMON TAB: APPEARANCE & DISPLAY THEMES
         ========================================================================= */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
            <div className="border-b border-border/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Palette size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Theme & Visual Experience</h3>
                  <p className="text-xs text-muted-foreground">
                    Customize your display mode across mobile sales tablets, desktop monitors, and dispatch docks
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Rich Interactive Mockup Theme Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Light Theme Card */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSelectTheme('light')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectTheme('light'); }}
                className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between text-left ${
                  themePreference === 'light'
                    ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                    : 'border-border bg-surface hover:border-border/80 hover:bg-muted/40 shadow-xs'
                }`}
              >
                <div>
                  <div className="w-full h-24 rounded-xl bg-slate-100 border border-slate-200 p-2 flex gap-1.5 shadow-inner mb-3 overflow-hidden">
                    <div className="w-7 h-full bg-slate-200/80 rounded-md flex flex-col gap-1 p-1">
                      <div className="w-full h-2 bg-blue-500 rounded-sm" />
                      <div className="w-full h-1.5 bg-slate-300 rounded-sm" />
                      <div className="w-full h-1.5 bg-slate-300 rounded-sm" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="w-full h-3 bg-white rounded-md border border-slate-200 shadow-2xs" />
                      <div className="flex-1 bg-white rounded-md border border-slate-200 p-1.5 flex flex-col justify-between">
                        <div className="w-12 h-1.5 bg-slate-300 rounded-sm" />
                        <div className="w-full h-3 bg-blue-50 rounded border border-blue-100" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun size={17} className={themePreference === 'light' ? 'text-primary' : 'text-amber-500'} />
                      <span className="font-bold text-sm text-foreground">Light Mode</span>
                    </div>
                    {themePreference === 'light' && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    High clarity for bright showroom environments, daytime warehouse scanning, and paper invoice parity.
                  </p>
                </div>
              </div>

              {/* Dark Theme Card */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSelectTheme('dark')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectTheme('dark'); }}
                className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between text-left ${
                  themePreference === 'dark'
                    ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                    : 'border-border bg-surface hover:border-border/80 hover:bg-muted/40 shadow-xs'
                }`}
              >
                <div>
                  <div className="w-full h-24 rounded-xl bg-slate-950 border border-slate-800 p-2 flex gap-1.5 shadow-inner mb-3 overflow-hidden">
                    <div className="w-7 h-full bg-slate-900 rounded-md flex flex-col gap-1 p-1">
                      <div className="w-full h-2 bg-blue-500 rounded-sm" />
                      <div className="w-full h-1.5 bg-slate-700 rounded-sm" />
                      <div className="w-full h-1.5 bg-slate-700 rounded-sm" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="w-full h-3 bg-slate-900 rounded-md border border-slate-800" />
                      <div className="flex-1 bg-slate-900 rounded-md border border-slate-800 p-1.5 flex flex-col justify-between">
                        <div className="w-12 h-1.5 bg-slate-700 rounded-sm" />
                        <div className="w-full h-3 bg-blue-950/60 rounded border border-blue-900" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon size={17} className={themePreference === 'dark' ? 'text-primary' : 'text-blue-400'} />
                      <span className="font-bold text-sm text-foreground">Dark Mode</span>
                    </div>
                    {themePreference === 'dark' && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    OLED black aesthetic optimized for battery preservation during field travel and low-light night shifts.
                  </p>
                </div>
              </div>

              {/* System Adaptive Theme Card */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSelectTheme('system')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectTheme('system'); }}
                className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between text-left ${
                  themePreference === 'system'
                    ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                    : 'border-border bg-surface hover:border-border/80 hover:bg-muted/40 shadow-xs'
                }`}
              >
                <div>
                  <div className="w-full h-24 rounded-xl border border-border p-2 flex gap-1.5 shadow-inner mb-3 overflow-hidden relative">
                    <div className="absolute inset-0 flex">
                      <div className="w-1/2 bg-slate-100 border-r border-slate-300" />
                      <div className="w-1/2 bg-slate-950" />
                    </div>
                    <div className="relative z-10 w-full flex gap-1.5">
                      <div className="w-7 h-full bg-slate-400/40 rounded-md" />
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="w-full h-3 bg-slate-300/60 rounded-md" />
                        <div className="flex-1 bg-slate-300/40 rounded-md" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor size={17} className={themePreference === 'system' ? 'text-primary' : 'text-purple-400'} />
                      <span className="font-bold text-sm text-foreground">System Adaptive</span>
                    </div>
                    {themePreference === 'system' && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Automatically syncs with Windows, macOS, Android, or iOS appearance settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          COMMON TAB: SECURITY & PASSWORD UPDATE
         ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Profile & Session Card */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-border/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Session & Identity</h3>
                    <p className="text-xs text-muted-foreground">Currently authenticated personnel credentials</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/60">
                <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                  {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'SF'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-foreground truncate">{currentUser.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary uppercase">
                      {currentUser.roleLabel || currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Session Active • Verified Token
                  </p>
                </div>
              </div>

              {/* Demo Mode Role Switcher */}
              {isDemoAccount && (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-foreground">Interactive Demo Role Switcher</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Toggle between trader administrator view and field representative view
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => switchRole('admin')}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        currentUser.role === 'admin'
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-surface border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      Wholesale Trader / Admin View
                    </button>
                    <button
                      type="button"
                      onClick={() => switchRole('salesperson')}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        currentUser.role === 'salesperson'
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-surface border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      Sales Representative Portal View
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password Card */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-border/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Update Account Password</h3>
                    <p className="text-xs text-muted-foreground">Change your sign-in credentials for this device</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter at least 6 characters"
                      className="w-full h-11 px-3.5 pr-10 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword || !newPassword}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                  >
                    {isUpdatingPassword ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                    <span>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
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
