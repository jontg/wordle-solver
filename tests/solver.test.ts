import { describe, it, expect } from 'vitest';
import { computeFeedback, calculateEntropy, rankGuesses } from '../src/solver.js';

describe('computeFeedback', () => {
  it('all green for exact match', () => {
    expect(computeFeedback('crane', 'crane')).toEqual(['g', 'g', 'g', 'g', 'g']);
  });

  it('all gray for no match', () => {
    expect(computeFeedback('crane', 'built')).toEqual(['x', 'x', 'x', 'x', 'x']);
  });

  it('mixed feedback', () => {
    // guess: crane, answer: recon
    // c -> yellow (c is in recon at pos 2)
    // r -> yellow (r is in recon at pos 0)
    // a -> gray
    // n -> yellow (n is in recon at pos 4)
    // e -> yellow (e is in recon at pos 1)
    expect(computeFeedback('crane', 'recon')).toEqual(['y', 'y', 'x', 'y', 'y']);
  });

  it('handles duplicate letters correctly', () => {
    // guess: speed, answer: creep
    // s -> gray
    // p -> yellow (p at pos 4 in creep)
    // e -> green (e at pos 2 in creep)
    // e -> green (e at pos 3 in creep)
    // d -> gray
    expect(computeFeedback('speed', 'creep')).toEqual(['x', 'y', 'g', 'g', 'x']);
  });

  it('handles duplicate guess letters with limited answer letters', () => {
    // guess: geese, answer: edges
    // g -> yellow (g at pos 2 in edges)
    // e -> yellow (e at pos 0 in edges)
    // e -> yellow (e at pos 3 in edges)
    // s -> yellow (s at pos 4 in edges)
    // e -> gray (no more e's available)
    expect(computeFeedback('geese', 'edges')).toEqual(['y', 'y', 'y', 'y', 'x']);
  });
});

describe('calculateEntropy', () => {
  it('returns 0 for a single candidate', () => {
    expect(calculateEntropy('crane', ['crane'])).toBe(0);
  });

  it('returns positive entropy for multiple candidates', () => {
    const candidates = ['crane', 'brain', 'train', 'grain', 'plain'];
    const entropy = calculateEntropy('crane', candidates);
    expect(entropy).toBeGreaterThan(0);
  });

  it('perfect split gives maximum entropy', () => {
    // If a guess perfectly splits 2 candidates, entropy = 1 bit
    const candidates = ['abcde', 'fghij'];
    const entropy = calculateEntropy('abcde', candidates);
    expect(entropy).toBeCloseTo(1.0, 1);
  });
});

describe('rankGuesses', () => {
  it('returns ranked suggestions', () => {
    const candidates = ['crane', 'brain', 'train', 'grain', 'plain'];
    const ranked = rankGuesses(candidates, candidates, 3);
    expect(ranked.length).toBeLessThanOrEqual(3);
    expect(ranked[0].entropy).toBeGreaterThanOrEqual(ranked[1]?.entropy ?? 0);
  });

  it('suggests the only remaining word', () => {
    const candidates = ['crane'];
    const ranked = rankGuesses(candidates, candidates, 5);
    expect(ranked.length).toBe(1);
    expect(ranked[0].word).toBe('crane');
  });
});
