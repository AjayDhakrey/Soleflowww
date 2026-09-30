import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Building2,
  Package,
  TrendingDown,
  Percent,
  Receipt,
  FileText,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  MessageSquare,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { DiscountRequest, Order } from '../../types';
import { Button, StatusBadge, Tag } from '../ui';
import { discountRequestsService } from '../../services/discountRequests';
import { useApp } from '../../context/AppContext';

interface DiscountRequestDrawerProps {
  request: DiscountRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedReq: DiscountRequest) => void;
  onNavigateToOrder?: (orderId: string) => void;
}

export const DiscountRequestDrawer: React.FC<DiscountRequestDrawerProps> = ({
  request,
  isOpen,
  onClose,
  onUpdated,
  onNavigateToOrder,
}) => {
  const { currentUser, showToast, orders } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [counterPercent, setCounterPercent] = useState<number>(request?.requestedPercent || 9.0);
  const [approvalNote, setApprovalNote] = useState('');
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (request) {
      setCounterPercent(request.requestedPercent);
      setShowCounterOffer(false);
      setShowRejectModal(false);
      setApprovalNote('');
      setRejectReason('');
    }
  }, [request]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !request) return null;

  const order = orders.find((o) => o.id === request.orderId);

  // Financial Before vs After Preview Calculations
  const subtotal = request.orderSubtotal;
  const defaultDiscountAmt = (subtotal * request.defaultPercent) / 100;
  const requestedDiscountAmt = (subtotal * request.requestedPercent) / 100;

  const defaultTaxable = subtotal - defaultDiscountAmt;
  const requestedTaxable = subtotal - requestedDiscountAmt;

  const defaultGst = defaultTaxable * 0.12;
  const requestedGst = requestedTaxable * 0.12;

  const defaultNet = defaultTaxable + defaultGst;
  const requestedNet = requestedTaxable + requestedGst;

  const handleApprove = async (percentToApprove?: number) => {
    setIsSubmitting(true);
    try {
      const finalPct = percentToApprove ?? request.requestedPercent;
      const updated = await discountRequestsService.approveDiscountRequest(
        request.id,
        finalPct,
        approvalNote || (finalPct !== request.requestedPercent ? `Approved counter-offer of ${finalPct}%` : 'Approved standard volume override')
      );
      showToast(`Discount request ${request.id} approved at ${finalPct}%!`);
      onUpdated(updated);
      setIsApproving(false);
      setShowCounterOffer(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to approve discount request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showToast('Please provide a reason for rejecting the discount request.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await discountRequestsService.rejectDiscountRequest(request.id, rejectReason);
      showToast(`Discount request ${request.id} rejected.`);
      onUpdated(updated);
      setShowRejectModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to reject discount request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLowMargin = (request.projectedMarginPercent ?? 20) < 15;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-[540px] bg-surface h-full shadow-2xl border-l border-border flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="px-6 py-4.5 border-b border-border flex items-center justify-between bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs font-mono">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-foreground tracking-tight">
                  Discount Authorization
                </h3>
                <span className="font-mono text-xs text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border">
                  {request.id}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {request.clientName} • Order #{request.orderId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge
              status={
                request.status === 'approved'
                  ? 'active'
                  : request.status === 'pending'
                  ? 'pending'
                  : 'neutral'
              }
            >
              {request.status.toUpperCase()}
            </StatusBadge>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-foreground">
          {/* Order & Client Context Hero */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  CLIENT ACCOUNT
                </span>
                <span className="text-sm font-bold text-foreground block mt-0.5">
                  {request.clientName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {request.clientCity} • Rep: {request.salesmanName}
                </span>
              </div>

              {onNavigateToOrder && (
                <button
                  onClick={() => onNavigateToOrder(request.orderId)}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 cursor-pointer"
                >
                  <span>Inspect Order</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Order Volume:</span>
              <span className="font-bold text-foreground font-mono">
                {request.productSummary || `${request.pairs} Pairs`}
              </span>
            </div>
          </div>

          {/* Pricing Impact Comparison Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Financial Impact &amp; Concession
              </h4>
              <Tag variant="purple">
                +{ (request.requestedPercent - request.defaultPercent).toFixed(1) }% Override
              </Tag>
            </div>

            <div className="rounded-xl border border-border overflow-hidden bg-surface">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3 text-left">Metric</th>
                    <th className="py-2.5 px-3 text-right">Standard ({request.defaultPercent}%)</th>
                    <th className="py-2.5 px-3 text-right text-purple-600 dark:text-purple-400 font-bold">
                      Requested ({request.requestedPercent}%)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2.5 px-3 text-muted-foreground font-medium">Order Subtotal</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-muted-foreground font-medium">Trade Discount</td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                      -₹{defaultDiscountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                      -₹{requestedDiscountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-muted-foreground font-medium">Taxable Subtotal</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{defaultTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{requestedTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-muted-foreground font-medium">GST (12%)</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{defaultGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{requestedGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-muted/30 font-bold">
                    <td className="py-2.5 px-3 text-foreground">Net Payable Invoice</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{defaultNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{requestedNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Concession & Profitability Chips */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-purple-50/60 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/60">
                <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block">
                  MARGIN CONCESSION
                </span>
                <span className="text-base font-bold font-mono text-purple-900 dark:text-purple-200 mt-0.5 block">
                  ₹{request.marginConcession.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5 block">
                  Revenue sacrificed to secure deal
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  isLowMargin
                    ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
                    : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                }`}
              >
                <span
                  className={`text-[10px] uppercase font-bold block ${
                    isLowMargin ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  PROJECTED MARGIN
                </span>
                <span
                  className={`text-base font-bold font-mono mt-0.5 block ${
                    isLowMargin ? 'text-amber-900 dark:text-amber-200' : 'text-emerald-900 dark:text-emerald-200'
                  }`}
                >
                  {request.projectedMarginPercent ? `${request.projectedMarginPercent}%` : '21.4%'}
                </span>
                <span
                  className={`text-[10px] mt-0.5 block ${
                    isLowMargin ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isLowMargin ? '⚠️ Warning: Below 15% target' : 'Healthy wholesale spread'}
                </span>
              </div>
            </div>
          </div>

          {/* Salesman's Justification */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Sales Representative Justification
            </h4>
            <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-start gap-3">
              <MessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs text-foreground leading-relaxed italic">
                  "{request.reason}"
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Submitted by <strong>{request.salesmanName}</strong> • {new Date(request.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </div>
          </div>

          {/* Decision Record (if decided) */}
          {request.status !== 'pending' && (
            <div
              className={`p-4 rounded-xl border ${
                request.status === 'approved'
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {request.status === 'approved' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
                <span className="text-xs font-bold capitalize text-foreground">
                  Request {request.status}
                </span>
                {request.approvedPercent && (
                  <Tag variant="green">{request.approvedPercent}% Final</Tag>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {request.decisionNote || 'Decision logged by management.'}
              </p>
              {request.decidedAt && (
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                  Decided at: {new Date(request.decidedAt).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          )}

          {/* Counter-Offer Section (Admin Only) */}
          {showCounterOffer && request.status === 'pending' && isAdmin && (
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  Counter-Offer Margin Override
                </span>
                <button
                  onClick={() => setShowCounterOffer(false)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Approved Discount Percentage (%):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={request.defaultPercent}
                  max={15}
                  value={counterPercent}
                  onChange={(e) => setCounterPercent(parseFloat(e.target.value) || request.defaultPercent)}
                  className="w-full h-9 px-3 text-xs rounded-xl bg-surface border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Optional Approval Note:
                </label>
                <input
                  type="text"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="e.g. Approved 9.0% as final Diwali seasonal volume incentive."
                  className="w-full h-9 px-3 text-xs rounded-xl bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full"
                disabled={isSubmitting}
                onClick={() => handleApprove(counterPercent)}
              >
                Confirm &amp; Authorize {counterPercent}% Override
              </Button>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions (Admin Only when Pending) */}
        {request.status === 'pending' && isAdmin && (
          <div className="p-4 border-t border-border bg-surface shrink-0 space-y-2">
            {!showCounterOffer && (
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setShowRejectModal(true)}
                  className="text-rose-600 hover:text-rose-700 dark:text-rose-400"
                >
                  Reject
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setShowCounterOffer(true)}
                >
                  Counter %
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => handleApprove(request.requestedPercent)}
                >
                  Approve {request.requestedPercent}%
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Rejection Modal Dialog */}
        {showRejectModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm bg-surface rounded-2xl p-5 border border-border shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-bold text-sm text-foreground">Reject Discount Request</h4>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Provide a mandatory reason for declining this margin concession. The order will revert to the standard <strong>{request.defaultPercent}%</strong> trade discount.
              </p>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Minimum order size not met for requested margin concession."
                  className="w-full p-2.5 text-xs rounded-xl bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting || !rejectReason.trim()}
                  onClick={handleReject}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
