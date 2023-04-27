const {
  validateOptions,
} = require("../../src/commands/migrateGithubToBitbucket");

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
