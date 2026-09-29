import { describe, it, expect } from 'vitest';

interface LineItem {
  pairs: number;
  rate: number;
}

function calculateOrderTotals(items: LineItem[], gstRate: number = 0.18, discount: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.pairs * item.rate), 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const taxAmount = Math.round((discountedSubtotal * gstRate) * 100) / 100;
  const grandTotal = discountedSubtotal + taxAmount;

  return {
    subtotal,
    discount,
    discountedSubtotal,
    taxAmount,
    grandTotal,
  };
}

describe('Order Pricing and Line Item Mathematics', () => {
  it('calculates subtotal correctly for multiple footwear line items', () => {
    const items = [
      { pairs: 100, rate: 450 }, // 45,000
      { pairs: 50, rate: 600 },  // 30,000
    ];
    const totals = calculateOrderTotals(items, 0.18, 0);
    expect(totals.subtotal).toBe(75000);
    expect(totals.taxAmount).toBe(13500);
    expect(totals.grandTotal).toBe(88500);
  });

  it('applies trade discounts correctly before GST calculation', () => {
    const items = [{ pairs: 200, rate: 500 }]; // 100,000
    const totals = calculateOrderTotals(items, 0.18, 5000); // 95,000 taxable
    expect(totals.discountedSubtotal).toBe(95000);
    expect(totals.taxAmount).toBe(17100);
    expect(totals.grandTotal).toBe(112100);
  });
});
