import React from 'react';
import { X, Share2, CheckCircle2, Clock, Smartphone, ExternalLink, Eye, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DesignSharesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesignSharesModal: React.FC<DesignSharesModalProps> = ({ isOpen, onClose }) => {
  const { designShares, customers } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  Design Sharing &amp; Lookbook History
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {designShares.length} Shares Logged
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Measurable tracking of catalogue lookbooks shared with wholesale buyers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Shares */}
        <div className="p-5 overflow-y-auto divide-y divide-slate-100 space-y-3">
          {designShares.map((share) => (
            <div key={share.id} className="pt-3 first:pt-0 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">
                      {share.targetClientName}
                    </h4>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {share.channel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Recipient: {share.targetPhone} • Shared by <strong className="text-slate-700">{share.sharedBy}</strong> ({share.sharedByRole})
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {share.timestamp}
                </span>
              </div>

              {/* Designs Included */}
              <div className="flex flex-wrap gap-1.5">
                {share.designNames.map((name, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-900 text-xs font-semibold"
                  >
                    👟 {name}
                  </span>
                ))}
              </div>

              {/* Engagement Status */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Viewed: {share.wasViewed ? `Yes (${share.viewCount} times)` : 'Pending Open'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Converted to Order: {share.wasOrdered ? `Yes (${share.orderId})` : 'In Negotiation'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
