import { describe, it, expect } from 'vitest';
import { filterCandidates, isConsistent, type Guess } from '../src/filter.js';

describe('isConsistent', () => {
  it('matches green feedback', () => {
    const guess: Guess = { word: 'crane', feedback: ['g', 'x', 'x', 'x', 'x'] };
    expect(isConsistent('cloud', [guess])).toBe(true);  // c at pos 0, no r/a/n/e
    expect(isConsistent('about', [guess])).toBe(false);  // no c at pos 0
  });

  it('matches yellow feedback', () => {
    const guess: Guess = { word: 'crane', feedback: ['x', 'x', 'x', 'y', 'x'] };
    // 'n' must be in the word but not at position 3, and no c/r/a/e
    expect(isConsistent('nutty', [guess])).toBe(true);
    expect(isConsistent('blind', [guess])).toBe(false); // has 'n' but also no c/r/a/e... wait 'blind' has n at pos 3? b,l,i,n,d - pos 3 is n. So yellow says n must NOT be at pos 3.
  });

  it('handles green correctly — letter at exact position', () => {
    const guess: Guess = { word: 'hello', feedback: ['x', 'x', 'g', 'x', 'x'] };
    // position 2 must be 'l'. Gray 'l' at pos 3 means only 1 'l' allowed.
    // Gray h, e, o means those letters must not appear.
    expect(isConsistent('built', [guess])).toBe(false); // has no l at pos 2
    expect(isConsistent('sulky', [guess])).toBe(true);   // s,u,l,k,y — l at pos 2, exactly 1 l, no h/e/o
    expect(isConsistent('billy', [guess])).toBe(false);  // has 2 l's (gray l limits to 1)
  });

  it('handles gray with duplicate letters', () => {
    // Guess "sleep" with feedback: s=g, l=x, e=y, e=x, p=x
    // Required: s at pos 0, no l, no p, exactly 1 e (not at pos 2)
    const guess: Guess = { word: 'sleep', feedback: ['g', 'x', 'y', 'x', 'x'] };
    expect(isConsistent('shrew', [guess])).toBe(true);   // s at 0, has 1 e, no l/p
    expect(isConsistent('sleek', [guess])).toBe(false);   // has l
    expect(isConsistent('sweet', [guess])).toBe(false);   // has 2 e's
  });

  it('handles multiple guesses', () => {
    const guesses: Guess[] = [
      { word: 'crane', feedback: ['x', 'y', 'x', 'x', 'y'] },
      { word: 'moist', feedback: ['x', 'x', 'x', 'x', 'x'] },
    ];
    // Need: r somewhere (not pos 1), e somewhere (not pos 4), no c/a/n/m/o/i/s/t
    // rebel: r,e,b,e,l — has r (not pos 1), has e (not pos 4), no c/a/n/m/o/i/s/t ✓
    expect(isConsistent('rebel', guesses)).toBe(true);
    // motel: has o and t which are gray from guess 2
    expect(isConsistent('motel', guesses)).toBe(false);
  });
});

describe('filterCandidates', () => {
  it('narrows word list based on feedback', () => {
    const words = ['crane', 'gruff', 'trump', 'bluff', 'fruit'];
    const guesses: Guess[] = [
      { word: 'crane', feedback: ['x', 'g', 'x', 'x', 'x'] },
    ];
    const result = filterCandidates(words, guesses);
    // Must have 'r' at position 1, no c/a/n/e
    expect(result.every(w => w[1] === 'r')).toBe(true);
    expect(result).toContain('gruff');
    expect(result).toContain('fruit');
    expect(result).not.toContain('crane');
  });

  it('returns empty when no words match', () => {
    const words = ['crane', 'brain'];
    const guesses: Guess[] = [
      { word: 'crane', feedback: ['g', 'g', 'g', 'g', 'x'] },
    ];
    const result = filterCandidates(words, guesses);
    expect(result).toEqual([]);
  });

  it('handles all green — only exact match', () => {
    const words = ['crane', 'brain', 'train'];
    const guesses: Guess[] = [
      { word: 'crane', feedback: ['g', 'g', 'g', 'g', 'g'] },
    ];
    expect(filterCandidates(words, guesses)).toEqual(['crane']);
  });
});
