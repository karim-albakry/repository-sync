/**
 * A simple wrapper for NodeCache that provides basic cache functionality.
 */
const NodeCache = require("node-cache");

class Cache {
  /**
   * Creates a new Cache instance.
   *
   * @param {NodeCache} [nodeCache] - An optional NodeCache instance to use as the underlying cache.
   */
  constructor(nodeCache) {
    this.cache = nodeCache || new NodeCache();
  }

  /**
   * Retrieves the value for the specified key from the cache.
   *
   * @param {string} key - The key to retrieve the value for.
   * @returns {*} The value associated with the specified key, or undefined if the key is not found in the cache.
   */
  get(key) {
    return this.cache.get(key);
  }

  /**
   * Sets the value for the specified key in the cache.
   *
   * @param {string} key - The key to set the value for.
   * @param {*} value - The value to set.
   * @param {number} [ttl] - An optional time-to-live value in seconds for the key-value pair. If not specified, the default TTL for the underlying NodeCache instance will be used.
   * @returns {boolean} - true if the key-value pair was successfully set in the cache, false otherwise.
   */
  set(key, value, ttl) {
    return this.cache.set(key, value, ttl);
  }

  /**
   * Deletes the key-value pair for the specified key from the cache.
   *
   * @param {string} key - The key to delete the associated value for.
   * @returns {boolean} - true if the key-value pair was successfully deleted from the cache, false otherwise.
   */
  del(key) {
    return this.cache.del(key);
  }
}

module.exports = Cache;
