import { describe, it, expect } from 'vitest';

interface Invoice {
  id: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
}

function calculateAgingBuckets(invoices: Invoice[], asOfDate: Date = new Date()) {
  const buckets = {
    current: 0,   // 0-30 days
    bucket31_60: 0, // 31-60 days
    bucket61_90: 0, // 61-90 days
    bucket90Plus: 0, // >90 days
    totalOutstanding: 0,
  };

  invoices.forEach((inv) => {
    const outstanding = Math.max(0, inv.totalAmount - inv.paidAmount);
    if (outstanding <= 0) return;

    buckets.totalOutstanding += outstanding;
    const due = new Date(inv.dueDate);
    const diffMs = asOfDate.getTime() - due.getTime();
    const overdueDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (overdueDays <= 30) {
      buckets.current += outstanding;
    } else if (overdueDays <= 60) {
      buckets.bucket31_60 += outstanding;
    } else if (overdueDays <= 90) {
      buckets.bucket61_90 += outstanding;
    } else {
      buckets.bucket90Plus += outstanding;
    }
  });

  return buckets;
}

describe('Receivables Aging Calculation', () => {
  it('correctly aggregates overdue balances into 0-30, 31-60, 61-90, 90+ buckets', () => {
    const today = new Date('2026-04-01T00:00:00Z');
    const invoices: Invoice[] = [
      { id: '1', totalAmount: 50000, paidAmount: 20000, dueDate: '2026-03-20T00:00:00Z' }, // 12 days overdue -> 30,000 in current
      { id: '2', totalAmount: 40000, paidAmount: 0, dueDate: '2026-02-15T00:00:00Z' },     // 45 days overdue -> 40,000 in 31-60
      { id: '3', totalAmount: 60000, paidAmount: 10000, dueDate: '2026-01-10T00:00:00Z' }, // 81 days overdue -> 50,000 in 61-90
      { id: '4', totalAmount: 100000, paidAmount: 0, dueDate: '2025-11-01T00:00:00Z' },    // 151 days overdue -> 100,000 in 90+
      { id: '5', totalAmount: 25000, paidAmount: 25000, dueDate: '2025-10-01T00:00:00Z' },  // Fully paid -> 0
    ];

    const result = calculateAgingBuckets(invoices, today);

    expect(result.current).toBe(30000);
    expect(result.bucket31_60).toBe(40000);
    expect(result.bucket61_90).toBe(50000);
    expect(result.bucket90Plus).toBe(100000);
    expect(result.totalOutstanding).toBe(220000);
  });
});
