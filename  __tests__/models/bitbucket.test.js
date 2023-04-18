const nock = require("nock");
const BitbucketClient = require("../../src/models/bitbucket");

describe("BitbucketClient", () => {
  const bitbucketUser = "test-user";
  const bitbucketPass = "test-pass";
  const bitbucketWorkspaceName = "test-workspace";
  const client = new BitbucketClient(
    bitbucketUser,
    bitbucketPass,
    bitbucketWorkspaceName
  );

  afterEach(() => {
    nock.cleanAll();
  });

  test("should list repositories", async () => {
    const apiUrl = "https://api.bitbucket.org/2.0";
    const mockApiResponse = {
      values: [{ slug: "repo1" }, { slug: "repo2" }, { slug: "repo3" }],
      next: null,
    };

    nock(apiUrl)
      .get(`/repositories/${bitbucketWorkspaceName}`)
      .query({ page: 1, q: "" })
      .reply(200, mockApiResponse);

    const repos = await client.listRepositories();
    expect(repos).toEqual(mockApiResponse.values);
  });

  test("should exclude specified repositories", async () => {
    const apiUrl = "https://api.bitbucket.org/2.0";
    const mockApiResponse = {
      values: [{ slug: "repo1" }, { slug: "repo2" }, { slug: "repo3" }],
      next: null,
    };

    nock(apiUrl)
      .get(`/repositories/${bitbucketWorkspaceName}`)
      .query({ page: 1, q: "" })
      .reply(200, mockApiResponse);

    const options = {
      exclude: ["repo1", "repo3"],
    };

    const repos = await client.listRepositories(options);
    expect(repos).toEqual([{ slug: "repo2" }]);
  });

  test("should throw an error if options is not an object", async () => {
    await expect(client.listRepositories("invalid")).rejects.toThrow(
      "Options must be an object"
    );
  });

  test("should fetch only specified repositories", async () => {
    const apiUrl = "https://api.bitbucket.org/2.0";
    const mockApiResponse = {
      values: [{ slug: "repo1" }, { slug: "repo2" }, { slug: "repo3" }],
      next: null,
    };

    nock(apiUrl)
      .get(`/repositories/${bitbucketWorkspaceName}`)
      .query({ page: 1, q: "" })
      .reply(200, mockApiResponse);

    const options = {
      specificRepos: ["repo1", "repo3"],
    };

    const repos = await client.listRepositories(options);
    expect(repos).toEqual([{ slug: "repo1" }, { slug: "repo3" }]);
  });
});
