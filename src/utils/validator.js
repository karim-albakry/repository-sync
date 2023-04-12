/**
 * A module that provides utility functions for checking if a string or an array is not empty.
 *
 * @module validators
 */

/**
 * Checks if a string is not empty (i.e., not undefined or null and not containing only whitespace characters).
 *
 * @param {string} str - The string to check.
 * @returns {boolean} - Returns true if the string is not empty, false otherwise.
 */
function isNotEmpty(str) {
  return str !== undefined && str !== null && str.trim() !== "";
}

/**
 * Checks if an array is not empty (i.e., is an array and has at least one element).
 *
 * @param {Array} list - The array to check.
 * @returns {boolean} - Returns true if the array is not empty, false otherwise.
 */
function isNotEmptyList(list) {
  return Array.isArray(list) && list.length > 0;
}

/**
 * Determines if the given argument is not a string.
 *
 * @param {any} str - The argument to check.
 * @returns {boolean} - `true` if the argument is not a string, `false` otherwise.
 */
function isNotString(str) {
  return typeof str !== "string";
}

/**
 * Checks if a string is empty or not.
 *
 * @param {string} str - The string to check.
 * @returns {boolean} Returns true if the string is empty, false otherwise.
 */
function isEmpty(str) {
  if (isNotString(str)) {
    return false;
  }
  return str === undefined || str === null || str.trim() === "";
}

/**
 * Checks if a value is not an array.
 *
 * @param {*} list - The value to check.
 * @returns {boolean} Returns true if the value is not an array, false otherwise.
 */
function isNotList(list) {
  return !Array.isArray(list);
}

module.exports = {
  isNotEmpty,
  isNotEmptyList,
  isNotString,
  isEmpty,
  isNotList,
};
