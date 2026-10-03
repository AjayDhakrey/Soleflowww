import React, { useState, useEffect } from 'react';
import {
  X,
  Percent,
  TrendingDown,
  AlertTriangle,
  Receipt,
  FileText,
  Send,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui';
import { discountRequestsService } from '../../services/discountRequests';
import { DiscountRequest, Order } from '../../types';

interface RequestDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  onSuccess: (newReq: DiscountRequest) => void;
}

export const RequestDiscountModal: React.FC<RequestDiscountModalProps> = ({
  isOpen,
  onClose,
  orderId: preselectedOrderId,
  onSuccess,
}) => {
  const { orders, showToast } = useApp();
  const [selectedOrderId, setSelectedOrderId] = useState<string>(preselectedOrderId || '');
  const [requestedPercent, setRequestedPercent] = useState<number>(9.5);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appSettings, setAppSettings] = useState({
    defaultTradeDiscount: 8.0,
    maxTradeDiscount: 15.0,
    minMargin: 15.0,
  });

  useEffect(() => {
    discountRequestsService.fetchAppSettings().then(setAppSettings);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (preselectedOrderId) {
        setSelectedOrderId(preselectedOrderId);
      } else {
        const eligible = orders.find((o) => ['Draft', 'Submitted', 'Under Review'].includes(o.status));
        if (eligible) setSelectedOrderId(eligible.id);
      }
      setRequestedPercent(9.5);
      setReason('');
      setIsSubmitting(false);
    }
  }, [isOpen, preselectedOrderId, orders]);

  if (!isOpen) return null;

  const eligibleOrders = orders.filter((o) => ['Draft', 'Submitted', 'Under Review'].includes(o.status));
  const currentOrder = orders.find((o) => o.id === selectedOrderId) || eligibleOrders[0];

  const defaultPct = currentOrder?.tradeDiscountPercent || appSettings.defaultTradeDiscount;
  const subtotal = currentOrder?.subtotal || 0;
  const concession = subtotal > 0 && requestedPercent > defaultPct ? ((requestedPercent - defaultPct) * subtotal) / 100 : 0;
  const newNetPayable = subtotal > 0 ? (subtotal - (requestedPercent * subtotal) / 100) * 1.12 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) {
      showToast('Please select a valid wholesale order.');
      return;
    }
    if (!reason.trim()) {
      showToast('Please provide a justification reason.');
      return;
    }
    if (requestedPercent <= defaultPct) {
      showToast(`Requested discount must be greater than current standard ${defaultPct}%.`);
      return;
    }
    if (requestedPercent > appSettings.maxTradeDiscount) {
      showToast(`Requested discount exceeds maximum threshold of ${appSettings.maxTradeDiscount}%.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await discountRequestsService.requestDiscount(
        currentOrder.id,
        requestedPercent,
        reason
      );
      showToast(`Special margin request submitted for Order #${currentOrder.id}!`);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit discount request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Percent size={20} strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground tracking-tight">
                Request Special Trade Margin
              </h3>
              <p className="text-xs text-muted-foreground">
                Submit volume discount override for Trader authorization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-foreground">
          {/* Order Selection */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Select Wholesale Order *
            </label>
            {preselectedOrderId ? (
              <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-foreground">
                    Order #{currentOrder?.id} — {currentOrder?.customerName}
                  </span>
                  <p className="text-muted-foreground mt-0.5">
                    {currentOrder?.pairsCount} Pairs • Subtotal ₹{currentOrder?.subtotal?.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 text-xs tabular-nums">
                  Current: {defaultPct}%
                </span>
              </div>
            ) : (
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {eligibleOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    #{o.id} • {o.customerName} ({o.pairsCount} pairs • ₹{o.subtotal?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Requested Percentage Input */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Standard Discount
              </label>
              <div className="h-9 px-3 rounded-xl bg-muted/50 border border-border flex items-center text-xs text-muted-foreground font-bold tabular-nums">
                {defaultPct}% Default
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Requested Override (%) *
              </label>
              <input
                type="number"
                step="0.1"
                min={defaultPct + 0.1}
                max={appSettings.maxTradeDiscount}
                required
                value={requestedPercent}
                onChange={(e) => setRequestedPercent(parseFloat(e.target.value) || defaultPct + 0.5)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-surface border border-border text-foreground tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Live Financial Impact Preview */}
          <div className="p-3.5 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/60 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block">
                MARGIN CONCESSION
              </span>
              <span className="text-sm font-bold font-display text-purple-950 dark:text-purple-200 mt-0.5 block tabular-nums">
                ₹{concession.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block">
                EST. NET PAYABLE (W/ GST)
              </span>
              <span className="text-sm font-bold font-display text-foreground mt-0.5 block tabular-nums">
                ₹{newNetPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Reason Justification */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Sales Justification &amp; Client Rationale *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Client placing repeat order for 900 pairs across 4 branches. Requested 9.5% to beat competitor quote."
              className="w-full p-3 text-xs rounded-xl bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              icon={Send}
            >
              Submit for Authorization
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
