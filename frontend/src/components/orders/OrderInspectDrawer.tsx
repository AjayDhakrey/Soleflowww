import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderItem } from '../../types';
import {
  X,
  Printer,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Footprints,
  Store,
  User,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Circle,
  Maximize2,
  ShieldCheck,
  Truck,
  FileText,
} from 'lucide-react';

import { RequestDiscountModal } from '../discounts/RequestDiscountModal';
import { ReceiptPreviewModal, mapPaymentStatusToReceiptStatus } from '../payments/ReceiptTemplate';
import { InvoicePreviewModal, generateInvoiceFileName } from './OrderInvoiceTemplate';
import { PaymentReceipt } from '../../types';

interface OrderInspectDrawerProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onOpenFullDetail: (order: Order) => void;
}

export const OrderInspectDrawer: React.FC<OrderInspectDrawerProps> = ({
  order,
  open,
  onClose,
  onOpenFullDetail,
}) => {
  const { designs, payments, customers, showToast } = useApp();
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentReceipt | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Sync URL search param ?inspect=<orderId>
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);

    if (open && order) {
      if (url.searchParams.get('inspect') !== order.id) {
        url.searchParams.set('inspect', order.id);
        window.history.pushState({}, '', url.toString());
      }
    } else {
      if (url.searchParams.has('inspect')) {
        url.searchParams.delete('inspect');
        window.history.pushState({}, '', url.toString());
      }
    }
  }, [open, order]);

  // Handle browser back button to close drawer
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      if (!params.has('inspect') && open) {
        onClose();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [open, onClose]);

  // Reset selected item when order changes
  useEffect(() => {
    setSelectedItemIndex(0);
    setIsImgLoading(true);
    setImgError(false);
  }, [order?.id]);

  // Keyboard navigation: Esc to close, Arrow keys for gallery
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' && order?.items && order.items.length > 1) {
        setSelectedItemIndex((prev) => (prev + 1) % order.items.length);
        setIsImgLoading(true);
        setImgError(false);
      } else if (e.key === 'ArrowLeft' && order?.items && order.items.length > 1) {
        setSelectedItemIndex((prev) => (prev - 1 + order.items.length) % order.items.length);
        setIsImgLoading(true);
        setImgError(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isLightboxOpen, onClose, order]);

  // Focus trap / manage initial focus
  useEffect(() => {
    if (open) {
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open || !order) return null;

  const items = order.items && order.items.length > 0 ? order.items : [];
  const activeItem: OrderItem | undefined = items[selectedItemIndex] || items[0];

  // Lookup fallback image from designs catalogue if item image is missing
  const getDisplayImage = (item?: OrderItem) => {
    if (!item) return '';
    if (item.image && item.image.trim()) return item.image;
    const matchingDesign = designs.find(
      (d) => d.id === item.designId || d.articleCode === item.articleCode
    );
    return matchingDesign?.image || '';
  };

  const activeImage = getDisplayImage(activeItem);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Production':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>{status}</span>
          </span>
        );
      case 'Ready to Dispatch':
      case 'Ready QC':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            <span>{status}</span>
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>{status}</span>
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
            Paid in Full
          </span>
        );
      case 'Advance Deposited':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50">
            Advance Deposited
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50">
            Overdue Balance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
            Payment Pending
          </span>
        );
    }
  };

  const handlePrint = () => {
    setIsInvoiceModalOpen(true);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-inspect-title"
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[560px] max-w-full bg-surface border-l border-border shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200 font-sans"
      >
        {/* 1. Header (Fixed) */}
        <div className="p-5 md:px-6 border-b border-border bg-surface flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-bold text-lg text-foreground tracking-tight" id="order-inspect-title">
                {order.id}
              </span>
              {getStatusBadge(order.status)}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              {getPaymentStatusBadge(order.paymentStatus || 'Payment Pending')}
              <span className="text-xs text-muted-foreground">
                • Booked on {order.orderDate || order.expectedDelivery || '2026-2027'}
              </span>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close Inspect Panel"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          
          {/* A. Image Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Article Showcase &amp; Gallery
              </h3>
              {items.length > 1 && (
                <span className="text-xs font-medium text-muted-foreground">
                  {selectedItemIndex + 1} of {items.length} articles
                </span>
              )}
            </div>

            {/* Main Image Stage */}
            <div
              onClick={() => {
                if (activeImage && !imgError) setIsLightboxOpen(true);
              }}
              className="w-full aspect-[4/3] bg-muted/40 rounded-2xl border border-border overflow-hidden relative flex items-center justify-center cursor-zoom-in group select-none shadow-2xs"
            >
              {isImgLoading && !imgError && (
                <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center text-muted-foreground">
                  <Footprints className="w-8 h-8 opacity-40 animate-bounce" />
                </div>
              )}

              {activeImage && !imgError ? (
                <img
                  src={activeImage}
                  alt={activeItem?.designName || 'Product'}
                  loading="lazy"
                  onLoad={() => setIsImgLoading(false)}
                  onError={() => {
                    setIsImgLoading(false);
                    setImgError(true);
                  }}
                  className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-2">
                    <Footprints size={24} className="text-muted-foreground/60" />
                  </div>
                  <p className="text-xs font-bold text-foreground">
                    {activeItem?.designName || 'Shoe Model'}
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                    {activeItem?.articleCode || order.id}
                  </p>
                </div>
              )}

              {/* Hover Zoom Hint */}
              {activeImage && !imgError && (
                <div className="absolute top-3 right-3 p-2 rounded-xl bg-surface/90 backdrop-blur-xs border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                  <Maximize2 size={16} />
                </div>
              )}
            </div>

            {/* Main Image Caption */}
            {activeItem && (
              <div className="p-3 bg-muted/30 rounded-xl border border-border flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-foreground leading-tight truncate">
                    {activeItem.designName}
                  </h4>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">
                    Art: {activeItem.articleCode}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-sm text-foreground">
                    ₹{Number(activeItem.ratePerPair || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    per pair
                  </span>
                </div>
              </div>
            )}

            {/* Thumbnail Strip (when multiple items exist) */}
            {items.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1 hide-scrollbar">
                {items.map((item, idx) => {
                  const thumb = getDisplayImage(item);
                  const isSelected = idx === selectedItemIndex;

                  return (
                    <button
                      key={item.designId || idx}
                      type="button"
                      onClick={() => {
                        setSelectedItemIndex(idx);
                        setIsImgLoading(true);
                        setImgError(false);
                      }}
                      className={`w-16 h-16 rounded-xl border p-1 bg-muted/40 shrink-0 transition-all cursor-pointer overflow-hidden relative ${
                        isSelected
                          ? 'ring-2 ring-primary border-primary bg-primary/5'
                          : 'border-border hover:border-border/80'
                      }`}
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={item.designName}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-muted-foreground">
                          {item.articleCode}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* B. Client & Sales Team Card */}
          <div className="bg-surface border border-border rounded-2xl p-4 md:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Store size={16} className="text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Retailer &amp; Sales Representative
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Client Info */}
              <div>
                <span className="text-muted-foreground block">Customer Store</span>
                <span className="font-bold text-foreground text-sm block mt-0.5">
                  {order.customerName}
                </span>
                <span className="text-muted-foreground block mt-0.5">
                  {order.propName && `${order.propName} • `}{order.customerCity}, {order.customerState}
                </span>
              </div>

              {/* Sales Rep Info */}
              <div>
                <span className="text-muted-foreground block">Assigned Representative</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                    <User size={12} />
                  </div>
                  <span className="font-semibold text-foreground text-xs">
                    {order.salespersonName || 'Rahul Sharma (Field Rep)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* C. Items & Size Matrix Table */}
          <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Consignment Line Items ({items.length})
                </h4>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold uppercase text-[10px] tracking-wider bg-muted/20">
                    <th className="py-2.5 px-3">Article</th>
                    <th className="py-2.5 px-3">Size Matrix</th>
                    <th className="py-2.5 px-3 text-right">Pairs</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item, idx) => {
                    const thumb = getDisplayImage(item);
                    const isSelected = idx === selectedItemIndex;

                    return (
                      <tr
                        key={item.designId || idx}
                        onClick={() => {
                          setSelectedItemIndex(idx);
                          setIsImgLoading(true);
                          setImgError(false);
                        }}
                        className={`hover:bg-muted/40 transition-colors cursor-pointer ${
                          isSelected ? 'bg-primary/5' : ''
                        }`}
                      >
                        {/* Article with Thumbnail */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-muted/60 border border-border flex items-center justify-center shrink-0 overflow-hidden">
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt={item.designName}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Footprints size={14} className="text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-foreground text-xs leading-tight truncate">
                                {item.designName}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                                {item.articleCode}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Size Matrix Chips */}
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[170px]">
                            {item.sizeBreakdown && item.sizeBreakdown.length > 0 ? (
                              item.sizeBreakdown.map((sb) => (
                                <span
                                  key={sb.size}
                                  className="px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-mono text-foreground border border-border"
                                >
                                  {sb.size}×{sb.pairs}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-[11px]">—</span>
                            )}
                          </div>
                        </td>

                        {/* Volume */}
                        <td className="py-3 px-3 text-right">
                          <span className="font-bold text-foreground">
                            {item.totalPairs}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            ({item.totalCartons}c)
                          </span>
                        </td>

                        {/* Rate */}
                        <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                          ₹{Number(item.ratePerPair || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Subtotal */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-foreground tabular-nums">
                          ₹{Number(item.itemSubtotal || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* D. Financial Breakdown Card */}
          <div className="bg-surface border border-border rounded-2xl p-4 md:p-5 shadow-2xs space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-1 border-b border-border">
              Financial Settlement &amp; Taxes
            </h4>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Gross Wholesale Subtotal</span>
                <span className="font-mono tabular-nums text-foreground">
                  ₹{Number(order.subtotal || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {Number(order.tradeDiscountAmount || 0) > 0 && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span>Trade Discount ({order.tradeDiscountPercent || 0}%)</span>
                    {order.status === 'Under Review' && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-semibold border border-amber-200 dark:border-amber-800">
                        Authorization Pending
                      </span>
                    )}
                  </span>
                  <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                    -₹{Number(order.tradeDiscountAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-muted-foreground">
                <span>Taxable Amount</span>
                <span className="font-mono tabular-nums text-foreground">
                  ₹{Number(order.taxableSubtotal ?? order.subtotal ?? 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span>GST ({order.gstPercent || 12}%)</span>
                <span className="font-mono tabular-nums text-foreground">
                  +₹{Number(order.gstAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-sm font-bold text-foreground">
                <span>Net Payable Invoice</span>
                <span className="font-mono text-base tabular-nums">
                  ₹{Number(order.netPayable || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-medium pt-1">
                <span className="text-emerald-600 dark:text-emerald-400">Advance Deposited</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ₹{Number(order.advanceDeposited || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold">
                <span className={Number(order.balanceDue || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}>
                  Balance Due Ledger
                </span>
                <span className={`font-mono tabular-nums ${Number(order.balanceDue || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
                  ₹{Number(order.balanceDue || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Payments Linked to Order */}
              {(() => {
                const orderPayments = payments.filter(
                  (p) => (p.orderId && p.orderId === order.id) || (p.orderNumber && p.orderNumber === order.id) || (p.customerId === order.customerId && Number(order.advanceDeposited || 0) > 0)
                );
                if (orderPayments.length === 0) return null;
                return (
                  <div className="pt-2.5 border-t border-border space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      Payment Receipts Linked ({orderPayments.length})
                    </span>
                    <div className="space-y-1.5">
                      {orderPayments.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/60 text-xs">
                          <div>
                            <span className="font-mono font-bold text-foreground block">{p.receiptNumber || `SF-REC-${p.id.slice(-5)}`}</span>
                            <span className="text-[10px] text-muted-foreground">{p.paymentDate} • {p.paymentMethod}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{Number(p.paymentAmount || 0).toLocaleString('en-IN')}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptPayment(p)}
                              className="px-2 py-0.5 rounded bg-surface hover:bg-muted border border-border text-blue-600 dark:text-blue-400 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="View Official Digital Receipt"
                            >
                              <FileText size={11} />
                              <span>Receipt</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {['Draft', 'Submitted', 'Under Review'].includes(order.status) && (
                <div className="pt-2.5 mt-2 border-t border-border flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsDiscountModalOpen(true)}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800/60 transition-colors cursor-pointer"
                  >
                    Request Special Margin Override
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* E. Fulfilment & Production Factory Card */}
          <div className="bg-surface border border-border rounded-2xl p-4 md:p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-border">
              <Building2 size={16} className="text-blue-600 dark:text-blue-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Factory Allocation &amp; Dispatch
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <span className="text-muted-foreground block">Manufacturing Foundry</span>
                <span className="font-bold text-foreground text-sm block mt-0.5">
                  {order.manufacturerName || 'Apex Footwear Works'}
                </span>
                <span className="text-muted-foreground block text-[11px] mt-0.5">
                  {order.manufacturerPlant || 'Agra Unit 2 (Sikandra Area)'}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block">Batch Schedule</span>
                <span className="font-mono font-bold text-foreground block mt-0.5">
                  {order.batchNumber || 'Batch Scheduled on Line 2'}
                </span>
                <span className="text-muted-foreground block text-[11px] mt-0.5">
                  Est. Dispatch: {order.expectedDelivery || '28 Oct 2026'}
                </span>
              </div>
            </div>
          </div>

          {/* F. Order Lifecycle Timeline */}
          <div className="bg-surface border border-border rounded-2xl p-4 md:p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-1 border-b border-border">
              Consignment Progress Timeline
            </h4>

            <div className="space-y-3 pt-1">
              {order.timeline && order.timeline.length > 0 ? (
                order.timeline.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="mt-0.5 shrink-0">
                      {event.completed ? (
                        <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                      ) : event.active ? (
                        <Clock size={16} className="text-blue-600 dark:text-blue-400 animate-spin" />
                      ) : (
                        <Circle size={16} className="text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-semibold ${event.completed || event.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {event.step}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {event.date}
                        </span>
                      </div>
                      {event.notes && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {event.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No timeline events recorded yet.</p>
              )}
            </div>
          </div>

        </div>

        {/* 3. Footer Actions (Fixed at bottom) */}
        <div className="p-4 md:px-6 border-t border-border bg-surface flex items-center justify-between gap-3 shrink-0 shadow-lg">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-muted text-foreground text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer size={15} />
            <span>Print Invoice</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenFullDetail(order);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <ExternalLink size={14} />
              <span>Open Full Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Fullscreen Image Lightbox Modal */}
      {isLightboxOpen && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] bg-black/90 flex flex-col justify-between p-4 sm:p-6 text-white animate-in fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
            <div>
              <p className="font-bold text-sm sm:text-base">
                {activeItem?.designName}
              </p>
              <p className="font-mono text-xs text-slate-300">
                {activeItem?.articleCode} • {order.id}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {items.length > 1 && (
                <span className="text-xs font-mono text-slate-300 bg-white/10 px-2.5 py-1 rounded-full">
                  {selectedItemIndex + 1} / {items.length}
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image */}
          <div
            className="flex-1 flex items-center justify-center p-4 relative max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedItemIndex((prev) => (prev - 1 + items.length) % items.length)}
                className="absolute left-2 sm:left-6 p-3 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white transition-colors cursor-pointer z-10"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <img
              src={activeImage}
              alt={activeItem?.designName}
              className="max-h-full max-w-full object-contain rounded-2xl drop-shadow-2xl animate-in zoom-in-95 duration-150"
            />

            {items.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedItemIndex((prev) => (prev + 1) % items.length)}
                className="absolute right-2 sm:right-6 p-3 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white transition-colors cursor-pointer z-10"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Lightbox Footer Caption */}
          <div className="text-center text-xs text-slate-300 pb-2" onClick={(e) => e.stopPropagation()}>
            Click anywhere outside or press <kbd className="px-1.5 py-0.5 rounded bg-white/20 font-mono text-[11px]">Esc</kbd> to exit lightbox
          </div>
        </div>
      )}

      {/* Request Special Discount Modal */}
      {isDiscountModalOpen && (
        <RequestDiscountModal
          isOpen={isDiscountModalOpen}
          orderId={order.id}
          onClose={() => setIsDiscountModalOpen(false)}
          onSuccess={() => {
            setIsDiscountModalOpen(false);
            showToast('Discount request submitted for Trader authorization.');
          }}
        />
      )}

      {/* Standalone Receipt Preview Modal */}
      {selectedReceiptPayment && (
        <ReceiptPreviewModal
          open={Boolean(selectedReceiptPayment)}
          onClose={() => setSelectedReceiptPayment(null)}
          receipt={selectedReceiptPayment}
          customer={(() => {
            const cust = customers.find((c) => c.id === selectedReceiptPayment.customerId || c.id === order.customerId);
            if (!cust) return undefined;
            return {
              customerCode: cust.id,
              gstin: cust.gstin,
              phone: cust.phone,
              address: cust.address ? `${cust.address}, ${cust.city}, ${cust.state}` : `${cust.city || 'Agra'}, Uttar Pradesh`,
            };
          })()}
          status={mapPaymentStatusToReceiptStatus(selectedReceiptPayment.status)}
        />
      )}

      {/* Wholesale Order Tax Invoice & Consignment Receipt Preview Modal */}
      {isInvoiceModalOpen && order && (
        <InvoicePreviewModal
          open={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          order={order}
          customer={(() => {
            const cust = customers.find((c) => c.id === order.customerId);
            if (!cust) return undefined;
            return {
              customerCode: cust.id,
              gstin: cust.gstin,
              phone: cust.phone,
              address: cust.address ? `${cust.address}, ${cust.city}, ${cust.state}` : `${cust.city || 'Agra'}, Uttar Pradesh`,
            };
          })()}
        />
      )}
    </>
  );
};
