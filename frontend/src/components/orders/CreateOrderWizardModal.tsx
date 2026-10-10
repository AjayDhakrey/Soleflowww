import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderSizeMatrix } from '../../types';
import { Icons } from '../../lib/icons';
import { Button } from '../ui/Button';
import { discountRequestsService } from '../../services/discountRequests';

export const CreateOrderWizardModal: React.FC = () => {
  const {
    isCreateOrderModalOpen,
    setIsCreateOrderModalOpen,
    customers,
    selectedCustomer,
    designs,
    manufacturers,
    createOrder,
  } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCustId, setSelectedCustId] = useState(
    selectedCustomer ? selectedCustomer.id : customers[0]?.id || ''
  );
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

  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [tradeDiscountPercent, setTradeDiscountPercent] = useState<number>(8);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [appSettings, setAppSettings] = useState({
    defaultTradeDiscount: 8.0,
    maxTradeDiscount: 15.0,
    minMargin: 15.0,
  });

  React.useEffect(() => {
    discountRequestsService.fetchAppSettings().then((settings) => {
      setAppSettings(settings);
    });
  }, []);

  // Reset entire wizard state whenever modal opens
  React.useEffect(() => {
    if (isCreateOrderModalOpen) {
      setCurrentStep(1);
      setSelectedCustId(selectedCustomer ? selectedCustomer.id : customers[0]?.id || '');
      setSelectedDesignId(designs[0]?.id || '');
      setSelectedMfgId(manufacturers[0]?.id || '');
      setSizeMatrix([
        { size: 6, pairs: 30, cartons: 2, loose: 6 },
        { size: 7, pairs: 50, cartons: 4, loose: 2 },
        { size: 8, pairs: 60, cartons: 5, loose: 0, isFastMover: true },
        { size: 9, pairs: 40, cartons: 3, loose: 4 },
        { size: 10, pairs: 20, cartons: 1, loose: 8 },
      ]);
      setAdvanceAmount(0);
      setDiscountReason('');
      setTradeDiscountPercent(appSettings.defaultTradeDiscount || 8);
    }
  }, [isCreateOrderModalOpen, selectedCustomer, customers, designs, manufacturers, appSettings.defaultTradeDiscount]);

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

  // Business defaults (no UI override yet): 12 pairs per master carton and a
  // 12% GST footwear slab. Rate always comes from the article's catalog price.
  const totalPairs = sizeMatrix.reduce((s, i) => s + i.pairs, 0);
  const totalCartons = Math.floor(totalPairs / 12);
  const looseTotal = totalPairs % 12;

  const ratePerPair = currentDesign?.price || 0;
  const subtotal = totalPairs * ratePerPair;
  const discountAmount = Math.round((subtotal * tradeDiscountPercent) / 100);
  const taxableSubtotal = subtotal - discountAmount;
  const gstAmount = Math.round(taxableSubtotal * 0.12);
  const netTotalPayable = taxableSubtotal + gstAmount;
  const commercialBalance = Math.max(0, netTotalPayable - advanceAmount);

  const handleFinish = async () => {
    if (isSaving) return;
    if (!currentCust || !currentDesign || !currentMfg) return;

    if (!ratePerPair) {
      alert('The selected article has no wholesale rate configured. Set a catalog price before booking the order.');
      return;
    }

    const isOverride = tradeDiscountPercent > appSettings.defaultTradeDiscount;
    if (isOverride && !discountReason.trim()) {
      alert('Please provide a justification reason for requesting a special discount above the standard rate.');
      return;
    }

    // Order id and batch number are generated server-side (create_order_draft
    // RPC) — never fabricate them on the client. Margin-override requests are
    // raised from the order drawer once the real order id exists.
    setIsSaving(true);
    const saved = await createOrder({
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
      status: isOverride ? 'Under Review' : 'Submitted',
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
      expectedDelivery: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    });

    setIsSaving(false);
    if (!saved) return;
    setIsCreateOrderModalOpen(false);
  };

  const steps = [
    { num: 1, title: 'Retailer' },
    { num: 2, title: 'Article & Plant' },
    { num: 3, title: 'Size & Cartons' },
    { num: 4, title: 'Pricing & Terms' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Icons.Orders size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground tracking-tight">
                Create Wholesale Order Consignment
              </h3>
              <p className="text-xs text-muted-foreground">
                Step {currentStep} of 4: {steps[currentStep - 1]?.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOrderModalOpen(false)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
          >
            <Icons.Close size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Stepper Bar */}
        <div className="px-6 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
          {steps.map((step) => {
            const isDone = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isDone ? <Icons.Check size={14} strokeWidth={2.5} /> : step.num}
                </div>
                <span
                  className={`text-xs hidden sm:inline ${
                    isCurrent
                      ? 'font-bold text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Modal Form Step Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Step 1: Select Retailer */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Select Retail Store Account:
                </label>
                <select
                  value={selectedCustId}
                  onChange={(e) => setSelectedCustId(e.target.value)}
                  className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.businessName} ({c.propName}) — {c.city}, {c.state} • Due: ₹{c.amountDue.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {currentCust && (
                <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Contact / WhatsApp:</span>
                    <span className="font-semibold text-foreground">{currentCust.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GSTIN:</span>
                    <span className="font-mono text-foreground">{currentCust.gstin}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Approved Credit Limit:</span>
                    <span className="font-semibold text-foreground">₹{((currentCust.creditLimit || 500000) / 100000).toFixed(1)}L</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Article & Plant */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Select Footwear Article Model:
                </label>
                <select
                  value={selectedDesignId}
                  onChange={(e) => setSelectedDesignId(e.target.value)}
                  className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                >
                  {designs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.articleCode} — {d.name} (₹{d.price}/pr • {d.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Allocate Manufacturing Unit:
                </label>
                <select
                  value={selectedMfgId}
                  onChange={(e) => setSelectedMfgId(e.target.value)}
                  className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                >
                  {manufacturers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.companyName} ({m.hubLocation}) • Pass Rate: {m.qcPassRatio}% • Line Cap: {m.monthlyCapacityPairs} Prs
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Size Breakdown & Cartons */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Assorted Carton Ratio ({currentDesign?.name})
                  </h4>
                  <p className="text-xs text-muted-foreground">12 Pairs = 1 Master Carton</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => applyCurve('standard')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted hover:bg-muted/80 text-foreground cursor-pointer transition-colors"
                  >
                    Standard Curve
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCurve('heavy')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted hover:bg-muted/80 text-foreground cursor-pointer transition-colors"
                  >
                    Heavy 8-9 Curve
                  </button>
                </div>
              </div>

              {/* Size Matrix Table */}
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                {sizeMatrix.map((item) => (
                  <div
                    key={item.size}
                    className="p-3 bg-surface flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold text-sm flex items-center justify-center">
                        {item.size}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">
                          Size UK {item.size}
                        </span>
                        {item.isFastMover && (
                          <span className="ml-2 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                            Fast Mover
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-foreground block tabular-nums">
                          {item.cartons} Ctns
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {item.pairs} Prs
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateSizeQty(item.size, -12)}
                          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted cursor-pointer font-bold transition-colors"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSizeQty(item.size, 12)}
                          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted cursor-pointer font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Volume Strip */}
              <div className="p-4 rounded-xl bg-muted/60 border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground font-semibold block">Total Consignment Volume</span>
                  <span className="text-lg font-bold text-foreground tabular-nums">
                    {totalPairs} Pairs ({totalCartons} Master Cartons{looseTotal > 0 ? ` + ${looseTotal} Loose Prs` : ''})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Ex-Factory Base</span>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pricing & Advance */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Trade Discount (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={appSettings.maxTradeDiscount}
                    value={tradeDiscountPercent}
                    onChange={(e) => setTradeDiscountPercent(Number(e.target.value))}
                    className="w-full h-12 px-4 text-sm font-mono bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Standard wholesale discount: {appSettings.defaultTradeDiscount}%
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Advance Payment Deposited (₹)
                  </label>
                  <input
                    type="number"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                    className="w-full h-12 px-4 text-sm font-mono bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Recorded upon order booking
                  </span>
                </div>
              </div>

              {/* Special Discount Warning & Justification Reason Box */}
              {tradeDiscountPercent > appSettings.defaultTradeDiscount && (
                <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                    <span>Special Margin Authorization Required</span>
                    <span className="text-[10px] font-mono bg-purple-200 dark:bg-purple-900/60 px-1.5 py-0.2 rounded">
                      +{ (tradeDiscountPercent - appSettings.defaultTradeDiscount).toFixed(1) }% Override
                    </span>
                  </div>
                  <p className="text-xs text-purple-900/80 dark:text-purple-300/80 leading-relaxed">
                    Discounts exceeding standard {appSettings.defaultTradeDiscount}% will route to the Trader for authorization. Order status will be set to <strong>Under Review</strong>.
                  </p>
                  <div>
                    <label className="text-xs font-semibold text-purple-950 dark:text-purple-200 block mb-1">
                      Reason for Special Margin Concession *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      placeholder="e.g. Major festive multi-branch booking. Client matching local competitor pricing."
                      className="w-full p-2.5 text-xs rounded-xl bg-surface border border-purple-300 dark:border-purple-700 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Financial Calculation Sheet */}
              <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Goods Value ({totalPairs} Prs):</span>
                  <span className="tabular-nums text-foreground">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Trade Discount ({tradeDiscountPercent}%):</span>
                  <span className="tabular-nums">-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (12% Footwear Slab):</span>
                  <span className="tabular-nums text-foreground">+₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between font-bold text-base text-foreground font-display">
                  <span>Net Payable:</span>
                  <span className="tabular-nums">₹{netTotalPayable.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
                  <span>Balance Due on Dispatch:</span>
                  <span className="tabular-nums">₹{commercialBalance.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
              } else {
                setIsCreateOrderModalOpen(false);
              }
            }}
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>

          {currentStep < 4 ? (
            <Button
              variant="primary"
              onClick={() => setCurrentStep(currentStep + 1)}
              icon={Icons.ChevronRight}
              iconPosition="right"
            >
              Next Step
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={Icons.Check}
              onClick={handleFinish}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Generate Order Consignment'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
