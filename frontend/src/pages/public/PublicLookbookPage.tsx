import React, { useEffect, useState } from 'react';
import { supabase, isDemoModeActive } from '../../lib/supabase';
import { MOCK_DESIGNS } from '../../data/mockData';
import { resolveDesignImage } from '../../services/designImageUrl';
import { ShoeDesign } from '../../types';
import {
  Footprints,
  Layers,
  Sparkles,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Package,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

interface PublicLookbookPageProps {
  shareToken: string;
  onReturnToApp?: () => void;
}

export const PublicLookbookPage: React.FC<PublicLookbookPageProps> = ({
  shareToken,
  onReturnToApp,
}) => {
  const [designs, setDesigns] = useState<ShoeDesign[]>([]);
  const [clientInfo, setClientInfo] = useState<{ businessName?: string; city?: string } | null>(null);
  const [salesPhone, setSalesPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<ShoeDesign | null>(null);
  const [interestSubmitted, setInterestSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchSharedCatalog = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (supabase) {
          const { data, error: rpcError } = await (supabase as any).rpc('get_shared_designs', {
            p_share_token: shareToken,
          });

          if (!rpcError && data && (data as any).success) {
            const rawData = data as any;
            const sharedDesigns = await Promise.all((rawData.designs || []).map(async (design: ShoeDesign) => ({ ...design, image: await resolveDesignImage(design.image) })));
            if (isMounted) {
              setDesigns(sharedDesigns);
              setClientInfo(rawData.client || null);
              // Use the sharing org's real sales phone when the share payload provides one
              setSalesPhone(
                rawData.salesPhone || rawData.sales_phone || rawData.client?.phone || rawData.org?.phone || null
              );
              if (sharedDesigns.length > 0) {
                setSelectedDesign(sharedDesigns[0]);
              }
              setIsLoading(false);
              return;
            }
          }
        }

        // In demo mode or if RPC returned no rows for demo share tokens, fallback to sample catalogue
        if (isDemoModeActive || !supabase) {
          if (isMounted) {
            setDesigns(MOCK_DESIGNS.slice(0, 6));
            setClientInfo({ businessName: 'Wholesale Retailer Partner', city: 'Agra Footwear Hub' });
            setSalesPhone('+919876543210');
            if (MOCK_DESIGNS.length > 0) setSelectedDesign(MOCK_DESIGNS[0]);
            setIsLoading(false);
            return;
          }
        }

        // Invalid/expired token or database unavailable
        if (isMounted) {
          setError('This link is invalid or has expired');
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Failed to load shared lookbook:', err);
        if (isMounted) {
          setError(err?.message || 'This link is invalid or has expired');
          setIsLoading(false);
        }
      }
    };

    fetchSharedCatalog();

    return () => {
      isMounted = false;
    };
  }, [shareToken]);

  const handleWhatsAppEnquiry = (design?: ShoeDesign) => {
    if (!salesPhone) return;
    const item = design || selectedDesign;
    const text = item
      ? `Hello SoleFlow Team, I am interested in wholesale booking for Article *${item.articleCode} - ${item.name}* (Wholesale Rate: ₹${item.price}/pair, MOQ: ${item.moqPairs} pairs). Please share delivery schedule and sample terms.`
      : `Hello SoleFlow Team, I am interested in your wholesale shoe catalog.`;
    const whatsappUrl = `https://wa.me/${salesPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleExpressInterest = () => {
    setInterestSubmitted(true);
    setTimeout(() => {
      setInterestSubmitted(false);
    }, 4000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white font-sans">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading curated digital footwear catalog...</p>
      </div>
    );
  }

  if (error || designs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full text-center bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Lookbook Unavailable</h2>
          <p className="text-sm text-slate-400 mb-6">{error || 'This link is invalid or has expired'}</p>
          {onReturnToApp && (
            <button
              onClick={onReturnToApp}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Back to SoleFlow
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Footprints className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-white">SoleFlow</span>
              <span className="text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                Lookbook
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {clientInfo?.businessName ? `Curated for ${clientInfo.businessName}` : 'B2B Wholesale Footwear'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {salesPhone && (
            <button
              onClick={() => handleWhatsAppEnquiry()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Enquiry</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1 block">
              Wholesale Sample Collection
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white mb-2">
              Autumn / Festive 2026 Production Line
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ex-factory direct rates for wholesale traders & distributors. Ready size matrices, injection molded soles, and tested upper durability.
            </p>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {designs.map((design) => (
            <div
              key={design.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all flex flex-col group shadow-xl"
            >
              {/* Image */}
              <div className="relative aspect-video sm:aspect-square bg-slate-950 overflow-hidden">
                <img
                  src={design.image}
                  alt={design.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <span className="text-[10px] font-bold bg-black/75 backdrop-blur-md text-white px-2 py-0.5 rounded-md border border-white/10">
                    ART: {design.articleCode}
                  </span>
                  {design.marginBadge && (
                    <span className="text-[10px] font-bold bg-indigo-600/90 text-white px-2 py-0.5 rounded-md shadow">
                      {design.marginBadge}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="text-xs font-black bg-emerald-600/90 text-white px-2.5 py-1 rounded-lg shadow-md backdrop-blur-sm">
                    ₹{design.price.toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] font-normal">/ pair</span>
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    {design.category}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {design.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {design.soleType ? `Sole: ${design.soleType}` : design.upperMaterial}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-indigo-400" />
                    <span>MOQ: {design.moqPairs} pairs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{design.pairsPerCarton} Prs/Carton</span>
                  </div>
                </div>

                {/* Available Sizes */}
                {design.sizes && (
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400 mr-1">Sizes:</span>
                    {design.sizes.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                  {salesPhone && (
                    <button
                      onClick={() => handleWhatsAppEnquiry(design)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Book on WhatsApp</span>
                    </button>
                  )}
                  <button
                    onClick={handleExpressInterest}
                    className={`px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer ${
                      salesPhone ? '' : 'flex-1'
                    }`}
                  >
                    Interested
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {interestSubmitted && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Thank you! Your interest has been recorded with our sales desk.</span>
          </div>
        )}
      </main>
    </div>
  );
};
