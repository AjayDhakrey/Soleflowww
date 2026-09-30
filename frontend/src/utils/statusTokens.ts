/**
 * SoleFlow Unified Status Tokens
 * Consistent semantic colors, badges, and icon tokens per Spec §37
 */

export interface StatusToken {
  label: string;
  badgeClass: string;
  dotClass: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const ORDER_STATUS_TOKENS: Record<string, StatusToken> = {
  'Draft': {
    label: 'Draft',
    badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    dotClass: 'bg-zinc-400',
    bgClass: 'bg-zinc-50',
    textClass: 'text-zinc-700',
    borderClass: 'border-zinc-200',
  },
  'Under Review': {
    label: 'Under Review',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
    bgClass: 'bg-amber-50/50',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-200',
  },
  'Approved': {
    label: 'Approved',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
    bgClass: 'bg-emerald-50/50',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-200',
  },
  'In Production': {
    label: 'In Production',
    badgeClass: 'bg-zinc-100 text-zinc-900 border-zinc-200',
    dotClass: 'bg-zinc-900 animate-pulse',
    bgClass: 'bg-zinc-50',
    textClass: 'text-zinc-900',
    borderClass: 'border-zinc-200',
  },
  'Ready QC': {
    label: 'Ready QC',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    dotClass: 'bg-purple-500',
    bgClass: 'bg-purple-50/50',
    textClass: 'text-purple-800',
    borderClass: 'border-purple-200',
  },
  'Ready to Dispatch': {
    label: 'Ready to Dispatch',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
    dotClass: 'bg-teal-500',
    bgClass: 'bg-teal-50/50',
    textClass: 'text-teal-800',
    borderClass: 'border-teal-200',
  },
  'Dispatched': {
    label: 'Dispatched',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
    dotClass: 'bg-teal-500',
    bgClass: 'bg-teal-50/50',
    textClass: 'text-teal-800',
    borderClass: 'border-teal-200',
  },
  'Delivered': {
    label: 'Delivered',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
    bgClass: 'bg-emerald-50/50',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-200',
  },
  'Cancelled': {
    label: 'Cancelled',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    dotClass: 'bg-rose-500',
    bgClass: 'bg-rose-50/50',
    textClass: 'text-rose-800',
    borderClass: 'border-rose-200',
  },
};

export const CUSTOMER_STATUS_TOKENS: Record<string, StatusToken> = {
  'active': {
    label: 'Active Balance',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    bgClass: 'bg-emerald-50/30',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
  },
  'due_soon': {
    label: 'Due Soon',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
    bgClass: 'bg-amber-50/30',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
  },
  'overdue': {
    label: 'Overdue Balance',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500 animate-pulse',
    bgClass: 'bg-rose-50/30',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
  },
  'idle': {
    label: 'Zero Due',
    badgeClass: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    dotClass: 'bg-zinc-400',
    bgClass: 'bg-zinc-50',
    textClass: 'text-zinc-600',
    borderClass: 'border-zinc-200',
  },
};

export function getOrderStatusToken(status: string): StatusToken {
  return ORDER_STATUS_TOKENS[status] || ORDER_STATUS_TOKENS['Draft'];
}

export function getCustomerStatusToken(status: string): StatusToken {
  return CUSTOMER_STATUS_TOKENS[status] || CUSTOMER_STATUS_TOKENS['active'];
}

export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['confirmed', 'under_review', 'cancelled'],
  under_review: ['confirmed', 'cancelled', 'draft'],
  confirmed: ['in_production', 'cancelled'],
  in_production: ['ready_qc', 'ready_to_dispatch', 'dispatched', 'cancelled'],
  ready_qc: ['ready_to_dispatch', 'in_production'],
  ready_to_dispatch: ['dispatched'],
  dispatched: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function isValidOrderTransition(currentStatus: string, newStatus: string): boolean {
  const current = currentStatus.toLowerCase().replace(/ /g, '_');
  const next = newStatus.toLowerCase().replace(/ /g, '_');
  if (current === next) return true;
  const allowed = ORDER_STATUS_TRANSITIONS[current];
  if (!allowed) return false;
  return allowed.includes(next);
}

