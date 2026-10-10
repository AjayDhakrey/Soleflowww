import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import { Button } from '../ui/Button';

export const EditCustomerModal: React.FC = () => {
  const {
    isEditCustomerModalOpen,
    setIsEditCustomerModalOpen,
    customerToEdit,
    updateCustomer,
    salesTeam,
    currentUser,
  } = useApp();

  const [businessName, setBusinessName] = useState('');
  const [propName, setPropName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [cluster, setCluster] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [creditLimit, setCreditLimit] = useState<number | string>(500000);
  const [paymentTerms, setPaymentTerms] = useState('30% Advance + 70% Bilty');
  const [salespersonId, setSalespersonId] = useState('');
  const [tier, setTier] = useState<string>('Tier 2');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state whenever customerToEdit changes or modal opens
  useEffect(() => {
    if (customerToEdit && isEditCustomerModalOpen) {
      setBusinessName(customerToEdit.businessName || '');
      setPropName(customerToEdit.propName || '');
      setPhone(customerToEdit.phone || '');
      setWhatsapp(customerToEdit.whatsapp || customerToEdit.phone || '');
      setEmail(customerToEdit.email || '');
      setCity(customerToEdit.city || '');
      setState(customerToEdit.state || '');
      setCluster(customerToEdit.cluster || '');
      setAddress(customerToEdit.address || '');
      setGstin(customerToEdit.gstin || '');
      setCreditLimit(customerToEdit.creditLimit ?? 500000);
      setPaymentTerms(customerToEdit.paymentTerms || '30% Advance + 70% Bilty');
      setSalespersonId(customerToEdit.salespersonId || '');
      setTier(customerToEdit.tier || 'Tier 2');
      setNotes(customerToEdit.notes || '');
    }
  }, [customerToEdit, isEditCustomerModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditCustomerModalOpen) {
        setIsEditCustomerModalOpen(false);
      }
    };
    if (isEditCustomerModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditCustomerModalOpen, setIsEditCustomerModalOpen]);

  if (!isEditCustomerModalOpen || !customerToEdit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !businessName.trim() || !phone.trim()) return;

    setIsSaving(true);
    const assignedRep = salesTeam.find((s) => s.id === salespersonId);

    const success = await updateCustomer(customerToEdit.id, {
      businessName: businessName.trim(),
      propName: propName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      email: email.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      cluster: cluster.trim() || undefined,
      address: address.trim(),
      gstin: gstin.trim() || undefined,
      creditLimit: Number(creditLimit) || 0,
      paymentTerms,
      salespersonId: salespersonId || undefined,
      salespersonName: assignedRep?.name || customerToEdit.salespersonName,
      tier: (tier as any) || customerToEdit.tier,
      notes: notes.trim() || undefined,
    });

    setIsSaving(false);
    if (success) {
      setIsEditCustomerModalOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150"
      onClick={() => setIsEditCustomerModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-customer-title"
    >
      <div
        className="relative w-full max-w-xl bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Icons.Edit size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="edit-customer-title" className="font-bold text-lg text-foreground tracking-tight">
                  Edit Customer Details
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                  {customerToEdit.id}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update profile, commercial terms, and contact info for {customerToEdit.businessName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditCustomerModalOpen(false)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <Icons.Close size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Store Name & Proprietor */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Store / Business Name *
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Royal Footwear Emporium"
              className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Proprietor / Contact Person
              </label>
              <input
                type="text"
                value={propName}
                onChange={(e) => setPropName(e.target.value)}
                placeholder="e.g. Arvind Singhania"
                className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Primary Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98000 00000"
                className="w-full h-11 px-3.5 text-sm font-mono bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                WhatsApp Connect Number
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91 98000 00000"
                className="w-full h-11 px-3.5 text-sm font-mono bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Location details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                City / Market Hub *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Agra"
                className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Uttar Pradesh"
                className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Market Cluster
              </label>
              <input
                type="text"
                value={cluster}
                onChange={(e) => setCluster(e.target.value)}
                placeholder="e.g. Hing Ki Mandi"
                className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Market / Godown Consignment Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Shop 24, Hing Ki Mandi Wholesale Market, Agra - 282003"
              className="w-full p-3 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Commercial & Financial Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                GSTIN Number
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="09AAACA9999F1Z0"
                className="w-full h-11 px-3.5 text-sm font-mono bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Credit Limit (₹)
              </label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="w-full h-11 px-3.5 text-sm font-mono bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="30% Advance + 70% Bilty">30% Advance + 70% Bilty</option>
                <option value="100% Against Dispatch/Lorry Receipt">100% Against Dispatch/Lorry Receipt</option>
                <option value="15 Days Net Wholesale Credit">15 Days Net Wholesale Credit</option>
                <option value="30 Days Net Wholesale Credit">30 Days Net Wholesale Credit</option>
                <option value="100% Advance Payment (Immediate)">100% Advance Payment (Immediate)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Assigned Sales Representative
              </label>
              <select
                value={salespersonId}
                onChange={(e) => setSalespersonId(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="">Unassigned</option>
                {salesTeam.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    {rep.name} ({rep.zone || 'Sales'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Retailer Tier / Classification
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="Tier 1">Tier 1 (High Volume Distributor)</option>
                <option value="Tier 2">Tier 2 (Regular Wholesale Retailer)</option>
                <option value="Tier 3">Tier 3 (Occasional / New Buyer)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Internal Account Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Prefers Sunday delivery, cash discount requested"
                className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditCustomerModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Icons.Check}
              disabled={isSaving}
            >
              {isSaving ? 'Saving Changes…' : 'Update Customer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

