const axios = require("axios");
const util = require("util");
const { createRepo, createOrgRepo } = require("../../src/models/github");
const { log, fail } = require("../../src/utils/logger");

const setTimeoutPromise = util.promisify(setTimeout);

jest.mock("axios");
jest.mock("../../src/utils/logger");

describe("repoCreator", () => {
  const authToken = "test-token";
  const repoName = "test-repo";
  const isPrivate = true;
  const orgName = "test-org";

  beforeEach(() => {
    axios.post.mockClear();
    log.mockClear();
    fail.mockClear();
  });

  test("createRepo should create a new repository for the user", async () => {
    axios.post.mockResolvedValue();

    await createRepo(authToken, repoName, isPrivate);

    const url = axios.post.mock.calls[0][0];
    const data = axios.post.mock.calls[0][1];
    const config = axios.post.mock.calls[0][2];

    expect(url).toBe("https://api.github.com/user/repos");
    expect(config.headers.Authorization).toBe(`Bearer ${authToken}`);
    expect(data).toEqual({ name: repoName, isPrivate });
  });

  test("createOrgRepo should create a new repository for the organization", async () => {
    axios.post.mockResolvedValue();

    await createOrgRepo(authToken, orgName, repoName, isPrivate);

    const url = axios.post.mock.calls[0][0];
    const data = axios.post.mock.calls[0][1];
    const config = axios.post.mock.calls[0][2];

    expect(url).toBe(`https://api.github.com/orgs/${orgName}/repos`);
    expect(config.headers.Authorization).toBe(`Bearer ${authToken}`);
    expect(data).toEqual({ name: repoName, private: isPrivate });
  });

  test("createRepo should retry on rate limit exceeded", async () => {
    axios.post
      .mockRejectedValueOnce({
        response: {
          data: {
            message:
              "You have exceeded a secondary rate limit and have been temporarily blocked from content creation",
          },
        },
      })
      .mockResolvedValueOnce();

    const setTimeoutSpy = jest.spyOn(global, "setTimeout");
    setTimeoutSpy.mockImplementationOnce((callback) => callback());

    await createRepo(authToken, repoName, isPrivate);

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("Rate limit exceeded while creating")
    );
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 20000);
    expect(axios.post).toHaveBeenCalledTimes(2);

    setTimeoutSpy.mockRestore();
  });

  test("createOrgRepo should retry on rate limit exceeded", async () => {
    const setTimeoutSpy = jest.spyOn(global, "setTimeout");

    axios.post
      .mockRejectedValueOnce({
        response: {
          data: {
            message:
              "You have exceeded a secondary rate limit and have been temporarily blocked from content creation",
          },
        },
      })
      .mockResolvedValueOnce();

    setTimeoutSpy.mockImplementationOnce((callback) => {
      callback();
    });

    await createOrgRepo(authToken, orgName, repoName, isPrivate);

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("Rate limit exceeded while creating")
    );
    expect(axios.post).toHaveBeenCalledTimes(2);

    // Cleanup
    setTimeoutSpy.mockRestore();
  });
});
