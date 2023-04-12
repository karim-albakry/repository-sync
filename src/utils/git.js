const git = require("isomorphic-git");
const fs = require("fs");
const http = require("isomorphic-git/http/node");
const { execSync } = require("child_process");

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
  } catch (err) {
    throw new Error(err.message);
  }
}

const setPushUrlAndPush = (
  destinationUrl,
  workingDirectory,
  retryCount = 0,
  maxRetries = 5,
  waitTime = 60000
) => {
  try {
    // Set the push URL for the remote
    execSync(`git remote set-url --push origin ${destinationUrl}`, {
      cwd: workingDirectory,
    });

    // Push the local repository's contents to the remote
    execSync("git push --mirror", { cwd: workingDirectory });

    console.log("Pushed to remote successfully.");
  } catch (error) {
    if (error.stderr.includes("rate limit exceeded")) {
      if (retryCount < maxRetries) {
        console.log(
          `Rate limit exceeded. Retrying in ${waitTime / 1000} seconds.`
        );
        setTimeout(() => {
          setPushUrlAndPush(retryCount + 1);
        }, waitTime);
      } else {
        console.error("Max retries exceeded. Aborting.");
      }
    } else {
      console.error(`Error: ${error.stderr}`);
    }
  }
};

module.exports = { cloneRepository, setPushUrlAndPush };
