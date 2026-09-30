import React, { useEffect, useState } from 'react';
import { useReceiptData } from '../../hooks/useReceiptData';
import { ReceiptTemplate } from '../../components/payments/ReceiptTemplate';
import { Icons } from '../../lib/icons';
import { Button } from '../../components/ui';

interface ReceiptPageProps {
  paymentId?: string;
  onBack?: () => void;
}

export const ReceiptPage: React.FC<ReceiptPageProps> = ({ paymentId: propPaymentId, onBack }) => {
  // Extract paymentId from props, pathname, or hash
  const getResolvedPaymentId = (): string => {
    if (propPaymentId) return propPaymentId;
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    const matchPath = pathname.match(/\/receipts\/([^?#/]+)/);
    if (matchPath) return matchPath[1];
    const matchHash = hash.match(/#receipts\/([^?#/]+)/);
    if (matchHash) return matchHash[1];
    return '';
  };

  const resolvedPaymentId = getResolvedPaymentId();
  const searchParams = new URLSearchParams(window.location.search);
  const autoPrint = searchParams.get('print') === '1' || window.location.hash.includes('print=1');
  const [copied, setCopied] = useState(false);

  const {
    receipt,
    company,
    customer,
    status,
    isLoading,
    isFound,
    hasAccess,
  } = useReceiptData(resolvedPaymentId);

  useEffect(() => {
    if (receipt) {
      const prevTitle = document.title;
      document.title = `Receipt-${receipt.receiptNumber}`;
      if (autoPrint) {
        // Wait briefly for logo and styles to render before triggering print dialog
        const timer = setTimeout(() => {
          window.print();
        }, 600);
        return () => {
          clearTimeout(timer);
          document.title = prevTitle;
        };
      }
      return () => {
        document.title = prevTitle;
      };
    }
  }, [receipt, autoPrint]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (!receipt) return;
    const url = `${window.location.origin}/receipts/${receipt.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (!receipt) return;
    const rawPhone = customer?.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const receiptLink = `${window.location.origin}/receipts/${receipt.id}`;
    
    const msg = `*Payment Receipt — ${company?.brandName || 'ShoeConnect'}*\n\n` +
      `Dear ${receipt.customerName},\n` +
      `We have received your payment of *₹${Number(receipt.paymentAmount).toLocaleString('en-IN')}* via *${receipt.paymentMethod}* on ${receipt.paymentDate}.\n` +
      `Receipt No: *${receipt.receiptNumber}*\n` +
      (receipt.utrRef ? `Reference / Instrument: ${receipt.utrRef}\n` : '') +
      `Balance Outstanding: *₹${Number(receipt.amountDueAfter).toLocaleString('en-IN')}*\n\n` +
      `View / Download Official Digital Receipt:\n${receiptLink}\n\n` +
      `Thank you for your business!`;

    const waUrl = phoneWithCode
      ? `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const handleBackNavigation = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Loading digital payment receipt...</p>
        </div>
      </div>
    );
  }

  if (!isFound || !receipt) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <Icons.Alert size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Receipt Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The payment receipt you are looking for does not exist or has been removed.
          </p>
          <Button variant="primary" onClick={handleBackNavigation} className="w-full justify-center">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Icons.Lock size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Access Denied</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You do not have permission to view receipts for accounts outside your assigned territory.
          </p>
          <Button variant="secondary" onClick={handleBackNavigation} className="w-full justify-center">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-6 px-3 sm:px-6">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="max-w-[794px] mx-auto mb-4 flex items-center justify-between gap-3 rcpt-noprint flex-wrap">
        <Button
          variant="secondary"
          size="sm"
          icon={Icons.ArrowLeft}
          onClick={handleBackNavigation}
        >
          Back
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={Icons.Share}
            onClick={handleCopyLink}
          >
            {copied ? 'Link Copied!' : 'Copy Link'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Icons.Export}
            onClick={handleSendWhatsApp}
            className="text-emerald-600 dark:text-emerald-400"
          >
            Send on WhatsApp
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Icons.Payments}
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Printable Receipt Container */}
      <div id="rcpt-print-root" className="max-w-[794px] mx-auto shadow-xl rounded-2xl overflow-hidden">
        <ReceiptTemplate
          receipt={receipt}
          company={company}
          customer={customer}
          status={status}
        />
      </div>
    </div>
  );
};

export default ReceiptPage;
