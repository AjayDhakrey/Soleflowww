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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Icons.Share size={20} strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-foreground tracking-tight">
                  Design Sharing & Lookbook History
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  {designShares.length} Shares
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Measurable tracking of catalogue lookbooks shared with wholesale buyers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
          >
            <Icons.Close size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* List of Shares */}
        <div className="p-6 overflow-y-auto divide-y divide-border space-y-4">
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
        <div className="px-6 py-4 border-t border-border flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
