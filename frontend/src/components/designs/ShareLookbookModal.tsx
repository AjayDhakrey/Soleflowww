import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import { safeRandomUUID } from '../../lib/uuid';
import { X, Sparkles, MessageCircle, Building2, Phone } from 'lucide-react';

// Quick template definitions for wholesale field agents
const QUICK_TEMPLATES = [
  {
    id: 'arrivals',
    label: '✨ New Arrivals',
    getMessage: (names: string, count: number, custName: string) =>
      `Namaste ${custName || 'Ji'}! Sharing ${count} fresh design(s) from our latest wholesale footwear collection: ${names}. Take a look and let us know your requirements!`,
  },
  {
    id: 'rates',
    label: '💰 Best Rates',
    getMessage: (names: string, count: number, custName: string) =>
      `Namaste ${custName || 'Ji'}! Here are our top wholesale footwear models at factory-direct pricing: ${names}. Check full specs, carton packings, and bulk quotes below:`,
  },
  {
    id: 'stock',
    label: '📦 Ready Stock',
    getMessage: (names: string, count: number, custName: string) =>
      `Namaste ${custName || 'Ji'}! Sharing ready-stock footwear articles available for immediate dispatch: ${names}. High-repeat wholesale lines for your retail store.`,
  },
];

// Build default message from designs and recipient
const buildShareMessage = (sharedDesigns: { name: string }[], custName?: string): string => {
  const names = sharedDesigns.map((d) => d.name).join(', ');
  const greeting = custName ? `Namaste ${custName}! ` : 'Namaste! ';
  return `${greeting}Sharing ${sharedDesigns.length} design(s) from our latest collection: ${names}. Take a look and share your interest!`;
};

