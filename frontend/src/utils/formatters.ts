/**
 * SoleFlow Indian Formatting & Date Utilities
 * Enforces Indian Currency grouping, Lakh formatting, and Asia/Kolkata timezone
 */

export function formatINR(amount: number | null | undefined, decimals = 0): string {
  if (amount === null || amount === undefined || isNaN(amount)) return decimals > 0 ? '₹0.00' : '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatINRLakhs(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00 L';
  const inLakhs = amount / 100000;
  if (inLakhs >= 100) {
    const inCrores = inLakhs / 100;
    return `₹${inCrores.toFixed(2)} Cr`;
  }
  if (amount < 100000 && amount > 0) {
    return formatINR(amount);
  }
  return `₹${inLakhs.toFixed(2)} L`;
}

export const formatLakhs = formatINRLakhs;

export function formatDateIST(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return dateStr;
  }
}

export const formatDate = formatDateIST;

export function formatDateTimeIST(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return dateStr;
  }
}

export const formatDateTime = formatDateTimeIST;
