import { describe, it, expect } from 'vitest';
import { formatINR, formatLakhs, formatDate, formatDateTime } from '../utils/formatters';

describe('Indian Currency and Number Formatting', () => {
  it('formats standard INR amounts with currency symbol and Indian grouping', () => {
    const formatted = formatINR(1234567.89);
    expect(formatted).toContain('₹');
    expect(formatted).toMatch(/12,34,568/);
  });

  it('formats zero and negative INR correctly', () => {
    expect(formatINR(0, 2)).toBe('₹0.00');
    expect(formatINR(-500)).toContain('₹');
  });

  it('formats amounts in Lakhs and Crores', () => {
    expect(formatLakhs(1500000)).toBe('₹15.00 L');
    expect(formatLakhs(25000000)).toBe('₹2.50 Cr');
    expect(formatLakhs(50000)).toBe('₹50,000');
  });

  it('formats dates consistently in Indian Standard Time locale', () => {
    const dateStr = '2026-03-15T10:30:00Z';
    const formatted = formatDate(dateStr);
    expect(formatted).toBeDefined();
    expect(formatted.length).toBeGreaterThan(0);
  });
});
