import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  MapPin,
  Target,
  Percent,
  Shield,
  Briefcase,
  Share2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface CreateSalesRepresentativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  onSuccess?: () => void;
}

export const CreateSalesRepresentativeModal: React.FC<CreateSalesRepresentativeModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'salesperson',
  onSuccess,
}) => {
  const { createTeamMemberAccount, showToast } = useApp();

  // Step state: 'form' | 'success'
  const [step, setStep] = useState<'form' | 'success'>('form');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [zone, setZone] = useState('Agra Hub • Hing Ki Mandi');
  const [monthlyTarget, setMonthlyTarget] = useState<number>(1500000);
  const [commissionRate, setCommissionRate] = useState<number>(3.5);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
    zone: string;
    monthlyTarget: number;
  } | null>(null);

  // Auto-generate a secure, memorable password
  const generatePassword = () => {
    const prefixes = ['Sole', 'Foot', 'Agra', 'Flow', 'Step', 'Walk'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newPass = `${randomPrefix}@${randomNum}`;
    setPassword(newPass);
  };

  // Generate initial password when opening modal
  useEffect(() => {
    if (isOpen && step === 'form' && !password) {
      generatePassword();
    }
  }, [isOpen, step]);

  // Auto-suggest email based on name
  const handleNameChange = (val: string) => {
    setName(val);
    const sanitized = val.trim().toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.');
    if (sanitized && (!email || email.endsWith('@soleflow.com'))) {
      setEmail(`${sanitized}.sales@soleflow.com`);
    }
  };

  if (!isOpen) return null;

  const getPortalUrl = () => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}/#login`;
    }
    return 'https://soleflowww.vercel.app/#login';
  };

  const formatTargetInWords = (num: number) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Crore`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} Lakh`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter representative full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid Login ID (Email).');
      return;
    }
    if (!password || password.length < 6) {
      showToast('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createTeamMemberAccount({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        role,
        zone,
        cluster: zone,
        monthlyTarget,
        commissionRate,
      });

      if (!res.success) {
        showToast(res.error || 'Failed to create representative account.');
        setIsSubmitting(false);
        return;
      }

      setCreatedCredentials({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        role,
        zone,
        monthlyTarget,
      });

      setStep('success');
      showToast(`Account created for ${name.trim()}! Ready to share credentials.`);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Error creating account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormattedShareMessage = () => {
    if (!createdCredentials) return '';
    const portalUrl = getPortalUrl();
    const cleanPhone = createdCredentials.phone.replace(/\D/g, '');

    return `👞 *SoleFlow Field Sales Console Access*
----------------------------------------
👋 Hello *${createdCredentials.name}*,

Welcome to the SoleFlow Sales Force team! Here are your credentials to log in to the sales portal:

🌐 *Portal URL:* ${portalUrl}
📧 *Login ID:* ${createdCredentials.email}
🔑 *Password:* ${createdCredentials.password}
📍 *Territory:* ${createdCredentials.zone}
🎯 *Monthly Target:* ${formatTargetInWords(createdCredentials.monthlyTarget)}

📲 Log in on your mobile or laptop to review your assigned retail accounts, catalog, and daily field stops.
----------------------------------------`;
  };

  const handleCopyCredentials = () => {
    const text = getFormattedShareMessage();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Login credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = getFormattedShareMessage();
    if (!text || !createdCredentials) return;

    let cleanPhone = createdCredentials.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast('Opening WhatsApp with pre-filled credentials...');
  };

  const handleResetAndClose = () => {
    setStep('form');
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setCreatedCredentials(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${step === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-primary/10 text-primary'}`}>
              {step === 'success' ? <CheckCircle2 size={19} /> : <UserPlus size={19} />}
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-foreground">
                {step === 'success' ? 'Representative Account Created 🎉' : 'Add Sales Representative'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {step === 'success'
                  ? 'Share login credentials directly with the representative'
                  : 'Create account and set login ID & password for immediate access'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <form onSubmit={handleCreateAccount} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Representative Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram Rathore"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Role & Territory Zone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Access Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="salesperson">Field Sales Representative</option>
                  <option value="admin">Trader Administrator</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Territory Zone / Hub
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="Agra Hub • Hing Ki Mandi">Agra Hub • Hing Ki Mandi</option>
                  <option value="Delhi NCR • Karol Bagh & CP">Delhi NCR • Karol Bagh & CP</option>
                  <option value="Kanpur Cluster • Collectorganj">Kanpur Cluster • Collectorganj</option>
                  <option value="Jaipur Hub • MI Road Market">Jaipur Hub • MI Road</option>
                  <option value="Mumbai • Linking Road & Bandra">Mumbai • Linking Road</option>
                  <option value="South Zone • Bengaluru / Chennai">South Zone • Bengaluru / Chennai</option>
                </select>
              </div>
            </div>

            {/* Login Email / ID */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">
                  Login ID (Email Address) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-muted-foreground">Used by representative to sign in</span>
              </div>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram.sales@soleflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Login Password (with auto-generate & show/hide) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">
                  Assigned Login Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  <Sparkles size={11} /> Auto-Generate
                </button>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter or generate temporary password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-9 pr-10 text-xs font-mono rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Admin can share this ID and password directly via WhatsApp or copyable link.
              </p>
            </div>

            {/* Mobile / WhatsApp Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">
                  Mobile Number (WhatsApp)
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Instant WhatsApp dispatch
                </span>
              </div>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Sales Rep Targets (if salesperson) */}
            {role === 'salesperson' && (
              <div className="p-3 bg-muted/40 rounded-2xl border border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Target size={14} className="text-primary" /> Monthly Quota Target
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {formatTargetInWords(monthlyTarget)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1000000, 1500000, 2000000, 2500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setMonthlyTarget(amt)}
                      className={`flex-1 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                        monthlyTarget === amt
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-surface border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ₹{amt / 100000}L
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleResetAndClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={UserPlus}
                loading={isSubmitting}
              >
                Create & Generate Credentials
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: CREDENTIALS SHARING SCREEN */}
        {step === 'success' && createdCredentials && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Success Callout */}
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  Account Ready for {createdCredentials.name}
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5 leading-relaxed">
                  The account has been created. Share the login credentials below with the representative so they can sign in immediately.
                </p>
              </div>
            </div>

            {/* Credentials Card */}
            <div className="p-4 bg-muted/60 dark:bg-muted/30 border border-border rounded-2xl space-y-3 font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-border/70">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Representative Login Card
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-primary/10 text-primary">
                  {createdCredentials.role === 'admin' ? 'Trader Admin' : 'Field Sales Rep'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground block font-medium">Portal URL</span>
                  <a
                    href={getPortalUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-primary hover:underline flex items-center gap-1 text-[11px] font-medium break-all"
                  >
                    {getPortalUrl()} <ExternalLink size={10} />
                  </a>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground block font-medium">Assigned Territory</span>
                  <span className="font-semibold text-foreground text-xs">{createdCredentials.zone}</span>
                </div>

                <div className="p-2.5 bg-surface rounded-xl border border-border">
                  <span className="text-[10px] text-muted-foreground block font-medium">Login ID / Email</span>
                  <span className="font-mono font-bold text-foreground text-xs select-all">
                    {createdCredentials.email}
                  </span>
                </div>

                <div className="p-2.5 bg-surface rounded-xl border border-border">
                  <span className="text-[10px] text-muted-foreground block font-medium">Assigned Password</span>
                  <span className="font-mono font-bold text-primary text-xs select-all">
                    {createdCredentials.password}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: WhatsApp & Copy */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
              >
                <Share2 size={15} />
                Share Credentials via WhatsApp {createdCredentials.phone ? `to ${createdCredentials.name}` : ''}
              </button>

              <button
                type="button"
                onClick={handleCopyCredentials}
                className="w-full h-10 px-4 rounded-xl border border-border bg-surface hover:bg-muted text-foreground font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-500" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy size={14} className="text-muted-foreground" />
                    Copy Credentials Message
                  </>
                )}
              </button>
            </div>

            {/* Footer Done Button */}
            <div className="pt-2 border-t border-border flex justify-end">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleResetAndClose}
              >
                Done / Return to Console
              </Button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

