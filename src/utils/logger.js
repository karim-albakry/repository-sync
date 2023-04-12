/**
 * A module that provides logging functions with different log levels using the kleur library for colorized output.
 *
 * @module logger
 */
const kleur = require("kleur");

/**
 * Logs an informational message with the [INFO] prefix to the console.
 *
 * @param {string} message - The message to log.
 */
function log(message) {
  console.log(kleur.blue(`[INFO] ${message}`));
}

/**
 * Logs an error message with the [ERROR] prefix to the console.
 *
 * @param {string} message - The message to log.
 */
function error(message) {
  console.error(`[ERROR] ${message}`);
}

/**
 * Logs a debug message with the [DEBUG] prefix to the console. The message is colorized with blue text using the kleur library.
 *
 * @param {string} message - The message to log.
 */
function debug(message) {
  console.debug(kleur.magenta(`[DEBUG] ${message}`));
}

/**
 * Logs a success message with the [INFO] prefix to the console. The message is colorized with bold green background using the kleur library.
 *
 * @param {string} message - The message to log.
 */
function success(message) {
  console.log(kleur.bgGreen().bold(`[INFO] ${message}`));
}

/**
 * Logs a failure message with the [INFO] prefix to the console. The message is colorized with bold red background using the kleur library.
 *
 * @param {string} message - The message to log.
 */
function fail(message) {
  console.log(kleur.bgRed().bold(`[ERROR] ${message}`));
}

module.exports = {
  log,
  error,
  debug,
  success,
  fail,
};
