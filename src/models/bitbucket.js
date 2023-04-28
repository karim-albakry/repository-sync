const { Bitbucket } = require("bitbucket");
const axios = require("axios");

function toValidSlug(repoName) {
  return repoName
    .toLowerCase()
    .replace(/[^a-z0-9-_.]/g, "-")
    .replace(/-{2,}/g, "-");
}
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

    this.getProjectKeyByName = (function () {
      const secureToken = bitbucketPass;

      return async function (projectName) {
        try {
          const response = await axios.get(
            `https://api.bitbucket.org/2.0/workspaces/${this.workspaceName}/projects`,
            {
              headers: {
                Authorization: `Bearer ${secureToken}`,
              },
            }
          );
          const projects = response.data.values;
          const project = projects.find((p) => p.name === projectName);
          return project ? project.key : null;
        } catch (error) {
          console.error(`Error fetching projects: ${error.message}`);
          return null;
        }
      };
    })();

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
    try {
      if (typeof options !== "object") {
        throw new Error("Options must be an object");
      }
      const { query = "", exclude = [], specificRepos = [] } = options;

      const repos = await this.getValues(1, query);

      return repos.filter(({ slug }) => {
        const excludeRepo = exclude.includes(slug);
        const includeRepo =
          specificRepos.length === 0 || specificRepos.includes(slug);
        return !excludeRepo && includeRepo;
      });
    } catch (error) {
      throw new Error(`Error fetching repositories: ${error.message}`);
    }
  }

  async createBitbucketRepo(
    username,
    repoName,
    isPrivate,
    workspace,
    projectKey
  ) {
    try {
      const validRepoSlug = toValidSlug(repoName);
      const response = await this.bitbucket.repositories.create({
        workspace: workspace || username,
        repo_slug: validRepoSlug,
        is_private: isPrivate,
        _body: { project: { key: projectKey } },
      });

      console.log(`Repository created: ${response.data.links.html.href}`);
    } catch (error) {
      console.error(repoName);
      console.error(error);
      console.error(`Error creating repository: ${error.message}`);
    }
  }
}

module.exports = BitbucketClient;
