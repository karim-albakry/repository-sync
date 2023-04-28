const {
  migrate,
  validateOptions,
  createGithubRepo,
  cloneRepo,
  pushRepo,
} = require("../../src/commands/migrateBitbucketToGithub");

const Bitbucket = require("../../src/models/bitbucket");
const { createOrgRepo, createRepo } = require("../../src/models/github");
const git = require("../../src/utils/git");

jest.mock("../../src/models/bitbucket");
jest.mock("../../src/models/github");
jest.mock("../../src/utils/git");

describe("migrate module", () => {
  const options = {
    bitbucketUser: "testUser",
    bitbucketToken: "testToken",
    githubUser: "testUser",
    githubToken: "testToken",
    workspace: "testWorkspace",
    exclude: [],
    organization: "",
    project: null,
    specificRepos: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("validateOptions should throw an error if options are invalid", () => {
    const invalidOptions = { ...options, bitbucketUser: undefined };
    expect(() => validateOptions(invalidOptions)).toThrow(Error);
  });

  test("validateOptions should not throw an error if options are valid", () => {
    expect(() => validateOptions(options)).not.toThrow();
  });

  test("createGithubRepo should handle errors when creating a repo", async () => {
    createRepo.mockImplementationOnce(() => {
      throw new Error("Failed to create repo");
    });

    await createGithubRepo("testToken", {
      slug: "testSlug",
      isPrivate: false,
      organization: "",
    });

    expect(createRepo).toHaveBeenCalledTimes(1);
  });

  test("cloneRepo should handle errors when cloning a repo", async () => {
    git.cloneRepository.mockImplementationOnce(() => {
      throw new Error("Failed to clone repo");
    });

    await expect(
      cloneRepo({
        slug: "testSlug",
        repoLocation: "/test/repoLocation",
        sourceUrl: "https://test.sourceUrl",
      })
    ).rejects.toThrow(Error);

    expect(git.cloneRepository).toHaveBeenCalledTimes(1);
  });

  test("pushRepo should handle errors when pushing a repo", () => {
    git.setPushUrlAndPush.mockImplementationOnce(() => {
      throw new Error("Failed to push repo");
    });

    expect(() =>
      pushRepo({
        slug: "testSlug",
        destinationUrl: "https://test.destinationUrl",
        repoLocation: "/test/repoLocation",
      })
    ).toThrow(Error);

    expect(git.setPushUrlAndPush).toHaveBeenCalledTimes(1);
  });

  test("migrate should run migration steps", async () => {
    const listRepositoriesMock = jest.fn().mockResolvedValue([]);
    Bitbucket.mockImplementation(() => ({
      listRepositories: listRepositoriesMock,
    }));

    await migrate(options);

    expect(Bitbucket).toHaveBeenCalledTimes(1);
    expect(listRepositoriesMock).toHaveBeenCalledTimes(1);
    expect(createRepo).toHaveBeenCalledTimes(0);
    expect(git.cloneRepository).toHaveBeenCalledTimes(0);
    expect(git.setPushUrlAndPush).toHaveBeenCalledTimes(0);
  });
});
