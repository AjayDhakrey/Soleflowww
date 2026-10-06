import React, { useEffect, useState } from 'react';
import { useReceiptData } from '../../hooks/useReceiptData';
import { ReceiptTemplate, generateReceiptFileName, exportReceiptToWord } from '../../components/payments/ReceiptTemplate';
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
  const [fileFormat, setFileFormat] = useState<'pdf' | 'word'>('pdf');
  const [isDownloading, setIsDownloading] = useState(false);

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
      const suggestedFileName = generateReceiptFileName(receipt, customer);
      document.title = suggestedFileName;
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
  }, [receipt, customer, autoPrint]);

  const handleDownload = async () => {
    if (!receipt) return;
    const suggestedFileName = generateReceiptFileName(receipt, customer);

    if (fileFormat === 'word') {
      exportReceiptToWord(receipt, company, customer, status, suggestedFileName);
      return;
    }

    const element = document.getElementById('rcpt-print-root');
    if (!element) return;

    setIsDownloading(true);
    try {
      // @ts-ignore
      const html2pdfModule = (await import('html2pdf.js')).default || (await import('html2pdf.js'));
      const opt = {
        margin: [8, 8, 8, 8] as [number, number, number, number],
        filename: `${suggestedFileName}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      };
      await html2pdfModule().set(opt).from(element).save();
    } catch (err) {
      console.warn('html2pdf fallback to window.print():', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

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
          {/* Format Selector: PDF or Word */}
          <div className="inline-flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setFileFormat('pdf')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                fileFormat === 'pdf'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              PDF (Default)
            </button>
            <button
              type="button"
              onClick={() => setFileFormat('word')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                fileFormat === 'word'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Word (.doc)
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            disabled={isDownloading}
            icon={Icons.Receipt}
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            {isDownloading ? 'Generating...' : '⬇️ Download'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Icons.Payments}
            onClick={handlePrint}
          >
            🖨️ Print
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
