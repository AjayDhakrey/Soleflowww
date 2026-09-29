import { describe, it, expect } from 'vitest';
import { isValidOrderTransition, ORDER_STATUS_TRANSITIONS } from '../utils/statusTokens';

describe('Order Status Transition State Machine', () => {
  it('allows valid state progression for an order', () => {
    expect(isValidOrderTransition('draft', 'confirmed')).toBe(true);
    expect(isValidOrderTransition('confirmed', 'in_production')).toBe(true);
    expect(isValidOrderTransition('in_production', 'dispatched')).toBe(true);
    expect(isValidOrderTransition('dispatched', 'delivered')).toBe(true);
  });

  it('allows cancellation from unfulfilled stages', () => {
    expect(isValidOrderTransition('draft', 'cancelled')).toBe(true);
    expect(isValidOrderTransition('confirmed', 'cancelled')).toBe(true);
    expect(isValidOrderTransition('in_production', 'cancelled')).toBe(true);
  });

  it('rejects illegal status regressions and jumps', () => {
    expect(isValidOrderTransition('delivered', 'draft')).toBe(false);
    expect(isValidOrderTransition('delivered', 'in_production')).toBe(false);
    expect(isValidOrderTransition('cancelled', 'delivered')).toBe(false);
    expect(isValidOrderTransition('draft', 'delivered')).toBe(false);
  });
});
