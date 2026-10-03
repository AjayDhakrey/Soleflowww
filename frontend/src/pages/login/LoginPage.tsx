import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, User, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthProvider';

import studioBackdrop from '../../assets/images/login/studio_3d_backdrop_clean.png';
import studioLogo from '../../assets/images/login/studio_logo_clean.png';

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
    <div className="relative w-screen h-screen min-h-[100dvh] max-h-[100dvh] overflow-hidden select-none bg-white flex items-center justify-center m-0 p-0">
      
      {/* 1. Full Page 3D Studio Stage Backdrop */}
      <img
        src={studioBackdrop}
        alt="SoleFlow 3D Studio Stage"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
      />

      {/* 2. Seamless Central Login Card Matching Exact Design */}
      <div className="relative z-20 w-full max-w-[340px] sm:max-w-[370px] mx-auto px-4">
        <div className="bg-white rounded-[28px] sm:rounded-[34px] shadow-[0_20px_50px_rgba(15,23,42,0.12)] border border-slate-100/90 px-6 sm:px-7 py-5 sm:py-6 transition-all">
          
          {/* Circular Orbit Logo Emblem */}
          <div className="flex flex-col items-center justify-center mb-3.5">
            <img
              src={studioLogo}
              alt="SoleFlow Emblem"
              className="h-16 sm:h-18 w-auto object-contain pointer-events-none select-none"
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-2.5">
            
            {/* Email Address Pill Input */}
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-[#2B7FFF] pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                autoComplete="email"
                className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-2xl text-slate-800 bg-white border border-slate-200/90 focus:border-[#1E6FF6] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              />
            </div>

            {/* Password Pill Input */}
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-[#2B7FFF] pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-2xl text-slate-800 bg-white border border-slate-200/90 focus:border-[#1E6FF6] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between pt-0.5 pb-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#1E6FF6] border-slate-300 focus:ring-[#1E6FF6] accent-[#1E6FF6] cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Remember me
                </span>
              </label>

              {onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs font-semibold text-[#1E6FF6] hover:text-blue-700 hover:underline cursor-pointer select-none transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>

            {/* Sign In Primary Pill Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1E6FF6] to-[#2563EB] hover:from-[#1859D6] hover:to-[#1D4ED8] active:scale-[0.99] text-white font-bold py-2.5 sm:py-3 px-6 rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-xs sm:text-sm cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-1"
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

          {/* Quick Demo Segment with Trader & Sales Rep Badges */}
          <div className="mt-3.5 pt-2.5 flex items-center justify-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            
            <div className="flex items-center gap-2.5">
              {/* Trader Button */}
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="flex flex-col items-center justify-center py-2 px-3.5 rounded-2xl bg-[#EEF4FF] hover:bg-blue-100/90 text-[#1E5AE6] transition-all cursor-pointer border border-blue-100/60 shadow-2xs active:scale-[0.97]"
                title="Fill Admin Credentials"
              >
                <User size={16} className="text-[#1E5AE6] mb-0.5" />
                <span className="text-[11px] font-bold text-slate-800">Trader</span>
              </button>

              {/* Sales Rep Button */}
              <button
                type="button"
                onClick={() => handleQuickFill('salesperson')}
                className="flex flex-col items-center justify-center py-2 px-3.5 rounded-2xl bg-[#EAFBF3] hover:bg-emerald-100/90 text-[#059669] transition-all cursor-pointer border border-emerald-100/60 shadow-2xs active:scale-[0.97]"
                title="Fill Salesperson Credentials"
              >
                <Users size={16} className="text-[#059669] mb-0.5" />
                <span className="text-[11px] font-bold text-slate-800">Sales Rep</span>
              </button>
            </div>

            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Back Link */}
          {onBackToLanding && (
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={onBackToLanding}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
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
