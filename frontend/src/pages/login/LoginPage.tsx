import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, User, Users, Shield, Building2, Phone, MapPin, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

import loginBackground from '../../assets/images/login/background_image.png';
import studioLogo from '../../assets/images/login/studio_logo_clean.png';

interface LoginPageProps {
  onSuccess: (role: 'admin' | 'salesperson') => void;
  initialMode?: 'login' | 'signup';
  onBackToLanding?: () => void;
  onForgotPassword?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  initialMode = 'login',
  onForgotPassword,
  onBackToLanding,
}) => {
  const { signIn, signUp, quickDemoLogin } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('admin@soleflow.com');
  const [password, setPassword] = useState('admin123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Agra');
  const [gstin, setGstin] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check URL search parameters for invite token
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('invite');
      if (token) {
        setInviteToken(token);
        setMode('signup');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);

  const handleLoginSubmit = async (e: React.FormEvent) => {
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

      onSuccess(res.role === 'salesperson' ? 'salesperson' : 'admin');
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (gstin && gstin.trim().length !== 15) {
      setError('GSTIN must be exactly 15 characters long if provided.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signUp({
        email,
        password,
        fullName,
        phone,
        businessName: inviteToken ? 'Invited Workspace' : businessName,
        city,
        gstin,
        inviteToken: inviteToken || undefined,
      });

      setIsLoading(false);

      if (!res.success) {
        if (res.error?.toLowerCase().includes('already registered')) {
          setError('This email is already registered. Please log in instead.');
        } else {
          setError(res.error || 'Account creation failed. Please try again.');
        }
        return;
      }

      if (res.needsEmailVerification) {
        setVerificationEmail(email);
        setNeedsVerification(true);
      } else {
        onSuccess('admin');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Failed to create account.');
    }
  };

  const handleDemoLogin = async (demoRole: 'superadmin' | 'admin' | 'salesperson') => {
    setError('');
    setIsLoading(true);

    let demoEmail = 'admin@soleflow.com';
    let demoPass = 'admin123';

    if (demoRole === 'superadmin') {
      demoEmail = (import.meta.env.VITE_DEMO_SUPERADMIN_EMAIL as string) || 'superadmin@soleflow.com';
      demoPass = (import.meta.env.VITE_DEMO_SUPERADMIN_PASSWORD as string) || 'super123';
    } else if (demoRole === 'admin') {
      demoEmail = (import.meta.env.VITE_DEMO_ADMIN_EMAIL as string) || 'admin@soleflow.com';
      demoPass = (import.meta.env.VITE_DEMO_ADMIN_PASSWORD as string) || 'admin123';
    } else {
      demoEmail = (import.meta.env.VITE_DEMO_SALES_EMAIL as string) || 'sales@soleflow.com';
      demoPass = (import.meta.env.VITE_DEMO_SALES_PASSWORD as string) || 'sales123';
    }

    try {
      if (quickDemoLogin) {
        quickDemoLogin(demoRole);
      } else {
        await signIn(demoEmail, demoPass);
      }
    } catch (e) {
      console.warn('Demo login fallback:', e);
    } finally {
      setIsLoading(false);
      onSuccess(demoRole === 'salesperson' ? 'salesperson' : 'admin');
    }
  };

  return (
    <div className="relative w-full min-h-[100dvh] overflow-y-auto select-none bg-[#F5F8FE] flex items-center justify-center p-2 sm:p-3 my-auto">
      
      {/* 1. Full Page Background */}
      <img
        src={loginBackground}
        alt="SoleFlow Background"
        className="fixed inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
      />

      {/* 2. Floating Centered Card */}
      <div className="relative z-20 w-full max-w-[340px] sm:max-w-[370px] mx-auto my-auto flex items-center justify-center">
        <div className="w-full bg-white/95 backdrop-blur-md rounded-[20px] sm:rounded-[24px] shadow-[0_15px_40px_rgba(15,23,42,0.10)] border border-white/90 px-4 sm:px-5 py-3 sm:py-3.5 transition-all">
          
          {/* Circular Orbit Logo Emblem */}
          <div className="flex flex-col items-center justify-center mb-1.5">
            <img
              src={studioLogo}
              alt="SoleFlow Emblem"
              className={`${mode === 'signup' ? 'h-7 sm:h-8' : 'h-9 sm:h-10'} w-auto object-contain pointer-events-none select-none transition-all`}
            />
          </div>

          {/* Mode Tabs: Log in | Create account */}
          {!needsVerification && (
            <div className="flex items-center justify-center p-0.5 bg-slate-100 rounded-lg mb-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {inviteToken ? 'Join Team' : 'Create account'}
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-2 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-in fade-in duration-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Email Verification State */}
          {needsVerification ? (
            <div className="text-center py-2.5 space-y-2">
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-1">
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-xs sm:text-sm text-slate-900">Check your inbox</h3>
              <p className="text-[11px] text-slate-600">
                We sent a verification link to <strong className="text-slate-800">{verificationEmail}</strong>. Please confirm your email to activate your account.
              </p>
              {resendStatus && (
                <div className="text-emerald-600 text-[11px] font-medium">{resendStatus}</div>
              )}
              <div className="pt-1.5 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setResendStatus('Verification link re-sent!')}
                  className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Resend verification email
                </button>
                <button
                  type="button"
                  onClick={() => { setNeedsVerification(false); setMode('login'); }}
                  className="text-[11px] text-[#1E6FF6] hover:underline font-medium pt-0.5"
                >
                  Back to Log in
                </button>
              </div>
            </div>
          ) : mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-2">
              
              {/* Email Address */}
              <div className="relative flex items-center">
                <Mail className="absolute left-2.5 w-3.5 h-3.5 text-[#2B7FFF] pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  autoComplete="email"
                  className="w-full pl-8 pr-2.5 py-1.5 sm:py-2 text-xs font-medium rounded-lg text-slate-800 bg-white border border-slate-200/90 focus:border-[#1E6FF6] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {/* Password */}
              <div className="relative flex items-center">
                <Lock className="absolute left-2.5 w-3.5 h-3.5 text-[#2B7FFF] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full pl-8 pr-8 py-1.5 sm:py-2 text-xs font-medium rounded-lg text-slate-800 bg-white border border-slate-200/90 focus:border-[#1E6FF6] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-0.5 pb-0.5 px-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3 h-3 rounded text-[#1E6FF6] border-slate-300 focus:ring-[#1E6FF6] accent-[#1E6FF6] cursor-pointer"
                  />
                  <span className="text-[11px] font-medium text-slate-700">
                    Remember me
                  </span>
                </label>

                {onForgotPassword && (
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-[11px] font-medium text-[#1E6FF6] hover:text-blue-700 hover:underline cursor-pointer select-none transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#1E6FF6] to-[#2563EB] hover:from-[#1859D6] hover:to-[#1D4ED8] active:scale-[0.99] text-white font-medium py-1.5 sm:py-2 px-4 rounded-lg shadow-sm shadow-blue-500/20 transition-all text-xs cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-0.5"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Create Account Form */
            <form onSubmit={handleSignUpSubmit} className="space-y-1.5">
              {!inviteToken && (
                <div className="relative flex items-center">
                  <Building2 className="absolute left-2.5 w-3 h-3 text-[#2B7FFF] pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Business / Firm Name *"
                    className="w-full pl-7.5 pr-2 py-1 text-xs font-medium rounded-lg text-slate-800 bg-white border border-slate-200/90 focus:border-[#1E6FF6] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                  />
                </div>
              )}

              <div className="relative flex items-center">
                <User className="absolute left-2.5 w-3 h-3 text-[#2B7FFF] pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name *"
                  className="w-full pl-7.5 pr-2 py-1 text-xs font-medium rounded-lg text-slate-800 bg-white border border-slate-200/90 focus:border-[#1E6FF6] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="relative flex items-center">
                <Phone className="absolute left-2.5 w-3 h-3 text-[#2B7FFF] pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile (+91, 10 Digits) *"
                  className="w-full pl-7.5 pr-2 py-1 text-xs font-medium rounded-lg text-slate-800 bg-white border border-slate-200/90 focus:border-[#1E6FF6] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="relative flex items-center">
                <Mail className="absolute left-2.5 w-3 h-3 text-[#2B7FFF] pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Work Email *"
                  className="w-full pl-7.5 pr-2 py-1 text-xs font-medium rounded-lg text-slate-800 bg-white border border-slate-200/90 focus:border-[#1E6FF6] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="relative flex items-center">
                <Lock className="absolute left-2.5 w-3 h-3 text-[#2B7FFF] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 8 chars) *"
                  className="w-full pl-7.5 pr-7.5 py-1 text-xs font-medium rounded-lg text-slate-800 bg-white border border-slate-200/90 focus:border-[#1E6FF6] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="px-0.5 flex items-center gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-0.5 flex-1 rounded-full transition-all ${
                        passwordStrength >= step
                          ? passwordStrength <= 2
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              )}

              <div className="relative flex items-center">
                <Lock className="absolute left-2.5 w-3 h-3 text-[#2B7FFF] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password *"
                  className="w-full pl-7.5 pr-2 py-1 text-xs font-medium rounded-lg text-slate-800 bg-white border border-slate-200/90 focus:border-[#1E6FF6] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                />
              </div>

              {!inviteToken && (
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-2 w-2.5 h-2.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full pl-5.5 pr-1.5 py-1 text-[11px] font-medium rounded-md text-slate-800 bg-white border border-slate-200 focus:border-[#1E6FF6] focus:outline-none"
                    />
                  </div>

                  <div className="relative flex items-center">
                    <FileText className="absolute left-2 w-2.5 h-2.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="GSTIN (Optional)"
                      maxLength={15}
                      className="w-full pl-5.5 pr-1.5 py-1 text-[11px] font-medium rounded-md text-slate-800 bg-white border border-slate-200 focus:border-[#1E6FF6] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Terms checkbox */}
              <div className="pt-0.5 px-0.5">
                <label className="flex items-start gap-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-3 h-3 rounded text-[#1E6FF6] border-slate-300 focus:ring-[#1E6FF6] accent-[#1E6FF6] cursor-pointer mt-0.5 shrink-0"
                  />
                  <span className="text-[10px] text-slate-600 leading-tight">
                    I agree to the <span className="text-[#1E6FF6] font-medium">Terms of Service</span> &amp; <span className="text-[#1E6FF6] font-medium">Privacy Policy</span>.
                  </span>
                </label>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#1E6FF6] to-[#2563EB] hover:from-[#1859D6] hover:to-[#1D4ED8] active:scale-[0.99] text-white font-medium py-1.5 sm:py-2 px-4 rounded-lg shadow-sm shadow-blue-500/20 transition-all text-xs cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-1"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>{inviteToken ? 'Join Workspace' : 'Create Business Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Logins */}
          {!needsVerification && (
            <div className="mt-2 pt-1.5 flex flex-col items-center">
              <div className="w-full flex items-center gap-1.5 mb-1">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">Quick Demo Login</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              
              <div className="flex items-center gap-1.5 w-full justify-center">
                {/* Super Admin */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('superadmin')}
                  className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 transition-all cursor-pointer border border-amber-200/60 shadow-2xs active:scale-[0.97]"
                  title="Demo Platform Owner"
                >
                  <Shield size={11} className="text-amber-600 mb-0.5" />
                  <span className="text-[9px] font-bold">Platform</span>
                </button>

                {/* Trader Admin */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-md bg-[#EEF4FF] hover:bg-blue-100/90 text-[#1E5AE6] transition-all cursor-pointer border border-blue-100/60 shadow-2xs active:scale-[0.97]"
                  title="Demo Business Admin"
                >
                  <Building2 size={11} className="text-[#1E5AE6] mb-0.5" />
                  <span className="text-[9px] font-bold">Admin</span>
                </button>

                {/* Salesperson */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('salesperson')}
                  className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-md bg-[#EAFBF3] hover:bg-emerald-100/90 text-[#059669] transition-all cursor-pointer border border-emerald-100/60 shadow-2xs active:scale-[0.97]"
                  title="Demo Sales Rep"
                >
                  <Users size={11} className="text-[#059669] mb-0.5" />
                  <span className="text-[9px] font-bold">Sales Rep</span>
                </button>
              </div>
            </div>
          )}

          {/* Back Link */}
          {onBackToLanding && (
            <div className="mt-1.5 text-center">
              <button
                type="button"
                onClick={onBackToLanding}
                className="text-[10px] font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                ← Back to Homepage
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
