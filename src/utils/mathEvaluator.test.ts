import { describe, it, expect } from 'vitest';
import { evaluateMathExpression } from './mathEvaluator';

describe('evaluateMathExpression', () => {
  it('evaluates basic arithmetic operations', () => {
    expect(evaluateMathExpression('10 + 5').value).toBe(15);
    expect(evaluateMathExpression('20 - 8').value).toBe(12);
    expect(evaluateMathExpression('6 * 7').value).toBe(42);
    expect(evaluateMathExpression('100 / 4').value).toBe(25);
  });

  it('respects operator precedence (PEMDAS/BODMAS)', () => {
    expect(evaluateMathExpression('2 + 3 * 4').value).toBe(14);
    expect(evaluateMathExpression('(2 + 3) * 4').value).toBe(20);
    expect(evaluateMathExpression('2 ^ 3 + 1').value).toBe(9);
  });

  it('handles negative numbers and decimals', () => {
    expect(evaluateMathExpression('-5 + 12').value).toBe(7);
    expect(evaluateMathExpression('3.5 * 2').value).toBe(7);
  });

  it('safely handles division by zero', () => {
    const result = evaluateMathExpression('10 / 0');
    expect(result.isValid).toBe(false);
    expect(result.value).toBeNull();
  });

  it('rejects malicious or invalid code injection attempts without executing them', () => {
    expect(evaluateMathExpression('alert(1)').isValid).toBe(false);
    expect(evaluateMathExpression('window.location').isValid).toBe(false);
    expect(evaluateMathExpression('console.log("test")').isValid).toBe(false);
    expect(evaluateMathExpression('10; drop table users').isValid).toBe(false);
  });

  it('handles empty or blank inputs gracefully', () => {
    expect(evaluateMathExpression('').isValid).toBe(false);
    expect(evaluateMathExpression('   ').isValid).toBe(false);
  });
});
