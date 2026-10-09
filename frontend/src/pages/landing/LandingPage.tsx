import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShoppingBag,
  Building,
  CheckCircle2,
  Layers,
  Activity,
  CreditCard,
  MapPin,
  TrendingUp,
  Package,
  X,
  Lock,
  Mail,
  FileText,
  Share2,
  Factory,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ShieldCheck,
  Zap,
  Camera,
  Star,
  Compass,
  Play,
  Pause,
  Sliders,
  Check,
  Search,
  SlidersHorizontal,
  Smartphone,
  Users,
  LayoutGrid,
  User as UserIcon,
  Building2,
  Phone,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../auth/AuthProvider';
import { WholesaleCalculator } from './WholesaleCalculator';

// High-fidelity image assets
import heroFootwearImg from '../../assets/images/hero_footwear_editorial_1790321154027.jpg';
import sneakerMotionImg from '../../assets/images/sneaker_motion_stride_1790321168010.jpg';
import leatherCraftImg from '../../assets/images/leather_craft_detail_1790321180013.jpg';
import outdoorBootImg from '../../assets/images/outdoor_technical_boot_1790321192724.jpg';
import walkingMotionBg from '../../assets/images/footwear_walking_motion_1790245134535.jpg';

interface LandingPageProps {
  onLoginSuccess: (role: 'admin' | 'salesperson') => void;
  isAlreadyLoggedIn?: boolean;
  onReturnToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginSuccess,
  isAlreadyLoggedIn = false,
  onReturnToDashboard,
}) => {
  const { signIn, signUp, quickDemoLogin } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [authRoleChoice, setAuthRoleChoice] = useState<'admin' | 'salesperson'>('admin');
  const [email, setEmail] = useState('admin@soleflow.com');
  const [password, setPassword] = useState('admin123');
  const [authError, setAuthError] = useState('');

  // Create Account (Sign up) form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signupRole, setSignupRole] = useState<'admin' | 'salesperson'>('admin');
  const [signupBusinessName, setSignupBusinessName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupZone, setSignupZone] = useState('Delhi-NCR & Western UP Hub');
  const [signupError, setSignupError] = useState('');
  const [isSubmittingSignup, setIsSubmittingSignup] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const prefillSignup = (role: 'admin' | 'salesperson') => {
    setSignupRole(role);
    setSignupError('');
    if (role === 'admin') {
      setSignupName('Vikram Malhotra');
      setSignupEmail('vikram@apexfootwear.com');
      setSignupPassword('soleflow2026');
      setSignupConfirmPassword('soleflow2026');
      setSignupBusinessName('Apex Footwear Wholesale');
      setSignupPhone('+91 98112 34567');
      setSignupZone('Delhi-NCR & Western UP Hub');
    } else {
      setSignupName('Arjun Rawat');
      setSignupEmail('arjun.rawat@soleflow.com');
      setSignupPassword('salesrep2026');
      setSignupConfirmPassword('salesrep2026');
      setSignupBusinessName('North Region Traveling Rep');
      setSignupPhone('+91 98234 56789');
      setSignupZone('Agra Footwear Manufacturing Belt');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!signupName.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@') || !signupEmail.includes('.')) {
      setSignupError('Please enter a valid work email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    if (signupConfirmPassword && signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setSignupError('Please accept the Terms of Service to continue.');
      return;
    }

    setIsSubmittingSignup(true);
    setIsSubmittingSignup(true);
    (async () => {
      const result = await signUp({
        fullName: signupName,
        email: signupEmail,
        password: signupPassword,
        businessName: signupBusinessName || (signupRole === 'admin' ? 'Apex Footwear Hub' : 'Field Sales Operations'),
        phone: signupPhone,
      });

      setIsSubmittingSignup(false);
      if (result.success) {
        setIsAuthModalOpen(false);
        onLoginSuccess(signupRole);
      } else {
        setSignupError(result.error || 'Failed to create account. Please try again.');
      }
    })();
  };

  // Interactive Prompt Generator State (Hercules-style)
  const [activeArchetype, setActiveArchetype] = useState<string>('factory');
  const [promptText, setPromptText] = useState<string>(
    'Build a 24-pair master carton assortment for 600 injection runners with SATRA TM92 certification...'
  );
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [attachedSpec, setAttachedSpec] = useState<string | null>(null);

  // Case Studies Carousel State
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Archetype prompts mapping
  const archetypePrompts: Record<string, { label: string; prompt: string; icon: any }> = {
    factory: {
      label: 'Factory Production',
      prompt: 'Build a multi-stage lasting pipeline for 1,200 pairs of PU direct injection sneakers tracking upper cutting, stitch line, soling and QC pass...',
      icon: Factory,
    },
    lineSheets: {
      label: 'Wholesale Line Sheets',
      prompt: 'Create a digital line sheet for 350 retailers with 24-pair master carton size curves, FOB wholesale tiers, and 1-click WhatsApp export...',
      icon: Layers,
    },
    fieldSales: {
      label: 'Field Rep Routes',
      prompt: 'Build a GPS-geotagged route planner for 12 sales reps with offline dealer ordering, instant balance check, and sample bag stock sync...',
      icon: Users,
    },
    mobileApps: {
      label: 'Mobile Order App',
      prompt: 'Create a rapid footwear B2B order checkout app for retail shop owners with pre-pack curve assortment and instant GST invoice generation...',
      icon: Smartphone,
    },
  };

  const handleArchetypeClick = (key: string) => {
    setActiveArchetype(key);
    setPromptText(archetypePrompts[key].prompt);
  };

  const handleTryTagClick = (tag: string) => {
    switch (tag) {
      case '24-Pr Master Carton':
        setPromptText('Model a 24-pair master carton assortment with EU 40-45 ratio (2:4:6:6:4:2) and volumetric freight calculation...');
        break;
      case 'PU Injection Runner':
        setPromptText('Generate factory lasting specs for Apex Runner Pro with dual-density Phylon midsole and 180,000 SATRA TM92 flex cycles...');
        break;
      case 'Blake Welt Derby':
        setPromptText('Create artisan wholesale order for 240 pairs of Italian calfskin Blake-stitched derbies with vegetable tanned leather outsoles...');
        break;
      case 'Geotagged Visit':
        setPromptText('Log a verified store visit at Metro Footwear Hub with ₹4,20,000 outstanding ledger recovery and 5 master carton order...');
        break;
      case '30-Day Credit Aging':
        setPromptText('Enforce 30-day dealer credit limit lock with automated overdue payment reminders and post-dated cheque reconciliation...');
        break;
      default:
        break;
    }
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationResult({
        title: promptText.includes('Blake')
          ? 'Blake-Stitched Executive Production Run'
          : promptText.includes('Master Carton')
          ? '24-Pair Master Carton Pre-Pack Assortment'
          : promptText.includes('Visit')
          ? 'Geotagged Retailer Store Order & Ledger'
          : 'High-Performance Injection Batch SF-1024',
        article: promptText.includes('Blake') ? 'Firenze Blake Derby' : 'Apex Runner Pro SF-1024',
        volume: promptText.includes('Blake') ? '240 Pairs (20 Cartons)' : '600 Pairs (25 Cartons)',
        fob: promptText.includes('Blake') ? '₹1,350 / pair' : '₹780 / pair',
        qcStandard: 'SATRA TM92 Certified (Zero Delamination)',
        leadTime: '12 Working Days',
        status: 'Simulation Ready · Click below to launch in portal',
      });
    }, 700);
  };

  // Case Studies (matching Hercules image 3 cards layout)
  const caseStudies = [
    {
      id: 1,
      company: 'Kingdom Footwear Dist.',
      category: 'Wholesale Distribution',
      stat1: '$30k',
      label1: 'Saved per year',
      stat2: '4',
      label2: 'Vendors replaced',
      image: heroFootwearImg,
      quote: 'Consolidated order sheets, dealer credit control, and factory tracking into one unified system.',
    },
    {
      id: 2,
      company: 'The Sole Hut',
      category: 'Footwear Retail Chain',
      stat1: '30x',
      label1: 'Reorder velocity',
      stat2: '$50k',
      label2: 'Saved in deadstock',
      image: sneakerMotionImg,
      quote: 'Eliminated broken size-curves with automated 24-pair master carton ratio ordering.',
    },
    {
      id: 3,
      company: 'Sold Out Footwear',
      category: 'Athletic Brand',
      stat1: '30x',
      label1: 'Faster bulk releases',
      stat2: '75 hrs',
      label2: 'Saved a month',
      image: leatherCraftImg,
      quote: 'Automated digital line sheets with customized wholesale pricing for every distributor tier.',
    },
    {
      id: 4,
      company: 'Petony Footwear Logistics',
      category: 'Fleet & Dispatch',
      stat1: '+20%',
      label1: 'Revenue growth',
      stat2: '$230k',
      label2: 'Saved in transit',
      image: outdoorBootImg,
      quote: 'Real-time transport LR tracking and GST e-invoicing integrated straight with our dispatch docks.',
    },
    {
      id: 5,
      company: 'Gamatauri Shoes',
      category: 'OEM Leather Mill',
      stat1: '+$200k',
      label1: 'Added revenue',
      stat2: '49%',
      label2: 'Higher dealer retention',
      image: walkingMotionBg,
      quote: 'Connected our lasting factory lines directly to wholesale distributor orders with zero mispacking.',
    },
  ];

  // Testimonials (matching Hercules image 4 4x2 grid)
  const testimonials = [
    {
      id: 1,
      quote:
        '“I lost over $36k on a software agency that spent a year and never delivered. I built my company’s whole footwear trade operating system on SoleFlow in under a month.”',
      author: 'Sarah',
      role: 'Founder, Imjomat Footwear',
      avatarBg: 'bg-emerald-600',
      initials: 'S',
    },
    {
      id: 2,
      quote:
        '“I’m a full-stack engineer and shoe brand owner. I’ve tried dozens of ERP systems in 8 years. I built what I have now on SoleFlow in 15 days for about $1,000. It’s incredible.”',
      author: 'Airam',
      role: 'Founder, Pleno',
      avatarBg: 'bg-blue-600',
      initials: 'A',
    },
    {
      id: 3,
      quote:
        '“I found SoleFlow on a Friday evening and kept configuring until 3am. The next morning I showed my wholesale partners what I’d built and they were amazed.”',
      author: 'Doug Dostal',
      role: 'Founder, Reiliz Kicks',
      avatarBg: 'bg-amber-600',
      initials: 'D',
    },
    {
      id: 4,
      quote:
        '“As a non-technical founder, SoleFlow has already saved me thousands I would have spent on an ERP consultant and bespoke inventory developers.”',
      author: 'Brittany B.',
      role: 'Founder, B-Sole Footwear',
      avatarBg: 'bg-rose-600',
      initials: 'B',
    },
    {
      id: 5,
      quote:
        '“It took me an hour to configure an order portal that my whole 12-person sales team now uses every day. I can’t even code, but SoleFlow makes it that easy.”',
      author: 'Dorian P.',
      role: 'VP Operations, Apex Footwear',
      avatarBg: 'bg-indigo-600',
      initials: 'D',
    },
    {
      id: 6,
      quote:
        '“It cut my daily admin work from 12 hours down to maybe 1.5. SoleFlow rekindled something in me I thought I’d lost—the joy of building great shoes.”',
      author: 'Donnie Lee',
      role: 'Founder, Donald Lee Footwear',
      avatarBg: 'bg-slate-700',
      initials: 'DL',
    },
    {
      id: 7,
      quote:
        '“With SoleFlow I can set a different wholesale price for every product and every customer in seconds. My dealer reorders instantly went up.”',
      author: 'Thales',
      role: 'Founder, Gamatauri',
      avatarBg: 'bg-teal-600',
      initials: 'T',
    },
    {
      id: 8,
      quote:
        '“A pre-pack size breakdown used to take me an hour. Now it’s instant, and it generates the factory production ticket and GST invoice automatically.”',
      author: 'David Restrepo',
      role: 'VP Logistics, Sold Out',
      avatarBg: 'bg-purple-600',
      initials: 'DR',
    },
  ];

  // Frequently Asked Questions (matching Hercules image 5)
  const faqs = [
    {
      q: 'What is SoleFlow?',
      a: 'SoleFlow is the specialized B2B operating system and software platform built specifically for footwear wholesale distributors, OEM manufacturing mills, and traveling sales teams. It manages master carton size curves, factory lasting milestones, field rep GPS routes, dealer credit limits, and WhatsApp digital line sheets.',
    },
    {
      q: 'How does SoleFlow work?',
      a: 'SoleFlow unifies your entire footwear trade cycle: designers upload article CAD and specs, traders configure master carton pre-pack ratios, traveling reps capture geotagged dealer orders on tablets, factories update real-time lasting gates (Cutting, Stitching, Soling, QC), and accountants track 30/60/90-day aging receivables.',
    },
    {
      q: 'What can I build and run with SoleFlow?',
      a: 'You can run complete dealer ordering portals, digital lookbooks with customized wholesale tier pricing, factory batch tracking pipelines, sales rep route management with sample bag checkouts, and automated GST-compliant e-invoices with HSN 6403/6404 codes.',
    },
    {
      q: 'What features are built into SoleFlow for master carton size curves?',
      a: 'SoleFlow has a built-in pre-pack modeling engine that automatically calculates pairs per carton (e.g. 24 pairs with a 2:4:6:6:4:2 ratio), volumetric weight, CBM freight estimates, and projected retail profit margins before factory production starts.',
    },
    {
      q: 'Do I need coding or ERP experience?',
      a: 'No. SoleFlow is designed for footwear industry business owners, merchandisers, and sales reps. You can start with our pre-loaded footwear catalog and sample data in 1 click.',
    },
    {
      q: 'Can field reps work offline during store visits?',
      a: 'Yes. Traveling reps can browse digital line sheets, check customer credit limits, and capture orders in retail shops even with intermittent or zero internet connectivity. Data synchronizes automatically once back online.',
    },
    {
      q: 'How are factory production gates and quality tests tracked?',
      a: 'Every production order moves through standard industrial milestones: Upper Leather Die Cutting, Closing & Stitching, PU Injection / Blake Welt Lasting, and Quality Inspection. SATRA TM92 flex cycle test certifications and batch barcodes are verified before master carton packing.',
    },
    {
      q: 'Can I export digital line sheets directly to WhatsApp?',
      a: 'Yes! SoleFlow generates high-resolution, branded digital line sheets and PDF catalogs with 1 click. You can select whether to show MSRP, wholesale FOB, or custom dealer tier discounts when sharing via WhatsApp or email.',
    },
  ];

  const handleInstantLogin = (role: 'admin' | 'salesperson') => {
    const res = quickDemoLogin(role);
    if (res.success) {
      onLoginSuccess(role);
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const result = await signIn(email, password);
    if (result.success) {
      onLoginSuccess(result.role || (email.includes('sales') ? 'salesperson' : 'admin'));
    } else {
      setAuthError(result.error || 'Invalid credentials. Please use demo buttons or check your email/password.');
    }
  };

  return (
    <div className="min-h-screen bg-diamond-pattern text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. FLOATING PILL TOP NAVIGATION BAR (Exact Hercules styling)             */}
      {/* ========================================================================= */}
      <div className="sticky top-2 sm:top-3 z-50 px-2 sm:px-6">
        <header className="max-w-5xl mx-auto h-12 sm:h-14 bg-white/95 backdrop-blur-md px-3 sm:px-5 rounded-full border border-slate-200/90 shadow-sm flex items-center justify-between transition-all">
          {/* Brand Wordmark with Lion/Sole Logo */}
          <a href="#hero" className="flex items-center gap-2 text-sm sm:text-base font-black tracking-tight text-slate-900 shrink-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 14.5L7 12l3 2.5 3-2.5 3 2.5 4-3.5v5c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-3.5z" />
                <path d="M4 9c0-1.1.9-2 2-2h4l4 4h4a2 2 0 0 1 2 2v1.5" />
              </svg>
            </div>
            <span className="font-extrabold tracking-tight">SoleFlow</span>
          </a>

          {/* Clean Nav Links (matching Hercules) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-xs font-semibold text-slate-600">
            <a href="#capabilities" className="hover:text-slate-900 transition-colors">
              Docs
            </a>
            <a href="#case-studies" className="hover:text-slate-900 transition-colors">
              Case Studies
            </a>
            <a href="#wholesale-calculator" className="hover:text-slate-900 transition-colors">
              Pricing
            </a>
            <a href="#faqs" className="hover:text-slate-900 transition-colors">
              Support
            </a>
          </nav>

          {/* Action Buttons: Log in + Create account / Demo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {isAlreadyLoggedIn ? (
              <button
                onClick={onReturnToDashboard}
                className="px-3 sm:px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-full transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span className="hidden sm:inline">Back to Portal</span>
                <span className="sm:hidden">Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer whitespace-nowrap"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setSignupError('');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 sm:px-4 py-1 sm:py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span>Create account</span>
                </button>
              </>
            )}
          </div>
        </header>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION WITH HERCULES PROMPT GENERATOR & DIAMOND GRID            */}
      {/* ========================================================================= */}
      <section id="hero" className="pt-8 pb-14 sm:pt-16 sm:pb-24 px-3 sm:px-6 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Main Headline (Exact Hercules composition) */}
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.14] text-balance">
            The Best{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
              Footwear B2B Platform
            </span>{' '}
            for Wholesale
          </h1>

          {/* Underlined Subtitle */}
          <p className="text-xs sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed text-balance px-2">
            Run wholesale orders, factory production &amp; field sales{' '}
            <span className="relative inline-block text-slate-800 font-semibold underline decoration-blue-500/60 decoration-2 underline-offset-4">
              without spreadsheet chaos
            </span>
          </p>

          {/* Archetype Filter Buttons (2x2 grid on mobile for perfect symmetry, flex on tablet/desktop) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 pt-1 max-w-sm sm:max-w-none mx-auto">
            {Object.entries(archetypePrompts).map(([key, item]) => {
              const IconComp = item.icon;
              const isActive = activeArchetype === key;
              return (
                <button
                  key={key}
                  onClick={() => handleArchetypeClick(key)}
                  className={`px-3 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
                    isActive
                      ? 'bg-white text-blue-700 border border-blue-400/80 shadow-xs ring-2 ring-blue-500/10 font-bold'
                      : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* The Central Interactive Generator Box (Exact Hercules Card Design) */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200/90 shadow-xl text-left space-y-3 sm:space-y-4 relative">
            {/* Input area */}
            <div className="relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={3}
                className="w-full text-xs sm:text-base font-medium text-slate-800 placeholder-slate-400 bg-transparent resize-none border-0 focus:outline-none focus:ring-0 leading-relaxed"
                placeholder="Describe your footwear wholesale assortment, master carton run, or dealer route..."
              />
            </div>

            {/* Bottom Row Inside Box: Attach Image & Build it Button */}
            <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-slate-100 gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <button
                  onClick={() => {
                    setAttachedSpec('Apex_Runner_TechPack_SF1024.pdf');
                  }}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{attachedSpec ? 'Tech Pack Γ£ô' : 'Attach Spec Sheet'}</span>
                </button>

                {attachedSpec && (
                  <span className="hidden sm:inline text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 truncate">
                    {attachedSpec}
                  </span>
                )}
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30 cursor-pointer shrink-0 disabled:opacity-75"
              >
                {isSimulating ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Modeling...</span>
                  </>
                ) : (
                  <>
                    <span>Build it</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Click Tags below box: Try it -> [ ... ] with centered wrapping */}
          <div className="pt-1 space-y-1.5">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500">
              <span>Try prompt examples:</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 max-w-lg mx-auto">
              {[
                '24-Pr Master Carton',
                'PU Injection Runner',
                'Blake Welt Derby',
                'Geotagged Visit',
                '30-Day Credit Aging',
              ].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTryTagClick(tag)}
                  className="px-2.5 sm:px-3 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-200/90 shadow-2xs text-[10px] sm:text-[11px] transition-colors cursor-pointer active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Trusted subtext */}
          <div className="pt-1">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
              Trusted by 350+ wholesale footwear distributors &amp; OEM factories
            </span>
          </div>
        </div>

        {/* Simulation Modal / Result Drawer */}
        <AnimatePresence>
          {simulationResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden text-left"
              >
                <div className="p-6 bg-slate-900 text-white relative">
                  <button
                    onClick={() => setSimulationResult(null)}
                    className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Live Simulation Generated</span>
                  </div>
                  <h3 className="text-xl font-black text-white">{simulationResult.title}</h3>
                  <p className="text-xs text-slate-300 mt-1">{simulationResult.qcStandard}</p>
                </div>

                <div className="p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Article Target</span>
                      <span className="font-bold text-slate-900 text-sm">{simulationResult.article}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Volume Allocation</span>
                      <span className="font-mono font-bold text-blue-600 text-sm">{simulationResult.volume}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Wholesale FOB</span>
                      <span className="font-mono font-bold text-slate-900">{simulationResult.fob}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Factory Lead Time</span>
                      <span className="font-bold text-emerald-600">{simulationResult.leadTime}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed">
                    This commercial batch is configured with 24-pair master carton curves, SATRA flex test thresholds, and automated GST e-invoicing.
                  </p>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => handleInstantLogin('admin')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
                    >
                      <span>Launch This Run in Trader Admin</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setSimulationResult(null);
                        const calc = document.getElementById('wholesale-calculator');
                        calc?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>Model Pre-Pack Curve &amp; Pricing</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* 3. CATEGORY / INDUSTRY CARDS STRIP (Matching Hercules bottom of hero)    */}
        {/* ========================================================================= */}
        <div className="max-w-6xl mx-auto pt-6 sm:pt-8">
          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 text-left">
            {[
              {
                title: 'Apex Runner Pro',
                category: 'Injection Athletic',
                icon: '≡ƒæƒ',
                stat: '180k Flex Cycles',
                image: sneakerMotionImg,
              },
              {
                title: 'Firenze Derby',
                category: 'Blake Calfskin',
                icon: '≡ƒæ₧',
                stat: '90k Wet/Dry Pass',
                image: leatherCraftImg,
              },
              {
                title: 'TerraGrip All-Weather',
                category: 'Commando Boots',
                icon: '≡ƒÑ╛',
                stat: '-20┬░C Crack Proof',
                image: outdoorBootImg,
              },
              {
                title: 'AeroGlide Knit',
                category: 'Ultralight Mesh',
                icon: '≡ƒÅâ',
                stat: '284g Featherweight',
                image: heroFootwearImg,
              },
              {
                title: 'Royal Footwear Mills',
                category: 'Direct OEM Soling',
                icon: '≡ƒÅ¡',
                stat: '99.4% QC Accept',
                image: walkingMotionBg,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  const caseStudies = document.getElementById('case-studies');
                  caseStudies?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-[155px] xs:w-[170px] sm:w-auto shrink-0 snap-start relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer border border-slate-200 shadow-2xs hover:shadow-md transition-all"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-semibold text-white flex items-center gap-1 border border-white/10">
                  <span>{item.icon}</span>
                  <span className="truncate max-w-[90px]">{item.category}</span>
                </div>

                {/* Bottom Title */}
                <div className="absolute bottom-2 inset-x-2">
                  <div className="text-xs font-bold text-white leading-tight truncate">{item.title}</div>
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold">{item.stat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CASE STUDIES CAROUSEL WITH DUAL STATS (Exact Hercules Screenshot 3)   */}
      {/* ========================================================================= */}
      <section id="case-studies" className="py-12 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          {/* Header (Matching Hercules "From idea to published app in minutes") */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              From line sheet to factory dispatch{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                in minutes
              </span>
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-base text-slate-600">
              Trusted by 350+ wholesale footwear distributors and high-capacity OEM mills across major trading hubs.
            </p>
          </div>

          {/* Carousel Cards: Horizontally swipeable with snap on mobile, clean grid on desktop */}
          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-3 -mx-3 px-3 sm:mx-0 sm:px-0">
            {caseStudies.map((study) => (
              <div
                key={study.id}
                className="w-[230px] sm:w-auto shrink-0 snap-center relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 text-white shadow-lg border border-slate-800 flex flex-col justify-end p-4 sm:p-5 group"
              >
                {/* Background Photo */}
                <img
                  src={study.image}
                  alt={study.company}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover object-center filter brightness-75 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                {/* Content Overlay (Matching Hercules Screenshot 3) */}
                <div className="relative z-10 space-y-2.5 sm:space-y-3">
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight truncate">{study.company}</h3>

                  {/* Dual Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20">
                    <div>
                      <div className="text-lg sm:text-xl font-black text-white font-mono">{study.stat1}</div>
                      <div className="text-[10px] text-slate-300 leading-tight mt-0.5">{study.label1}</div>
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-black text-white font-mono">{study.stat2}</div>
                      <div className="text-[10px] text-slate-300 leading-tight mt-0.5">{study.label2}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator & Link (Exact Hercules Screenshot 3) */}
          <div className="flex flex-col items-center justify-center gap-3 mt-8">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="w-6 h-2 rounded-full bg-blue-600" />
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="w-2 h-2 rounded-full bg-slate-300" />
            </div>

            <a
              href="#wholesale-calculator"
              className="text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View all case studies</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. WHOLESALE CALCULATOR (Pre-Pack Modeling)                              */}
      {/* ========================================================================= */}
      <WholesaleCalculator
        onOpenOrderWizard={() => {
          setIsAuthModalOpen(true);
        }}
      />

      {/* ========================================================================= */}
      {/* 7. CUSTOMER TESTIMONIALS (4x2 Grid matching Hercules Screenshot 4)       */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-diamond-pattern border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-2">
              Loved by Traders &amp; Manufacturers
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Neither have our customers
            </h2>
          </div>

          {/* 4x2 Grid (Exact layout from Screenshot 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* 5 Golden Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {t.quote}
                  </p>
                </div>

                {/* Author row with avatar photo */}
                <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
                  <div
                    className={`w-8 h-8 rounded-full ${t.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                  >
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{t.author}</div>
                    <div className="text-[10px] text-slate-500 truncate">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (Accordion matching Hercules Screenshot 5) */}
      {/* ========================================================================= */}
      <section id="faqs" className="py-16 sm:py-24 bg-diamond-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Frequently Asked Questions
            </h2>
          </div>

          {/* White Rounded Container */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="transition-colors">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/60 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-slate-900 pr-4">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. BOTTOM PROMPT CALL TO ACTION (Matching Hercules Screenshot 1 & 6)     */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-diamond-pattern-subtle border-t border-slate-200/80 text-center px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            Start building for free
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            No credit card required. Describe your footwear assortment and start production in seconds.
          </p>

          {/* Bottom Prompt Card (Exact Hercules Screenshot 1/6) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-lg text-left space-y-3">
            <textarea
              defaultValue="Build a master carton stock tracker for my injection running shoe line with 30-day dealer credit limits..."
              rows={2}
              className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 bg-transparent resize-none border-0 focus:outline-none focus:ring-0 leading-relaxed"
            />
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => setAttachedSpec('Running_Shoe_Sole_CAD.png')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-slate-400" />
                <span>Attach Image</span>
              </button>

              <button
                onClick={() => {
                  setAuthMode('signup');
                  setSignupError('');
                  setIsAuthModalOpen(true);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. LIGHT MULTI-COLUMN FOOTER (Exact Hercules Screenshot 1 & 6)          */}
      {/* ========================================================================= */}
      <footer className="bg-slate-50/80 border-t border-slate-200/90 py-14 text-xs text-slate-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Left Brand Col */}
            <div className="col-span-2 space-y-2">
              <div className="flex items-center gap-2 text-base font-black text-slate-900">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                  <svg
                    className="w-3.5 h-3.5 text-blue-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 14.5L7 12l3 2.5 3-2.5 3 2.5 4-3.5v5c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-3.5z" />
                    <path d="M4 9c0-1.1.9-2 2-2h4l4 4h4a2 2 0 0 1 2 2v1.5" />
                  </svg>
                </div>
                <span>SoleFlow</span>
              </div>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                The best footwear B2B operating system and line sheet builder for business.
              </p>
            </div>

            {/* Col 1: Product */}
            <div className="space-y-2.5">
              <div className="font-bold text-slate-900 text-xs">Product</div>
              <ul className="space-y-2 text-slate-500">
                <li>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setSignupError('');
                      setIsAuthModalOpen(true);
                    }}
                    className="hover:text-blue-600 transition-colors text-left cursor-pointer font-medium text-blue-600"
                  >
                    Create Account
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError('');
                      setIsAuthModalOpen(true);
                    }}
                    className="hover:text-blue-600 transition-colors text-left cursor-pointer"
                  >
                    Sign In
                  </button>
                </li>
                <li><a href="#wholesale-calculator" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                <li><a href="#wholesale-calculator" className="hover:text-blue-600 transition-colors">Pre-Pack Calculator</a></li>
                <li><a href="#capabilities" className="hover:text-blue-600 transition-colors">Skills</a></li>
              </ul>
            </div>

            {/* Col 2: Company */}
            <div className="space-y-2.5">
              <div className="font-bold text-slate-900 text-xs">Company</div>
              <ul className="space-y-2 text-slate-500">
                <li><a href="#case-studies" className="hover:text-blue-600 transition-colors">Case Studies</a></li>
                <li><span className="hover:text-blue-600 transition-colors cursor-pointer">Careers</span></li>
                <li><span className="hover:text-blue-600 transition-colors cursor-pointer">Affiliates</span></li>
                <li><span className="hover:text-blue-600 transition-colors cursor-pointer">Changelog</span></li>
              </ul>
            </div>

            {/* Col 3: Support & Connect */}
            <div className="space-y-2.5">
              <div className="font-bold text-slate-900 text-xs">Support</div>
              <ul className="space-y-2 text-slate-500">
                <li><a href="#capabilities" className="hover:text-blue-600 transition-colors">Docs</a></li>
                <li><a href="#faqs" className="hover:text-blue-600 transition-colors">Forum</a></li>
                <li><span className="hover:text-blue-600 transition-colors cursor-pointer">Status</span></li>
                <li><span className="hover:text-blue-600 transition-colors cursor-pointer">Contact us</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Legal Rule */}
          <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>┬⌐ 2026 Aflix infotech pvt ltd, Inc.</div>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-800 transition-colors cursor-pointer">Terms</span>
              <span>|</span>
              <span className="hover:text-slate-800 transition-colors cursor-pointer">Privacy</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 11. AUTH & 1-CLICK DEMO LOGIN MODAL                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg my-auto overflow-hidden relative max-h-[92vh] flex flex-col"
            >
              {/* Modal Top Header with Tab Switcher */}
              <div className="p-5 sm:p-6 bg-slate-900 text-white relative shrink-0">
                <button
                  onClick={() => setIsAuthModalOpen(false)}
                  className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                    <svg
                      className="w-4 h-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 14.5L7 12l3 2.5 3-2.5 3 2.5 4-3.5v5c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-3.5z" />
                      <path d="M4 9c0-1.1.9-2 2-2h4l4 4h4a2 2 0 0 1 2 2v1.5" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-wider uppercase text-blue-400">SoleFlow Platform</span>
                    <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                      {authMode === 'signup' ? 'Create Your Account' : 'Sign In to SoleFlow'}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  {authMode === 'signup'
                    ? 'Start your 14-day free access. Setup your footwear distribution hub & catalog in seconds.'
                    : 'Select a demo role below for instant access, or sign in with your credentials.'}
                </p>

                {/* Segmented Mode Switcher */}
                <div className="mt-4 grid grid-cols-2 p-1 bg-white/10 rounded-2xl gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError('');
                      setSignupError('');
                    }}
                    className={`py-1.5 sm:py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      authMode === 'login'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthError('');
                      setSignupError('');
                    }}
                    className={`py-1.5 sm:py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      authMode === 'signup'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <span>Create Account</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-semibold">
                      Free
                    </span>
                  </button>
                </div>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                {authMode === 'signup' ? (
                  /* ================= CREATE ACCOUNT FORM ================= */
                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    {/* Role Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800">
                          Select Account Role
                        </label>
                        {/* Quick Prefill options */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-semibold hidden xs:inline">Quick Fill:</span>
                          <button
                            type="button"
                            onClick={() => prefillSignup('admin')}
                            className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition-colors cursor-pointer"
                          >
                            Γ£¿ Trader
                          </button>
                          <button
                            type="button"
                            onClick={() => prefillSignup('salesperson')}
                            className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors cursor-pointer"
                          >
                            Γ£¿ Sales Rep
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div
                          onClick={() => setSignupRole('admin')}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                            signupRole === 'admin'
                              ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                              ≡ƒÅó Trader / Distributor
                            </span>
                            {signupRole === 'admin' && (
                              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            Master cartons, size curves, pricing tiers, factory lasting gates &amp; GST invoices.
                          </p>
                        </div>

                        <div
                          onClick={() => setSignupRole('salesperson')}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                            signupRole === 'salesperson'
                              ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                              ≡ƒÆ╝ Field Sales Rep
                            </span>
                            {signupRole === 'salesperson' && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            Mobile catalog showcase, dealer GPS visits, WhatsApp orders &amp; collection receipts.
                          </p>
                        </div>
                      </div>
                    </div>

                    {signupError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                        {signupError}
                      </div>
                    )}

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Full Name *
                        </label>
                        <div className="relative">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900"
                            placeholder="e.g. Vikram Malhotra"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Company / Trade Name *
                        </label>
                        <div className="relative">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={signupBusinessName}
                            onChange={(e) => setSignupBusinessName(e.target.value)}
                            className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900"
                            placeholder="e.g. Apex Footwear Trading"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Work Email *
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900"
                            placeholder="vikram@apexfootwear.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Mobile / WhatsApp Number
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="tel"
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value)}
                            className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900"
                            placeholder="+91 98200 12345"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Footwear Trade Territory / Primary Zone
                      </label>
                      <select
                        value={signupZone}
                        onChange={(e) => setSignupZone(e.target.value)}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                      >
                        <option value="Delhi-NCR & Western UP Hub">Delhi-NCR & Western UP Hub</option>
                        <option value="Agra Footwear Manufacturing Belt">Agra Footwear Manufacturing Belt</option>
                        <option value="Mumbai & Western Maharashtra">Mumbai & Western Maharashtra</option>
                        <option value="Bangalore & South India Region">Bangalore & South India Region</option>
                        <option value="Kolkata & Eastern Wholesale Hub">Kolkata & Eastern Wholesale Hub</option>
                        <option value="International / Export Division">International / Export Division</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Password (min 6 chars) *
                        </label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            className="w-full h-10 pl-9 pr-9 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900"
                            placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={signupConfirmPassword}
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                            className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900"
                            placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="agreeTerms" className="text-[11px] text-slate-500 leading-tight cursor-pointer">
                        I agree to SoleFlow's <span className="text-slate-800 font-semibold underline">Terms of Service</span> and <span className="text-slate-800 font-semibold underline">Privacy Policy</span>. No credit card required.
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingSignup}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30 active:scale-[0.99] disabled:opacity-75"
                    >
                      {isSubmittingSignup ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin" />
                          <span>Setting up your footwear portal...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account &amp; Launch Portal</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-1 border-t border-slate-100">
                      <p className="text-xs text-slate-500">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('login');
                            setAuthError('');
                            setSignupError('');
                          }}
                          className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer underline"
                        >
                          Sign In here
                        </button>
                      </p>
                    </div>
                  </form>
                ) : (
                  /* ================= SIGN IN FORM ================= */
                  <div className="space-y-4">
                    {/* Instant 1-Click Launchers */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Instant 1-Click Demo Login
                      </span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleInstantLogin('admin')}
                          className="p-3 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition-all cursor-pointer group"
                        >
                          <span className="text-xs font-black text-blue-900 block group-hover:text-blue-700">
                            Trader Admin
                          </span>
                          <span className="text-[10px] text-blue-700 font-mono block">
                            admin@soleflow.com
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInstantLogin('salesperson')}
                          className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-left transition-all cursor-pointer group"
                        >
                          <span className="text-xs font-black text-emerald-900 block group-hover:text-emerald-700">
                            Field Rep
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono block">
                            sales@soleflow.com
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-slate-200 w-full" />
                      <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                        or sign in with credentials
                      </span>
                    </div>

                    {/* Form Credentials */}
                    <form onSubmit={handleFormLogin} className="space-y-3 pt-1">
                      {authError && (
                        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                          {authError}
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900"
                            placeholder="name@soleflow.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900"
                            placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                      >
                        <span>Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="text-center pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                          Don't have an account yet?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('signup');
                              setAuthError('');
                              setSignupError('');
                            }}
                            className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer underline"
                          >
                            Create a free account
                          </button>
                        </p>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
