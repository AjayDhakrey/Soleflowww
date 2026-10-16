import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  Zap,
  Star,
  Compass,
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
  Truck,
  RotateCw,
  Calculator,
  Receipt,
  Tag,
  MessageCircle,
  IndianRupee,
  BarChart3,
  Boxes,
  HelpCircle,
  Play,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { FootwearMotionStage } from './FootwearMotionStage';

// High-fidelity image and video poster assets
import heroVideoPosterImg from '../../assets/images/hero_video_poster.jpg';
import heroFootwearImg from '../../assets/images/hero_footwear_editorial_1790321154027.jpg';
import sneakerMotionImg from '../../assets/images/sneaker_motion_stride_1790321168010.jpg';
import leatherCraftImg from '../../assets/images/leather_craft_detail_1790321180013.jpg';
import outdoorBootImg from '../../assets/images/outdoor_technical_boot_1790321192724.jpg';
import walkingMotionBg from '../../assets/images/footwear_walking_motion_1790245134535.jpg';
import footwearShowcaseBanner from '../../assets/images/footwear_showcase_banner_1790245146976.jpg';
import projectLogo from '../../assets/images/project_logo.png';

// =========================================================================
// EMBEDDED HERO CINEMATIC VIDEO PLAYER (IN HERO SECTION)
// =========================================================================
export const HeroCinematicVideoPlayer: React.FC<{ onOpenModal?: () => void }> = ({ onOpenModal }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => {});
    };

    tryPlay();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else {
        tryPlay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/10] lg:aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xl bg-slate-900 group">
      {/* Fallback Poster */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{ backgroundImage: `url(${heroVideoPosterImg})` }}
        aria-hidden="true"
      />

      {/* Video element embedded in hero showcase */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover object-center will-change-transform"
        autoPlay
        muted
        loop
        playsInline
        controls={false}
        disablePictureInPicture
        preload="auto"
        poster={heroVideoPosterImg}
      >
        <source media="(min-width: 768px)" src="/assets/videos/soleflow-hero-cinematic.mp4" type="video/mp4" />
        <source src="/assets/videos/soleflow-hero-cinematic-mobile.mp4" type="video/mp4" />
      </video>

      {/* Subtle bottom glass overlay with live tag and demo action */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

      {/* Top Floating Badge */}
      <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 backdrop-blur-md text-white border border-white/20 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live B2B Platform</span>
        </span>
      </div>

      {/* Bottom Floating Stats Strip */}
      <div className="absolute bottom-3.5 inset-x-3.5 p-3 rounded-2xl bg-slate-950/75 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3 text-white">
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block truncate">
            Footwear Wholesale Suite
          </span>
          <span className="text-xs sm:text-sm font-bold text-white truncate block">
            Catalogs • Invoicing • Factory Dispatch
          </span>
        </div>

        {onOpenModal && (
          <button
            type="button"
            onClick={onOpenModal}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="hidden xs:inline">Full Demo</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface LandingPageProps {
  onLoginSuccess: (role: 'admin' | 'salesperson') => void;
  onNavigateToLogin?: (mode?: 'login' | 'signup') => void;
  isAlreadyLoggedIn?: boolean;
  onReturnToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginSuccess,
  onNavigateToLogin,
  isAlreadyLoggedIn = false,
  onReturnToDashboard,
}) => {
  const { signIn, signUp, quickDemoLogin } = useAuth();
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [authRoleChoice, setAuthRoleChoice] = useState<'admin' | 'salesperson'>('admin');
  const [email, setEmail] = useState('admin@soleflow.com');
  const [password, setPassword] = useState('admin123');
  const [authError, setAuthError] = useState('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => {});
    };

    tryPlay();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else {
        tryPlay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Sign up form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signupRole, setSignupRole] = useState<'admin' | 'salesperson'>('admin');
  const [signupBusinessName, setSignupBusinessName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupNotice, setSignupNotice] = useState('');
  const [isSubmittingSignup, setIsSubmittingSignup] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Wholesale calculator state
  const [calcSizeCurve, setCalcSizeCurve] = useState<'mens' | 'womens' | 'unisex'>('mens');
  const [calcTotalPairs, setCalcTotalPairs] = useState<number>(48);
  const [calcPricePerPair, setCalcPricePerPair] = useState<number>(1250);
  const [calcRetailMrp, setCalcRetailMrp] = useState<number>(2499);

  const calcCurves = {
    mens: {
      name: "Men's Pro Runner (EU 39-44)",
      sizes: ['6', '7', '8', '9', '10', '11'],
      weights: [1.5, 3, 3, 2, 1.5, 1],
    },
    womens: {
      name: "Women's Comfort Curve (EU 36-41)",
      sizes: ['4', '5', '6', '7', '8', '9'],
      weights: [1, 2.5, 3.5, 2.5, 1.5, 1],
    },
    unisex: {
      name: 'Universal Sneaker Assortment',
      sizes: ['5', '6', '7', '8', '9', '10'],
      weights: [1.5, 2, 3, 3, 1.5, 1],
    },
  };

  const activeCalcCurve = calcCurves[calcSizeCurve];
  const curveWeightSum = activeCalcCurve.weights.reduce((a, b) => a + b, 0);
  const calcTotalOrderValue = calcTotalPairs * calcPricePerPair;
  const calcGst = Math.round(calcTotalOrderValue * 0.12);
  const calcFreight = 2500;
  const calcTotalLandedCost = calcTotalOrderValue + calcGst + calcFreight;
  const calcPotentialRevenue = calcTotalPairs * calcRetailMrp;
  const calcMargin = Math.max(0, Math.round(((calcPotentialRevenue - calcTotalLandedCost) / calcPotentialRevenue) * 100)) || 18;

  // Role choice only — the signup form itself stays blank (no fabricated identities).
  const selectSignupRole = (role: 'admin' | 'salesperson') => {
    setSignupRole(role);
    setSignupError('');
    setSignupNotice('');
  };

  const handleFormSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupNotice('');

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setSignupError('Please fill in all required fields.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmittingSignup(true);

    try {
      const res = await signUp({
        email: signupEmail,
        password: signupPassword,
        fullName: signupName,
        phone: signupPhone,
        businessName: signupBusinessName || signupName,
      });

      setIsSubmittingSignup(false);

      if (!res.success) {
        setSignupError(res.error || 'Failed to create account. Please try again.');
        return;
      }

      if (res.needsEmailVerification) {
        setSignupNotice(`Check your inbox — we sent a verification link to ${signupEmail}. Please confirm your email to activate your account.`);
        return;
      }

      setIsAuthModalOpen(false);
      onLoginSuccess(signupRole);
    } catch (err: any) {
      setIsSubmittingSignup(false);
      setSignupError(err?.message || 'Failed to create account. Please try again.');
    }
  };

  const handleDemoLogin = async (demoRole: 'admin' | 'salesperson') => {
    setIsDemoLoggingIn(true);
    setAuthError('');

    let demoEmail = 'admin@soleflow.com';
    let demoPass = 'admin123';

    if (demoRole === 'admin') {
      demoEmail = (import.meta.env.VITE_DEMO_ADMIN_EMAIL as string) || 'admin@soleflow.com';
      demoPass = (import.meta.env.VITE_DEMO_ADMIN_PASSWORD as string) || 'admin123';
    } else {
      demoEmail = (import.meta.env.VITE_DEMO_SALES_EMAIL as string) || 'sales@soleflow.com';
      demoPass = (import.meta.env.VITE_DEMO_SALES_PASSWORD as string) || 'sales123';
    }

    try {
      if (quickDemoLogin) {
        quickDemoLogin(demoRole);
      } else if (signIn) {
        await signIn(demoEmail, demoPass);
      }
    } catch (e) {
      console.warn('Demo auth API login fallback to local state', e);
    } finally {
      setIsDemoLoggingIn(false);
      setIsAuthModalOpen(false);
      onLoginSuccess(demoRole === 'salesperson' ? 'salesperson' : 'admin');
    }
  };

  const handleInstantLogin = (role: 'admin' | 'salesperson') => {
    handleDemoLogin(role);
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = await signIn(email, password);
    if (res.success) {
      setIsAuthModalOpen(false);
      onLoginSuccess(res.role === 'salesperson' ? 'salesperson' : 'admin');
    } else {
      setAuthError(res.error || 'Invalid credentials. Please try again.');
    }
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  // Frequently Asked Questions
  const faqs = [
    {
      q: 'What is SoleFlow?',
      a: 'SoleFlow is an all-in-one software platform built specifically for Indian footwear wholesalers, distributors, manufacturers, and sales teams to manage products, stock, dealer orders, factory production, and payments in one simple place.',
    },
    {
      q: 'Who is SoleFlow for?',
      a: 'SoleFlow is made for footwear business owners, wholesale traders, master distributors, OEM manufacturing mills, retail chain buyers, and field sales teams taking orders on the go.',
    },
    {
      q: 'Can I manage inventory and wholesale orders?',
      a: 'Yes. You can add shoes with size curves, colors, and prices, track live stock across warehouses, and generate wholesale orders with automatic GST and landed cost calculations.',
    },
    {
      q: 'Do I need technical knowledge?',
      a: 'No. SoleFlow is intentionally designed with a clean, simple Indian business interface. Anyone comfortable using a smartphone or WhatsApp can run their business on SoleFlow without spreadsheets or ERP consultants.',
    },
    {
      q: 'Can I share orders on WhatsApp?',
      a: 'Yes! You can export professional digital line sheets, wholesale order summaries, and GST-ready invoices directly to dealers via WhatsApp in 1 click.',
    },
    {
      q: 'Does SoleFlow support GST and HSN codes?',
      a: 'Yes. SoleFlow includes native Indian GST invoicing (5%, 12%, 18%) with standard footwear HSN codes (6402, 6403, 6404) pre-configured.',
    },
    {
      q: 'How does dealer credit work?',
      a: 'You can set credit limits, track outstanding balances, view aging reports (30/60/90 days), and record part payments via Bank NEFT, UPI, Cheque, or Cash.',
    },
    {
      q: 'Can my sales team use SoleFlow on mobile?',
      a: 'Yes. Traveling sales reps can open digital shoe catalogs, check live dealer balances, and book pre-pack orders right from their mobile phones during market visits.',
    },
    {
      q: 'How does factory production tracking work?',
      a: 'Send approved dealer orders directly to your factory unit and monitor progress through Cutting, Stitching, Lasting/Soling, and Quality Inspection before dispatch.',
    },
  ];

  return (
    <div className="landing-page relative isolate min-h-screen overflow-x-clip text-slate-900 font-sans selection:bg-blue-600 selection:text-white bg-slate-50">
      {/* Crisp subtle background grid and ambient lighting */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(219,234,254,0.7),rgba(255,255,255,0))]" />

      <div className="relative z-0">
        {/* ========================================================================= */}
        {/* TOP FLOATING NAVBAR (FLOATS DIRECTLY OVER HERO VIDEO)                     */}
        {/* ========================================================================= */}
        <div className="fixed top-2 sm:top-3 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none">
          <header className="max-w-6xl mx-auto h-12 sm:h-14 bg-white/95 backdrop-blur-md px-4 sm:px-6 rounded-full border border-slate-200/90 shadow-md flex items-center justify-between transition-all pointer-events-auto">
            {/* Logo */}
            <a href="#hero" className="flex items-center gap-2.5 text-sm sm:text-base font-black tracking-tight text-slate-900 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                <img src={projectLogo} alt="SoleFlow Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-bold tracking-tight text-slate-900">SoleFlow</span>
            </a>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <a href="#hero-video" className="hover:text-blue-600 transition-colors">Platform Demo</a>
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#product-view" className="hover:text-blue-600 transition-colors">Product View</a>
              <a href="#calculator" className="hover:text-blue-600 transition-colors">Pricing &amp; Calculator</a>
              <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#faq" className="hover:text-blue-600 transition-colors">Support &amp; FAQ</a>
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAlreadyLoggedIn ? (
                <button
                  onClick={onReturnToDashboard}
                  className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => openAuth('login')}
                    className="text-xs font-bold text-slate-700 hover:text-blue-600 px-2.5 py-1.5 transition-colors cursor-pointer"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => openAuth('signup')}
                    className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span>Create account</span>
                  </button>
                </>
              )}
            </div>
          </header>
        </div>

        {/* ========================================================================= */}
        {/* HERO SECTION — CINEMATIC VIDEO BACKGROUND EXTENDS BEHIND NAVBAR           */}
        {/* ========================================================================= */}
        <section
          id="hero"
          className="relative isolate overflow-hidden bg-slate-950 text-white pt-20 sm:pt-28 pb-16 sm:pb-24 px-3.5 sm:px-6 lg:px-8 border-b border-slate-800/80"
        >
          {/* Fallback Poster Layer */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-30 transition-opacity duration-700"
            style={{ backgroundImage: `url(${heroVideoPosterImg})` }}
            aria-hidden="true"
          />

          {/* Background Video playing behind the entire hero with rich clarity */}
          <video
            ref={heroVideoRef}
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none -z-20 will-change-transform opacity-90 sm:opacity-95 lg:opacity-100 brightness-[1.02] contrast-[1.05]"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            disablePictureInPicture
            preload="auto"
            poster={heroVideoPosterImg}
          >
            <source media="(min-width: 768px)" src="/assets/videos/soleflow-hero-cinematic.mp4" type="video/mp4" />
            <source src="/assets/videos/soleflow-hero-cinematic-mobile.mp4" type="video/mp4" />
          </video>

          {/* High-visibility cinematic scrim: calibrated deep left density (95% -> 80%) to block light video frames behind text, while keeping right video action 100% bright */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 40% via-slate-950/30 70% to-transparent -z-10" />
          {/* Subtle top & bottom edge transition so navbar and bottom border blend seamlessly */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/80 -z-10" />
          {/* Subtle blue accent glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.18),transparent_60%)] -z-10 pointer-events-none" />

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Hero Column: Required Headlines, Subtitle, CTAs & 1-Click Demo Login */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-blue-400/40 text-blue-300 text-xs sm:text-[13px] font-bold shadow-xl backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>India's #1 Footwear Wholesale Operating System</span>
              </div>

              {/* Hero Headline with solid luminous sky-400 (prevents browser text-clip shadow bug) */}
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                Manage Your Entire <br />
                <span className="text-sky-400 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                  Footwear Business
                </span> <br />
                From One Place
              </h1>

              {/* Hero Description with high-contrast text shadow */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-100 max-w-xl leading-relaxed font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                SoleFlow helps footwear wholesalers, distributors, manufacturers, and sales teams manage products, stock,
                wholesale orders, customers, factory production, and collections — without spreadsheet chaos.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {isAlreadyLoggedIn ? (
                  <button
                    onClick={onReturnToDashboard}
                    className="h-11 sm:h-12 px-7 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs sm:text-sm font-bold transition-all shadow-xl shadow-black/40 flex items-center gap-2 cursor-pointer border border-blue-400/30"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => openAuth('signup')}
                    className="h-11 sm:h-12 px-7 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs sm:text-sm font-bold transition-all shadow-xl shadow-black/40 flex items-center gap-2 cursor-pointer border border-blue-400/30"
                  >
                    <span>Get started free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="h-11 sm:h-12 px-6 rounded-full bg-slate-900/75 hover:bg-slate-800/90 active:scale-98 border border-white/30 text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xl backdrop-blur-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-blue-400" />
                  <span>Watch Walkthrough</span>
                </button>
              </div>

              {/* Instant 1-Click Demo Login Bar */}
              <div className="pt-2 sm:pt-4 space-y-2.5">
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-white tracking-wider uppercase [text-shadow:_0_1px_6px_rgba(0,0,0,0.9)]">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                  <span>Instant 1-Click Demo Login:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('admin')}
                    disabled={isDemoLoggingIn}
                    className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/95 active:scale-95 text-blue-200 border border-blue-400/50 text-xs sm:text-sm font-bold transition-all shadow-xl backdrop-blur-md cursor-pointer"
                    title="Footwear Wholesaler Admin / Owner"
                  >
                    <Building className="w-4 h-4 text-blue-300 group-hover:scale-110 transition-transform" />
                    <span>Admin / Owner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('salesperson')}
                    disabled={isDemoLoggingIn}
                    className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/95 active:scale-95 text-emerald-200 border border-emerald-400/50 text-xs sm:text-sm font-bold transition-all shadow-xl backdrop-blur-md cursor-pointer"
                    title="Field Sales Representative"
                  >
                    <Users className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
                    <span>Salesman</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Frosted Glass Highlights & Live Metrics */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-3xl bg-slate-950/50 hover:bg-slate-950/60 transition-colors backdrop-blur-md border border-white/20 p-5 sm:p-6 shadow-2xl space-y-5">
                {/* Status Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white tracking-wide uppercase">SoleFlow Cloud Platform</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">v2.4 Live</span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-center">
                    <span className="text-lg sm:text-xl font-black text-white block font-display">350+</span>
                    <span className="text-[10px] sm:text-[11px] font-medium text-slate-300 block truncate">Wholesale Hubs</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-center">
                    <span className="text-lg sm:text-xl font-black text-blue-400 block font-display">1M+</span>
                    <span className="text-[10px] sm:text-[11px] font-medium text-slate-300 block truncate">Pairs Managed</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-center">
                    <span className="text-lg sm:text-xl font-black text-emerald-400 block font-display">99.4%</span>
                    <span className="text-[10px] sm:text-[11px] font-medium text-slate-300 block truncate">Order Accuracy</span>
                  </div>
                </div>

                {/* Operating Capabilities Checklist */}
                <div className="space-y-2.5 pt-1 text-xs text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Size-curve assortments (EU 39-44, UK 6-10)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Indian GST (5%, 12%, 18%) & HSN footwear invoicing</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-time factory job cards & dispatch tracking</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dealer ledger aging & 1-tap WhatsApp sharing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1 — EVERYTHING YOU NEED TO RUN YOUR FOOTWEAR BUSINESS             */}
        {/* ========================================================================= */}
        <section id="features" className="py-6 sm:py-10 px-3 sm:px-6">
          <div
            className="max-w-6xl mx-auto rounded-3xl p-6 sm:p-10 space-y-8 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.70)',
              borderRadius: '28px',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.10)',
            }}
          >
            <div className="max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Everything You Need to Run Your Footwear Business
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                From product management to factory dispatch, SoleFlow covers your complete business flow.
              </p>
            </div>

            {/* 5 Translucent Feature Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-4">
              {/* Card 1 */}
              <div
                className="p-5 rounded-2xl hover:bg-white/90 transition-all text-left space-y-3 shadow-xs"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.80)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '18px',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100/90 text-blue-600 flex items-center justify-center font-bold">
                  <Boxes className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Products &amp; Inventory</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Add shoes with sizes, colours, pricing and track real-time stock.
                </p>
              </div>

              {/* Card 2 */}
              <div
                className="p-5 rounded-2xl hover:bg-white/90 transition-all text-left space-y-3 shadow-xs"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.80)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '18px',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100/90 text-blue-600 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Wholesale Orders</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Create and manage dealer orders with size-wise quantities.
                </p>
              </div>

              {/* Card 3 */}
              <div
                className="p-5 rounded-2xl hover:bg-white/90 transition-all text-left space-y-3 shadow-xs"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.80)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '18px',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100/90 text-blue-600 flex items-center justify-center font-bold">
                  <Factory className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Factory Production</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Send orders to production and track progress from factory to dispatch.
                </p>
              </div>

              {/* Card 4 */}
              <div
                className="p-5 rounded-2xl hover:bg-white/90 transition-all text-left space-y-3 shadow-xs"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.80)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '18px',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100/90 text-blue-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Customers &amp; Dealers</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Manage customer details, pricing, credit limits and order history.
                </p>
              </div>

              {/* Card 5 */}
              <div
                className="p-5 rounded-2xl hover:bg-white/90 transition-all text-left space-y-3 shadow-xs sm:col-span-2 lg:col-span-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.80)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '18px',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100/90 text-blue-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Sales Team</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Help your field team show products and take orders from mobile.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2 — PRODUCT VIEW (Interactive Product View)                        */}
        {/* ========================================================================= */}
        <section id="product-view" className="py-6 sm:py-10 px-3 sm:px-6">
          <div
            className="max-w-6xl mx-auto rounded-3xl p-4 sm:p-8"
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.70)',
              borderRadius: '28px',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.10)',
            }}
          >
            <FootwearMotionStage onOpenOrderWizard={() => openAuth('signup')} />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3 — WHOLESALE ORDER & PROFIT CALCULATOR                           */}
        {/* ========================================================================= */}
        <section id="calculator" className="py-6 sm:py-10 px-3 sm:px-6">
          <div
            className="max-w-6xl mx-auto rounded-3xl p-6 sm:p-10 space-y-6"
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.70)',
              borderRadius: '28px',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.10)',
            }}
          >
            {/* 3-Column Calculator Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Heading & CTA (3.5 cols) */}
              <div className="lg:col-span-4 space-y-4 text-left">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 tracking-wider uppercase">
                  <span>WHOLESALE ORDER CALCULATOR</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  Plan Your Wholesale Order &amp; Profit
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Choose sizes, order quantity and selling price. SoleFlow automatically shows your total order cost,
                  GST, freight and expected margin.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => openAuth('signup')}
                    className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>Create Wholesale Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Middle Column: Size-wise Order Plan (4.5 cols) */}
              <div
                className="lg:col-span-4 p-5 rounded-2xl space-y-4 text-left"
                style={{
                  background: 'rgba(255, 255, 255, 0.90)',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  borderRadius: '18px',
                }}
              >
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Size-wise Order Plan
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-medium">
                        <th className="py-2 text-left">Size</th>
                        {activeCalcCurve.sizes.map((s) => (
                          <th key={s} className="py-2 text-center">{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr>
                        <td className="py-2.5 text-slate-600 font-semibold">Pairs per size</td>
                        {activeCalcCurve.sizes.map((s, idx) => {
                          const pairsForSize = Math.round((activeCalcCurve.weights[idx] / curveWeightSum) * calcTotalPairs);
                          return (
                            <td key={s} className="py-2.5 text-center font-bold text-slate-900">
                              {pairsForSize}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Order Quantity</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCalcTotalPairs(Math.max(12, calcTotalPairs - 12))}
                      className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center justify-center font-bold cursor-pointer"
                      title="Decrease pairs"
                    >
                      -
                    </button>
                    <span className="font-mono text-blue-600 font-bold px-1.5">{calcTotalPairs} Pairs</span>
                    <button
                      onClick={() => setCalcTotalPairs(calcTotalPairs + 12)}
                      className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center justify-center font-bold cursor-pointer"
                      title="Increase pairs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary (4 cols) */}
              <div
                className="lg:col-span-4 p-5 rounded-2xl space-y-3.5 text-left shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.94)',
                  border: '1px solid rgba(255, 255, 255, 0.98)',
                  borderRadius: '18px',
                }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Order Summary
                </h3>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Price per pair</span>
                    <span className="text-slate-900 font-bold">₹{calcPricePerPair.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Total pairs</span>
                    <span className="text-slate-900 font-bold">{calcTotalPairs}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Total order value</span>
                    <span className="text-slate-900 font-bold">₹{calcTotalOrderValue.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>GST (12%)</span>
                    <span className="text-slate-900 font-bold">₹{calcGst.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Freight / Handling</span>
                    <span className="text-slate-900 font-bold">₹{calcFreight.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-900">
                    <span>Total landed cost</span>
                    <span className="text-sm font-black">₹{calcTotalLandedCost.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-1 flex justify-between text-xs text-blue-600 font-bold">
                    <span>Expected margin</span>
                    <span>{calcMargin}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4 — HOW SOLEFLOW WORKS (5-Step Horizontal Process)                */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-6 sm:py-10 px-3 sm:px-6">
          <div
            className="max-w-6xl mx-auto rounded-3xl p-6 sm:p-10 space-y-8 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.70)',
              borderRadius: '28px',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.10)',
            }}
          >
            <div className="max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 tracking-wider uppercase">
                <span>SAMPLE 5 STEP PROCESS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                How SoleFlow Works
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A simple process to manage your entire footwear business.
              </p>
            </div>

            {/* 5 Connected Step Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-3 relative">
              {[
                {
                  icon: Boxes,
                  title: '1. Add Products',
                  desc: 'Add shoes with sizes, colours, prices and stock.',
                },
                {
                  icon: FileText,
                  title: '2. Receive an Order',
                  desc: 'Create wholesale orders for dealers or retailers.',
                },
                {
                  icon: Factory,
                  title: '3. Check Stock or Start Production',
                  desc: 'Use available inventory or send required quantities for production.',
                },
                {
                  icon: Truck,
                  title: '4. Track Payment & Delivery',
                  desc: 'Record payment status, dealer credit and dispatch details.',
                },
                {
                  icon: BarChart3,
                  title: '5. View Reports',
                  desc: 'See sales, stock, payments and business performance.',
                },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="relative p-4 sm:p-5 text-left space-y-3 flex flex-col justify-between"
                  style={{
                    background: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.80)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '18px',
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <step.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">{step.title}</h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-1.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5 — COMPLETE FOOTWEAR BUSINESS MANAGEMENT (Dashboard Preview)     */}
        {/* ========================================================================= */}
        <section className="py-6 sm:py-10 px-3 sm:px-6">
          <div
            className="max-w-6xl mx-auto rounded-3xl p-6 sm:p-10 space-y-8 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.70)',
              borderRadius: '28px',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.10)',
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Title & CTA (4 cols) */}
              <div className="lg:col-span-4 space-y-4 text-left">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 tracking-wider uppercase">
                  <span>POWERFUL &amp; EASY TO USE</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  Complete Footwear Business Management
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  A simple and modern interface designed for real business needs. Access everything from desktop or mobile.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => openAuth('signup')}
                    className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>View All Features</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Desktop & Mobile Mockup (8 cols) */}
              <div className="lg:col-span-8 relative">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Desktop Mockup (8 cols) */}
                  <div className="md:col-span-8 bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-xl text-left">
                    <div className="h-7 bg-slate-950 px-3 flex items-center gap-1.5 border-b border-slate-800">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <div className="mx-auto text-[11px] text-slate-400 font-mono">SoleFlow Admin</div>
                    </div>

                    <div className="p-4 space-y-3 bg-slate-900 text-white">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                          <div className="text-[11px] text-slate-400">Total Orders</div>
                          <div className="text-sm font-bold text-white font-mono">245</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                          <div className="text-[11px] text-slate-400">Inventory Value</div>
                          <div className="text-sm font-bold text-white font-mono">₹48,20,000</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                          <div className="text-[11px] text-slate-400">Active Dealers</div>
                          <div className="text-sm font-bold text-white font-mono">186</div>
                        </div>
                      </div>

                      {/* Mock Chart */}
                      <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 space-y-2">
                        <div className="text-[11px] font-bold text-slate-300">Sales Overview</div>
                        <div className="h-16 flex items-end justify-between gap-1 pt-2">
                          {[35, 55, 40, 75, 60, 90, 80].map((h, i) => (
                            <div key={i} className="flex-1 bg-blue-500/80 rounded-t-xs" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Mockup (4 cols) */}
                  <div className="md:col-span-4 bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl p-3 text-left space-y-3 text-white">
                    <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-1" />
                    <div className="text-[11px] font-bold">SoleFlow Mobile</div>
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                      <div className="text-[11px] text-slate-400">Live Orders</div>
                      <div className="text-sm font-mono font-bold text-blue-400">245 Active</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                      <div className="text-[11px] text-slate-400">Inventory Stock</div>
                      <div className="text-xs font-mono font-bold text-emerald-400">₹48,20,000</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                      <div className="text-[11px] text-slate-400">Dealers</div>
                      <div className="text-xs font-mono font-bold">186 Connected</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6 — MADE FOR EVERY TYPE OF FOOTWEAR BUSINESS                      */}
        {/* ========================================================================= */}
        <section className="py-6 sm:py-10 px-3 sm:px-6">
          <div
            className="max-w-6xl mx-auto rounded-3xl p-6 sm:p-10 space-y-8 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.70)',
              borderRadius: '28px',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.10)',
            }}
          >
            <div className="max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 tracking-wider uppercase">
                <span>BUILT FOR EVERY TYPE OF FOOTWEAR BUSINESS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Made for Every Type of Footwear Business
              </h2>
            </div>

            {/* 5 Business Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-4">
              {[
                {
                  title: 'Wholesalers',
                  desc: 'Manage dealers, bulk orders, pricing and stock.',
                  image: heroFootwearImg,
                },
                {
                  title: 'Distributors',
                  desc: 'Track inventory, customer orders, credit and delivery.',
                  image: outdoorBootImg,
                },
                {
                  title: 'Manufacturers',
                  desc: 'Manage production orders, materials and dispatch.',
                  image: leatherCraftImg,
                },
                {
                  title: 'Retail Chains',
                  desc: 'Monitor products, availability and supplier orders.',
                  image: footwearShowcaseBanner,
                },
                {
                  title: 'Sales Teams',
                  desc: 'Show products and take dealer orders from mobile.',
                  image: walkingMotionBg,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] border border-slate-200/80 shadow-sm text-left flex flex-col justify-end p-4"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                  <div className="relative z-10 space-y-1">
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7 — BUILT FOR THE INDIAN FOOTWEAR MARKET                          */}
        {/* ========================================================================= */}
        <section className="py-6 sm:py-10 px-3 sm:px-6">
          <div
            className="max-w-6xl mx-auto rounded-3xl p-6 sm:p-10 space-y-8 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.70)',
              borderRadius: '28px',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.10)',
            }}
          >
            <div className="max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 tracking-wider uppercase">
                <span>BUILT FOR THE INDIAN FOOTWEAR MARKET</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Everything You Need for the Indian Footwear Market
              </h2>
            </div>

            {/* 6 India Feature Pill Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                className="p-4 rounded-2xl flex items-center gap-3.5 text-left"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.80)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '18px',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  ₹
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">₹ Pricing</h3>
                  <p className="text-[11px] text-slate-600">Use Indian currency throughout.</p>
                </div>
              </div>

              <div
                className="p-4 rounded-2xl flex items-center gap-3.5 text-left"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.80)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '18px',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">GST Invoicing</h3>
                  <p className="text-[11px] text-slate-600">Create GST-friendly invoices.</p>
                </div>
              </div>

              <div
                className="p-4 rounded-2xl flex items-center gap-3.5 text-left"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.80)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '18px',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">HSN Code Support</h3>
                  <p className="text-[11px] text-slate-600">Organise products with HSN codes.</p>
                </div>
              </div>

              <div
                className="p-4 rounded-2xl flex items-center gap-3.5 text-left"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.80)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '18px',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">WhatsApp Sharing</h3>
                  <p className="text-[11px] text-slate-600">Share orders instantly.</p>
                </div>
              </div>

              <div
                className="p-4 rounded-2xl flex items-center gap-3.5 text-left"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.80)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '18px',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Dealer Credit</h3>
                  <p className="text-[11px] text-slate-600">Track customer credit limits.</p>
                </div>
              </div>

              <div
                className="p-4 rounded-2xl flex items-center gap-3.5 text-left"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.80)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '18px',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">UPI / Bank / Cash</h3>
                  <p className="text-[11px] text-slate-600">Record payments easily.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8 & 9 COMBINED — FAQ (LEFT) & FINAL CTA (RIGHT)                   */}
        {/* ========================================================================= */}
        <section id="faq" className="py-6 sm:py-10 px-3 sm:px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Frequently Asked Questions (6.5 cols) */}
            <div
              className="lg:col-span-6 p-6 sm:p-8 space-y-5 text-left flex flex-col justify-between"
              style={{
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.70)',
                borderRadius: '28px',
                boxShadow: '0 20px 60px rgba(15, 23, 42, 0.10)',
              }}
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                    FREQUENTLY ASKED QUESTIONS
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Frequently Asked Questions
                  </h2>
                </div>

                {/* FAQ Accordion List */}
                <div className="space-y-2">
                  {faqs.slice(0, 5).map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200/80 overflow-hidden bg-white/80"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full px-3.5 py-3 text-left flex items-center justify-between gap-2 text-xs font-bold text-slate-900 hover:bg-white transition-colors cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          <span className="text-slate-500 font-mono text-sm">{isOpen ? '−' : '+'}</span>
                        </button>

                        {isOpen && (
                          <div className="overflow-hidden transition-all duration-200">
                            <div className="px-3.5 pb-3 pt-1 text-[11px] text-slate-600 leading-relaxed border-t border-slate-100">
                              {faq.a}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Ready to Simplify Your Footwear Business? (6 cols) */}
            <div
              className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 text-white shadow-2xl flex flex-col justify-between space-y-6 text-left"
              style={{
                borderRadius: '28px',
              }}
            >
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  Ready to Simplify Your <br />
                  Footwear Business?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Manage products, orders, inventory, customers and production from one place.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <button
                    onClick={() => openAuth('signup')}
                    className="h-11 px-7 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>Get started free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsVideoModalOpen(true)}
                    className="h-11 px-6 rounded-full bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md border border-slate-700 text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-blue-400" />
                    <span>Watch demo</span>
                  </button>
                </div>
              </div>

              {/* Trust Points */}
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-300 pt-4 border-t border-slate-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>No credit card required</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Easy setup</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Start in minutes</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FOOTER                                                                    */}
        {/* ========================================================================= */}
        <footer className="bg-slate-950/95 text-white border-t border-slate-900 py-10 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-left text-xs">
              {/* Brand Description (2 cols) */}
              <div className="col-span-2 space-y-3">
                <div className="flex items-center gap-2.5 text-base font-black tracking-tight text-white">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-700/80 p-0.5 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                    <img src={projectLogo} alt="SoleFlow Logo" className="w-full h-full object-contain" />
                  </div>
                  <span>SoleFlow</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                  One platform to manage footwear products, inventory, wholesale orders, and production.
                </p>
              </div>

              {/* Product */}
              <div className="space-y-2">
                <div className="font-bold text-slate-300 text-[11px]">Product</div>
                <ul className="space-y-1 text-slate-400">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#calculator" className="hover:text-white transition-colors">Pricing</a></li>
                </ul>
              </div>

              {/* Operations */}
              <div className="space-y-2">
                <div className="font-bold text-slate-300 text-[11px]">Operations</div>
                <ul className="space-y-1 text-slate-400">
                  <li><a href="#product-view" className="hover:text-white transition-colors">Case Studies</a></li>
                  <li><a href="#hero" className="hover:text-white transition-colors">What&apos;s New</a></li>
                </ul>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <div className="font-bold text-slate-300 text-[11px]">Company</div>
                <ul className="space-y-1 text-slate-400">
                  <li><span className="hover:text-white transition-colors cursor-pointer">About Us</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer">Careers</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer">Blog</span></li>
                </ul>
              </div>

              {/* Support */}
              <div className="space-y-2">
                <div className="font-bold text-slate-300 text-[11px]">Support</div>
                <ul className="space-y-1 text-slate-400">
                  <li><a href="#faq" className="hover:text-white transition-colors">Docs</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><span onClick={() => openAuth('signup')} className="hover:text-white transition-colors cursor-pointer">Book a Demo</span></li>
                </ul>
              </div>
            </div>

            {/* Bottom Credit */}
            <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div>© 2026 SoleFlow Technologies Inc. All rights reserved.</div>
              <div className="font-medium text-slate-400">
                Made for India&apos;s Footwear Businesses 🇮🇳
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* AUTHENTICATION MODAL (Login / Sign up)                                    */}
      {/* ========================================================================= */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-left space-y-5 relative max-h-[90vh] overflow-y-auto"
          >
              {/* Close Button */}
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Mode Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Log In
                </button>
              </div>

              {authMode === 'login' ? (
                /* Login Form */
                <form onSubmit={handleFormLogin} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Welcome Back</h3>
                    <p className="text-xs text-slate-500">Sign in to your SoleFlow workspace</p>
                  </div>

                  {/* 1-Click Instant Demo Access */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        1-Click Instant Demo Login:
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">No password required</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDemoLogin('admin')}
                        disabled={isDemoLoggingIn}
                        className="py-2 px-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 active:scale-95 border border-blue-200 text-blue-700 text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-xs"
                        title="Wholesaler Owner / Admin"
                      >
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="truncate">Admin / Owner</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoLogin('salesperson')}
                        disabled={isDemoLoggingIn}
                        className="py-2 px-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-200 text-emerald-700 text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-xs"
                        title="Field Sales Representative"
                      >
                        <UserIcon className="w-4 h-4 text-emerald-600" />
                        <span className="truncate">Salesman</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Work Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-blue-600"
                        placeholder="admin@soleflow.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-blue-600"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  {authError && <div className="text-xs font-semibold text-rose-600">{authError}</div>}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Sign In
                  </button>

                  <div className="pt-2 text-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAuthModalOpen(false);
                        onNavigateToLogin?.('login');
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                    >
                      Prefer dedicated full-screen login page? Open login page →
                    </button>
                  </div>
                </form>
              ) : (
                /* Sign Up Form */
                <form onSubmit={handleFormSignup} className="space-y-3.5">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Create Free Account</h3>
                    <p className="text-xs text-slate-500">Join 350+ footwear wholesalers &amp; manufacturers</p>
                  </div>

                  {/* Role Selector */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => selectSignupRole('admin')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        signupRole === 'admin'
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Wholesaler / Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => selectSignupRole('salesperson')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        signupRole === 'salesperson'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Field Rep
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:outline-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Work Email</label>
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="you@yourbusiness.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:outline-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Business Name</label>
                      <input
                        type="text"
                        value={signupBusinessName}
                        onChange={(e) => setSignupBusinessName(e.target.value)}
                        placeholder="Your business / firm name"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:outline-blue-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Password</label>
                        <input
                          type="password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:outline-blue-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Confirm Password</label>
                        <input
                          type="password"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:outline-blue-600"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {signupError && <div className="text-xs font-semibold text-rose-600">{signupError}</div>}

                  {signupNotice && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{signupNotice}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingSignup}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    {isSubmittingSignup ? 'Activating Account...' : 'Get Started Now'}
                  </button>

                  <div className="pt-2 text-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAuthModalOpen(false);
                        onNavigateToLogin?.('signup');
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                    >
                      Prefer dedicated full-screen signup page? Open signup page →
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      {/* ========================================================================= */}
      {/* WATCH DEMO VIDEO MODAL                                                    */}
      {/* ========================================================================= */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-lg">
          <div
            className="w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 relative"
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-blue-400 fill-current" />
                <span className="text-xs sm:text-sm font-bold">SoleFlow B2B Platform Walkthrough</span>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black">
              <video
                className="w-full h-full object-cover"
                autoPlay
                controls
                playsInline
              >
                <source src="/assets/videos/soleflow-hero-cinematic.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
