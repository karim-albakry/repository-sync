const Joi = require("joi");
const { listRepos } = require("../models/github");
const BitbucketClient = require("../models/bitbucket");
const git = require("../utils/git");

async function cloneRepo({ name, repoLocation, sourceUrl }) {
  try {
    console.log(`cloning: ${name}`);
    await git.cloneRepository(sourceUrl, repoLocation, { mirror: true });
  } catch (err) {
    console.error(`Failed to clone repository ${name}: ${err.message}`);
    throw new Error(`Failed to [clone repository] ${name}: ${err.message}`);
  }
}
async function cloneRepos(repos) {
  if (!Array.isArray(repos)) {
    throw new Error("repos argument must be an array");
  }

  await Promise.all(
    repos.map(({ name, repoLocation, sourceUrl }) =>
      cloneRepo({ name, repoLocation, sourceUrl })
    )
  );
}
const optionsSchema = Joi.object({
  bitbucketUser: Joi.string().required(),
  bitbucketToken: Joi.string().required(),
  githubUser: Joi.string().required(),
  githubToken: Joi.string().required(),
  workspace: Joi.string().required(),
  exclude: Joi.array().items(Joi.string()),
  organization: Joi.string().allow(""),
  projectKey: Joi.string().allow(null),
  specificRepos: Joi.array().items(Joi.string()),
});

function pushRepo({ name, destinationUrl, repoLocation }) {
  try {
    console.log(`pushing: ${name}`);
    git.setPushUrlAndPush(destinationUrl, repoLocation);
  } catch (err) {
    throw new Error(`Failed to push repository ${name}: ${err.message}`);
  }
}

function pushGithubRepos(repos) {
  const delay = 20;
  let count = 0;
  repos.forEach((repo) => {
    count += 1;
    pushRepo(repo);
    if (count % delay === 0) {
      console.debug(`
        Delaying for 20 seconds after pushing ${count} repositories.
      `);
      setTimeout(() => {}, 20000);
    }
  });
}

function validateOptions(options) {
  const { error: err } = optionsSchema.validate(options);
  if (err) {
    throw new Error(`Invalid options: ${err.message}`);
  }
}

async function createbitbucketRepos(
  bitbucketUser,
  bitbucketToken,
  bitbucketWorkspaceName,
  bitbucketProjectName,
  repos
) {
  if (!Array.isArray(repos)) {
    throw new Error("repos argument must be an array");
  }
  const btc = new BitbucketClient(
    bitbucketUser,
    bitbucketToken,
    bitbucketWorkspaceName
  );
  await Promise.all(
    repos.map(({ name, private: isPrivate }) =>
      btc.createBitbucketRepo(
        bitbucketUser,
        name,
        isPrivate,
        bitbucketWorkspaceName,
        bitbucketProjectName
      )
    )
  );
}

async function fetchRepos({
  organization,
  githubUser,
  bitbucketUser,
  bitbucketToken,
  workspace,
  githubToken,
  exclude,
  specificRepos,
}) {
  let repos = await listRepos(
    organization || githubUser,
    githubToken,
    exclude,
    specificRepos
  );
  repos = repos.map(({ name, private: isPrivate }) => {
    const repoLocation = `${process.cwd()}/repos/${name}`;
    const destinationUrl = `https://${bitbucketUser}:${bitbucketToken}@bitbucket.org/${workspace}/${name}.git`;
    const sourceUrl = `https://${githubToken}@github.com/${
      organization || githubUser
    }/${name}`;
    return {
      name,
      isPrivate,
      destinationUrl,
      repoLocation,
      sourceUrl,
      organization,
    };
  });
  return repos;
}

async function migrate(options) {
  validateOptions(options);

  const {
    bitbucketUser,
    bitbucketToken,
    githubUser,
    githubToken,
    workspace,
    organization = "",
    exclude = [],
    projectKey = null,
    specificRepos = [],
  } = options;

  try {
    // fetch GitHub Repos.
    const repos = await fetchRepos({
      organization,
      githubUser,
      bitbucketUser,
      bitbucketToken,
      workspace,
      githubToken,
      exclude,
      specificRepos,
    });
    await createbitbucketRepos(
      bitbucketUser,
      bitbucketToken,
      workspace,
      projectKey,
      repos
    );
    await cloneRepos(repos);
    await pushGithubRepos(repos);
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = {
  migrate,
  validateOptions,
};
