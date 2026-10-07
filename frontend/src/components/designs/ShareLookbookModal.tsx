import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import { Button } from '../ui/Button';

// Build the WhatsApp message from the designs actually being shared
const buildShareMessage = (sharedDesigns: { name: string }[]): string => {
  const names = sharedDesigns.map((d) => d.name).join(', ');
  return `Namaste! Sharing ${sharedDesigns.length} design(s) from our latest collection: ${names}. Take a look and share your interest!`;
};

export const ShareLookbookModal: React.FC = () => {
  const {
    isShareModalOpen,
    setIsShareModalOpen,
    customers,
    designs,
    selectedDesignIds,
    currentUser,
    recordDesignShare,
    showToast,
  } = useApp();

  const [selectedCustId, setSelectedCustId] = useState(customers[0]?.id || '');
  const [customMsg, setCustomMsg] = useState(() => {
    const chosen = designs.filter((d) => selectedDesignIds.includes(d.id));
    return buildShareMessage(chosen.length > 0 ? chosen : designs.slice(0, 3));
  });

  React.useEffect(() => {
    if (isShareModalOpen) {
      if (customers.length > 0) {
        setSelectedCustId(customers[0].id);
      }
      const chosen = designs.filter((d) => selectedDesignIds.includes(d.id));
      setCustomMsg(buildShareMessage(chosen.length > 0 ? chosen : designs.slice(0, 3)));
    }
  }, [isShareModalOpen, customers, designs, selectedDesignIds]);

  if (!isShareModalOpen) return null;

  const currentCust = customers.find((c) => c.id === selectedCustId) || customers[0];
  const chosenDesigns = designs.filter((d) => selectedDesignIds.includes(d.id));
  const activeDesigns = chosenDesigns.length > 0 ? chosenDesigns : designs.slice(0, 3);

  const handleShare = async () => {
    if (!currentCust) return;

    const token = crypto.randomUUID();
    const shareUrl = `${window.location.origin}/#s/${token}`;

    const cleanPhone = (currentCust.phone || '').replace(/[^0-9]/g, '');
    const recipientPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const introMsg = customMsg.trim() || `Namaste ${currentCust.propName || currentCust.businessName}! Sharing our latest footwear designs.`;
    const designListText = activeDesigns.map((d, idx) => `${idx + 1}. *${d.name}* (Art. ${d.articleCode || 'N/A'}) — ₹${d.price.toLocaleString('en-IN')}/pr`).join('\n');

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

    showToast(`Lookbook successfully shared with ${currentCust.businessName} on WhatsApp!`);
    setIsShareModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-xl border border-border overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Icons.Share size={20} strokeWidth={1.75} />
            </div>
            <h3 className="font-bold text-lg text-foreground tracking-tight">
              Share WhatsApp Lookbook
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsShareModalOpen(false)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
          >
            <Icons.Close size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Select Recipient Retailer:
            </label>
            <select
              value={selectedCustId}
              onChange={(e) => setSelectedCustId(e.target.value)}
              className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.propName}) • {c.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Included Footwear Articles ({activeDesigns.length} Selected):
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {activeDesigns.map((d) => (
                <div
                  key={d.id}
                  className="p-2 rounded-xl bg-muted/50 border border-border text-center"
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-16 rounded-lg object-cover mb-1.5"
                  />
                  <p className="text-xs font-semibold text-foreground truncate">
                    {d.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    ₹{d.price.toLocaleString('en-IN')}/pr
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              WhatsApp Accompanying Message:
            </label>
            <textarea
              rows={3}
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="w-full p-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsShareModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              icon={Icons.WhatsApp}
              onClick={handleShare}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Send on WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
