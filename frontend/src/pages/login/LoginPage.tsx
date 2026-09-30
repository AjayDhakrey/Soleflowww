import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  User as UserIcon,
  Building2,
  Phone,
  CheckCircle2,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthProvider';
import walkingMotionBg from '../../assets/images/footwear_walking_motion_1790245134535.jpg';
import showcaseBannerBg from '../../assets/images/footwear_showcase_banner_1790245146976.jpg';
import projectLogo from '../../assets/images/project_logo.png';

interface LoginPageProps {
  onSuccess: (role: 'admin' | 'salesperson') => void;
  initialMode?: 'login' | 'signup';
  onBackToLanding?: () => void;
  onForgotPassword?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  initialMode = 'login',
  onBackToLanding,
  onForgotPassword,
}) => {
  const { login: appLogin, register } = useApp();
  const { signIn, isDemoMode, allowDemo, role: currentRole } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('soleflow.admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMotionActive, setIsMotionActive] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Auto-switching background images
  const bgImages = [walkingMotionBg, showcaseBannerBg];
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bgImages.length]);

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
  const [showSignupPassword, setShowSignupPassword] = useState(false);

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

  const handleSignupSubmit = async (e: React.FormEvent) => {
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
    try {
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
    } catch {
      setIsSubmittingSignup(false);
      setSignupError('Failed to create account. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await signIn(email, password);
      setIsLoading(false);

      if (!res.success) {
        setError(res.error || 'Authentication failed. Please check your credentials.');
        return;
      }

      appLogin(email, password);
      const determinedRole = email.toLowerCase().includes('sales') ? 'salesperson' : 'admin';
      onSuccess(determinedRole);
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'salesperson') => {
    const targetEmail = role === 'admin' ? 'soleflow.admin@gmail.com' : 'soleflow.sales@gmail.com';
    const targetPass = role === 'admin' ? 'admin123' : 'sales123';
    setEmail(targetEmail);
    setPassword(targetPass);
    setError('');
    setIsLoading(true);

    const res = await signIn(targetEmail, targetPass);
    setIsLoading(false);
    if (res.success) {
      appLogin(targetEmail, targetPass);
      onSuccess(role);
    } else {
      setError(res.error || 'Could not log in with credentials.');
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col justify-between items-center p-3 sm:p-4 overflow-x-hidden overflow-y-auto select-none bg-slate-950 font-sans text-slate-100">
      {/* 1. Cinematic Background Layer with Auto-switching Footwear Motion */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {bgImages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt="Footwear motion background"
            referrerPolicy="no-referrer"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
              i === bgIndex ? 'opacity-100' : 'opacity-0'
            } ${isMotionActive ? 'animate-walking-bg scale-105' : 'scale-100'}`}
          />
        ))}

        {/* Dynamic lighting gradients & ambient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-slate-900/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-slate-950/80" />

        {/* Animated Walking Cadence Spotlight / Floor glow */}
        {isMotionActive && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-72 bg-blue-500/15 blur-3xl rounded-full animate-step-pulse" />
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
          <div className="w-8 h-8 rounded-xl bg-white border border-white/30 p-0.5 flex items-center justify-center shadow-lg shadow-blue-900/30 ring-1 ring-white/20 shrink-0 overflow-hidden">
            <img src={projectLogo} alt="SoleFlow Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-white hidden xs:inline">
            SoleFlow
          </span>
        </div>
      </header>

      {/* 3. Center Glassmorphic Login Card (Blue Theme) */}
      <main className="relative z-10 w-full max-w-md my-auto py-2">
        <div className="transition-all duration-300 rounded-2xl sm:rounded-3xl shadow-2xl border bg-slate-950/60 backdrop-blur-2xl border-white/20 shadow-black/80 overflow-hidden">
          {/* Brand Header */}
          <div className="px-4 py-3 sm:px-6 sm:py-5 text-center border-b border-white/10 bg-white/5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white mx-auto flex items-center justify-center p-1 shadow-xl shadow-blue-900/40 mb-2.5 ring-2 ring-blue-500/40 border border-white/40 overflow-hidden">
              <img src={projectLogo} alt="SoleFlow Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white">
              SoleFlow
            </h1>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-400 mt-0.5">
              B2B Footwear Trade &amp; CRM
            </p>

            {/* Mode Switcher */}
            <div className="mt-3.5 grid grid-cols-2 p-1 bg-black/40 rounded-xl gap-1 max-w-xs mx-auto border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                  setSignupError('');
                }}
                className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
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
                className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
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
                      className="text-[9px] font-bold text-blue-300 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-500/30 hover:bg-blue-800/50 cursor-pointer"
                    >
                      ✨ Trader
                    </button>
                    <button
                      type="button"
                      onClick={() => prefillSignup('salesperson')}
                      className="text-[9px] font-bold text-emerald-300 bg-emerald-900/40 px-1.5 py-0.5 rounded border border-emerald-500/30 hover:bg-emerald-800/50 cursor-pointer"
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
                        ? 'bg-blue-950/70 border-blue-400 text-white ring-1 ring-blue-400'
                        : 'bg-black/30 border-white/10 text-white/70 hover:border-white/20'
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
                        ? 'bg-emerald-950/70 border-emerald-400 text-white ring-1 ring-emerald-400'
                        : 'bg-black/30 border-white/10 text-white/70 hover:border-white/20'
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
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all"
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
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all"
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
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold block mb-1 text-slate-200">Password (min 6 chars) *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/60" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-9 pl-9 pr-8 text-xs rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-2.5 top-2.5 text-white/60 hover:text-white cursor-pointer"
                  >
                    {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingSignup}
                className="w-full h-9 sm:h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] mt-2"
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
                <label className="text-[10px] sm:text-xs font-bold block mb-1 text-slate-200">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 sm:top-3 text-white/60" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@soleflow.com"
                    className="w-full h-9 sm:h-10 pl-9 pr-3 text-xs rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-200">
                    Password
                  </label>
                  {onForgotPassword && (
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="text-[10px] text-blue-300 hover:text-blue-200 hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 sm:top-3 text-white/60" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-9 sm:h-10 pl-9 pr-8 text-xs rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2.5 top-2.5 sm:top-3 text-white/60 hover:text-white cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-9 sm:h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] mt-1"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to SoleFlow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Quick Demo Role Picker Buttons (Frosted Blue Glass) */}
              <div className="pt-2.5 sm:pt-3.5 border-t border-white/10">
                <span className="text-[9px] uppercase font-bold block text-center mb-1.5 tracking-wider text-blue-300">
                  Instant 1-Click Demo Login
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin')}
                    className="p-2 sm:p-2.5 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer bg-blue-950/50 hover:bg-blue-900/60 border border-blue-400/40 backdrop-blur-md"
                  >
                    <span className="text-[11px] sm:text-xs font-black block truncate text-blue-300">
                      Trader / Admin
                    </span>
                    <span className="text-[9px] font-mono block truncate text-blue-200/90">
                      soleflow.admin@gmail.com
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('salesperson')}
                    className="p-2 sm:p-2.5 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-400/40 backdrop-blur-md"
                  >
                    <span className="text-[11px] sm:text-xs font-black block truncate text-emerald-300">
                      Salesperson
                    </span>
                    <span className="text-[9px] font-mono block truncate text-emerald-200/90">
                      soleflow.sales@gmail.com
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};
