import { z } from 'zod';

export const ClientSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  contact_person: z.string().optional(),
  phone: z.string().min(10, 'Enter a valid 10-digit phone number'),
  whatsapp: z.string().optional(),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  cluster: z.string().optional(),
  address: z.string().optional(),
  gstin: z.string().optional(),
  salesperson_id: z.string().optional().nullable(),
  payment_terms: z.string().default('30% Advance + 70% Bilty'),
  credit_limit: z.number().min(0, 'Credit limit must be non-negative').default(0),
  tier: z.string().default('Standard Retail'),
  notes: z.string().optional(),
});

export const DesignSchema = z.object({
  article_code: z.string().min(2, 'Article code is required (e.g. SF-1024)'),
  name: z.string().min(2, 'Design name is required'),
  category: z.string().min(2, 'Category is required'),
  wholesale_price: z.number().positive('Price must be greater than zero'),
  sample_price: z.number().optional().nullable(),
  moq_pairs: z.number().int().positive('MOQ must be at least 1 pair'),
  moq_cartons: z.number().int().positive('MOQ Cartons must be at least 1'),
  sizes: z.array(z.number()).min(1, 'Select at least one size'),
  colors: z.array(z.string()).min(1, 'Select at least one color'),
  tags: z.array(z.string()).default([]),
  sole_type: z.string().optional().nullable(),
  upper_material: z.string().optional().nullable(),
  pairs_per_carton: z.number().int().positive().default(12),
  margin_badge: z.string().optional().nullable(),
  velocity_badge: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
});

export const OrderItemSchema = z.object({
  design_id: z.string().optional().nullable(),
  design_name: z.string().min(1, 'Design name required'),
  article_code: z.string().min(1, 'Article code required'),
  rate_per_pair: z.number().positive('Rate must be positive'),
  total_pairs: z.number().int().positive('Pairs count must be positive'),
  total_cartons: z.number().int().min(0).default(0),
  loose_pairs: z.number().int().min(0).default(0),
  item_subtotal: z.number().min(0),
  size_breakdown: z.array(z.any()).default([]),
});

export const OrderSchema = z.object({
  client_id: z.string().min(1, 'Select a client'),
  salesperson_id: z.string().optional().nullable(),
  manufacturer_id: z.string().optional().nullable(),
  subtotal: z.number().min(0),
  trade_discount_percent: z.number().min(0).max(100).default(0),
  trade_discount_amount: z.number().min(0).default(0),
  taxable_subtotal: z.number().min(0),
  gst_percent: z.number().min(0).max(28).default(12),
  gst_amount: z.number().min(0).default(0),
  net_payable: z.number().min(0),
  advance_deposited: z.number().min(0).default(0),
  balance_due: z.number().min(0),
  expected_delivery: z.string().optional().nullable(),
  batch_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(OrderItemSchema).min(1, 'Add at least one shoe article to the order'),
});

export const PaymentSchema = z.object({
  client_id: z.string().min(1, 'Select a customer'),
  amount: z.number().positive('Payment amount must be greater than zero'),
  payment_mode: z.enum(['UPI', 'Cash', 'NEFT', 'RTGS', 'Cheque', 'Bank Transfer']),
  reference_no: z.string().optional().nullable(),
  payment_date: z.string().default(() => new Date().toISOString().split('T')[0]),
  notes: z.string().optional().nullable(),
  salesperson_id: z.string().optional().nullable(),
  allocations: z.array(z.object({
    order_id: z.string(),
    amount: z.number().positive(),
  })).optional(),
});

export const FollowUpSchema = z.object({
  client_id: z.string().min(1, 'Select a client'),
  salesperson_id: z.string().optional().nullable(),
  order_id: z.string().optional().nullable(),
  reason: z.string().min(2, 'Reason is required'),
  due_date: z.string().min(1, 'Due date is required'),
  due_time: z.string().optional().nullable(),
  amount_due: z.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['today', 'upcoming', 'overdue', 'completed']).default('upcoming'),
});

export const FieldVisitSchema = z.object({
  client_id: z.string().min(1, 'Select a client'),
  salesperson_id: z.string().optional().nullable(),
  location: z.string().min(2, 'Location is required'),
  visit_date: z.string().default(() => new Date().toISOString().split('T')[0]),
  visit_time: z.string().optional().nullable(),
  purpose: z.string().min(2, 'Purpose is required'),
  outcome: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  verified_gps: z.boolean().default(false),
  status: z.enum(['today', 'upcoming', 'completed']).default('today'),
});

export type ClientInput = z.infer<typeof ClientSchema>;
export type DesignInput = z.infer<typeof DesignSchema>;
export type OrderInput = z.infer<typeof OrderSchema>;
export type PaymentInput = z.infer<typeof PaymentSchema>;
export type FollowUpInput = z.infer<typeof FollowUpSchema>;
export type FieldVisitInput = z.infer<typeof FieldVisitSchema>;

export const clientSchema = ClientSchema;
export const designSchema = DesignSchema;
export const orderSchema = OrderSchema;
export const paymentSchema = PaymentSchema;
export const followUpSchema = FollowUpSchema;
export const fieldVisitSchema = FieldVisitSchema;

