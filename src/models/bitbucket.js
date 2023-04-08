const { Bitbucket } = require("bitbucket");

/**
 * A class for interacting with the Bitbucket API.
 * @class BitbucketClient
 */
class BitbucketClient {
  /**
   * Creates a new instance of the BitbucketClient class.
   * @param {string} bitbucketUser - The Bitbucket username to use for authentication.
   * @param {string} bitbucketPass - The Bitbucket password to use for authentication.
   * @param {string} bitbucketWorkspaceName - The name of the Bitbucket workspace to retrieve repositories from.
   */
  constructor(bitbucketUser, bitbucketPass, bitbucketWorkspaceName) {
    const clientOptions = {
      baseUrl: "https://api.bitbucket.org/2.0",
      auth: {
        username: bitbucketUser,
        password: bitbucketPass,
      },
    };
    this.bitbucket = new Bitbucket(clientOptions);
    this.workspaceName = bitbucketWorkspaceName;

    /**
     * Retrieves a list of repositories from the Bitbucket API.
     * @async
     * @function
     * @param {number} pageNumber - The page number of the repositories to retrieve.
     * @param {string} query - The query to use when retrieving the repositories.
     * @returns {Promise<Array>} An array of repository objects.
     * @memberof BitbucketClient
     * @inner
     */
    this.getValues = async (pageNumber, query) => {
      const { values, next } = await this.bitbucket.repositories
        .list({
          workspace: this.workspaceName,
          page: pageNumber,
          q: query,
        })
        .then((res) => res.data);

      if (next) {
        return [...values, ...(await this.getValues(pageNumber + 1, query))];
      }
      return values;
    };
  }

  /**
   * Retrieves a list of repositories for the configured Bitbucket workspace.
   * @async
   * @function
   * @param {Object} [options={}] - An options object to configure the repository list.
   * @param {string} [options.query=""] - The query to use when retrieving the repositories.
   * @param {Array} [options.exclude=[]] - An array of repository slugs to exclude from the list.
   * @returns {Promise<Array>} An array of repository objects.
   * @throws {Error} If the options parameter is not an object.
   * @memberof BitbucketClient
   */
  async listRepositories(options = {}) {
    if (typeof options !== "object") {
      throw new Error("Options must be an object");
    }

    const { query = "", exclude = [] } = options;

    const repos = await this.getValues(1, query, {
      bitbucket: this.bitbucket,
      workspaceName: this.workspaceName,
    });

    return repos.filter(({ slug }) => !exclude.includes(slug));
  }
}

module.exports = BitbucketClient;
