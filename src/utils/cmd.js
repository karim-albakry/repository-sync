/**
 * A utility function that executes a shell command and logs the stdout and stderr output.
 *
 * @param {string} command - The shell command to execute.
 * @param {Object} [options] - Optional options to pass to the child_process.exec method.
 * @param {string} [options.cwd] - The current working directory to execute the command in. Defaults to the current working directory of the Node process.
 * @param {number} [options.timeout] - The maximum amount of time in milliseconds to wait for the command to complete. Defaults to 0 (no timeout).
 * @throws {Error} - If the command argument is not a string or is an empty string, or if the options argument is not an object, an error is thrown with a descriptive error message.
 */
const { promisify } = require("util");
const { exec } = require("child_process");
const { error, log } = require("./logger");
const { isNotEmpty } = require("./validator");

async function executeShellCommand(command, options = {}) {
  if (typeof command !== "string") {
    throw new Error("Command must be a string");
  }

  if (!isNotEmpty(command)) {
    throw new Error("Command must be not empty");
  }

  if (typeof options !== "object") {
    throw new Error("Options must be an object");
  }

  const { cwd = process.cwd(), timeout = 0 } = options;

  const execPromise = promisify(exec);

  try {
    const { stdout, stderr } = await execPromise(command, { cwd, timeout });
    if (stderr) {
      error(`Stderr: ${stderr}`);
      return new Error(`Command Error: ${stderr}`);
    }
    log(`Stdout: ${stdout}`);
  } catch (err) {
    error(`Error: ${err.message}`);
    return new Error(`Failed to execute command: ${err.message}`);
  }
}

module.exports = executeShellCommand;
