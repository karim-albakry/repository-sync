const { migrate } = require("../src/commands/migrate");
const { program } = require("../src/cli");

jest.mock("../src/commands/migrate");

const originalArgv = process.argv;
beforeEach(() => {
  process.argv = [...originalArgv];
});
afterAll(() => {
  process.argv = originalArgv;
});
describe("CLI", () => {
  beforeEach(() => {
    migrate.mockClear();
  });
  test("migrate command with required options", async () => {
    const parseArgs = [
      "node",
      "cli.js",
      "migrate",
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

    expect(migrate).toHaveBeenCalledWith({
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

  test("migrate command with optional options", async () => {
    const parseArgs = [
      "node",
      "cli.js",
      "migrate",
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

    expect(migrate).toHaveBeenCalledWith({
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
});
