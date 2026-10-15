import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, User, Users, Shield, Building2, Phone, MapPin, FileText, CheckCircle2, KeyRound, RefreshCw } from 'lucide-react';
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
  const { signIn, signUp, verifySignupOtp, resendSignupOtp, quickDemoLogin } = useAuth();

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
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        setOtpDigits(['', '', '', '', '', '']);
        setOtpError('');
        setResendStatus('');
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        onSuccess('admin');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Failed to create account.');
    }
  };

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      const next = [...otpDigits];
      chars.forEach((c, i) => {
        if (index + i < 6) next[index + i] = c;
      });
      setOtpDigits(next);
      const nextFocus = Math.min(5, index + chars.length);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = clean;
    setOtpDigits(next);
    setOtpError('');

    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const chars = pasted.split('');
    const next = ['', '', '', '', '', ''];
    chars.forEach((c, i) => {
      if (i < 6) next[i] = c;
    });
    setOtpDigits(next);
    setOtpError('');
    const targetFocus = Math.min(5, chars.length);
    otpInputRefs.current[targetFocus]?.focus();
  };

  const handleVerifyOtpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = otpDigits.join('').trim();
    if (token.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setOtpError('');
    setIsVerifyingOtp(true);

    try {
      const res = await verifySignupOtp(verificationEmail, token);
      setIsVerifyingOtp(false);

      if (!res.success) {
        setOtpError(res.error || 'Invalid or expired OTP code. Please try again.');
        return;
      }

      onSuccess(res.role === 'salesperson' ? 'salesperson' : 'admin');
    } catch (err: any) {
      setIsVerifyingOtp(false);
      setOtpError(err?.message || 'Verification failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpError('');
    setResendStatus('');

    try {
      const res = await resendSignupOtp(verificationEmail);
      if (res.success) {
        setResendStatus('A new 6-digit OTP code has been sent to your inbox.');
        setResendCooldown(30);
      } else {
        setOtpError(res.error || 'Failed to resend verification code.');
      }
    } catch (err: any) {
      setOtpError(err?.message || 'Failed to resend verification code.');
    }
  };

  const handleDemoLogin = async (demoRole: 'admin' | 'salesperson') => {
    setError('');
    setIsLoading(true);

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
        <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-[20px] sm:rounded-[24px] shadow-[0_15px_40px_rgba(15,23,42,0.10)] border border-white/90 dark:border-slate-800 px-4 sm:px-5 py-3 sm:py-3.5 transition-all">
          
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
            <div className="flex items-center justify-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg mb-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
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

          {/* Email Verification State (6-Digit OTP) */}
          {needsVerification ? (
            <div className="py-2 space-y-3">
              <div className="text-center space-y-1.5">
                <div className="w-10 h-10 bg-blue-50 text-[#1E6FF6] border border-blue-100 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <KeyRound className="w-5 h-5 text-[#1E6FF6]" />
                </div>
                <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">
                  Verify your account
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed px-1">
                  We sent a 6-digit verification code from <strong className="text-slate-900 font-semibold">ShoeFlow</strong> to{' '}
                  <span className="font-semibold text-slate-800 break-all">{verificationEmail}</span>. Enter it below to activate your account.
                </p>
              </div>

              {/* OTP Error Banner */}
              {otpError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in duration-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="font-medium">{otpError}</span>
                </div>
              )}

              {/* Resend Status Banner */}
              {resendStatus && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium">{resendStatus}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-3">
                {/* 6-Digit Code Inputs */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      disabled={isVerifyingOtp}
                      className="w-9 h-11 sm:w-10 sm:h-12 text-center text-base sm:text-lg font-bold font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-[#1E6FF6] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50 disabled:bg-slate-50"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isVerifyingOtp || otpDigits.join('').trim().length !== 6}
                  className="w-full py-2 px-3 bg-linear-to-r from-[#1E6FF6] to-[#2B7FFF] hover:from-[#1557c0] hover:to-[#1e6ff6] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifyingOtp ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Resend & Back Controls */}
              <div className="pt-1 flex flex-col items-center gap-2">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span>Didn't receive the OTP?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className="font-semibold text-[#1E6FF6] hover:underline cursor-pointer disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNeedsVerification(false);
                    setMode('login');
                    setOtpError('');
                    setResendStatus('');
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  ← Back to Log in
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
                  className="w-full pl-8 pr-2.5 py-1.5 sm:py-2 text-xs font-medium rounded-lg text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 focus:border-[#1E6FF6] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal"
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
                  className="w-full pl-8 pr-8 py-1.5 sm:py-2 text-xs font-medium rounded-lg text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 focus:border-[#1E6FF6] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 transition-colors cursor-pointer"
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
                    className="w-3 h-3 rounded text-[#1E6FF6] border-slate-300 dark:border-slate-600 focus:ring-[#1E6FF6] accent-[#1E6FF6] cursor-pointer"
                  />
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    Remember me
                  </span>
                </label>

                {onForgotPassword && (
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-[11px] font-medium text-[#1E6FF6] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer select-none transition-colors"
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
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">Quick Demo Login</span>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              </div>
              
              <div className="flex items-center gap-1.5 w-full justify-center">
                {/* Trader Admin */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-md bg-[#EEF4FF] dark:bg-blue-950/60 hover:bg-blue-100/90 dark:hover:bg-blue-900/60 text-[#1E5AE6] dark:text-blue-300 transition-all cursor-pointer border border-blue-100/60 dark:border-blue-800/60 shadow-2xs active:scale-[0.97]"
                  title="Demo Business Admin"
                >
                  <Building2 size={11} className="text-[#1E5AE6] dark:text-blue-300 mb-0.5" />
                  <span className="text-[9px] font-bold">Admin</span>
                </button>

                {/* Salesperson */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('salesperson')}
                  className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-md bg-[#EAFBF3] dark:bg-emerald-950/60 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/60 text-[#059669] dark:text-emerald-300 transition-all cursor-pointer border border-emerald-100/60 dark:border-emerald-800/60 shadow-2xs active:scale-[0.97]"
                  title="Demo Sales Rep"
                >
                  <Users size={11} className="text-[#059669] dark:text-emerald-300 mb-0.5" />
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
