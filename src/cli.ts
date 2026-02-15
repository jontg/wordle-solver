import * as readline from 'readline';
import { WORD_LIST } from './wordlist.js';
import { type Feedback, filterCandidates, type Guess } from './filter.js';
import { getBestOpener, rankGuesses } from './solver.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(prompt: string): Promise<string> {
  return new Promise(resolve => rl.question(prompt, resolve));
}

function parseFeedback(input: string): Feedback[] | null {
  const cleaned = input.toLowerCase().replace(/\s/g, '');

  // Support emoji input: 🟩=g, 🟨=y, ⬛/⬜=x
  const emojiMap: Record<string, Feedback> = {
    '🟩': 'g', '🟨': 'y', '⬛': 'x', '⬜': 'x',
  };

  let result: Feedback[] = [];

  // Try emoji parsing first
  const emojis = [...cleaned];
  const emojiResult: Feedback[] = [];
  for (const char of emojis) {
    if (emojiMap[char]) emojiResult.push(emojiMap[char]);
  }
  if (emojiResult.length === 5) return emojiResult;

  // Try letter parsing (g/y/x)
  if (cleaned.length === 5 && /^[gyx]+$/.test(cleaned)) {
    return cleaned.split('') as Feedback[];
  }

  return null;
}

async function main() {
  console.log('\n🟩 Wordle Solver');
  console.log('================');
  console.log('Enter your guesses and feedback to get suggestions.');
  console.log('Feedback format: g=green, y=yellow, x=gray');
  console.log('  Example: "crane xyxgx" or "crane 🟨⬛🟩⬛⬛"\n');

  const guesses: Guess[] = [];
  let candidates = [...WORD_LIST];

  console.log(`📚 ${candidates.length} possible words`);
  console.log(`💡 Suggested opener: ${getBestOpener()}\n`);

  for (let round = 1; round <= 6; round++) {
    const input = await ask(`Round ${round} — enter "word feedback": `);

    if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
      console.log('Goodbye!');
      break;
    }

    const parts = input.trim().split(/\s+/);
    if (parts.length < 2) {
      console.log('⚠️  Format: word feedback (e.g., "crane xygxx")');
      round--;
      continue;
    }

    const word = parts[0].toLowerCase();
    const feedbackStr = parts.slice(1).join('');

    if (word.length !== 5) {
      console.log('⚠️  Word must be 5 letters');
      round--;
      continue;
    }

    const feedback = parseFeedback(feedbackStr);
    if (!feedback) {
      console.log('⚠️  Feedback must be 5 chars of g/y/x (or emoji 🟩🟨⬛)');
      round--;
      continue;
    }

    if (feedback.every(f => f === 'g')) {
      console.log(`\n🎉 Solved in ${round}! The word is "${word.toUpperCase()}"`);
      break;
    }

    guesses.push({ word, feedback });
    candidates = filterCandidates(WORD_LIST, guesses);

    console.log(`\n📊 ${candidates.length} candidates remaining`);

    if (candidates.length === 0) {
      console.log('❌ No candidates match — check your feedback!');
      break;
    }

    if (candidates.length === 1) {
      console.log(`✅ The answer must be: ${candidates[0].toUpperCase()}`);
      break;
    }

    if (candidates.length <= 10) {
      console.log(`   Remaining: ${candidates.join(', ')}`);
    }

    const suggestions = rankGuesses(candidates, WORD_LIST, 5);
    console.log('\n💡 Top suggestions:');
    for (const s of suggestions) {
      const inList = candidates.includes(s.word) ? '✓' : ' ';
      console.log(`   ${inList} ${s.word}  (entropy: ${s.entropy.toFixed(2)})`);
    }
    console.log();
  }

  rl.close();
}

main().catch(console.error);
