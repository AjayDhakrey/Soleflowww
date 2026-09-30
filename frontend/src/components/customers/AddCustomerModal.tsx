import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import { Button } from '../ui/Button';

export const AddCustomerModal: React.FC = () => {
  const { isAddCustomerModalOpen, setIsAddCustomerModalOpen, addCustomer } = useApp();

  const [businessName, setBusinessName] = useState('');
  const [propName, setPropName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Agra');
  const [state, setState] = useState('Uttar Pradesh');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [creditLimit, setCreditLimit] = useState(500000);
  const [paymentTerms, setPaymentTerms] = useState('30% Advance + 70% Bilty');

  if (!isAddCustomerModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;
    addCustomer({
      businessName: businessName.trim(),
      propName: propName.trim(),
      phone: phone.trim() || '+91 98000 12345',
      whatsapp: phone.trim() || '+91 98000 12345',
      city: city.trim(),
      state: state.trim(),
      address: address.trim() || `${city} Wholesale Footwear Market`,
      gstin: gstin.trim() || '09AAACA9999F1Z0',
      creditLimit: Number(creditLimit),
      paymentTerms,
    });
    setIsAddCustomerModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-xl border border-border overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Icons.Clients size={20} strokeWidth={1.75} />
            </div>
            <h3 className="font-bold text-lg text-foreground tracking-tight">
              Add Retailer Client Account
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAddCustomerModalOpen(false)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
          >
            <Icons.Close size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Store / Business Name *
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Royal Footwear Emporium"
              className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Proprietor Name
              </label>
              <input
                type="text"
                value={propName}
                onChange={(e) => setPropName(e.target.value)}
                placeholder="e.g. Arvind Singhania"
                className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98000 00000"
                className="w-full h-12 px-4 text-sm font-mono bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                City / Market Hub
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Agra"
                className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Uttar Pradesh"
                className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Market / Godown Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Shop 24, Hing Ki Mandi Footwear Market"
              className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                GSTIN Number
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="09AAACA9999F1Z0"
                className="w-full h-12 px-4 text-sm font-mono bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors uppercase"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Credit Limit (₹)
              </label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="w-full h-12 px-4 text-sm font-mono bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Wholesale Payment Terms
            </label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option value="30% Advance + 70% Bilty">30% Advance + 70% Bilty</option>
              <option value="100% Against Dispatch/Lorry Receipt">100% Against Dispatch/Lorry Receipt</option>
              <option value="15 Days Net Wholesale Credit">15 Days Net Wholesale Credit</option>
              <option value="30 Days Net Wholesale Credit">30 Days Net Wholesale Credit</option>
              <option value="100% Advance Payment (Immediate)">100% Advance Payment (Immediate)</option>
            </select>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddCustomerModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Icons.Check}>
              Save Client
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
