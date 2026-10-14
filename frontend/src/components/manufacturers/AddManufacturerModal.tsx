import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import { Button } from '../ui/Button';
import { Manufacturer } from '../../types';

const SPECIALIZATIONS = [
  'Full Grain Leather Derby, Brogues & Formal Footwear',
  'Engineered Mesh & Flyknit Athletic Sneakers',
  'EVA / Phylon Lightweight Running Soles & Casuals',
  'Direct Vulcanized Canvas & High-Top Sneakers',
  'PU / TPR Injection Moulded Soles & Safety Shoes',
  'Handmade Crust Leather Blake-Stitched Loafers',
  'Synthetic Leather & Lifestyle Casual Footwear',
];

const HUBS = [
  'Agra Hub (Bodla Industrial Area)',
  'Agra Hub (Sikandra Export Zone)',
  'Agra Hub (Foundry Nagar)',
  'Kanpur Leather Complex (Jajmau)',
  'Ambur Footwear Cluster (Tamil Nadu)',
  'Jalandhar Sports Footwear Cluster',
  'Ranipet Finished Leather Hub',
  'Bahadurgarh Non-Leather Footwear Cluster',
];

export const AddManufacturerModal: React.FC = () => {
  const {
    isAddManufacturerModalOpen,
    setIsAddManufacturerModalOpen,
    addManufacturer,
    showToast,
  } = useApp();

  const [companyName, setCompanyName] = useState('');
  const [hubLocation, setHubLocation] = useState('Agra Hub (Bodla Industrial Area)');
  const [customHub, setCustomHub] = useState('');
  const [generalManager, setGeneralManager] = useState('');
  const [phone, setPhone] = useState('');
  const [primarySpecialization, setPrimarySpecialization] = useState(SPECIALIZATIONS[0]);
  const [customSpecialization, setCustomSpecialization] = useState('');
  const [monthlyCapacityPairs, setMonthlyCapacityPairs] = useState<number | string>(20000);
  const [toolingLeadTimeDays, setToolingLeadTimeDays] = useState<number | string>(14);
  const [moldsActiveCount, setMoldsActiveCount] = useState<number | string>(4);
  const [estYear, setEstYear] = useState<number | string>(new Date().getFullYear() - 5);
  const [status, setStatus] = useState<Manufacturer['status']>('Active Plants');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAddManufacturerModalOpen) {
      setCompanyName('');
      setHubLocation('Agra Hub (Bodla Industrial Area)');
      setCustomHub('');
      setGeneralManager('');
      setPhone('');
      setPrimarySpecialization(SPECIALIZATIONS[0]);
      setCustomSpecialization('');
      setMonthlyCapacityPairs(20000);
      setToolingLeadTimeDays(14);
      setMoldsActiveCount(4);
      setEstYear(new Date().getFullYear() - 5);
      setStatus('Active Plants');
    }
  }, [isAddManufacturerModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAddManufacturerModalOpen) {
        setIsAddManufacturerModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddManufacturerModalOpen, setIsAddManufacturerModalOpen]);

  if (!isAddManufacturerModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !companyName.trim()) return;

    const finalHub = hubLocation === 'other' ? (customHub.trim() || 'Agra Hub') : hubLocation;
    const finalSpec = primarySpecialization === 'other' ? (customSpecialization.trim() || 'Footwear Assembly') : primarySpecialization;

    setIsSaving(true);
    const success = await addManufacturer({
      companyName: companyName.trim(),
      hubLocation: finalHub,
      generalManager: generalManager.trim(),
      phone: phone.trim(),
      primarySpecialization: finalSpec,
      monthlyCapacityPairs: Number(monthlyCapacityPairs) || 15000,
      toolingLeadTimeDays: Number(toolingLeadTimeDays) || 14,
      moldsActiveCount: Number(moldsActiveCount) || 4,
      estYear: Number(estYear) || new Date().getFullYear(),
      status,
      runningBatchesCount: 0,
      loadPercentage: 25,
      onTimeDeliveryRate: 95,
      qcPassRatio: 98,
    });
    setIsSaving(false);

    if (success) {
      setIsAddManufacturerModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 dark:bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-surface dark:bg-slate-900 rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Icons.Manufacturers size={20} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight truncate">
                Register Manufacturing Plant &amp; Foundry
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                Onboard OEM partner foundries, assembly lines, and mould units
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddManufacturerModalOpen(false)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
          >
            <Icons.Close size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Section 1: Plant Identity */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Icons.Building size={13} className="text-blue-600 dark:text-blue-400" />
              <span>Plant &amp; Facility Profile</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="text-xs sm:text-sm font-semibold text-foreground block mb-1">
                  Plant / Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Footwear Works Unit-4"
                  className="w-full h-11 px-3.5 text-xs sm:text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-foreground block mb-1">
                  Production Hub / Cluster <span className="text-rose-500">*</span>
                </label>
                <select
                  value={hubLocation}
                  onChange={(e) => setHubLocation(e.target.value)}
                  className="w-full h-11 px-3 text-xs sm:text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
                >
                  {HUBS.map((hub) => (
                    <option key={hub} value={hub}>
                      {hub}
                    </option>
                  ))}
                  <option value="other">Other / Custom Location</option>
                </select>
                {hubLocation === 'other' && (
                  <input
                    type="text"
                    required
                    value={customHub}
                    onChange={(e) => setCustomHub(e.target.value)}
                    placeholder="Enter city / hub location"
                    className="w-full h-10 px-3.5 text-xs sm:text-sm bg-surface border border-border rounded-xl text-foreground mt-2 placeholder:text-muted-foreground/70 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                )}
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-foreground block mb-1">
                  Operating Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Manufacturer['status'])}
                  className="w-full h-11 px-3 text-xs sm:text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="Active Plants">Active Plants (Open for Allocations)</option>
                  <option value="Near Full">Near Full (High Capacity Load)</option>
                  <option value="Maintenance">Maintenance (Tooling Overhaul)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Key Personnel */}
          <div className="space-y-3 pt-2 border-t border-border/70">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Icons.Users size={13} className="text-blue-600 dark:text-blue-400" />
              <span>Plant Management Contact</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-foreground block mb-1">
                  General Manager / In-Charge
                </label>
                <input
                  type="text"
                  value={generalManager}
                  onChange={(e) => setGeneralManager(e.target.value)}
                  placeholder="e.g. Rameshwar Dayal"
                  className="w-full h-11 px-3.5 text-xs sm:text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-foreground block mb-1">
                  Factory Phone / Hotline
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98371 XXXXX"
                  className="w-full h-11 px-3.5 text-xs sm:text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Technical Capabilities & Capacity */}
          <div className="space-y-3 pt-2 border-t border-border/70">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Icons.Designs size={13} className="text-blue-600 dark:text-blue-400" />
              <span>Technical Capabilities &amp; Capacity</span>
            </h4>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-foreground block mb-1">
                  Primary Footwear Specialization
                </label>
                <select
                  value={primarySpecialization}
                  onChange={(e) => setPrimarySpecialization(e.target.value)}
                  className="w-full h-11 px-3 text-xs sm:text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
                >
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                  <option value="other">Other / Custom Specialization</option>
                </select>
                {primarySpecialization === 'other' && (
                  <input
                    type="text"
                    required
                    value={customSpecialization}
                    onChange={(e) => setCustomSpecialization(e.target.value)}
                    placeholder="Enter custom manufacturing specialization"
                    className="w-full h-10 px-3.5 text-xs sm:text-sm bg-surface border border-border rounded-xl text-foreground mt-2 placeholder:text-muted-foreground/70 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Monthly Pairs
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={monthlyCapacityPairs}
                    onChange={(e) => setMonthlyCapacityPairs(e.target.value)}
                    className="w-full h-10 px-3 text-xs sm:text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Tooling Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={toolingLeadTimeDays}
                    onChange={(e) => setToolingLeadTimeDays(e.target.value)}
                    className="w-full h-10 px-3 text-xs sm:text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Active Moulds
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={moldsActiveCount}
                    onChange={(e) => setMoldsActiveCount(e.target.value)}
                    className="w-full h-10 px-3 text-xs sm:text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Est. Year
                  </label>
                  <input
                    type="number"
                    min="1950"
                    max={new Date().getFullYear()}
                    value={estYear}
                    onChange={(e) => setEstYear(e.target.value)}
                    className="w-full h-10 px-3 text-xs sm:text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddManufacturerModalOpen(false)}
              className="text-xs sm:text-sm h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Icons.Check}
              disabled={isSaving || !companyName.trim()}
              className="text-xs sm:text-sm h-10 px-5 font-semibold"
            >
              {isSaving ? 'Registering Plant...' : 'Register Plant'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

