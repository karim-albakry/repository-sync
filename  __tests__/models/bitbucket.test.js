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

  test("should paginate through repositories", async () => {
    const apiUrl = "https://api.bitbucket.org/2.0";
    const mockApiResponse1 = {
      values: [{ slug: "repo1" }, { slug: "repo2" }],
      next: `${apiUrl}/repositories/${bitbucketWorkspaceName}?page=2`,
    };
    const mockApiResponse2 = {
      values: [{ slug: "repo3" }, { slug: "repo4" }],
      next: null,
    };

    nock(apiUrl)
      .get(`/repositories/${bitbucketWorkspaceName}`)
      .query({ page: 1, q: "" })
      .reply(200, mockApiResponse1);

    nock(apiUrl)
      .get(`/repositories/${bitbucketWorkspaceName}`)
      .query({ page: 2, q: "" })
      .reply(200, mockApiResponse2);

    const repos = await client.listRepositories();
    expect(repos).toEqual([
      { slug: "repo1" },
      { slug: "repo2" },
      { slug: "repo3" },
      { slug: "repo4" },
    ]);
  });

  test("should handle API errors", async () => {
    const apiUrl = "https://api.bitbucket.org/2.0";

    nock(apiUrl)
      .get(`/repositories/${bitbucketWorkspaceName}`)
      .query({ page: 1, q: "" })
      .reply(500, { error: "Internal Server Error" });

    await expect(client.listRepositories()).rejects.toThrow(
      "Error fetching repositories: Internal Server Error"
    );
  });
  test("should get project key by project name", async () => {
    const apiUrl = "https://api.bitbucket.org/2.0";
    const mockApiResponse = {
      values: [
        { name: "Project1", key: "P1" },
        { name: "Project2", key: "P2" },
      ],
    };

    nock(apiUrl)
      .get(`/workspaces/${bitbucketWorkspaceName}/projects`)
      .reply(200, mockApiResponse);

    const projectKey = await client.getProjectKeyByName("Project1");
    console.log("Expected projects data:", mockApiResponse); // Use mockApiResponse instead of MOCK_PROJECTS_DATA

    expect(projectKey).toEqual("P1");
  });

  test("should return null if project not found", async () => {
    const apiUrl = "https://api.bitbucket.org/2.0";
    const mockApiResponse = {
      values: [
        { name: "Project1", key: "P1" },
        { name: "Project2", key: "P2" },
      ],
    };

    nock(apiUrl)
      .get(`/workspaces/${bitbucketWorkspaceName}/projects`)
      .reply(200, mockApiResponse);

    const projectKey = await client.getProjectKeyByName(
      bitbucketWorkspaceName,
      "NonexistentProject"
    );
    expect(projectKey).toBeNull();
  });

  test("should create a repository", async () => {
    const projectKey = "P1";
    const repoName = "NewRepo";
    const isPrivate = true;

    const mockRepoCreationResponse = {
      links: { html: { href: "https://bitbucket.org/test-workspace/newrepo" } },
    };

    const createRepoMock = jest
      .spyOn(client.bitbucket.repositories, "create")
      .mockResolvedValue({ data: mockRepoCreationResponse });

    const createRepoSpy = jest.spyOn(console, "log").mockImplementation();
    const errorSpy = jest.spyOn(console, "error").mockImplementation();

    await client.createBitbucketRepo(
      bitbucketUser,
      repoName,
      isPrivate,
      bitbucketWorkspaceName,
      projectKey
    );

    expect(createRepoSpy).toHaveBeenCalledWith(
      `Repository created: ${mockRepoCreationResponse.links.html.href}`
    );
    expect(errorSpy).not.toHaveBeenCalled();

    createRepoSpy.mockRestore();
    errorSpy.mockRestore();
    createRepoMock.mockRestore();
  });
});
