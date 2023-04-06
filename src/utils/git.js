const git = require("isomorphic-git");
const fs = require("fs");
const http = require("isomorphic-git/http/node");
const { success } = require("./logger");

/**
 * Clones a Git repository to the specified directory using isomorphic-git library.
 * @param {string} sourceUrl - The URL of the Git repository to clone.
 * @param {string} repoLocation - The directory to clone the repository into.
 * @param {Object} [options] - Additional options to pass to the clone method.
 * @returns {Promise<void>} - A Promise that resolves if the repository is cloned successfully, or rejects with an error if cloning fails.
 */
async function cloneRepository(sourceUrl, repoLocation, options = {}) {
  try {
    await git.clone({
      dir: repoLocation,
      url: sourceUrl,
      fs,
      http,
      ...options,
    });
    success(`Repository ${repoLocation.trimStart("/")} cloned successfully`);
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = { cloneRepository };
