import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { PaymentReceipt } from '../types';
import {
  DEFAULT_RECEIPT_COMPANY,
  ReceiptCompanyInfo,
  ReceiptCustomerExtras,
  ReceiptStatus,
  mapPaymentStatusToReceiptStatus,
} from '../components/payments/ReceiptTemplate';

export function useReceiptData(paymentId: string | undefined) {
  const { payments, customers } = useApp();
  const { user, isAdmin } = useAuth();

  // Query database if available, with AppContext fallback
  const { data: dbPayment, isLoading, error } = useQuery({
    queryKey: ['payment-receipt', paymentId],
    queryFn: async () => {
      if (!paymentId) return null;
      if (!supabase) return null;

      const { data, error: err } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .maybeSingle();

      if (err || !data) return null;

      return {
        id: data.id,
        receiptNumber: data.receiptNumber || `SF-REC-${data.id.slice(-5)}`,
        customerId: data.customerId || '',
        customerName: data.customerName || 'Customer Store',
        customerCity: data.customerCity || 'Agra',
        orderId: data.orderId || undefined,
        orderNumber: data.orderNumber || undefined,
        amountDueBefore: Number(data.amountDueBefore ?? 0),
        paymentAmount: Number(data.paymentAmount ?? 0),
        amountDueAfter: Number(data.amountDueAfter ?? 0),
        paymentDate: data.paymentDate || new Date().toISOString().slice(0, 10),
        paymentMethod: (data.paymentMethod === 'NEFT' ? 'NEFT/RTGS' : data.paymentMethod) as PaymentReceipt['paymentMethod'],
        utrRef: data.utrRef || '',
        collectedBy: data.collectedBy || 'Sales Rep',
        notes: data.notes || '',
        sentSms: Boolean(data.sentSms),
        status: data.status || 'verified',
        chequeNo: data.cheque_no || undefined,
        chequeBank: data.cheque_bank || undefined,
        chequeDate: data.cheque_date || undefined,
      } as PaymentReceipt;
    },
    staleTime: 1000 * 60,
    enabled: Boolean(paymentId),
  });

  const payment = useMemo(() => {
    if (dbPayment) return dbPayment;
    return payments.find((p) => p.id === paymentId || p.receiptNumber === paymentId) || null;
  }, [dbPayment, payments, paymentId]);

  const customerRecord = useMemo(() => {
    if (!payment) return null;
    return customers.find((c) => c.id === payment.customerId) || null;
  }, [payment, customers]);

  // Access check: Salesman can only view their own assigned clients
  const hasAccess = useMemo(() => {
    if (!payment) return false;
    if (isAdmin) return true;
    if (!customerRecord) return true; // fallback if customer unassigned
    return (
      customerRecord.salespersonId === user?.id ||
      customerRecord.salespersonName?.toLowerCase().includes(user?.name.toLowerCase() || '') ||
      payment.collectedBy?.toLowerCase().includes(user?.name.toLowerCase() || '')
    );
  }, [payment, isAdmin, customerRecord, user]);

  const company: ReceiptCompanyInfo = useMemo(() => {
    return {
      ...DEFAULT_RECEIPT_COMPANY,
      brandName: 'ShoeConnect',
      legalName: 'SoleFlow Footwear Trading Ltd.',
      tagline: 'Step Towards Better Tomorrow',
      address: 'Agra Mandi Dock 4, Hing Ki Mandi, Agra, Uttar Pradesh',
      gstin: '09AAACS4412M1Z0',
      logoUrl: '/assets/images/shoeconnect-logo.png',
    };
  }, []);

  const customer: ReceiptCustomerExtras = useMemo(() => {
    if (!customerRecord && !payment) return {};
    return {
      customerCode: customerRecord?.id || payment?.customerId,
      gstin: customerRecord?.gstin || undefined,
      phone: customerRecord?.phone || undefined,
      address: customerRecord?.address
        ? `${customerRecord.address}, ${customerRecord.city}, ${customerRecord.state}`
        : `${payment?.customerCity || 'Agra'}, Uttar Pradesh`,
    };
  }, [customerRecord, payment]);

  const status: ReceiptStatus = useMemo(() => {
    return mapPaymentStatusToReceiptStatus(payment?.status);
  }, [payment?.status]);

  return {
    receipt: payment,
    company,
    customer,
    status,
    isLoading,
    error: error ? (error as any).message : null,
    isFound: Boolean(payment),
    hasAccess,
  };
}
