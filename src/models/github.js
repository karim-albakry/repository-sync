const { Octokit } = require("@octokit/rest");

class GitHub {
  // Constructor that initializes the Octokit client with the provided GitHub token
  constructor(githubToken) {
    this.octokit = new Octokit({
      auth: githubToken,
    });
  }

  // Method that creates a new repository in the specified GitHub organization
  async createOrgRepo(githubOrgName, repoName, isPrivate) {
    // Validate required parameters
    if (!githubOrgName) {
      throw new Error("GitHub organization name is required");
    }
    if (!repoName) {
      throw new Error("Repository name is required");
    }

    try {
      // Make a request to the GitHub API to create the repository
      const response = await this.octokit.request("POST /orgs/{org}/repos", {
        org: githubOrgName,
        name: repoName,
        private: isPrivate,
        homepage: "https://github.com",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      // Return the response data from the API call
      return response.data;
    } catch (error) {
      // Handle common errors with helpful error messages
      if (error.status === 422) {
        throw new Error(
          `Repository ${repoName} already exists in ${githubOrgName} organization`
        );
      } else if (error.status === 401) {
        throw new Error(`Invalid GitHub token provided`);
      } else {
        throw new Error(`Failed to create repository: ${error.message}`);
      }
    }
  }

  async createUserRepo(repoName, options = {}) {
    if (!repoName) {
      throw new Error("Repository name is required");
    }
    const {
      isPrivate = false,
      isTemplate = true,
      description = `This ${repoName} repo`,
    } = options;
    await this.octokit.request("POST /user/repos", {
      name: repoName,
      description,
      homepage: "https://github.com",
      private: isPrivate,
      is_template: isTemplate,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
  }
}

module.exports = GitHub;
