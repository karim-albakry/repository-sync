const git = require("../../src/utils/git");
const {
  validateOptions,
  createGithubRepo,
  cloneRepo,
  pushRepo,
} = require("../../src/commands/migrate");

// You may need to mock your dependencies, like the GitHub and Bitbucket APIs
// This example uses jest.mock() to mock the createRepo and createOrgRepo functions
jest.mock("../../src/models/github", () => ({
  createRepo: jest.fn(),
  createOrgRepo: jest.fn(),
}));

jest.mock("../../src/models/bitbucket", () => {
  return jest.fn().mockImplementation(() => {
    return { listRepositories: () => [] };
  });
});

jest.mock("../../src/utils/git");

// Test cases for validateOptions
describe("validateOptions", () => {
  it("should throw an error if options are invalid", () => {
    const invalidOptions = {
      bitbucketUser: "",
      bitbucketToken: "",
      githubUser: "",
      githubToken: "",
      workspace: "",
      exclude: [],
      organization: "",
      project: "",
    };

    expect(() => validateOptions(invalidOptions)).toThrow();
  });

  it("should not throw an error if options are valid", () => {
    const validOptions = {
      bitbucketUser: "user",
      bitbucketToken: "token",
      githubUser: "user",
      githubToken: "token",
      workspace: "workspace",
      exclude: [],
      organization: "",
      project: "some-project",
    };

    expect(() => validateOptions(validOptions)).not.toThrow();
  });
});

// Test cases for createGithubRepo
describe("createGithubRepo", () => {
  it("should call createOrgRepo if organization is provided", async () => {
    const githubToken = "token";
    const repoInfo = {
      slug: "test-repo",
      isPrivate: true,
      organization: "test-org",
    };

    // Import the mocked functions from '../models/github'
    const { createRepo, createOrgRepo } = require("../../src/models/github");

    await createGithubRepo(githubToken, repoInfo);

    expect(createOrgRepo).toHaveBeenCalledWith(
      githubToken,
      repoInfo.organization,
      repoInfo.slug,
      repoInfo.isPrivate
    );
    expect(createRepo).not.toHaveBeenCalled();
  });

  it("should call createRepo if organization is not provided", async () => {
    const githubToken = "token";
    const repoInfo = {
      slug: "test-repo",
      isPrivate: true,
      organization: "",
    };

    // Import the mocked functions from '../models/github'
    const { createRepo, createOrgRepo } = require("../../src/models/github");

    await createGithubRepo(githubToken, repoInfo);

    expect(createRepo).toHaveBeenCalledWith(
      githubToken,
      repoInfo.slug,
      repoInfo.isPrivate
    );
    expect(createOrgRepo).not.toHaveBeenCalledWith(
      githubToken,
      repoInfo.slug,
      repoInfo.isPrivate,
      repoInfo.organization
    );
  });
});

describe("cloneRepo", () => {
  it("should clone the repo successfully", async () => {
    git.cloneRepository.mockResolvedValue(true);
    const repoInfo = {
      slug: "test-repo",
      repoLocation: "/tmp/repos/test-repo",
      sourceUrl: "https://bitbucket.org/workspace/test-repo",
    };

    await expect(cloneRepo(repoInfo)).resolves.toBeUndefined();
    expect(git.cloneRepository).toHaveBeenCalledWith(
      repoInfo.sourceUrl,
      repoInfo.repoLocation,
      { mirror: true }
    );
  });

  it("should throw an error if cloning fails", async () => {
    const errorMessage = "Failed to clone repository";
    git.cloneRepository.mockRejectedValue(new Error(errorMessage));
    const repoInfo = {
      slug: "test-repo",
      repoLocation: "/tmp/repos/test-repo",
      sourceUrl: "https://bitbucket.org/workspace/test-repo",
    };

    await expect(cloneRepo(repoInfo)).rejects.toThrow(errorMessage);
  });
});

describe("pushRepo", () => {
  it("should push the repo successfully", () => {
    git.setPushUrlAndPush.mockReturnValue(true);
    const repoInfo = {
      slug: "test-repo",
      repoLocation: "/tmp/repos/test-repo",
      destinationUrl: "https://github.com/user/test-repo.git",
    };

    expect(() => pushRepo(repoInfo)).not.toThrow();
    expect(git.setPushUrlAndPush).toHaveBeenCalledWith(
      repoInfo.destinationUrl,
      repoInfo.repoLocation
    );
  });

  it("should throw an error if pushing fails", () => {
    const errorMessage = "Failed to push repository";
    git.setPushUrlAndPush.mockImplementation(() => {
      throw new Error(errorMessage);
    });
    const repoInfo = {
      slug: "test-repo",
      repoLocation: "/tmp/repos/test-repo",
      destinationUrl: "https://github.com/user/test-repo.git",
    };

    expect(() => pushRepo(repoInfo)).toThrow(errorMessage);
  });
});
