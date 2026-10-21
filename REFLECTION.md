# Reflection

**Name / Andrew ID:**
Matt Gershenzon/mgershe2

**Recitation group members (Task 2):**

---

### 1. Valid but weak

Pick a property you wrote that passes on the correct implementation but
kills few or no mutants. Why is it still a *valid* property? Describe a
concrete bug (not one of our mutants) that it *would* catch.

The wordle property "returns exactly five colors" is valid because the Wordle specification requires the scoring output to contain one color token for each of the five letter positions. It killed no mutants because none of them altered the output array length, but it would catch a bug where an implementation crashes.

### 2. A generator problem, not a property problem

Describe a mutant, from either task, that survived or was flaky because of
your **generator** rather than your property. What did the generator fail to
produce? How did you fix it? Paste the runner output from before and after.

The mutant singlePass was flaky (killed in only 2 of 5 runs) by the property "never credits a letter more times than the secret contains it".

Because the generator chose letters uniformly from the full 26-letter alphabet (ALPHABET), it rarely generated words sharing the duplicate letters and positional collisions necessary to trip up a single-pass greedy matching algorithm within fast-check's sample budget. I fixed this by restricting the generator's pool to a smaller alphabet (e.g., 'ABCDE'), which drastically increases the frequency of shared and duplicate letters between secret and guess.

BEFORE: Running against 5 mutants (5 runs each)...

  ✔ allBlack       killed  by: guessing the secret gives all greens
      Counterexample: [["A","A","A","A","A"]]
      AssertionError: expected [ 'B', 'B', 'B', 'B', 'B' ] to deeply equal [ 'G', 'G', 'G', 'G', 'G' ]
  ✘ greensOnly     SURVIVED
  ✔ ignoresCounts  killed  by: never credits a letter more times than the secret contains it
      Counterexample: [["U","A","A","A","A"],["A","A","A","U","U"]]
      AssertionError: expected 2 to be less than or equal to 1
  ✔ singlePass     killed  by: never credits a letter more times than the secret contains it
      Counterexample: [["A","A","A","A","H"],["A","A","A","H","H"]]
      AssertionError: expected 2 to be less than or equal to 1
  ✔ swapped        killed  by: never credits a letter more times than the secret contains it
      Counterexample: [["C","A","A","A","A"],["A","P","A","A","A"]]
      AssertionError: expected 1 to be less than or equal to 0

Mutation score: 4/5 killed (80%)


AFTER: Running against 5 mutants (5 runs each)...

  ✔ allBlack       killed  by: guessing the secret gives all greens
      Counterexample: [["A","A","A","A","A"]]
      AssertionError: expected [ 'B', 'B', 'B', 'B', 'B' ] to deeply equal [ 'G', 'G', 'G', 'G', 'G' ]
  ✘ greensOnly     SURVIVED
  ✔ ignoresCounts  killed  by: never credits a letter more times than the secret contains it
      Counterexample: [["A","A","A","A","C"],["A","A","A","A","A"]]
      AssertionError: expected 5 to be less than or equal to 4
  ✔ singlePass     killed  by: never credits a letter more times than the secret contains it
      Counterexample: [["A","A","A","A","C"],["A","A","C","A","C"]]
      AssertionError: expected 2 to be less than or equal to 1
  ✔ swapped        killed  by: never credits a letter more times than the secret contains it
      Counterexample: [["A","A","A","A","C"],["A","A","C","A","B"]]
      AssertionError: expected 1 to be less than or equal to 0



### 3. Reading a counterexample

Paste one counterexample that the mutation runner printed for a killed
mutant. In 2–3 sentences, explain using the *specification* why that input
exposes the bug.

✔ ignoresCounts  killed  by: never credits a letter more times than the secret contains it
      Counterexample: [["A","A","A","D","A"],["A","D","D","A","A"]]
      AssertionError: expected 2 to be less than or equal to 1

      The specification says a letter cannot recieve positive credit more times than it actually appears in the secret, so the "D" should only be ocunted once.

### 4. Your project

Name one function or module in your team's project that would benefit from
property-based testing. State two properties in English, name the pattern of
each, and describe the generator you'd need, including anything about its
inputs that a naive generator would get wrong.

Property 1 (Algebraic): Toggling hint mode on and then immediately off returns the session state to its exact original configuration without side effects.

Property 2 (Invariant): Whenever hint mode is active, the formatted prompt payload sent to the model must always include the concise guidance system instruction, regardless of the user query.