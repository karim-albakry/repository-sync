const {
  migrate: migrateBitbucketToGithub,
} = require("../src/commands/migrateBitbucketToGithub");
const {
  migrate: migrateGithubToBitbucket,
} = require("../src/commands/migrateGithubToBitbucket");
const { program } = require("../src/cli");

jest.mock("../src/commands/migrateBitbucketToGithub");
jest.mock("../src/commands/migrateGithubToBitbucket");

const originalArgv = process.argv;
beforeEach(() => {
  process.argv = [...originalArgv];
});
afterAll(() => {
  process.argv = originalArgv;
});
describe("CLI", () => {
  beforeEach(() => {
    migrateBitbucketToGithub.mockClear();
    migrateGithubToBitbucket.mockClear();
  });
  test("migrate bitbucket-to-github command with required options", async () => {
    const parseArgs = [
      "node",
      "cli.js",
      "bitbucket-to-github",
      "-b",
      "bitbucketUser",
      "-bt",
      "bitbucketToken",
      "-g",
      "githubUser",
      "-gt",
      "githubToken",
      "-w",
      "workspaceName",
      "-p",
      "projectName",
    ];

    await program.parseAsync(parseArgs);

    expect(migrateBitbucketToGithub).toHaveBeenCalledWith({
      bitbucketUser: "bitbucketUser",
      bitbucketToken: "bitbucketToken",
      githubUser: "githubUser",
      githubToken: "githubToken",
      workspace: "workspaceName",
      project: "projectName",
      organization: undefined,
      exclude: undefined,
    });
  });

  test("migrate bitbucket-to-github command with optional options", async () => {
    const parseArgs = [
      "node",
      "cli.js",
      "bitbucket-to-github",
      "-b",
      "bitbucketUser",
      "-bt",
      "bitbucketToken",
      "-g",
      "githubUser",
      "-gt",
      "githubToken",
      "-w",
      "workspaceName",
      "-p",
      "projectName",
      "-o",
      "organizationName",
      "-e",
      "repo1",
      "repo2",
    ];

    await program.parseAsync(parseArgs);

    expect(migrateBitbucketToGithub).toHaveBeenCalledWith({
      bitbucketUser: "bitbucketUser",
      bitbucketToken: "bitbucketToken",
      githubUser: "githubUser",
      githubToken: "githubToken",
      workspace: "workspaceName",
      project: "projectName",
      organization: "organizationName",
      exclude: ["repo1", "repo2"],
    });
  });

  test("migrate github-to-bitbucket command with required options", async () => {
    const parseArgs = [
      "node",
      "cli.js",
      "github-to-bitbucket",
      "-b",
      "bitbucketUser",
      "-bt",
      "bitbucketToken",
      "-g",
      "githubUser",
      "-gt",
      "githubToken",
      "-w",
      "workspaceName",
      "-pk",
      "projectkey",
    ];

    await program.parseAsync(parseArgs);

    expect(migrateGithubToBitbucket).toHaveBeenCalledWith({
      bitbucketUser: "bitbucketUser",
      bitbucketToken: "bitbucketToken",
      githubUser: "githubUser",
      githubToken: "githubToken",
      workspace: "workspaceName",
      projectKey: "projectkey",
      organization: undefined,
      exclude: undefined,
    });
  });

  test("migrate github-to-bitbucket command with optional options", async () => {
    const parseArgs = [
      "node",
      "cli.js",
      "github-to-bitbucket",
      "-b",
      "bitbucketUser",
      "-bt",
      "bitbucketToken",
      "-g",
      "githubUser",
      "-gt",
      "githubToken",
      "-w",
      "workspaceName",
      "-pk",
      "projectkey",
      "-o",
      "organizationName",
      "-e",
      "repo1",
      "repo2",
    ];

    await program.parseAsync(parseArgs);

    expect(migrateGithubToBitbucket).toHaveBeenCalledWith({
      bitbucketUser: "bitbucketUser",
      bitbucketToken: "bitbucketToken",
      githubUser: "githubUser",
      githubToken: "githubToken",
      workspace: "workspaceName",
      projectKey: "projectkey",
      organization: "organizationName",
      exclude: ["repo1", "repo2"],
    });
  });
});
