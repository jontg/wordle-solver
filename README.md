# Wordle Solver

A CLI tool that helps solve Wordle puzzles using entropy-based information theory.

## Setup

```bash
npm install
```

## Usage

```bash
npx tsx src/cli.ts
```

The solver will suggest an opening word, then you enter each guess with its feedback:

```
Round 1 — enter "word feedback": crane xygxx
```

### Feedback format

| Symbol | Meaning |
|--------|---------|
| `g` | 🟩 Green — correct letter, correct position |
| `y` | 🟨 Yellow — correct letter, wrong position |
| `x` | ⬛ Gray — letter not in word |

You can also use emoji: `crane 🟨⬛🟩⬛⬛`

### Example session

```
🟩 Wordle Solver
================
📚 2309 possible words
💡 Suggested opener: crane

Round 1 — enter "word feedback": crane xygxx
📊 87 candidates remaining

💡 Top suggestions:
   ✓ lousy  (entropy: 5.12)
   ✓ doily  (entropy: 5.08)
   ...
```

## Testing

```bash
npm test
```

## How it works

1. **Filtering**: Each guess + feedback eliminates impossible words, correctly handling duplicate letters
2. **Entropy scoring**: Ranks potential guesses by expected information gain — the guess that best splits remaining candidates wins
3. **Suggestions**: Shows top 5 guesses with entropy scores; ✓ marks words that could be the answer

## Project structure

```
src/
  wordlist.ts  — Official Wordle answer list (2,309 words)
  filter.ts    — Feedback matching & candidate filtering
  solver.ts    — Entropy calculation & guess ranking
  cli.ts       — Interactive CLI interface
tests/
  filter.test.ts
  solver.test.ts
```
