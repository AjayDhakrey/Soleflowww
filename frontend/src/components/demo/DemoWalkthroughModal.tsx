import React from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  CheckCircle2,
  ArrowRight,
  Users,
  Layers,
  ShoppingBag,
  CreditCard,
  Factory,
  History,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DemoWalkthroughModalProps {
  onNavigate: (path: string) => void;
}

export const DemoWalkthroughModal: React.FC<DemoWalkthroughModalProps> = ({ onNavigate }) => {
  const {
    isWalkthroughOpen,
    setIsWalkthroughOpen,
    walkthroughStep,
    setWalkthroughStep,
    currentUser,
    switchRole,
    setIsShareModalOpen,
    setIsCreateOrderModalOpen,
    setIsPaymentModalOpen,
    customers,
    setSelectedCustomer,
    showToast,
  } = useApp();

  if (!isWalkthroughOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: 'Trader Control Dashboard',
      role: 'admin',
      path: '/admin/dashboard',
      description: 'The Trader logs in and views the central business control tower: Active Accounts, Total Receivables, Open Production Batches, and Overdue Priority Queue.',
      actionLabel: 'Go to Trader Dashboard',
      icon: Users,
    },
    {
      step: 2,
      title: 'Customer Accounts & Ledger',
      role: 'admin',
      path: '/admin/customers',
      description: 'Inspect buyer credit limit, total business, balance due, and click on any client to view their immutable running ledger (Debit vs Credit).',
      actionLabel: 'Inspect ABC Footwear Ledger',
      action: () => {
        setSelectedCustomer(customers[0]);
      },
      icon: Users,
    },
    {
      step: 3,
      title: 'Shoe Designs Catalogue & SKUs',
      role: 'admin',
      path: '/admin/designs',
      description: 'Browse wholesale catalogue articles, wholesale rates (₹/pair), MOQ in cartons, sole types, and margin badges.',
      actionLabel: 'Open Designs Catalogue',
      icon: Layers,
    },
    {
      step: 4,
      title: 'Share WhatsApp Lookbook',
      role: 'admin',
      path: '/admin/designs',
      description: 'Select multiple footwear designs and trigger the WhatsApp digital lookbook dispatch modal with pre-packed carton details.',
      actionLabel: 'Open Share Lookbook Modal',
      action: () => {
        setIsShareModalOpen(true);
      },
      icon: Sparkles,
    },
    {
      step: 5,
      title: 'Create Wholesale Order Wizard',
      role: 'admin',
      path: '/admin/orders',
      description: 'Open the 5-step order wizard: Select Customer → Choose SKU → Size Distribution Curve → GST 12% Financial Ledger → Factory Routing.',
      actionLabel: 'Launch Order Wizard',
      action: () => {
        setIsCreateOrderModalOpen(true);
      },
      icon: ShoppingBag,
    },
    {
      step: 6,
      title: 'Manufacturing Plants & Foundries',
      role: 'admin',
      path: '/admin/manufacturers',
      description: 'Review factory load capacities (Agra, Kanpur, Noida), running batches, mold availability, and QC pass ratios.',
      actionLabel: 'View Plant Capacities',
      icon: Factory,
    },
    {
      step: 7,
      title: 'Record Payment & Settle Balance',
      role: 'admin',
      path: '/admin/payments',
      description: 'Record incoming payment via UPI/NEFT/Cheque with instant before-and-after balance calculation and automatic SMS/WhatsApp receipt.',
      actionLabel: 'Open Record Payment Modal',
      action: () => {
        setIsPaymentModalOpen(true);
      },
      icon: CreditCard,
    },
    {
      step: 8,
      title: 'Audit Log & Complete Traceability',
      role: 'admin',
      path: '/admin/audit-log',
      description: 'Reconstruct who did what, when, to which record, and view exact state diffs for total administrative and tax audit integrity.',
      actionLabel: 'Inspect Audit Trail',
      icon: History,
    },
    {
      step: 9,
      title: 'Switch to Sales Rep Field Portal',
      role: 'salesperson',
      path: '/sales/dashboard',
      description: 'Switch operational mode to Salesperson (Rahul Sharma) to view territory quota, assigned accounts, follow-up reminders, and field visit logs.',
      actionLabel: 'Switch to Sales Rep Mode',
      action: () => {
        switchRole('salesperson');
      },
      icon: ShieldCheck,
    },
  ];

  const current = demoSteps[walkthroughStep] || demoSteps[0];
  const Icon = current.icon;

  const handleStepAction = () => {
    if (current.role !== currentUser.role) {
      switchRole(current.role as 'admin' | 'salesperson');
    }
    onNavigate(current.path);
    if (current.action) {
      current.action();
    }
  };

  const handleNext = () => {
    if (walkthroughStep < demoSteps.length - 1) {
      const nextStep = walkthroughStep + 1;
      setWalkthroughStep(nextStep);
      const nextDemo = demoSteps[nextStep];
      if (nextDemo.role !== currentUser.role) {
        switchRole(nextDemo.role as 'admin' | 'salesperson');
      }
      onNavigate(nextDemo.path);
      if (nextDemo.action) {
        nextDemo.action();
      }
    } else {
      setIsWalkthroughOpen(false);
      showToast('Completed the End-to-End Prototype Demonstration!');
    }
  };

  const handlePrev = () => {
    if (walkthroughStep > 0) {
      const prevStep = walkthroughStep - 1;
      setWalkthroughStep(prevStep);
      const prevDemo = demoSteps[prevStep];
      if (prevDemo.role !== currentUser.role) {
        switchRole(prevDemo.role as 'admin' | 'salesperson');
      }
      onNavigate(prevDemo.path);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] max-w-md w-full p-2 select-none animate-in slide-in-from-bottom-5">
      <div className="bg-slate-900/95 backdrop-blur-xl text-white rounded-3xl p-5 shadow-2xl border border-slate-700/80 space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Interactive Prototype Storyline (Section 21)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">
              {walkthroughStep + 1} / {demoSteps.length}
            </span>
            <button
              onClick={() => setIsWalkthroughOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Walkthrough Guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300 shrink-0">
            <Icon className="w-5 h-5" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-white truncate">
                {current.step}. {current.title}
              </h4>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
                {current.role === 'admin' ? 'Trader' : 'Sales Rep'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {current.description}
            </p>
          </div>
        </div>

        {/* Action Trigger */}
        <button
          onClick={handleStepAction}
          className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <span>{current.actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* Stepper Navigation */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
          <button
            onClick={handlePrev}
            disabled={walkthroughStep === 0}
            className={`flex items-center gap-1 font-semibold ${
              walkthroughStep === 0
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-white cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-1">
            {demoSteps.map((s, idx) => (
              <span
                key={s.step}
                onClick={() => setWalkthroughStep(idx)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                  walkthroughStep === idx
                    ? 'w-4 bg-blue-400'
                    : idx < walkthroughStep
                    ? 'bg-emerald-400'
                    : 'bg-slate-700'
                }`}
                title={s.title}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            <span>{walkthroughStep === demoSteps.length - 1 ? 'Finish' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
