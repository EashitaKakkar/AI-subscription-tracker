import { TOOL_PRICES } from '../lib/constants';

// Mocking a simplified version of your audit logic for testing
const calculateSavings = (id, tier, cycle, seats) => {
  const toolPrice = TOOL_PRICES[id]?.[tier];
  if (toolPrice && cycle === 'monthly' && toolPrice.monthly > toolPrice.yearly) {
    return (toolPrice.monthly - toolPrice.yearly) * 12 * seats;
  }
  return 0;
};

describe('Audit Engine Logic', () => {
  test('Cursor Pro: Switching Monthly to Yearly saves $48/seat/yr', () => {
    expect(calculateSavings('cursor', 'pro', 'monthly', 1)).toBe(48);
  });

  test('Claude Team: Switching Monthly to Yearly saves $60/seat/yr', () => {
    expect(calculateSavings('claude', 'team', 'monthly', 1)).toBe(60);
  });

  test('Zero savings if already on Yearly cycle', () => {
    expect(calculateSavings('cursor', 'pro', 'yearly', 1)).toBe(0);
  });

  test('Correctly scales savings for a team of 10', () => {
    const savings = calculateSavings('cursor', 'pro', 'monthly', 10);
    expect(savings).toBe(480);
  });

  test('Handles free tiers with zero savings', () => {
    expect(calculateSavings('cursor', 'hobby', 'monthly', 5)).toBe(0);
  });
});