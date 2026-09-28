import React, { useState } from 'react';
import {
  Calculator,
  Package,
  Truck,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface WholesaleCalculatorProps {
  onOpenOrderWizard?: () => void;
}

export const WholesaleCalculator: React.FC<WholesaleCalculatorProps> = ({ onOpenOrderWizard }) => {
  const [sizeCurve, setSizeCurve] = useState<'mens' | 'womens' | 'unisex'>('mens');
  const [cartonCount, setCartonCount] = useState<number>(25); // Master cartons
  const [articleFobPrice, setArticleFobPrice] = useState<number>(750); // ₹ per pair wholesale
  const [targetRetailPrice, setTargetRetailPrice] = useState<number>(1899); // ₹ MSRP
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Pre-pack distribution (Pairs per 24-pair master carton)
  const sizeCurves = {
    mens: {
      label: "Adult Men's Pro-Run",
      sizes: ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'],
      ratio: [2, 4, 6, 6, 4, 2], // Sum = 24 pairs
      pairsPerCarton: 24,
      cartonWeightKg: 18.5,
      cbmPerCarton: 0.14,
    },
    womens: {
      label: "Women's Comfort-Curve",
      sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41'],
      ratio: [2, 5, 7, 5, 3, 2], // Sum = 24 pairs
      pairsPerCarton: 24,
      cartonWeightKg: 14.8,
      cbmPerCarton: 0.12,
    },
    unisex: {
      label: 'Universal Sneaker Curve',
      sizes: ['EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43'],
      ratio: [3, 4, 5, 5, 4, 3], // Sum = 24 pairs
      pairsPerCarton: 24,
      cartonWeightKg: 16.2,
      cbmPerCarton: 0.13,
    },
  };

  const activeCurve = sizeCurves[sizeCurve];
  const totalPairs = cartonCount * activeCurve.pairsPerCarton;
  const totalFobAmount = totalPairs * articleFobPrice;
  const totalWeightKg = (cartonCount * activeCurve.cartonWeightKg).toFixed(1);
  const totalCbm = (cartonCount * activeCurve.cbmPerCarton).toFixed(2);
  const estimatedFreight = Math.round(cartonCount * 140); // Approx ₹140 per master carton freight
  const totalLandedCost = totalFobAmount + estimatedFreight;
  const landedCostPerPair = Math.round(totalLandedCost / totalPairs);

  const potentialRetailRevenue = totalPairs * targetRetailPrice;
  const grossProfit = potentialRetailRevenue - totalLandedCost;
  const marginPercentage = Math.round((grossProfit / potentialRetailRevenue) * 100);

  const handleCopySummary = () => {
    const summary = `SoleFlow Pre-Pack Quotation:
- Curve: ${activeCurve.label}
- Master Cartons: ${cartonCount} (${totalPairs.toLocaleString('en-IN')} Pairs)
- FOB Price/Pr: ₹${articleFobPrice}
- Total FOB: ₹${totalFobAmount.toLocaleString('en-IN')}
- Gross Weight: ${totalWeightKg} kg (${totalCbm} CBM)
- Estimated Landed/Pr: ₹${landedCostPerPair}
- Target Retail: ₹${targetRetailPrice} (Gross Margin: ${marginPercentage}%)`;
    navigator.clipboard?.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <section id="wholesale-calculator" className="cinematic-transparent-section py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 mb-3 tracking-wide">
            <Calculator className="w-3.5 h-3.5" />
            <span>Master Carton &amp; Pre-Pack Modeling</span>
            <span aria-hidden="true">·</span>
            <span>Commercial B2B Terms</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Wholesale Pre-Pack &amp; Margin Simulator
          </h2>
          <p className="cinematic-section-description mt-3 text-sm sm:text-base text-slate-600 leading-relaxed text-balance">
            Model accurate footwear size-curve assortments, volumetric weight, landed freight, and retail markup before booking master carton batch production.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Configuration Column (7 cols on lg) */}
          <div className="lg:col-span-7 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm space-y-5 sm:space-y-6">
            {/* 1. Size Curve Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                1. Select Assortment Size Curve
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['mens', 'womens', 'unisex'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSizeCurve(key)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      sizeCurve === key
                        ? 'bg-blue-50/70 border-blue-500 text-blue-900 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{sizeCurves[key].label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {sizeCurves[key].sizes[0]} – {sizeCurves[key].sizes[sizeCurves[key].sizes.length - 1]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Ratio Visualization Bar (3 cols on phone, 6 cols on sm+) */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">
                  Carton Ratio Breakdown (24 Prs / Carton)
                </span>
                <span className="text-[11px] font-mono text-blue-600 font-semibold">
                  {activeCurve.ratio.join(' : ')}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
                {activeCurve.sizes.map((sz, i) => (
                  <div key={sz} className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-400">{sz}</div>
                    <div className="text-sm font-black text-slate-900 tabular-nums">
                      {activeCurve.ratio[i]} <span className="text-[10px] font-normal text-slate-500">prs</span>
                    </div>
                    <div className="text-[9px] font-mono text-emerald-600 mt-0.5 truncate">
                      {(activeCurve.ratio[i] * cartonCount).toLocaleString('en-IN')} tot
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Master Cartons Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Master Carton Quantity
                </label>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base sm:text-lg font-black text-blue-600 tabular-nums font-mono">
                    {cartonCount}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Cartons</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-bold text-slate-800 tabular-nums">
                    {totalPairs.toLocaleString('en-IN')} Pairs
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={5}
                max={150}
                step={5}
                value={cartonCount}
                onChange={(e) => setCartonCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono mt-1">
                <span>5 (120 Prs)</span>
                <span>50 (1,200 Prs)</span>
                <span>150 (3,600 Prs)</span>
              </div>
            </div>

            {/* 4. Pricing Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 sm:pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Wholesale FOB Price / Pair (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min={200}
                    max={5000}
                    step={25}
                    value={articleFobPrice}
                    onChange={(e) => setArticleFobPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full h-10 pl-7 pr-3 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Retail MSRP / Pair (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min={400}
                    max={12000}
                    step={50}
                    value={targetRetailPrice}
                    onChange={(e) => setTargetRetailPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full h-10 pl-7 pr-3 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Column (5 cols on lg) */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                  Commercial Ledger Projection
                </span>
                <h3 className="text-lg font-bold text-white">Pre-Pack Wholesale Order</h3>
              </div>
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>

            {/* Financial Highlights */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Total Volume:</span>
                <span className="font-mono text-white font-bold tabular-nums">
                  {cartonCount} Master Cartons ({totalPairs.toLocaleString('en-IN')} Pairs)
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Wholesale FOB Value:</span>
                <span className="font-mono text-white font-bold tabular-nums text-sm">
                  ₹{totalFobAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Est. Freight &amp; Handling:</span>
                <span className="font-mono text-slate-300 tabular-nums">
                  ₹{estimatedFreight.toLocaleString('en-IN')} ({totalWeightKg} kg · {totalCbm} CBM)
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-slate-800">
                <span className="text-slate-300 font-semibold">Total Landed Investment:</span>
                <span className="font-mono text-emerald-400 font-extrabold text-base tabular-nums">
                  ₹{totalLandedCost.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Effective Landed Cost/Pair:</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  ₹{landedCostPerPair} / pair
                </span>
              </div>
            </div>

            {/* Retail Profitability Card */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Retail Shelf Revenue</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  {marginPercentage}% Gross Margin
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs text-slate-400">Estimated Turnover:</span>
                <span className="text-sm font-bold text-white font-mono tabular-nums">
                  ₹{potentialRetailRevenue.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Projected Margin:</span>
                <span className="text-sm font-black text-emerald-400 font-mono tabular-nums">
                  +₹{grossProfit.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={onOpenOrderWizard}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
              >
                <span>Book This Assortment Batch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleCopySummary}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Quotation Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Pre-Pack Spec for WhatsApp</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Full GST E-Invoicing &amp; HSN 6403/6404 trade compliant.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
