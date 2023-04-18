const axios = require("axios");
const { log, fail } = require("../utils/logger");

const createOrgRepo = async (
  authToken,
  orgName,
  repoName,
  isPrivate,
  retryCount = 0
) => {
  const url = `https://api.github.com/orgs/${orgName}/repos`;
  const headers = {
    Authorization: `Bearer ${authToken}`,
    Accept: "application/vnd.github.v3+json",
  };
  const data = { name: repoName, private: isPrivate };

  try {
    await axios.post(url, data, { headers });
  } catch (error) {
    if (!error.response || !error.response.data) {
      fail(error.message);
    }

    if (
      error.response.data.message.includes(
        "You have exceeded a secondary rate limit and have been temporarily blocked from content creation"
      )
    ) {
      const waitTime = 2 ** retryCount * 20000;
      log(
        `Rate limit exceeded while creating ${repoName}. Retrying in ${
          waitTime / 1000
        } seconds.`
      );
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, waitTime);
      });
      return createOrgRepo(
        authToken,
        orgName,
        repoName,
        isPrivate,
        retryCount + 1
      );
    }
    fail(JSON.stringify(error.response.data));
  }
  return Promise.resolve();
};

const createRepo = async (authToken, repoName, isPrivate, retryCount = 0) => {
  try {
    const url = "https://api.github.com/user/repos";
    const headers = {
      Authorization: `Bearer ${authToken}`,
      Accept: "application/vnd.github.v3+json",
    };
    const data = { name: repoName, isPrivate };
    await axios.post(url, data, { headers });
  } catch (error) {
    if (!error.response.data) {
      fail(error.message);
    }
    if (
      error.response.data.message.includes(
        "You have exceeded a secondary rate limit and have been temporarily blocked from content creation"
      )
    ) {
      const waitTime = 2 ** retryCount * 20000;
      log(
        `Rate limit exceeded while creating ${repoName}. Retrying in ${
          waitTime / 1000
        } seconds.`
      );
      setTimeout(
        () => createRepo(authToken, repoName, isPrivate, retryCount + 1),
        waitTime
      );
    } else {
      fail(JSON.stringify(error.response.data));
    }
  }
};

module.exports = { createRepo, createOrgRepo };
