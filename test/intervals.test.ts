import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { mergeIntervals, type Interval } from '../src/intervals';

const intGen = fc.integer({ min: -1000, max: 1000 });

const interval: fc.Arbitrary<Interval> = fc
  .tuple(intGen, intGen)
  .map(([a, b]) => (a <= b ? [a, b] : [b, a]));
const intervalList = fc.array(interval);

describe('mergeIntervals', () => {
  // Pattern: invariant. Every input interval lies inside some output interval.
  it('every input interval lies inside some output interval', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        const uncovered = xs.filter(([s, e]) => !out.some(([a, b]) => a <= s && e <= b));
        expect(uncovered).toEqual([]);
      }),
    );
  });

  // Pattern: invariant. Output intervals are sorted and strictly separated.
  it('output intervals are strictly disjoint and ordered', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        for (let i = 0; i < out.length - 1; i++) {
          const currentEnd = out[i][1];
          const nextStart = out[i + 1][0];
          // By postcondition: result[i][1] < result[i + 1][0]
          expect(currentEnd).toBeLessThan(nextStart);
        }
      }),
    );
  });

  // Pattern: invariant. Does not mutate the input array or its interval tuples.
  it('does not mutate input array or input elements', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const snapshot = xs.map(([s, e]) => [s, e] as Interval);
        mergeIntervals(xs);
        expect(xs).toEqual(snapshot);
      }),
    );
  });

  // Pattern: algebraic. Idempotence: merging already merged intervals yields the exact same list.
  it('is idempotent: merge(merge(xs)) === merge(xs)', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const once = mergeIntervals(xs);
        const twice = mergeIntervals(once);
        expect(twice).toEqual(once);
      }),
    );
  });

  // Pattern: algebraic. Commutativity under permutation: order of input intervals does not affect the output.
  it('is order-independent across permutations', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const shuffled = [...xs].sort(() => Math.random() - 0.5);
        expect(mergeIntervals(xs)).toEqual(mergeIntervals(shuffled));
      }),
    );
  });

  // Pattern: metamorphic. 
  it('commutes with translation (shift invariance)', () => {
    fc.assert(
      fc.property(intervalList, fc.integer({ min: -500, max: 500 }), (xs, k) => {
        const shiftedInput: Interval[] = xs.map(([s, e]) => [s + k, e + k]);
        const originalOut = mergeIntervals(xs);
        const expectedShiftedOut: Interval[] = originalOut.map(([s, e]) => [s + k, e + k]);

        expect(mergeIntervals(shiftedInput)).toEqual(expectedShiftedOut);
      }),
    );
  });

  // Pattern: metamorphic. 
  it('covers a subset of the range covered by the full set', () => {
    fc.assert(
      fc.property(intervalList, intervalList, (xs, ys) => {
        const combined = [...xs, ...ys];
        const outPart = mergeIntervals(xs);
        const outTotal = mergeIntervals(combined);

        for (const [ps, pe] of outPart) {
          const covered = outTotal.some(([ts, te]) => ts <= ps && pe <= te);
          expect(covered).toBe(true);
        }
      }),
    );
  });

  // Pattern: conditional. Empty list always returns empty list.
  it('returns empty array when input is empty', () => {
    expect(mergeIntervals([])).toEqual([]);
  });

  // Pattern: conditional. If start > end or endpoints are not integers, RangeError is thrown.
  it('throws RangeError when preconditions are violated', () => {
    const invalidOrder = fc
      .tuple(intGen, intGen)
      .filter(([a, b]) => a !== b)
      .map(([a, b]): Interval => (a > b ? [a, b] : [b, a]));

    fc.assert(
      fc.property(invalidOrder, badInterval => {
        expect(() => mergeIntervals([badInterval])).toThrow(RangeError);
      }),
    );
  });
});