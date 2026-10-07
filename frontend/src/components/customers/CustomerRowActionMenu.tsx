import React, { useState, useRef, useEffect } from 'react';
import { Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  MoreVertical,
  Eye,
  Plus,
  DollarSign,
  Share2,
  Phone,
  MessageSquare,
  Calendar,
  UserCheck,
  Archive,
  Copy,
  Check,
} from 'lucide-react';

interface CustomerRowActionMenuProps {
  customer: Customer;
  onNavigate: (path: string) => void;
  fromPath?: string;
  align?: 'left' | 'right';
}

export const CustomerRowActionMenu: React.FC<CustomerRowActionMenuProps> = ({
  customer,
  onNavigate,
  fromPath = '/admin/customers',
  align = 'right',
}) => {
  const {
    currentUser,
    setSelectedCustomer,
    setIsCreateOrderModalOpen,
    setIsPaymentModalOpen,
    setIsShareModalOpen,
    showToast,
    addFollowUp,
    archiveCustomer,
    assignCustomerSalesman,
    salesTeam,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignedRep, setAssignedRep] = useState(customer.salespersonId || '');
  const [isAssigning, setIsAssigning] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleOpenDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setSelectedCustomer(customer);
    const basePath = currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers';
    onNavigate(`${basePath}/${customer.id}?from=${encodeURIComponent(fromPath)}`);
  };

  const handleNewOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setSelectedCustomer(customer);
    setIsCreateOrderModalOpen(true);
  };

  const handleRecordPayment = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setSelectedCustomer(customer);
    setIsPaymentModalOpen(true);
  };

  const handleShareLookbook = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setSelectedCustomer(customer);
    setIsShareModalOpen(true);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    const rawPhone = (customer.whatsapp || customer.phone || '').replace(/[^0-9]/g, '');
    const phone = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`;
    const amountStr = (customer.amountDue || 0).toLocaleString('en-IN');
    const message = encodeURIComponent(
      `Hello ${customer.propName || customer.businessName}, greetings from SoleFlow! We are pleased to share our latest seasonal footwear catalog with you.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    window.location.href = `tel:${customer.phone}`;
  };

  const handleScheduleFollowUp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    await addFollowUp({ customerId: customer.id, customerName: customer.businessName, customerCity: customer.city, phone: customer.phone, reason: 'call', status: 'today', date: new Date().toISOString(), notes: 'Follow-up scheduled from customer menu' });
  };

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(customer.id);
    setCopied(true);
    showToast(`Copied Client ID: ${customer.id}`);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 800);
  };

  const handleAssignSalesman = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setIsAssignOpen(true);
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (window.confirm(`Are you sure you want to archive ${customer.businessName}?`)) {
      if (await archiveCustomer(customer.id)) showToast(`${customer.businessName} has been archived`);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      {isAssignOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Assign sales representative">
        <div className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-xl space-y-4">
          <h3 className="font-semibold">Assign {customer.businessName}</h3>
          <select aria-label="Sales representative" className="w-full border border-border rounded-lg p-2 bg-surface" value={assignedRep} onChange={e => setAssignedRep(e.target.value)}>
            <option value="">Select representative</option>
            {salesTeam.map(rep => <option key={rep.id} value={rep.id}>{rep.name}</option>)}
          </select>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsAssignOpen(false)}>Cancel</button>
            <button type="button" disabled={!assignedRep || isAssigning} onClick={async () => {
              setIsAssigning(true);
              try { if (await assignCustomerSalesman(customer.id, assignedRep)) { setIsAssignOpen(false); showToast('Sales representative assignment saved.'); } }
              finally { setIsAssigning(false); }
            }}>{isAssigning ? 'Saving…' : 'Save assignment'}</button>
          </div>
        </div>
      </div>}
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Options for ${customer.businessName}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          isOpen ? 'bg-muted text-foreground ring-2 ring-blue-500/20' : ''
        }`}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1 w-52 rounded-xl bg-surface border border-border shadow-xl py-1 text-xs text-foreground animate-in fade-in zoom-in-95 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="menu"
          aria-orientation="vertical"
        >
          {/* View Details */}
          <button
            type="button"
            onClick={handleOpenDetails}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-muted/70 transition-colors font-medium cursor-pointer"
            role="menuitem"
          >
            <Eye size={14} className="text-blue-600 dark:text-blue-400" />
            <span>View Full Details</span>
          </button>

          {/* New Order */}
          <button
            type="button"
            onClick={handleNewOrder}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-muted/70 transition-colors font-medium cursor-pointer"
            role="menuitem"
          >
            <Plus size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>New Wholesale Order</span>
          </button>

          {/* Record Payment */}
          <button
            type="button"
            onClick={handleRecordPayment}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-muted/70 transition-colors font-medium cursor-pointer"
            role="menuitem"
          >
            <DollarSign size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Record Payment</span>
          </button>

          {/* Share Lookbook */}
          <button
            type="button"
            onClick={handleShareLookbook}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-muted/70 transition-colors font-medium cursor-pointer"
            role="menuitem"
          >
            <Share2 size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Share Catalogue</span>
          </button>

          <div className="my-1 border-t border-border" />

          {/* Call */}
          <button
            type="button"
            onClick={handleCall}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-muted/70 transition-colors font-medium cursor-pointer"
            role="menuitem"
          >
            <Phone size={14} className="text-blue-500" />
            <span>Call Proprietor</span>
          </button>

          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-muted/70 transition-colors font-medium cursor-pointer"
            role="menuitem"
          >
            <MessageSquare size={14} className="text-emerald-500" />
            <span>WhatsApp Message</span>
          </button>

          {/* Schedule Follow-up */}
          <button
            type="button"
            onClick={handleScheduleFollowUp}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-muted/70 transition-colors font-medium cursor-pointer"
            role="menuitem"
          >
            <Calendar size={14} className="text-amber-500" />
            <span>Schedule Follow-up</span>
          </button>

          {/* Copy ID */}
          <button
            type="button"
            onClick={handleCopyId}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-muted/70 transition-colors font-medium cursor-pointer"
            role="menuitem"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-muted-foreground" />}
            <span>Copy Client ID ({customer.id})</span>
          </button>

          {/* Admin only actions */}
          {currentUser.role === 'admin' && (
            <>
              <div className="my-1 border-t border-border" />

              <button
                type="button"
                onClick={handleAssignSalesman}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-muted/70 transition-colors font-medium cursor-pointer"
                role="menuitem"
              >
                <UserCheck size={14} className="text-indigo-500" />
                <span>Assign Sales Representative</span>
              </button>

              <button
                type="button"
                onClick={handleArchive}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors font-medium cursor-pointer"
                role="menuitem"
              >
                <Archive size={14} />
                <span>Archive Account</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
