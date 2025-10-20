import { describe, it, expect } from 'vitest';
import { signal, effect, computed } from '../src/signal';

describe('signal - deps cleanup and scheduler', () => {
  it('cleans up stale dependencies when effect changes its dependencies', async () => {
    const a = signal(1);
    const b = signal(10);
    let useA = true;
    const seen: number[] = [];

    const ef = effect(() => {
      if (useA) {
        seen.push(a.value);
      } else {
        seen.push(b.value);
      }
    });

    expect(seen).toEqual([1]);

    // switch dependency to b
    useA = false;

    // changing a should NOT re-run effect
    a.value = 2;
    await Promise.resolve();
    expect(seen).toEqual([1]);

    // changing b SHOULD run effect
    b.value = 20;
    await Promise.resolve();
    expect(seen).toEqual([1, 20]);

    ef.dispose();
  });

  it('batches synchronous updates to signals and runs effect once per microtask', async () => {
    const s = signal(0);
    let runs = 0;

    const ef = effect(() => {
      // read to create dependency
      void s.value;
      runs++;
    });

    expect(runs).toBe(1);

    // multiple synchronous updates
    s.value = 1;
    s.value = 2;
    s.value = 3;

    // wait a microtask for scheduled effects to flush
    await Promise.resolve();

    // effect should have run only once more
    expect(runs).toBe(2);

    ef.dispose();
  });
});