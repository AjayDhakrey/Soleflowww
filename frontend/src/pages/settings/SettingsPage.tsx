import React, { useState } from 'react';
import { useApp, ThemePreference } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import {
  PageHeader,
  Panel,
  Button,
} from '../../components/ui';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    currentUser,
    switchRole,
    showToast,
    themePreference,
    setThemePreference,
  } = useApp();

  const [companyName, setCompanyName] = useState('SoleFlow Footwear Trading Ltd.');
  const [gstin, setGstin] = useState('09AAACS4412M1Z0');
  const [hubAddress, setHubAddress] = useState('Agra Mandi Dock 4, Hing Ki Mandi, Agra UP');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('SoleFlow trade settings updated successfully.');
  };

  const handleSelectTheme = (pref: ThemePreference) => {
    setThemePreference(pref);
    showToast(`Theme updated to ${pref.charAt(0).toUpperCase() + pref.slice(1)}`);
  };

  const handleThemeKeyDown = (e: React.KeyboardEvent, pref: ThemePreference) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectTheme(pref);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const order: ThemePreference[] = ['light', 'dark', 'system'];
      const nextIdx = (order.indexOf(pref) + 1) % order.length;
      handleSelectTheme(order[nextIdx]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const order: ThemePreference[] = ['light', 'dark', 'system'];
      const prevIdx = (order.indexOf(pref) - 1 + order.length) % order.length;
      handleSelectTheme(order[prevIdx]);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto pb-24 md:pb-12 bg-background text-foreground">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: currentUser.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard' },
          { label: 'Settings' },
        ]}
        title={currentUser.role === 'admin' ? 'Trading Firm Configuration & Settings' : 'User Profile & Settings'}
        subtitle={
          currentUser.role === 'admin'
            ? 'Manage legal firm profile, tax identification, user workspace roles, and appearance preferences.'
            : 'Manage your profile preferences, display theme, and workspace options.'
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Trading Firm Profile (Admin only or shared) */}
        {currentUser.role === 'admin' && (
          <Panel
            title="Trading Firm Legal Entity"
            subtitle="Registered business identity applied to invoices and bilty notes"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Firm Legal Name
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

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Central Mandi Dispatch Address
                </label>
                <input
                  type="text"
                  value={hubAddress}
                  onChange={(e) => setHubAddress(e.target.value)}
                  className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </Panel>
        )}

        {/* Appearance & Theme Picker Panel */}
        <Panel
          title="Appearance & Theme"
          subtitle="Select your preferred workspace theme across desktop and mobile devices"
        >
          <div
            role="radiogroup"
            aria-label="Theme preference"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1"
          >
            {/* 1. Light Theme Card */}
            <div
              role="radio"
              aria-checked={themePreference === 'light'}
              tabIndex={themePreference === 'light' ? 0 : -1}
              onClick={() => handleSelectTheme('light')}
              onKeyDown={(e) => handleThemeKeyDown(e, 'light')}
              className={`p-3.5 rounded-2xl cursor-pointer transition-all text-left bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                themePreference === 'light'
                  ? 'border-2 border-primary shadow-xs'
                  : 'border border-border hover:bg-muted/50'
              }`}
            >
              {/* Mini Preview Box */}
              <div className="h-22 w-full rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-2 flex gap-1.5 overflow-hidden shadow-2xs">
                {/* Mini Sidebar */}
                <div className="w-5 h-full rounded-md bg-[#FFFFFF] border border-[#E2E8F0] flex flex-col gap-1 p-1">
                  <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                  <div className="w-full h-1 rounded bg-[#E2E8F0]" />
                  <div className="w-full h-1 rounded bg-[#E2E8F0]" />
                </div>
                {/* Mini Main Content */}
                <div className="flex-1 h-full flex flex-col gap-1.5">
                  <div className="h-3.5 w-full rounded-md bg-[#FFFFFF] border border-[#E2E8F0] flex items-center justify-between px-1.5">
                    <div className="w-8 h-1 rounded bg-[#CBD5E1]" />
                    <div className="w-2 h-2 rounded-full bg-[#E2E8F0]" />
                  </div>
                  <div className="flex-1 flex gap-1.5">
                    <div className="flex-1 h-full rounded-md bg-[#FFFFFF] border border-[#E2E8F0] p-1 flex flex-col gap-1">
                      <div className="w-3/4 h-1 rounded bg-[#94A3B8]" />
                      <div className="w-1/2 h-1 rounded bg-[#E2E8F0]" />
                    </div>
                    <div className="flex-1 h-full rounded-md bg-[#FFFFFF] border border-[#E2E8F0] p-1 flex flex-col gap-1">
                      <div className="w-2/3 h-1 rounded bg-[#94A3B8]" />
                      <div className="w-1/3 h-1 rounded bg-[#2563EB]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Label & Radio Indicator */}
              <div className="flex items-center justify-between mt-3 px-1">
                <div className="flex items-center gap-2">
                  <Sun size={17} className={themePreference === 'light' ? 'text-primary' : 'text-muted-foreground'} />
                  <span className="text-sm font-semibold text-foreground">Light</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    themePreference === 'light'
                      ? 'bg-primary text-white'
                      : 'border border-border bg-muted/40'
                  }`}
                >
                  {themePreference === 'light' && <Check size={12} strokeWidth={3} />}
                </div>
              </div>
            </div>

            {/* 2. Dark Theme Card */}
            <div
              role="radio"
              aria-checked={themePreference === 'dark'}
              tabIndex={themePreference === 'dark' ? 0 : -1}
              onClick={() => handleSelectTheme('dark')}
              onKeyDown={(e) => handleThemeKeyDown(e, 'dark')}
              className={`p-3.5 rounded-2xl cursor-pointer transition-all text-left bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                themePreference === 'dark'
                  ? 'border-2 border-primary shadow-xs'
                  : 'border border-border hover:bg-muted/50'
              }`}
            >
              {/* Mini Preview Box */}
              <div className="h-22 w-full rounded-xl bg-[#0B1220] border border-[#334155] p-2 flex gap-1.5 overflow-hidden shadow-2xs">
                {/* Mini Sidebar */}
                <div className="w-5 h-full rounded-md bg-[#111827] border border-[#334155] flex flex-col gap-1 p-1">
                  <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                  <div className="w-full h-1 rounded bg-[#334155]" />
                  <div className="w-full h-1 rounded bg-[#334155]" />
                </div>
                {/* Mini Main Content */}
                <div className="flex-1 h-full flex flex-col gap-1.5">
                  <div className="h-3.5 w-full rounded-md bg-[#111827] border border-[#334155] flex items-center justify-between px-1.5">
                    <div className="w-8 h-1 rounded bg-[#475569]" />
                    <div className="w-2 h-2 rounded-full bg-[#334155]" />
                  </div>
                  <div className="flex-1 flex gap-1.5">
                    <div className="flex-1 h-full rounded-md bg-[#111827] border border-[#334155] p-1 flex flex-col gap-1">
                      <div className="w-3/4 h-1 rounded bg-[#64748B]" />
                      <div className="w-1/2 h-1 rounded bg-[#1F2937]" />
                    </div>
                    <div className="flex-1 h-full rounded-md bg-[#111827] border border-[#334155] p-1 flex flex-col gap-1">
                      <div className="w-2/3 h-1 rounded bg-[#64748B]" />
                      <div className="w-1/3 h-1 rounded bg-[#3B82F6]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Label & Radio Indicator */}
              <div className="flex items-center justify-between mt-3 px-1">
                <div className="flex items-center gap-2">
                  <Moon size={17} className={themePreference === 'dark' ? 'text-primary' : 'text-muted-foreground'} />
                  <span className="text-sm font-semibold text-foreground">Dark</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    themePreference === 'dark'
                      ? 'bg-primary text-white'
                      : 'border border-border bg-muted/40'
                  }`}
                >
                  {themePreference === 'dark' && <Check size={12} strokeWidth={3} />}
                </div>
              </div>
            </div>

            {/* 3. System Theme Card */}
            <div
              role="radio"
              aria-checked={themePreference === 'system'}
              tabIndex={themePreference === 'system' ? 0 : -1}
              onClick={() => handleSelectTheme('system')}
              onKeyDown={(e) => handleThemeKeyDown(e, 'system')}
              className={`p-3.5 rounded-2xl cursor-pointer transition-all text-left bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                themePreference === 'system'
                  ? 'border-2 border-primary shadow-xs'
                  : 'border border-border hover:bg-muted/50'
              }`}
            >
              {/* Mini Preview Box (Split Light / Dark) */}
              <div className="h-22 w-full rounded-xl border border-border flex overflow-hidden shadow-2xs">
                {/* Left Half (Light) */}
                <div className="w-1/2 h-full bg-[#F8FAFC] border-r border-[#CBD5E1] p-1.5 flex gap-1">
                  <div className="w-3.5 h-full rounded bg-[#FFFFFF] border border-[#E2E8F0] flex flex-col gap-0.5 p-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                    <div className="w-full h-0.5 rounded bg-[#E2E8F0]" />
                  </div>
                  <div className="flex-1 h-full flex flex-col gap-1">
                    <div className="h-2.5 w-full rounded bg-[#FFFFFF] border border-[#E2E8F0]" />
                    <div className="flex-1 rounded bg-[#FFFFFF] border border-[#E2E8F0]" />
                  </div>
                </div>
                {/* Right Half (Dark) */}
                <div className="w-1/2 h-full bg-[#0B1220] p-1.5 flex gap-1">
                  <div className="flex-1 h-full flex flex-col gap-1">
                    <div className="h-2.5 w-full rounded bg-[#111827] border border-[#334155]" />
                    <div className="flex-1 rounded bg-[#111827] border border-[#334155]" />
                  </div>
                  <div className="w-3.5 h-full rounded bg-[#111827] border border-[#334155] flex flex-col items-center gap-0.5 p-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                    <div className="w-full h-0.5 rounded bg-[#334155]" />
                  </div>
                </div>
              </div>

              {/* Label & Radio Indicator */}
              <div className="flex items-center justify-between mt-3 px-1">
                <div className="flex items-center gap-2">
                  <Monitor size={17} className={themePreference === 'system' ? 'text-primary' : 'text-muted-foreground'} />
                  <span className="text-sm font-semibold text-foreground">System</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    themePreference === 'system'
                      ? 'bg-primary text-white'
                      : 'border border-border bg-muted/40'
                  }`}
                >
                  {themePreference === 'system' && <Check size={12} strokeWidth={3} />}
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {/* Role Switcher */}
        <Panel
          title="Active Role & Permissions"
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
        </Panel>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" icon={Icons.Check}>
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
