import React, { useState } from 'react';
import { X, Send, Share2, Check, Smartphone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ShareLookbookModal: React.FC = () => {
  const {
    isShareModalOpen,
    setIsShareModalOpen,
    customers,
    designs,
    selectedDesignIds,
    currentUser,
    showToast,
  } = useApp();

  const [selectedCustId, setSelectedCustId] = useState(customers[0]?.id || '');
  const [customMsg, setCustomMsg] = useState(
    'Namaste! Here is the latest SoleFlow AW24 Footwear Collection lookbook with wholesale ex-factory rates and carton packing details. Please review and let us know your booking requirements.'
  );

  if (!isShareModalOpen) return null;

  const currentCust = customers.find((c) => c.id === selectedCustId) || customers[0];
  const chosenDesigns = designs.filter((d) => selectedDesignIds.includes(d.id));
  const activeDesigns = chosenDesigns.length > 0 ? chosenDesigns : designs.slice(0, 3);

  const handleShare = () => {
    // Add activity to customer
    currentCust.activityHistory.unshift({
      id: `act-share-${Date.now()}`,
      type: 'shared_designs',
      title: `${currentUser.name} shared ${activeDesigns.length} shoe designs via WhatsApp`,
      description: `Sent digital catalog lookbook link to ${currentCust.propName}'s WhatsApp (${currentCust.phone}).`,
      timestamp: 'Just now',
      badge: 'WhatsApp Sent',
    });

    showToast(`Lookbook successfully shared with ${currentCust.businessName} on WhatsApp!`);
    setIsShareModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Share WhatsApp Lookbook
              </h3>
            </div>
          </div>
          <button
            onClick={() => setIsShareModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target Customer */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Select Recipient Retailer:
            </label>
            <select
              value={selectedCustId}
              onChange={(e) => setSelectedCustId(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.propName}) • {c.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Designs Preview */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Included Designs ({activeDesigns.length} Selected):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {activeDesigns.map((d) => (
                <div
                  key={d.id}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center"
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-16 rounded-lg object-cover mb-1"
                  />
                  <p className="text-[10px] font-bold text-slate-900 truncate">
                    {d.name}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    ₹{d.price.toLocaleString('en-IN')}/pr
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              WhatsApp Accompanying Message:
            </label>
            <textarea
              rows={3}
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          {/* Action */}
          <div className="pt-2">
            <button
              onClick={handleShare}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Send Lookbook to {currentCust.businessName}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
