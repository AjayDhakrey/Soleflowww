import React from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';

interface DesignSharesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesignSharesModal: React.FC<DesignSharesModalProps> = ({ isOpen, onClose }) => {
  const { designShares } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/60 dark:bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Icons.Share size={20} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight truncate">
                  Lookbook History
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 shrink-0">
                  {designShares.length}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                Measurable tracking of catalogue lookbooks shared with wholesale buyers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer shrink-0 ml-2"
          >
            <Icons.Close size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* List of Shares */}
        <div className="p-4 sm:p-6 overflow-y-auto divide-y divide-border space-y-4 flex-1">
          {designShares.map((share) => (
            <div key={share.id} className="pt-4 first:pt-0 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm md:text-base text-foreground">
                      {share.targetClientName}
                    </h4>
                    <Tag variant="blue">{share.channel}</Tag>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Phone: {share.targetPhone} • Shared by <strong className="text-foreground">{share.sharedBy}</strong> ({share.sharedByRole})
                  </p>
                </div>
                <span className="text-xs text-muted-foreground font-mono shrink-0">
                  {share.timestamp}
                </span>
              </div>

              {/* Designs Included */}
              <div className="flex flex-wrap gap-1.5">
                {share.designNames.map((name, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-muted/60 border border-border text-foreground text-xs font-medium"
                  >
                    👟 {name}
                  </span>
                ))}
              </div>

              {/* Engagement Status */}
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border">
                <div className="flex items-center gap-1.5">
                  <Icons.View size={15} className="text-primary" />
                  <span>Viewed: {share.wasViewed ? `Yes (${share.viewCount} times)` : 'Pending Open'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icons.Orders size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Order Status: {share.wasOrdered ? `Converted (${share.orderId})` : 'In Discussion'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border flex justify-end shrink-0">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