export const ShareLookbookModal: React.FC = () => {
  const {
    isShareModalOpen,
    setIsShareModalOpen,
    customers,
    designs,
    selectedDesignIds,
    toggleSelectDesign,
    recordDesignShare,
    showToast,
  } = useApp();

  const [selectedCustId, setSelectedCustId] = useState(customers[0]?.id || '');
  const [activeTemplateId, setActiveTemplateId] = useState<string>('arrivals');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const chosenDesigns = designs.filter((d) => selectedDesignIds.includes(d.id));
  const activeDesigns = chosenDesigns.length > 0 ? chosenDesigns : designs.slice(0, 3);
  const currentCust = customers.find((c) => c.id === selectedCustId) || customers[0];

  const [customMsg, setCustomMsg] = useState(() => {
    return buildShareMessage(activeDesigns, currentCust?.propName || currentCust?.businessName);
  });

  useEffect(() => {
    if (isShareModalOpen) {
      if (customers.length > 0 && !selectedCustId) {
        setSelectedCustId(customers[0].id);
      }
      const initialChosen = designs.filter((d) => selectedDesignIds.includes(d.id));
      const targetDesigns = initialChosen.length > 0 ? initialChosen : designs.slice(0, 3);
      setCustomMsg(
        buildShareMessage(targetDesigns, currentCust?.propName || currentCust?.businessName)
      );
    }
  }, [isShareModalOpen, selectedDesignIds]);

  if (!isShareModalOpen) return null;

  const handleApplyTemplate = (templateId: string) => {
    setActiveTemplateId(templateId);
    const tpl = QUICK_TEMPLATES.find((t) => t.id === templateId);
    if (tpl) {
      const names = activeDesigns.map((d) => d.name).join(', ');
      setCustomMsg(
        tpl.getMessage(
          names,
          activeDesigns.length,
          currentCust?.propName || currentCust?.businessName || 'Ji'
        )
      );
    }
  };

  const handleShare = async () => {
    if (!currentCust) return;

    const token = safeRandomUUID();
    const shareUrl = `${window.location.origin}/#s/${token}`;

    const cleanPhone = (currentCust.phone || '').replace(/[^0-9]/g, '');
    const recipientPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const introMsg =
      customMsg.trim() ||
      `Namaste ${currentCust.propName || currentCust.businessName}! Sharing our latest footwear designs.`;
    const designListText = activeDesigns
      .map(
        (d, idx) =>
          `${idx + 1}. *${d.name}* (Art. ${d.articleCode || 'N/A'}) — ₹${d.price.toLocaleString('en-IN')}/pr`
      )
      .join('\n');

    const fullWhatsAppMessage = `${introMsg}\n\n${designListText}\n\n*View Interactive Catalog & Place Order:*\n${shareUrl}\n\n_SoleFlow B2B Footwear Network_`;

    const waLink = recipientPhone
      ? `https://wa.me/${recipientPhone}?text=${encodeURIComponent(fullWhatsAppMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(fullWhatsAppMessage)}`;

    // Open WhatsApp in a new tab immediately
    window.open(waLink, '_blank');

    // Record share in background
    await recordDesignShare({
      id: `SHR-${Date.now()}`,
      targetClientId: currentCust.id,
      targetClientName: currentCust.businessName,
      targetPhone: currentCust.phone,
      designsCount: activeDesigns.length,
      designIds: activeDesigns.map((d) => d.id),
      designNames: activeDesigns.map((d) => d.name),
      channel: 'WhatsApp',
    });

    showToast(`Lookbook shared with ${currentCust.businessName} on WhatsApp!`);
    setIsShareModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 dark:bg-black/80 backdrop-blur-xs select-none animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Mobile Drag Handle */}
        <div className="pt-2.5 pb-0.5 sm:hidden flex justify-center bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0 shadow-xs">
              <MessageCircle className="w-5 h-5 fill-current/10" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate">
                Share WhatsApp Lookbook
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Curated wholesale catalogue with direct inquiry link
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsShareModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
            title="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          {/* 1. Recipient Retailer Selection */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Select Recipient Retailer:</span>
              <span className="text-[11px] font-normal text-slate-500">
                {customers.length} registered
              </span>
            </label>

            <div className="relative">
              <select
                value={selectedCustId}
                onChange={(e) => {
                  setSelectedCustId(e.target.value);
                  const cust = customers.find((c) => c.id === e.target.value);
                  if (cust) {
                    setCustomMsg(
                      buildShareMessage(activeDesigns, cust.propName || cust.businessName)
                    );
                  }
                }}
                className="w-full h-11 px-3.5 pr-8 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer font-medium appearance-none truncate"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} {c.propName ? `(${c.propName})` : ''} • {c.phone}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Icons.ChevronDown size={15} />
              </div>
            </div>

            {/* Recipient Details Pill */}
            {currentCust && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {currentCust.businessName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate text-[11px]">
                      {currentCust.businessName}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {currentCust.propName ? `${currentCust.propName} • ` : ''}
                      {currentCust.city || 'Wholesale Client'}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50">
                  {currentCust.phone || 'No phone'}
                </span>
              </div>
            )}
          </div>

          {/* 2. Included Footwear Articles Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Included Footwear Articles:
              </label>
              <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-900/50">
                {activeDesigns.length} Selected
              </span>
            </div>

            {activeDesigns.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                No designs selected. Go back to catalogue and tap items to include.
              </div>
            ) : (
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                {activeDesigns.map((d) => {
                  const hasError = brokenImages[d.id];
                  return (
                    <div
                      key={d.id}
                      className="relative shrink-0 w-28 xs:w-32 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between overflow-hidden shadow-xs group"
                    >
                      {/* Image Showcase with clean fallback */}
                      <div className="relative aspect-square w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden p-1.5">
                        {!hasError && d.image ? (
                          <img
                            src={d.image}
                            alt=""
                            onError={() => setBrokenImages((prev) => ({ ...prev, [d.id]: true }))}
                            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal select-none"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-2">
                            <Icons.Catalogue className="w-6 h-6 stroke-[1.5]" />
                            <span className="text-[9px] font-mono mt-1 font-bold uppercase truncate max-w-[80px]">
                              {d.articleCode}
                            </span>
                          </div>
                        )}

                        {/* Deselect button */}
                        {activeDesigns.length > 1 && (
                          <button
                            type="button"
                            onClick={() => toggleSelectDesign(d.id)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                            title="Remove from lookbook"
                          >
                            <X size={10} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>

                      {/* Info & Price */}
                      <div className="mt-1.5 min-w-0">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                          {d.name}
                        </p>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <span className="text-[10px] font-mono text-slate-400 truncate">
                            {d.articleCode}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums shrink-0">
                            ₹{d.price.toLocaleString('en-IN')}/pr
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. WhatsApp Message with Template Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                WhatsApp Accompanying Message:
              </label>
              <span className="text-[10px] text-slate-400">
                Interactive link appended below
              </span>
            </div>

            {/* Quick Template Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {QUICK_TEMPLATES.map((t) => {
                const isSelected = activeTemplateId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleApplyTemplate(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50'
                    }`}
                  >
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            <textarea
              rows={3}
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium leading-relaxed resize-none"
              placeholder="Write custom wholesale introduction note..."
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3.5 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(false)}
            className="h-11 px-4 sm:px-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={!currentCust || activeDesigns.length === 0}
            className="flex-1 h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <Icons.WhatsApp className="w-4 h-4 shrink-0" />
            <span className="truncate">Send on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareLookbookModal;
