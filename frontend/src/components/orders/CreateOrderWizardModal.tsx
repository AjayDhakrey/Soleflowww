import React, { useState } from 'react';
import {
  X,
  Check,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  Factory,
  ShieldCheck,
  Layers,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrderSizeMatrix } from '../../types';

export const CreateOrderWizardModal: React.FC = () => {
  const {
    isCreateOrderModalOpen,
    setIsCreateOrderModalOpen,
    customers,
    selectedCustomer,
    designs,
    manufacturers,
    createOrder,
    currentUser,
  } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(3); // Defaulting to step 3 as featured in Stitch screenshot!
  const [selectedCustId, setSelectedCustId] = useState(
    selectedCustomer ? selectedCustomer.id : customers[0]?.id || ''
  );

  React.useEffect(() => {
    if (selectedCustomer) {
      setSelectedCustId(selectedCustomer.id);
    }
  }, [selectedCustomer, isCreateOrderModalOpen]);
  const [selectedDesignId, setSelectedDesignId] = useState(designs[0]?.id || '');
  const [selectedMfgId, setSelectedMfgId] = useState(manufacturers[0]?.id || '');

  // Size matrix state
  const [sizeMatrix, setSizeMatrix] = useState<OrderSizeMatrix[]>([
    { size: 6, pairs: 30, cartons: 2, loose: 6 },
    { size: 7, pairs: 50, cartons: 4, loose: 2 },
    { size: 8, pairs: 60, cartons: 5, loose: 0, isFastMover: true },
    { size: 9, pairs: 40, cartons: 3, loose: 4 },
    { size: 10, pairs: 20, cartons: 1, loose: 8 },
  ]);

  const [advanceAmount, setAdvanceAmount] = useState<number>(100000);
  const [tradeDiscountPercent, setTradeDiscountPercent] = useState<number>(5);

  if (!isCreateOrderModalOpen) return null;

  const currentCust = customers.find((c) => c.id === selectedCustId) || customers[0];
  const currentDesign = designs.find((d) => d.id === selectedDesignId) || designs[0];
  const currentMfg = manufacturers.find((m) => m.id === selectedMfgId) || manufacturers[0];

  const updateSizeQty = (sizeNum: number, delta: number) => {
    setSizeMatrix((prev) =>
      prev.map((item) => {
        if (item.size === sizeNum) {
          const newPairs = Math.max(0, item.pairs + delta);
          const pairsPerCarton = 12;
          const fullCartons = Math.floor(newPairs / pairsPerCarton);
          const loose = newPairs % pairsPerCarton;
          return { ...item, pairs: newPairs, cartons: fullCartons, loose };
        }
        return item;
      })
    );
  };

  const applyCurve = (type: 'standard' | 'heavy') => {
    if (type === 'standard') {
      setSizeMatrix([
        { size: 6, pairs: 30, cartons: 2, loose: 6 },
        { size: 7, pairs: 50, cartons: 4, loose: 2 },
        { size: 8, pairs: 60, cartons: 5, loose: 0, isFastMover: true },
        { size: 9, pairs: 40, cartons: 3, loose: 4 },
        { size: 10, pairs: 20, cartons: 1, loose: 8 },
      ]);
    } else {
      setSizeMatrix([
        { size: 6, pairs: 20, cartons: 1, loose: 8 },
        { size: 7, pairs: 40, cartons: 3, loose: 4 },
        { size: 8, pairs: 80, cartons: 6, loose: 8, isFastMover: true },
        { size: 9, pairs: 70, cartons: 5, loose: 10 },
        { size: 10, pairs: 50, cartons: 4, loose: 2 },
      ]);
    }
  };

  const totalPairs = sizeMatrix.reduce((s, i) => s + i.pairs, 0);
  const totalCartons = Math.floor(totalPairs / 12);
  const looseTotal = totalPairs % 12;

  const ratePerPair = currentDesign.price;
  const subtotal = totalPairs * ratePerPair;
  const discountAmount = Math.round((subtotal * tradeDiscountPercent) / 100);
  const taxableSubtotal = subtotal - discountAmount;
  const gstAmount = Math.round(taxableSubtotal * 0.12);
  const netTotalPayable = taxableSubtotal + gstAmount;
  const commercialBalance = Math.max(0, netTotalPayable - advanceAmount);

  const handleFinish = () => {
    createOrder({
      customerId: currentCust.id,
      customerName: currentCust.businessName,
      customerCity: currentCust.city,
      customerState: currentCust.state,
      propName: currentCust.propName,
      pairsCount: totalPairs,
      cartonsCount: totalCartons,
      wholesaleRate: ratePerPair,
      subtotal: subtotal,
      tradeDiscountPercent: tradeDiscountPercent,
      tradeDiscountAmount: discountAmount,
      taxableSubtotal: taxableSubtotal,
      gstPercent: 12,
      gstAmount: gstAmount,
      netPayable: netTotalPayable,
      advanceDeposited: advanceAmount,
      balanceDue: commercialBalance,
      manufacturerId: currentMfg.id,
      manufacturerName: currentMfg.companyName,
      manufacturerPlant: currentMfg.hubLocation,
      items: [
        {
          designId: currentDesign.id,
          designName: currentDesign.name,
          articleCode: currentDesign.articleCode,
          image: currentDesign.image,
          ratePerPair: ratePerPair,
          sizeBreakdown: sizeMatrix,
          totalPairs: totalPairs,
          totalCartons: totalCartons,
          loosePairs: looseTotal,
          itemSubtotal: subtotal,
        },
      ],
    });
    setIsCreateOrderModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                New Order
              </span>
            </div>
            <h2 className="font-extrabold text-lg text-slate-900">
              {currentStep === 1 && 'Step 1: Select Retail Customer'}
              {currentStep === 2 && 'Step 2: Choose Shoe Design SKU'}
              {currentStep === 3 && 'Step 3: Size Breakdown, Factory Routing & Commercials'}
              {currentStep === 4 && 'Step 4: Commercial Advance & Terms'}
              {currentStep === 5 && 'Step 5: Review & Submit Order'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Step Pills */}
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold">
              <span
                onClick={() => setCurrentStep(1)}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  currentStep === 1
                    ? 'bg-slate-900 text-white'
                    : currentStep > 1
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-400'
                }`}
              >
                ✓ 1. Customer
              </span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span
                onClick={() => setCurrentStep(2)}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  currentStep === 2
                    ? 'bg-slate-900 text-white'
                    : currentStep > 2
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-400'
                }`}
              >
                ✓ 2. Designs
              </span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span
                onClick={() => setCurrentStep(3)}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  currentStep === 3
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500'
                }`}
              >
                3. Qty &amp; Rate
              </span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span
                onClick={() => setCurrentStep(4)}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  currentStep === 4
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-400'
                }`}
              >
                4. Payment
              </span>
            </div>

            <button
              onClick={() => setIsCreateOrderModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: Select Customer */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                Choose wholesale customer account:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustId(c.id);
                      setCurrentStep(2);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedCustId === c.id
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">
                        {c.businessName}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {c.tier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {c.city}, {c.state} • Rep: {c.salespersonName}
                    </p>
                    <p className="text-xs font-semibold text-slate-700 mt-2">
                      Credit Limit: ₹{(c.creditLimit / 100000).toFixed(1)}L | Due: ₹{(c.amountDue / 100000).toFixed(2)}L
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Choose Design SKU */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  Select Footwear Design SKU:
                </h3>
                <span className="text-xs text-slate-500">
                  Customer: <strong>{currentCust.businessName}</strong>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {designs.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setSelectedDesignId(d.id);
                      setCurrentStep(3);
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedDesignId === d.id
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img
                      src={d.image}
                      alt={d.name}
                      className="w-full h-36 rounded-xl object-cover"
                    />
                    <div className="mt-2.5">
                      <span className="text-[10px] font-mono text-blue-600 font-bold">
                        {d.articleCode}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{d.name}</h4>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        ₹{d.price.toLocaleString('en-IN')} / pair
                      </p>
                      <p className="text-[10px] text-slate-400">MOQ: {d.moqPairs} Pairs</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Size Breakdown, Factory Routing & Commercials (Exact Match to Screenshot 8!) */}
          {currentStep === 3 && (
            <div className="space-y-5">
              {/* Context Summary Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      AF
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">
                          {currentCust.businessName}
                        </h4>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                          {currentCust.tier}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {currentCust.address} • Rep: {currentCust.salespersonName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Change
                  </button>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentDesign.image}
                      alt={currentDesign.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {currentDesign.name} ({currentDesign.articleCode})
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {currentDesign.soleType} • {currentDesign.pairsPerCarton} Pairs/Master Carton
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Switch SKU
                  </button>
                </div>
              </div>

              {/* Grid: Left Size Distribution Matrix & Factory, Right Commercial Terms */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 Cols: Matrix */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">
                        Size Distribution Matrix
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => applyCurve('standard')}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                      >
                        Standard Curve
                      </button>
                      <button
                        onClick={() => applyCurve('heavy')}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                      >
                        Heavy Large
                      </button>
                    </div>
                  </div>

                  {/* Size Matrix Rows */}
                  <div className="space-y-2 bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200">
                    {sizeMatrix.map((item) => (
                      <div
                        key={item.size}
                        className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80"
                      >
                        <div className="w-24">
                          <span className="text-xs font-bold text-slate-900 block">
                            Size UK {item.size}
                          </span>
                          {item.isFastMover && (
                            <span className="text-[9px] font-bold text-emerald-600 block">
                              Fast Mover
                            </span>
                          )}
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateSizeQty(item.size, -10)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-bold text-sm text-slate-900 font-mono">
                            {item.pairs}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateSizeQty(item.size, 10)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>

                        {/* Cartons Calculation */}
                        <div className="text-right w-36">
                          <span className="text-xs font-bold text-slate-800">
                            {(item.pairs / 12).toFixed(1)} Cartons
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {item.cartons * 12} in ctn + {item.loose} loose
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Batch Allocation Callout */}
                  <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                        TOTAL BATCH ALLOCATION
                      </span>
                      <span className="text-lg font-black text-blue-950 font-display">
                        {totalPairs} Pairs
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                        Master Cartons Equivalent
                      </span>
                      <span className="text-xs font-bold text-blue-900 font-mono">
                        {totalCartons} Cartons + {looseTotal} Loose
                      </span>
                    </div>
                  </div>

                  {/* Manufacturing Facility Allocation */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Factory className="w-3.5 h-3.5 text-slate-500" />
                      <span>Manufacturing Facility Allocation</span>
                    </label>
                    <select
                      value={selectedMfgId}
                      onChange={(e) => setSelectedMfgId(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    >
                      {manufacturers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.companyName} ({m.hubLocation} - {m.loadPercentage}% load) - Estimated {m.toolingLeadTimeDays} Days
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500">
                      ● Plant has active mold for {currentDesign.articleCode} dual-density sole. Zero re-tooling lag.
                    </p>
                  </div>
                </div>

                {/* Right 5 Cols: Financial Ledger */}
                <div className="lg:col-span-5 bg-slate-50 p-4 rounded-3xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          COMMERCIAL TERMS
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900">
                          Financial Ledger
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                        GST 12% Slab
                      </span>
                    </div>

                    <div className="py-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Wholesale Unit Rate</span>
                        <span className="font-bold text-slate-900">
                          ₹{ratePerPair.toLocaleString('en-IN')} / pair
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Subtotal ({totalPairs} pairs × ₹{ratePerPair})</span>
                        <span className="font-bold text-slate-900 font-mono">
                          ₹{subtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Trade Discount ({tradeDiscountPercent}% Bulk)</span>
                        <span className="font-bold text-emerald-600 font-mono">
                          -₹{discountAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Taxable Subtotal</span>
                        <span className="font-bold text-slate-900 font-mono">
                          ₹{taxableSubtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>GST (12% Footwear)</span>
                        <span className="font-bold text-slate-900 font-mono">
                          +₹{gstAmount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-slate-900">Net Total Payable</span>
                        <span className="font-black text-base text-slate-900 font-mono">
                          ₹{netTotalPayable.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 pt-1">
                        <span>Advance Deposited (RTGS)</span>
                        <span className="font-bold text-blue-700 font-mono">
                          ₹{advanceAmount.toLocaleString('en-IN')} ({((advanceAmount / netTotalPayable) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    {/* Commercial Balance Box */}
                    <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xs mt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        COMMERCIAL BALANCE
                      </span>
                      <div className="flex items-baseline justify-between mt-0.5">
                        <span className="text-xs text-slate-300">Still to Pay on Dispatch:</span>
                        <span className="text-base font-black text-amber-300 font-mono">
                          ₹{commercialBalance.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Credit terms: Balance payable upon bilty delivery generation at Hing Ki Mandi godown.
                      </p>
                    </div>

                    {/* Credit Limit Verification Box */}
                    <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200/80 text-[11px] text-blue-900">
                      Buyer credit score is <strong>Verified (AAA)</strong>. Maximum exposure allowed: ₹6,00,000. Current order uses 44% of headroom.
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 space-y-2">
                    <button
                      onClick={handleFinish}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <span>
                        {currentUser.role === 'admin'
                          ? 'Approve & Transmit to Factory ->'
                          : 'Submit Order for Admin Approval ->'}
                      </span>
                    </button>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Back: Designs
                      </button>
                      <button
                        onClick={handleFinish}
                        className="py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Draft
                      </button>
                      <button
                        onClick={() => alert('Generating Factory Job Card Slip...')}
                        className="py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Job Card
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
