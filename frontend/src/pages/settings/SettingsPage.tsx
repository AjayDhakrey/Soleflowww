import React, { useState } from 'react';
import { Settings, ShieldCheck, Building, User, Bell, Database, Check, Moon, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { currentUser, switchRole, showToast, isDarkMode, toggleDarkMode } = useApp();

  const [companyName, setCompanyName] = useState('SoleFlow Footwear Trading Ltd.');
  const [gstin, setGstin] = useState('09AAACS4412M1Z0');
  const [hubAddress, setHubAddress] = useState('Agra Mandi Dock 4, Hing Ki Mandi, Agra UP');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('SoleFlow trade settings updated successfully.');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto select-none">
      {/* Header */}
      <div>
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 inline-block">
          Preferences &amp; Admin
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
          Trading Firm Configuration &amp; Settings
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Trading Firm Profile */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Trading Firm Legal Entity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Firm Legal Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Central Mandi Dispatch Address
            </label>
            <input
              type="text"
              value={hubAddress}
              onChange={(e) => setHubAddress(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            {isDarkMode ? <Moon className="w-4 h-4 text-blue-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>Appearance</span>
          </h3>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-800">Dark mode</p>
              <p className="text-xs text-slate-500 mt-1">Use a darker color theme across the workspace.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isDarkMode}
              aria-label="Toggle dark mode"
              onClick={toggleDarkMode}
              className={`relative w-12 h-7 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${isDarkMode ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Role & Switcher */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600" />
            <span>Active Role &amp; Permission Boundaries</span>
          </h3>

          <p className="text-xs text-slate-600">
            Currently browsing as <strong>{currentUser.name}</strong> ({currentUser.roleLabel}).
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => switchRole('admin')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                currentUser.role === 'admin'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Trader / Admin View
            </button>
            <button
              type="button"
              onClick={() => switchRole('salesperson')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                currentUser.role === 'salesperson'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Salesperson Portal View
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </form>
    </div>
  );
};
