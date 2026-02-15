import { type Feedback, filterCandidates, type Guess } from './filter.js';

/**
 * Compute the feedback that would result from guessing `guess` if `answer` is the true word.
 */
export function computeFeedback(guess: string, answer: string): Feedback[] {
  const result: Feedback[] = ['x', 'x', 'x', 'x', 'x'];
  const answerUsed = [false, false, false, false, false];

  // First pass: greens
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'g';
      answerUsed[i] = true;
    }
  }

  // Second pass: yellows
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'g') continue;
    for (let j = 0; j < 5; j++) {
      if (!answerUsed[j] && guess[i] === answer[j]) {
        result[i] = 'y';
        answerUsed[j] = true;
        break;
      }
    }
  }

  return result;
}

/**
 * Calculate expected information (entropy) for a guess given remaining candidates.
 * Higher entropy = more informative guess.
 */
export function calculateEntropy(guess: string, candidates: string[]): number {
  const patternCounts = new Map<string, number>();

  for (const candidate of candidates) {
    const feedback = computeFeedback(guess, candidate);
    const key = feedback.join('');
    patternCounts.set(key, (patternCounts.get(key) ?? 0) + 1);
  }

  let entropy = 0;
  const total = candidates.length;
  for (const count of patternCounts.values()) {
    const p = count / total;
    if (p > 0) entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * Rank candidates by expected information gain.
 * Returns top N suggestions sorted by entropy (descending).
 */
export function rankGuesses(
  candidates: string[],
  allWords: string[],
  topN: number = 10
): Array<{ word: string; entropy: number }> {
  // If few candidates remain, only evaluate those
  const guessPool = candidates.length <= 20 ? candidates : allWords;

  const scored = guessPool.map(word => ({
    word,
    entropy: calculateEntropy(word, candidates),
  }));

  scored.sort((a, b) => b.entropy - a.entropy);
  return scored.slice(0, topN);
}

/**
 * Get the best opening guess (precomputed: "salet" or "crane" are strong).
 * For speed, we use a known good opener rather than computing entropy over 2309 words.
 */
export function getBestOpener(): string {
  return 'crane';
}
