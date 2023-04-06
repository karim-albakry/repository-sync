const BitbucketClient = require("../../src/models/bitbucket");

describe("BitbucketClient", () => {
  let client;

  beforeEach(() => {
    client = new BitbucketClient(
      "bitbucket_user",
      "bitbucket_pass",
      "bitbucket_workspace"
    );
  });

  describe("listRepositories", () => {
    it("should return a list of repositories", async () => {
      const repos = await client.listRepositories();
      expect(Array.isArray(repos)).toBe(true);
    });

    it("should exclude repositories in the exclude list", async () => {
      const exclude = ["repo1", "repo2"];
      const repos = await client.listRepositories({ exclude });
      expect(repos.some(({ slug }) => exclude.includes(slug))).toBe(false);
    });

    it("should filter repositories by project name", async () => {
      const project = "project1";
      const repos = await client.listRepositories({ project });
      expect(repos.every(({ project: p }) => p.name === project)).toBe(true);
    });

    it("should enable caching when option is set", async () => {
      const enableCache = true;
      const spy = jest.spyOn(client.cache, "set");
      await client.listRepositories({ enableCache });
      expect(spy).toHaveBeenCalledWith("repos_list", expect.any(Array));
    });

    it("should throw an error if options is not an object", async () => {
      await expect(client.listRepositories("invalid_options")).rejects.toThrow(
        "Options must be an object"
      );
    });

    it("should throw an error if listing repositories fails", async () => {
      jest
        .spyOn(client.bitbucket.repositories, "list")
        .mockImplementation(() => {
          throw new Error("Failed to list repositories");
        });
      await expect(client.listRepositories()).rejects.toThrow(
        "Failed to list repositories"
      );
    });
  });
});
