const git = require("isomorphic-git");
const fs = require("fs");
const http = require("isomorphic-git/http/node");
const { execSync } = require("child_process");
const { cloneRepository, setPushUrlAndPush } = require("../../src/utils/git");

const consoleErrorOriginal = console.error;
console.error = jest.fn();

jest.mock("isomorphic-git");
jest.mock("child_process");

describe("cloneRepository", () => {
  afterEach(() => {
    git.clone.mockClear();
  });

  test("should clone a repository successfully", async () => {
    const sourceUrl = "https://github.com/user/repo.git";
    const repoLocation = "/path/to/repo";

    await cloneRepository(sourceUrl, repoLocation);

    expect(git.clone).toHaveBeenCalledWith({
      dir: repoLocation,
      url: sourceUrl,
      fs,
      http,
    });
  });

  test("should throw an error if cloning fails", async () => {
    const sourceUrl = "https://github.com/user/repo.git";
    const repoLocation = "/path/to/repo";
    const errorMessage = "Cloning failed";
    git.clone.mockRejectedValueOnce(new Error(errorMessage));

    await expect(cloneRepository(sourceUrl, repoLocation)).rejects.toThrow(
      errorMessage
    );
  });
});

describe("setPushUrlAndPush", () => {
  beforeEach(() => {
    execSync.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should set push URL and push successfully", () => {
    const destinationUrl = "https://github.com/user/destination.git";
    const workingDirectory = "/path/to/repo";

    setPushUrlAndPush(destinationUrl, workingDirectory);

    expect(execSync).toHaveBeenNthCalledWith(
      1,
      `git remote set-url --push origin ${destinationUrl}`,
      { cwd: workingDirectory }
    );
    expect(execSync).toHaveBeenNthCalledWith(2, "git push --mirror", {
      cwd: workingDirectory,
    });
  });

  test("should retry when rate limit exceeded and eventually succeed", async () => {
    const destinationUrl = "https://github.com/user/destination.git";
    const workingDirectory = "/path/to/repo";
    const rateLimitError = new Error("Rate limit exceeded");
    rateLimitError.stderr = "rate limit exceeded";

    execSync
      .mockImplementationOnce(() => {
        throw rateLimitError;
      })
      .mockImplementationOnce(() => {
        throw rateLimitError;
      })
      .mockImplementationOnce(() => {});

    setPushUrlAndPush(destinationUrl, workingDirectory, 0, 2, 1000);

    jest.advanceTimersByTime(1000);
    jest.advanceTimersByTime(1000);

    expect(execSync).toHaveBeenCalledTimes(2); // Two calls for each retry
  });

  test("should abort when rate limit exceeded and max retries reached", async () => {
    const destinationUrl = "https://github.com/user/destination.git";
    const workingDirectory = "/path/to/repo";
    const rateLimitError = new Error("Rate limit exceeded");
    rateLimitError.stderr = "rate limit exceeded";

    execSync.mockImplementation(() => {
      throw rateLimitError;
    });

    setPushUrlAndPush(destinationUrl, workingDirectory, 0, 2, 1000);

    jest.advanceTimersByTime(1000);
    jest.advanceTimersByTime(1000);

    expect(execSync).toHaveBeenCalledTimes(3); // Two calls for each retry
  });

  test("should log an error message when push fails for reasons other than rate limit", () => {
    const destinationUrl = "https://github.com/user/destination.git";
    const workingDirectory = "/path/to/repo";
    const otherError = new Error("Some other error");
    otherError.stderr = "Some other error";

    execSync.mockImplementation(() => {
      throw otherError;
    });

    // Create a spy for console.error
    const consoleErrorSpy = jest.spyOn(console, "error");

    setPushUrlAndPush(destinationUrl, workingDirectory);

    expect(consoleErrorSpy).toHaveBeenCalledWith(`Error: ${otherError.stderr}`);

    // Restore the original console.error function
    consoleErrorSpy.mockRestore();
  });
  console.error = consoleErrorOriginal;
});
