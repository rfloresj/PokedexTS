import { describe, expect, test } from 'vitest';
import { Cache } from './pokecache.js';

describe('Cache', () => {
  test.concurrent.each([
    {
      name: 'add and get a value',
      key: 'key1',
      val: 'value1',
      expectedVal: 'value1',
      expectFound: true,
    },
    {
      name: 'get returns undefined for missing key',
      key: 'missing',
      val: undefined,
      expectedVal: undefined,
      expectFound: false,
    },
  ])('$name', async ({ key, val, expectedVal, expectFound }) => {
    const cache = new Cache(60000);

    if (val !== undefined) {
      cache.add(key, val);
    }

    const entry = cache.get(key);

    if (expectFound) {
      expect(entry).not.toBeUndefined();
      expect(entry?.val).toBe(expectedVal);
    } else {
      expect(entry).toBeUndefined();
    }

    cache.stopReapLoop();
  });
});
