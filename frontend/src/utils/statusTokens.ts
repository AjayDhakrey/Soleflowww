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
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dotClass: 'bg-slate-400',
    bgClass: 'bg-slate-50 dark:bg-slate-900',
    textClass: 'text-slate-700 dark:text-slate-300',
    borderClass: 'border-slate-200 dark:border-slate-800',
  },
  'Under Review': {
    label: 'Under Review',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    dotClass: 'bg-amber-500',
    bgClass: 'bg-amber-50/50 dark:bg-amber-950/20',
    textClass: 'text-amber-800 dark:text-amber-300',
    borderClass: 'border-amber-200 dark:border-amber-800',
  },
  'Approved': {
    label: 'Approved',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    dotClass: 'bg-blue-500',
    bgClass: 'bg-blue-50/50 dark:bg-blue-950/20',
    textClass: 'text-blue-800 dark:text-blue-300',
    borderClass: 'border-blue-200 dark:border-blue-800',
  },
  'In Production': {
    label: 'In Production',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
    dotClass: 'bg-indigo-500 animate-pulse',
    bgClass: 'bg-indigo-50/50 dark:bg-indigo-950/20',
    textClass: 'text-indigo-800 dark:text-indigo-300',
    borderClass: 'border-indigo-200 dark:border-indigo-800',
  },
  'Ready QC': {
    label: 'Ready QC',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    dotClass: 'bg-purple-500',
    bgClass: 'bg-purple-50/50 dark:bg-purple-950/20',
    textClass: 'text-purple-800 dark:text-purple-300',
    borderClass: 'border-purple-200 dark:border-purple-800',
  },
  'Ready to Dispatch': {
    label: 'Ready to Dispatch',
    badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800',
    dotClass: 'bg-cyan-500',
    bgClass: 'bg-cyan-50/50 dark:bg-cyan-950/20',
    textClass: 'text-cyan-800 dark:text-cyan-300',
    borderClass: 'border-cyan-200 dark:border-cyan-800',
  },
  'Dispatched': {
    label: 'Dispatched',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
    dotClass: 'bg-teal-500',
    bgClass: 'bg-teal-50/50 dark:bg-teal-950/20',
    textClass: 'text-teal-800 dark:text-teal-300',
    borderClass: 'border-teal-200 dark:border-teal-800',
  },
  'Delivered': {
    label: 'Delivered',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    dotClass: 'bg-emerald-500',
    bgClass: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    textClass: 'text-emerald-800 dark:text-emerald-300',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
  },
  'Cancelled': {
    label: 'Cancelled',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    dotClass: 'bg-rose-500',
    bgClass: 'bg-rose-50/50 dark:bg-rose-950/20',
    textClass: 'text-rose-800 dark:text-rose-300',
    borderClass: 'border-rose-200 dark:border-rose-800',
  },
};

export const CUSTOMER_STATUS_TOKENS: Record<string, StatusToken> = {
  'active': {
    label: 'Active Balance',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300',
    dotClass: 'bg-emerald-500',
    bgClass: 'bg-emerald-50/30',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-200',
  },
  'due_soon': {
    label: 'Due Soon',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300',
    dotClass: 'bg-amber-500',
    bgClass: 'bg-amber-50/30',
    textClass: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-200',
  },
  'overdue': {
    label: 'Overdue Balance',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300',
    dotClass: 'bg-rose-500 animate-pulse',
    bgClass: 'bg-rose-50/30',
    textClass: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-200',
  },
  'idle': {
    label: 'Zero Due',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400',
    dotClass: 'bg-slate-400',
    bgClass: 'bg-slate-50',
    textClass: 'text-slate-600 dark:text-slate-400',
    borderClass: 'border-slate-200',
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

