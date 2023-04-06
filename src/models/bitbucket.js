const { Bitbucket } = require("bitbucket");
const Cache = require("../utils/cache");
const { isEmpty } = require("../utils/validator");

class BitbucketClient {
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
    this.cache = new Cache();
  }

  /**
   * Lists all repositories in the specified Bitbucket workspace.
   *
   * @async
   * @param {Object} [options] - Optional options to enable caching.
   * @param {boolean} [options.enableCache=false] - Whether to enable caching of the repository list.
   * @returns {Promise<Array>} - A Promise that resolves to an array of repository objects.
   * @throws {Error} - If an error occurs during the repository listing, an error is thrown with a descriptive message.
   */
  async listRepositories(options = {}) {
    if (typeof options !== "object") {
      throw new Error("Options must be an object");
    }

    const { enableCache = false, query = "", exclude = [] } = options;

    let pageNumber = 1;
    let nextPage = null;
    let repos = [];

    try {
      while (nextPage || pageNumber === 1) {
        // TODO: Use async iterator instead.
        const { values, page, next } = await this.bitbucket.repositories
          .list({ workspace: this.workspaceName, page: pageNumber, q: query })
          .then((res) => res.data);

        pageNumber = page + 1;
        nextPage = next;
        repos = [...repos, ...values];
      }
    } catch (err) {
      throw new Error(`Failed to list repositories: ${err.message}`);
    }

    if (enableCache) {
      this.cache.set("repos_list", repos);
    }
    return repos.filter(({ slug }) => !exclude.includes(slug));
  }
}

module.exports = BitbucketClient;
