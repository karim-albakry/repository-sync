const fs = require("fs");
const {
  migrate,
  cleanUp,
  validateOptions,
} = require("../../src/commands/migrate");

describe("validateOptions", () => {
  test("valid options should not throw an error", () => {
    const options = {
      bitbucketUser: "user",
      bitbucketToken: "token",
      githubUser: "user",
      githubToken: "token",
      workspace: "workspace",
      exclude: ["repo1", "repo2"],
      project: "project",
    };
    expect(() => validateOptions(options)).not.toThrow();
  });

  test("invalid options should throw an error with message", () => {
    const options = {
      bitbucketUser: "",
      bitbucketToken: "",
      githubUser: "",
      githubToken: "",
      workspace: "",
    };
    expect(() => validateOptions(options)).toThrow("Invalid options");
  });
});

describe("cleanUp", () => {
  beforeEach(() => {
    // create test repository
    fs.mkdirSync(`${process.cwd()}/test-repo`);
    fs.writeFileSync(`${process.cwd()}/test-repo/test.txt`, "hello world");
  });

  afterEach(() => {
    // remove test repository
    fs.rmdirSync(`${process.cwd()}/test-repo`, { recursive: true });
  });

  test("cleanUp should delete repository successfully", async () => {
    const repoLocation = `${process.cwd()}/test-repo`;
    await expect(cleanUp(repoLocation)).resolves.not.toThrow();
    expect(fs.existsSync(repoLocation)).toBe(false);
  });

  test("cleanUp should throw an error if repository cannot be deleted", async () => {
    const repoLocation = "non-existent-repo";
    await expect(cleanUp(repoLocation)).rejects.toThrow("Failed to clean up");
  });
});

describe("migrate", () => {
  test("migrate should complete successfully", async () => {
    const options = {
      bitbucketUser: "user",
      bitbucketToken: "token",
      githubUser: "user",
      githubToken: "token",
      workspace: "workspace",
      organization: "",
      exclude: ["repo1", "repo2"],
      project: "project",
    };
    await expect(migrate(options)).resolves.not.toThrow();
  });

  test("migrate should throw an error if migration fails", async () => {
    const options = {
      bitbucketUser: "",
      bitbucketToken: "",
      githubUser: "",
      githubToken: "",
      workspace: "",
    };
    await expect(migrate(options)).rejects.toThrow("Migration failed");
  });
});
