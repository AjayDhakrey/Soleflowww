import { describe, it, expect } from 'vitest';
import { clientSchema, orderSchema, paymentSchema, designSchema } from '../services/validation';

describe('Zod Domain Schema Validation', () => {
  describe('clientSchema', () => {
    it('accepts valid Indian B2B client data', () => {
      const validClient = {
        name: 'Agra Shoe Palace',
        phone: '9876543210',
        city: 'Agra',
        state: 'Uttar Pradesh',
        status: 'active',
        gstin: '09AAAAA0000A1Z5',
        credit_limit: 500000,
        payment_terms: '30% Advance + 70% Bilty',
      };

      const result = clientSchema.safeParse(validClient);
      expect(result.success).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      const invalidClient = {
        name: 'Agra Shoe Palace',
        phone: '123', // Too short
        city: 'Agra',
        state: 'UP',
      };

      const result = clientSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });
  });

  describe('paymentSchema', () => {
    it('validates payment input and rejects non-positive amounts', () => {
      const validPayment = {
        client_id: 'cli-123',
        amount: 25000,
        payment_mode: 'Bank Transfer' as const,
        reference_no: 'NEFT998877',
      };
      expect(paymentSchema.safeParse(validPayment).success).toBe(true);

      const invalidPayment = {
        client_id: 'cli-123',
        amount: -500,
        payment_mode: 'Cash' as const,
      };
      expect(paymentSchema.safeParse(invalidPayment).success).toBe(false);
    });
  });

  describe('orderSchema', () => {
    it('requires at least one order line item', () => {
      const validOrder = {
        client_id: 'cli-123',
        subtotal: 54000,
        taxable_subtotal: 54000,
        net_payable: 63720,
        balance_due: 63720,
        items: [
          {
            design_id: 'des-001',
            design_name: 'Oxford Tan Classic',
            article_code: 'SF-1024',
            rate_per_pair: 450,
            total_pairs: 120,
            item_subtotal: 54000,
          },
        ],
      };
      expect(orderSchema.safeParse(validOrder).success).toBe(true);

      const emptyOrder = {
        client_id: 'cli-123',
        subtotal: 0,
        taxable_subtotal: 0,
        net_payable: 0,
        balance_due: 0,
        items: [],
      };
      expect(orderSchema.safeParse(emptyOrder).success).toBe(false);
    });
  });
});
