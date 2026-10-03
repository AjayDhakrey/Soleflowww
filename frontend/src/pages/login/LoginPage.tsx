import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthProvider';

import newBackdrop from '../../assets/images/login/new_clean_login_stage_backdrop.png';
import soleflowLogo from '../../assets/images/login/soleflow_brand_logo.png';

interface LoginPageProps {
  onSuccess: (role: 'admin' | 'salesperson') => void;
  initialMode?: 'login' | 'signup';
  onBackToLanding?: () => void;
  onForgotPassword?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onForgotPassword,
  onBackToLanding,
}) => {
  const { login: appLogin } = useApp();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('soleflow.admin@gmail.com');
  const [password, setPassword] = useState('Password123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleQuickFill = (role: 'admin' | 'salesperson') => {
    if (role === 'admin') {
      setEmail('soleflow.admin@gmail.com');
      setPassword('Password123!');
    } else {
      setEmail('soleflow.sales@gmail.com');
      setPassword('Password123!');
    }
  };

  return (
    <div className="relative w-screen h-screen min-h-[100dvh] max-h-[100dvh] overflow-hidden select-none bg-[#F8FAFC] flex items-center justify-center m-0 p-0">
      
      {/* 1. Full Page Edge-to-Edge Background Artwork */}
      <img
        src={newBackdrop}
        alt="SoleFlow Showcase Backdrop"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
      />

      {/* 2. Floating Centered Login Card */}
      <div className="relative z-20 w-full max-w-[380px] sm:max-w-[400px] mx-auto px-4">
        <div className="bg-white/95 backdrop-blur-md rounded-[26px] sm:rounded-[32px] shadow-[0_20px_50px_rgba(15,23,42,0.09)] border border-white/90 px-6 sm:px-8 py-5 sm:py-6 transition-all">
          
          {/* SoleFlow Brand Logo */}
          <div className="flex flex-col items-center justify-center mb-2.5">
            <img
              src={soleflowLogo}
              alt="SoleFlow"
              className="h-11 sm:h-13 w-auto object-contain pointer-events-none select-none"
            />
          </div>

          {/* Heading */}
          <div className="text-center mb-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Welcome <span className="text-[#1E5AE6]">back</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-medium rounded-xl text-slate-800 bg-white border border-slate-200/90 focus:border-[#1E5AE6] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm font-medium rounded-xl text-slate-800 bg-white border border-slate-200/90 focus:border-[#1E5AE6] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5 pb-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#1E5AE6] border-slate-300 focus:ring-[#1E5AE6] accent-[#1E5AE6] cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700">
                  Remember me
                </span>
              </label>

              {onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs font-semibold text-[#1E5AE6] hover:text-blue-700 hover:underline cursor-pointer select-none transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#1E5AE6] hover:bg-[#1848BD] active:scale-[0.99] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-600/25 transition-all text-xs sm:text-sm md:text-base cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher Integrated Inside Card */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Demo
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="px-2.5 py-1 rounded-lg bg-blue-50/90 hover:bg-blue-100 text-[#1E5AE6] font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                title="Fill Admin Credentials"
              >
                <ShieldCheck size={13} className="text-[#1E5AE6]" />
                <span>Trader (Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('salesperson')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50/90 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                title="Fill Salesperson Credentials"
              >
                <UserCheck size={13} className="text-emerald-600" />
                <span>Sales Rep</span>
              </button>
            </div>
          </div>

          {/* Back to Homepage Link */}
          {onBackToLanding && (
            <div className="mt-2.5 text-center">
              <button
                type="button"
                onClick={onBackToLanding}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
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
