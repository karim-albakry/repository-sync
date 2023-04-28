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

const fetchReposPage = async (username, token, page, perPage) => {
  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}/repos?visibility=all&per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching repositories: ${error.message}`);
    return [];
  }
};

const listRepos = async (username, token, exclude = [], specificRepos = []) => {
  const perPage = 100;
  const currentPage = 1;
  let repos = [];

  const initialRepos = await fetchReposPage(
    username,
    token,
    currentPage,
    perPage
  );
  repos = repos.concat(initialRepos);

  const totalPages = Math.ceil(initialRepos.length / perPage);
  const pageRequests = [];

  for (let i = 2; i <= totalPages; i += 1) {
    pageRequests.push(fetchReposPage(username, token, i, perPage));
  }

  const pages = await Promise.all(pageRequests);
  pages.forEach((pageRepos) => {
    repos = repos.concat(pageRepos);
  });

  const filteredRepos = repos.filter(({ name }) => {
    const excludeRepo = exclude.includes(name);
    const includeRepo =
      specificRepos.length === 0 || specificRepos.includes(name);
    return !excludeRepo && includeRepo;
  });

  const repoInfo = filteredRepos.map((repo) => ({
    name: repo.name,
    private: repo.private,
  }));

  return repoInfo;
};

module.exports = { createRepo, createOrgRepo, listRepos };
