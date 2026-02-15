/**
 * Wordle feedback types:
 * 'g' = green (correct position)
 * 'y' = yellow (wrong position, letter is in word)
 * 'x' = gray (letter not in word, or already accounted for)
 */
export type Feedback = 'g' | 'y' | 'x';

export interface Guess {
  word: string;
  feedback: Feedback[];
}

/**
 * Given a candidate word and a set of guesses with feedback,
 * return true if the candidate is consistent with all feedback.
 */
export function isConsistent(candidate: string, guesses: Guess[]): boolean {
  for (const guess of guesses) {
    if (!matchesFeedback(candidate, guess)) return false;
  }
  return true;
}

function matchesFeedback(candidate: string, guess: Guess): boolean {
  const { word, feedback } = guess;

  for (let i = 0; i < 5; i++) {
    if (feedback[i] === 'g') {
      // Letter must be at this position
      if (candidate[i] !== word[i]) return false;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (feedback[i] === 'y') {
      // Letter must NOT be at this position
      if (candidate[i] === word[i]) return false;
      // But letter must exist somewhere in the candidate
      if (!candidate.includes(word[i])) return false;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (feedback[i] === 'x') {
      const letter = word[i];
      // Count how many times this letter appears as green or yellow in this guess
      let requiredCount = 0;
      for (let j = 0; j < 5; j++) {
        if (word[j] === letter && (feedback[j] === 'g' || feedback[j] === 'y')) {
          requiredCount++;
        }
      }
      // The candidate must have exactly requiredCount of this letter
      const candidateCount = candidate.split('').filter(c => c === letter).length;
      if (candidateCount > requiredCount) return false;
    }
  }

  return true;
}

/**
 * Filter a word list down to candidates consistent with all guesses.
 */
export function filterCandidates(wordList: string[], guesses: Guess[]): string[] {
  return wordList.filter(word => isConsistent(word, guesses));
}
