const { Bitbucket } = require("bitbucket");
const BitbucketClient = require("../../src/models/bitbucket");

jest.mock("bitbucket");

describe("BitbucketClient", () => {
  let client;

  beforeEach(() => {
    Bitbucket.mockClear();
    client = new BitbucketClient("user", "pass", "workspace");
  });

  describe("constructor", () => {
    it("should create a new instance of the Bitbucket client", () => {
      expect(Bitbucket).toHaveBeenCalledWith({
        baseUrl: "https://api.bitbucket.org/2.0",
        auth: { username: "user", password: "pass" },
      });
      expect(client.bitbucket).toBeInstanceOf(Bitbucket);
      expect(client.workspaceName).toBe("workspace");
    });
  });

  describe("listRepositories", () => {
    let mockRepositories;

    beforeEach(() => {
      mockRepositories = [
        { slug: "repo1", name: "Repo 1" },
        { slug: "repo2", name: "Repo 2" },
        { slug: "repo3", name: "Repo 3" },
      ];
      client.getValues = jest.fn().mockResolvedValue(mockRepositories);
    });

    it("should retrieve a list of repositories from the Bitbucket API", async () => {
      const repos = await client.listRepositories();
      expect(client.getValues).toHaveBeenCalledWith(1, "", {
        bitbucket: client.bitbucket,
        workspaceName: "workspace",
      });
      expect(repos).toEqual(mockRepositories);
    });

    it("should exclude specified repositories from the list", async () => {
      const repos = await client.listRepositories({
        exclude: ["repo2", "repo3"],
      });
      expect(repos).toEqual([{ slug: "repo1", name: "Repo 1" }]);
    });

    it("should throw an error if options is not an object", async () => {
      await expect(client.listRepositories("invalid")).rejects.toThrow(
        "Options must be an object"
      );
    });
  });
});
