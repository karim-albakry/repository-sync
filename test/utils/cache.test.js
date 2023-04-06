const NodeCache = require('node-cache');
const Cache = require('../../src/utils/cache');

describe('Cache', () => {
  test('should create a new cache object if none is provided', () => {
    const cache = new Cache();
    expect(cache.cache instanceof NodeCache).toBe(true);
  });

  test('should use the provided cache object', () => {
    const nodeCache = new NodeCache();
    const cache = new Cache(nodeCache);
    expect(cache.cache).toBe(nodeCache);
  });

  test('should get a value from the cache', () => {
    const key = 'my-key';
    const value = 'my-value';
    const ttl = 10; // Time-to-live in seconds

    const cache = new Cache();
    cache.set(key, value, ttl);

    const result = cache.get(key);

    expect(result).toBe(value);
  });

  test('should set a value in the cache', () => {
    const key = 'my-key';
    const value = 'my-value';
    const ttl = 10; // Time-to-live in seconds

    const cache = new Cache();
    cache.set(key, value, ttl);

    const result = cache.get(key);

    expect(result).toBe(value);
  });

  test('should delete a value from the cache', () => {
    const key = 'my-key';
    const value = 'my-value';
    const ttl = 10; // Time-to-live in seconds

    const cache = new Cache();
    cache.set(key, value, ttl);
    cache.del(key);

    const result = cache.get(key);

    expect(result).toBeUndefined();
  });
});
