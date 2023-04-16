const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");
const { createRepo, createOrgRepo } = require("../../src/models/github");
const { log, fail } = require("../../src/utils/logger");

const mockAxios = new MockAdapter(axios);

describe("repoCreator", () => {
  const authToken = "auth-token";
  const repoName = "test-repo";
  const isPrivate = true;
  const orgName = "test-org";

  beforeEach(() => {
    mockAxios.reset();
    jest.clearAllMocks();
  });

  test("createRepo should create a new repository for the user", async () => {
    mockAxios.onPost("https://api.github.com/user/repos").reply(200);

    await createRepo(authToken, repoName, isPrivate);

    expect(mockAxios.history.post.length).toBe(1);
    const request = mockAxios.history.post[0];
    expect(request.url).toBe("https://api.github.com/user/repos");
    expect(request.headers.Authorization).toBe(`Bearer ${authToken}`);
    expect(JSON.parse(request.data)).toEqual({ name: repoName, isPrivate });
  });

  test("createOrgRepo should create a new repository for the organization", async () => {
    mockAxios.onPost(`https://api.github.com/orgs/${orgName}/repos`).reply(200);

    await createOrgRepo(authToken, orgName, repoName, isPrivate);

    expect(mockAxios.history.post.length).toBe(1);
    const request = mockAxios.history.post[0];
    expect(request.url).toBe(`https://api.github.com/orgs/${orgName}/repos`);
    expect(request.headers.Authorization).toBe(`Bearer ${authToken}`);
    expect(JSON.parse(request.data)).toEqual({
      name: repoName,
      private: isPrivate,
    });
  });

  test("createRepo should retry if rate limit is exceeded", async () => {
    const errorMessage = "Rate limit exceeded";
    const errorResponseData = { message: errorMessage };
    const error = {
      response: {
        status: 429,
        data: errorResponseData,
        headers: { "x-ratelimit-reset": Date.now() / 1000 + 2 },
      },
    };

    axios.post
      .mockImplementationOnce(() => Promise.reject(error))
      .mockImplementationOnce(() => Promise.resolve({}));

    jest.spyOn(global, "setTimeout");

    await createRepo(authToken, repoName, isPrivate);

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledTimes(2);
  });

  test("createOrgRepo should retry if rate limit is exceeded", async () => {
    const errorMessage = "Rate limit exceeded";
    const errorResponseData = { message: errorMessage };
    const error = {
      response: {
        status: 429,
        data: errorResponseData,
        headers: { "x-ratelimit-reset": Date.now() / 1000 + 2 },
      },
    };

    axios.post
      .mockImplementationOnce(() => Promise.reject(error))
      .mockImplementationOnce(() => Promise.resolve({}));

    jest.spyOn(global, "setTimeout");

    await createOrgRepo(authToken, orgName, repoName, isPrivate);

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledTimes(2);
  });
  // Add more tests to cover error scenarios.
});
