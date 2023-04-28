const {
  migrate,
  validateOptions,
} = require("../../src/commands/migrateGithubToBitbucket");
const { listRepos } = require("../../src/models/github");
const git = require("../../src/utils/git");
const BitbucketClient = require("../../src/models/bitbucket");

jest.mock("../../src/models/github");
jest.mock("../../src/models/bitbucket");
jest.mock("../../src/utils/git");

describe("validateOptions", () => {
  it("should throw an error for invalid options", () => {
    const invalidOptions = {
      bitbucketUser: "user",
      bitbucketToken: "token",
      githubUser: "",
      githubToken: "token",
      workspace: "workspace",
    };

    expect(() => validateOptions(invalidOptions)).toThrow();
  });

  it("should not throw an error for valid options", () => {
    const validOptions = {
      bitbucketUser: "user",
      bitbucketToken: "token",
      githubUser: "user",
      githubToken: "token",
      workspace: "workspace",
    };

    expect(() => validateOptions(validOptions)).not.toThrow();
  });
});

describe("migrate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully migrate repositories", async () => {
    const options = {
      bitbucketUser: "user",
      bitbucketToken: "token",
      githubUser: "user",
      githubToken: "token",
      workspace: "workspace",
    };

    listRepos.mockResolvedValue([
      {
        name: "repo1",
        private: false,
      },
      {
        name: "repo2",
        private: true,
      },
    ]);

    await migrate(options);

    expect(listRepos).toHaveBeenCalledTimes(1);
    expect(git.cloneRepository).toHaveBeenCalledTimes(2);
    expect(git.setPushUrlAndPush).toHaveBeenCalledTimes(2);
    expect(BitbucketClient.prototype.createBitbucketRepo).toHaveBeenCalledTimes(
      2
    );
  });

  it("should throw an error if an error occurs during migration", async () => {
    const options = {
      bitbucketUser: "user",
      bitbucketToken: "token",
      githubUser: "user",
      githubToken: "token",
      workspace: "workspace",
    };

    listRepos.mockImplementation(() => {
      throw new Error("Error fetching repos");
    });

    await expect(migrate(options)).rejects.toThrow("Error fetching repos");
  });
});
