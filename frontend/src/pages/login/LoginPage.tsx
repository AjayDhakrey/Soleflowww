import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Layers,
  Footprints,
  Eye,
  EyeOff,
  User as UserIcon,
  Building2,
  Phone,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import walkingMotionBg from '../../assets/images/footwear_walking_motion_1790245134535.jpg';
import showcaseBannerBg from '../../assets/images/footwear_showcase_banner_1790245146976.jpg';

interface LoginPageProps {
  onSuccess: (role: 'admin' | 'salesperson') => void;
  initialMode?: 'login' | 'signup';
  onBackToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  initialMode = 'login',
  onBackToLanding,
}) => {
  const { login, register } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('admin@soleflow.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isMotionActive, setIsMotionActive] = useState(true);
  const [bgMode, setBgMode] = useState<'walking' | 'showcase'>('walking');
  const [isUltraTransparent, setIsUltraTransparent] = useState(true);

  useEffect(() => {
    if (initialMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode]);

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'admin' | 'salesperson'>('admin');
  const [signupBusinessName, setSignupBusinessName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupZone, setSignupZone] = useState('Delhi-NCR & Western UP Hub');
  const [signupError, setSignupError] = useState('');
  const [isSubmittingSignup, setIsSubmittingSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const prefillSignup = (role: 'admin' | 'salesperson') => {
    setSignupRole(role);
    setSignupError('');
    if (role === 'admin') {
      setSignupName('Vikram Malhotra');
      setSignupEmail('vikram@apexfootwear.com');
      setSignupPassword('soleflow2026');
      setSignupBusinessName('Apex Footwear Wholesale');
      setSignupPhone('+91 98112 34567');
      setSignupZone('Delhi-NCR & Western UP Hub');
    } else {
      setSignupName('Arjun Rawat');
      setSignupEmail('arjun.rawat@soleflow.com');
      setSignupPassword('salesrep2026');
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

    setIsSubmittingSignup(true);
    setTimeout(() => {
      const success = register({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        role: signupRole,
        businessName: signupBusinessName || (signupRole === 'admin' ? 'Apex Footwear Hub' : 'Field Sales Operations'),
        phone: signupPhone,
        zone: signupZone,
      });

      setIsSubmittingSignup(false);
      if (success) {
        onSuccess(signupRole);
      } else {
        setSignupError('Failed to create account. Please try again.');
      }
    }, 400);
  };

  const promotionalShoes = [
    {
      code: 'SF-1024',
      name: 'Runner Classic Pro',
      type: 'Bespoke Injection Sneaker',
      tag: '🔥 1,240 Pairs Booked',
      image:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
      sole: 'Phylon & Molded Rubber Outsole',
    },
    {
      code: 'SF-884',
      name: 'Verona Crust Leather Derby',
      type: 'Italian Tanned European Calfskin',
      tag: '✨ Handcrafted Blake Stitched',
      image:
        'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=400&q=80',
      sole: 'Argentine Vegetable Sole',
    },
    {
      code: 'SF-512',
      name: 'Artisan Chelsea Boot',
      type: 'Goodyear Welted Pull-Up Leather',
      tag: '⚡ High Demand Winterized',
      image:
        'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=400&q=80',
      sole: 'Commando Lugged Rubber',
    },
    {
      code: 'SF-204',
      name: 'AeroGlide Knit Runner',
      type: 'Dual-Density Lightweight Phylon',
      tag: '⭐ Master Carton Ready',
      image:
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=400&q=80',
      sole: 'Air Cushion Injection',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (success) {
      onSuccess(email.includes('sales') ? 'salesperson' : 'admin');
    } else {
      setError('Invalid credentials. Use demo credentials below.');
    }
  };

  const handleQuickLogin = (role: 'admin' | 'salesperson') => {
    if (role === 'admin') {
      setEmail('admin@soleflow.com');
      setPassword('admin123');
      login('admin@soleflow.com', 'admin123');
      onSuccess('admin');
    } else {
      setEmail('sales@soleflow.com');
      setPassword('sales123');
      login('sales@soleflow.com', 'sales123');
      onSuccess('salesperson');
    }
  };

  const activeBgImage = bgMode === 'walking' ? walkingMotionBg : showcaseBannerBg;

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col justify-between items-center p-3 sm:p-4 overflow-x-hidden overflow-y-auto select-none bg-slate-950 font-sans">
      {/* 1. Cinematic Background Layer with Walking Motion (Fixed for smooth scroll) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={activeBgImage}
          alt="Footwear walking motion promotion"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center transition-transform duration-1000 ${
            isMotionActive ? 'animate-walking-bg scale-105' : 'scale-100'
          }`}
        />

        {/* Dynamic lighting gradients & ambient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-900/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-slate-950/70" />

        {/* Animated Walking Cadence Spotlight / Floor glow */}
        {isMotionActive && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-72 bg-blue-500/10 blur-3xl rounded-full animate-step-pulse" />
        )}
      </div>

      {/* 2. Top Header / Controls */}
      <header className="relative z-20 w-full max-w-5xl flex items-center justify-between py-1 sm:py-2 text-white/90">
        <div className="flex items-center gap-2">
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs text-white transition-colors cursor-pointer mr-1 active:scale-95"
              title="Back to Landing Page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline font-medium">Back to Home</span>
            </button>
          )}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-600/90 backdrop-blur-md flex items-center justify-center text-white shadow-md ring-1 ring-white/20 shrink-0">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
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
          <span className="font-extrabold text-sm tracking-tight text-white hidden xs:inline">
            SoleFlow
          </span>
        </div>

        {/* Ambient Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-black/50 backdrop-blur-md rounded-xl p-0.5 border border-white/10 text-[10px] sm:text-xs">
            <button
              onClick={() => setBgMode('walking')}
              className={`px-2 py-0.5 sm:py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                bgMode === 'walking'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
              title="Runway Walking Motion"
            >
              <Footprints className="w-3 h-3" />
              <span className="hidden sm:inline">Runway</span>
            </button>
            <button
              onClick={() => setBgMode('showcase')}
              className={`px-2 py-0.5 sm:py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                bgMode === 'showcase'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
              title="3D Footwear Showcase"
            >
              <Layers className="w-3 h-3" />
              <span className="hidden sm:inline">Showcase</span>
            </button>
          </div>

          <button
            onClick={() => setIsMotionActive(!isMotionActive)}
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs text-white transition-colors"
            title={isMotionActive ? 'Pause walking motion' : 'Resume walking motion'}
            aria-label="Toggle background motion"
          >
            {isMotionActive ? (
              <>
                <Pause className="w-3 h-3 text-blue-300 shrink-0" />
                <span className="hidden sm:inline">Motion</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Play</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 3. Center Glassmorphic Login Card (Transparent on Mobile view) */}
      <main className="relative z-10 w-full max-w-md my-auto py-2">
        <div
          className={`transition-all duration-300 rounded-2xl sm:rounded-3xl shadow-2xl border overflow-hidden ${
            /* Mobile transparent glass vs desktop frosted glass */
            isUltraTransparent
              ? 'bg-slate-950/35 sm:bg-slate-950/60 backdrop-blur-xl border-white/20 sm:border-white/25 shadow-black/60'
              : 'bg-white/94 backdrop-blur-2xl border-white/60 text-slate-900'
          }`}
        >
          {/* Brand Header */}
          <div
            className={`px-4 py-3 sm:px-6 sm:py-5 text-center border-b transition-colors ${
              isUltraTransparent
                ? 'border-white/10 bg-white/5'
                : 'border-slate-100/80 bg-slate-50/60'
            }`}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-600/90 mx-auto flex items-center justify-center text-white shadow-md mb-1.5 ring-2 ring-white/20">
              <svg
                className="w-4 h-4 sm:w-6 sm:h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 14.5L7 12l3 2.5 3-2.5 3 2.5 4-3.5v5c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-3.5z" />
                <path d="M4 9c0-1.1.9-2 2-2h4l4 4h4a2 2 0 0 1 2 2v1.5" />
              </svg>
            </div>
            <h1
              className={`text-lg sm:text-2xl font-black tracking-tight leading-tight ${
                isUltraTransparent ? 'text-white' : 'text-slate-900'
              }`}
            >
              SoleFlow
            </h1>
            <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-400 mt-0.5">
              B2B Footwear Trade &amp; CRM
            </p>

            {/* Mode Switcher */}
            <div className="mt-3 grid grid-cols-2 p-1 bg-black/30 rounded-xl gap-1 max-w-xs mx-auto border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                  setSignupError('');
                }}
                className={`py-1 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError('');
                  setSignupError('');
                }}
                className={`py-1 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'signup'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {authMode === 'signup' ? (
            /* ================= SIGN UP FORM ================= */
            <form onSubmit={handleSignupSubmit} className="px-4 py-3 sm:px-6 sm:py-4 space-y-2.5 max-h-[70vh] overflow-y-auto">
              {signupError && (
                <div className="p-2 bg-rose-950/80 text-rose-200 text-[11px] rounded-lg border border-rose-500/40 font-medium">
                  {signupError}
                </div>
              )}

              {/* Role Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-200">Select Role</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => prefillSignup('admin')}
                      className="text-[9px] font-bold text-blue-300 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-500/30 hover:bg-blue-800/50"
                    >
                      ✨ Trader
                    </button>
                    <button
                      type="button"
                      onClick={() => prefillSignup('salesperson')}
                      className="text-[9px] font-bold text-emerald-300 bg-emerald-900/40 px-1.5 py-0.5 rounded border border-emerald-500/30 hover:bg-emerald-800/50"
                    >
                      ✨ Rep
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setSignupRole('admin')}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      signupRole === 'admin'
                        ? 'bg-blue-950/60 border-blue-400 text-white ring-1 ring-blue-400'
                        : 'bg-black/25 border-white/10 text-white/70 hover:border-white/20'
                    }`}
                  >
                    <div className="text-[11px] font-black flex items-center justify-between">
                      <span>🏢 Trader</span>
                      {signupRole === 'admin' && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                    </div>
                    <span className="text-[9px] text-white/60 block leading-tight">Admin &amp; Cartons</span>
                  </div>

                  <div
                    onClick={() => setSignupRole('salesperson')}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      signupRole === 'salesperson'
                        ? 'bg-emerald-950/60 border-emerald-400 text-white ring-1 ring-emerald-400'
                        : 'bg-black/25 border-white/10 text-white/70 hover:border-white/20'
                    }`}
                  >
                    <div className="text-[11px] font-black flex items-center justify-between">
                      <span>💼 Field Rep</span>
                      {signupRole === 'salesperson' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <span className="text-[9px] text-white/60 block leading-tight">Visits &amp; Orders</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold block mb-1 text-slate-200">Full Name *</label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/60" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Vikram Malhotra"
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-black/35 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold block mb-1 text-slate-200">Company / Trade Name *</label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/60" />
                  <input
                    type="text"
                    required
                    value={signupBusinessName}
                    onChange={(e) => setSignupBusinessName(e.target.value)}
                    placeholder="Apex Footwear Wholesale"
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-black/35 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold block mb-1 text-slate-200">Work Email *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/60" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="vikram@apexfootwear.com"
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-black/35 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold block mb-1 text-slate-200">Password (min 6 chars) *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-9 pl-9 pr-8 text-xs rounded-xl bg-black/35 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-white/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingSignup}
                className="w-full h-9 sm:h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] mt-2"
              >
                {isSubmittingSignup ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account &amp; Launch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ================= SIGN IN FORM ================= */
            <form onSubmit={handleSubmit} className="px-4 py-3.5 sm:px-6 sm:py-5 space-y-2.5 sm:space-y-3.5">
              {error && (
                <div className="p-2 bg-rose-950/80 text-rose-200 text-[11px] rounded-lg border border-rose-500/40 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label
                  className={`text-[10px] sm:text-xs font-bold block mb-1 ${
                    isUltraTransparent ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className={`w-3.5 h-3.5 absolute left-3 top-2.5 sm:top-3 ${
                      isUltraTransparent ? 'text-white/60' : 'text-slate-400'
                    }`}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@soleflow.com"
                    className={`w-full h-9 sm:h-10 pl-9 pr-3 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                      isUltraTransparent
                        ? 'bg-black/35 border border-white/20 text-white placeholder-white/40 focus:bg-black/50 focus:border-blue-400'
                        : 'bg-slate-50/80 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`text-[10px] sm:text-xs font-bold block mb-1 ${
                    isUltraTransparent ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className={`w-3.5 h-3.5 absolute left-3 top-2.5 sm:top-3 ${
                      isUltraTransparent ? 'text-white/60' : 'text-slate-400'
                    }`}
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full h-9 sm:h-10 pl-9 pr-3 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                      isUltraTransparent
                        ? 'bg-black/35 border border-white/20 text-white placeholder-white/40 focus:bg-black/50 focus:border-blue-400'
                        : 'bg-slate-50/80 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-9 sm:h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] mt-1"
              >
                <span>Sign In to SoleFlow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Quick Demo Role Picker Buttons (Transparent Frosted Glass) */}
              <div
                className={`pt-2.5 sm:pt-3.5 border-t ${
                  isUltraTransparent ? 'border-white/10' : 'border-slate-100'
                }`}
              >
                <span
                  className={`text-[9px] uppercase font-bold block text-center mb-1.5 tracking-wider ${
                    isUltraTransparent ? 'text-white/60' : 'text-slate-400'
                  }`}
                >
                  Instant 1-Click Demo Login
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin')}
                    className={`p-2 sm:p-2.5 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer ${
                      isUltraTransparent
                        ? 'bg-blue-950/40 hover:bg-blue-900/50 border border-blue-400/30 backdrop-blur-md'
                        : 'bg-blue-50/90 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <span
                      className={`text-[11px] sm:text-xs font-black block truncate ${
                        isUltraTransparent ? 'text-blue-300' : 'text-blue-900'
                      }`}
                    >
                      Trader / Admin
                    </span>
                    <span
                      className={`text-[9px] font-mono block truncate ${
                        isUltraTransparent ? 'text-blue-200/90' : 'text-blue-700'
                      }`}
                    >
                      admin@soleflow.com
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('salesperson')}
                    className={`p-2 sm:p-2.5 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer ${
                      isUltraTransparent
                        ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-400/30 backdrop-blur-md'
                        : 'bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <span
                      className={`text-[11px] sm:text-xs font-black block truncate ${
                        isUltraTransparent ? 'text-emerald-300' : 'text-emerald-900'
                      }`}
                    >
                      Salesperson
                    </span>
                    <span
                      className={`text-[9px] font-mono block truncate ${
                        isUltraTransparent ? 'text-emerald-200/90' : 'text-emerald-700'
                      }`}
                    >
                      sales@soleflow.com
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* 4. Bottom Footwear Design Promotional Marquee */}
      <footer className="relative z-20 w-full max-w-5xl py-1 sm:py-2 overflow-hidden rounded-xl bg-slate-950/50 backdrop-blur-md border border-white/10 shrink-0">
        <div className="animate-marquee items-center gap-3 sm:gap-6 text-xs text-white/80">
          {[...promotionalShoes, ...promotionalShoes].map((shoe, idx) => (
            <div
              key={`${shoe.code}-${idx}`}
              className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-white/5 border border-white/10 shrink-0"
            >
              <img
                src={shoe.image}
                alt={shoe.name}
                referrerPolicy="no-referrer"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-md object-cover ring-1 ring-white/20"
              />
              <span className="font-mono text-blue-400 font-bold text-[9px] sm:text-[11px]">
                {shoe.code}
              </span>
              <span className="font-semibold text-white text-[9px] sm:text-[11px]">
                {shoe.name}
              </span>
              <span className="text-[9px] text-emerald-400 font-medium hidden xs:inline">
                {shoe.tag}
              </span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};
