const Joi = require("joi");
const { isNotEmpty } = require("../utils/validator");
const git = require("../utils/git");
const { createOrgRepo, createRepo } = require("../models/github");
const Bitbucket = require("../models/bitbucket");
const { success, log, debug, error } = require("../utils/logger");

const optionsSchema = Joi.object({
  bitbucketUser: Joi.string().required(),
  bitbucketToken: Joi.string().required(),
  githubUser: Joi.string().required(),
  githubToken: Joi.string().required(),
  workspace: Joi.string().required(),
  exclude: Joi.array().items(Joi.string()),
  organization: Joi.string().allow(""),
  project: Joi.string().allow(null),
});

function validateOptions(options) {
  const { error: err } = optionsSchema.validate(options);
  if (err) {
    throw new Error(`Invalid options: ${err.message}`);
  }
}

async function fetchRepos({
  organization,
  githubUser,
  bitbucketUser,
  bitbucketToken,
  workspace,
  bitbucket,
  githubToken,
  exclude,
  project,
}) {
  log("Start fetching repos.");
  const query = project ? `project.name = "${project}"` : "";
  let repos = await bitbucket.listRepositories({
    exclude,
    query,
  });
  repos = repos.map(({ slug, is_private: isPrivate }) => {
    const repoLocation = `${process.cwd()}/repos/${slug}`;
    const sourceUrl = `https://${bitbucketUser}:${bitbucketToken}@bitbucket.org/${workspace}/${slug}`;
    const destinationUrl = isNotEmpty(organization)
      ? `https://${githubToken}@github.com/${organization}/${slug}.git`
      : `https://${githubToken}@github.com/${githubUser}/${slug}.git`;
    return {
      slug,
      isPrivate,
      destinationUrl,
      repoLocation,
      sourceUrl,
      organization,
    };
  });
  return repos;
}

async function createGithubRepo(
  githubToken,
  { slug, isPrivate, organization }
) {
  try {
    if (isNotEmpty(organization)) {
      await createOrgRepo(githubToken, organization, slug, isPrivate);
    } else {
      await createRepo(githubToken, slug, isPrivate);
    }
  } catch (err) {
    console.error(`Failed to create repo ${slug}: ${err.message}`);
  }
}

async function cloneRepo({ slug, repoLocation, sourceUrl }) {
  try {
    await git.cloneRepository(sourceUrl, repoLocation, { mirror: true });
    debug(`Repo ${slug} is cloned.`);
  } catch (err) {
    console.error(`Failed to clone repository ${slug}: ${error.message}`);
    throw new Error(`Failed to [clone repository] ${slug}: ${err.message}`);
  }
}

function pushRepo({ slug, destinationUrl, repoLocation }) {
  try {
    debug(`Repo ${slug} pushing operation started.`);
    git.setPushUrlAndPush(destinationUrl, repoLocation);
    success(`Repo ${slug} pushed successfully.`);
  } catch (err) {
    throw new Error(`Failed to push repository ${slug}: ${err.message}`);
  }
}

async function cloneRepos(repos) {
  if (!Array.isArray(repos)) {
    throw new Error("repos argument must be an array");
  }

  await Promise.all(
    repos.map(({ slug, repoLocation, sourceUrl }) =>
      cloneRepo({ slug, repoLocation, sourceUrl })
    )
  );
}

function pushGithubRepos(repos) {
  const delay = 20;
  let count = 0;
  repos.forEach((repo) => {
    count += 1;
    pushRepo(repo);
    if (count % delay === 0) {
      debug(`
        Delaying for 20 seconds after pushing ${count} repositories.
      `);
      setTimeout(() => {
        debug(`
          Resuming after delay for ${delay} repositories.
        `);
      }, 20000);
    }
  });
}

async function createGithubRepos(githubToken, repos) {
  if (!Array.isArray(repos)) {
    throw new Error("repos argument must be an array");
  }

  await Promise.all(
    repos.map(({ slug, isPrivate, organization }) =>
      createGithubRepo(githubToken, { slug, isPrivate, organization })
    )
  );
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
    project = null,
  } = options;

  try {
    const bitbucket = new Bitbucket(bitbucketUser, bitbucketToken, workspace);

    log(`Migration Stepes:
    1. Fetching Bitbuckit Repos. "Current"
    2. Creating Repositories on GitHub.
    3. Pushing Repositories on GitHub.
    4. Cleanning Up.
    `);
    const reposList = await fetchRepos({
      organization,
      githubUser,
      bitbucketUser,
      bitbucketToken,
      workspace,
      bitbucket,
      githubToken,
      exclude,
      project,
    });
    log(`Migration Stepes:
    1. ${success(`Fetching Bitbucket Repositories. "Done"`)}
    2. Creating Repositories on GitHub. "Current"
    3. Cloning Repositories to /repos.
    4. Pushing Repositories on GitHub.
    `);
    createGithubRepos(githubToken, reposList)
      .then(() => {
        log(`Migration Stepes:
        1. ${success(`Fetching Bitbucket Repositories. "Done"`)}
        2. ${success(`Creating Repositories on GitHub. "Done"`)}
        3. Cloning Repositories to /repos. "Current"
        3. Pushing Repositories on GitHub.
        `);
        return cloneRepos(reposList);
      })
      .then(() => {
        log(`Migration Stepes:
        1. ${success(`Fetching Bitbucket Repositories. "Done"`)}
        2. ${success(`Creating Repositories on GitHub. "Done"`)}
        3. ${success(`Cloning Repositories to /repos. "Current"`)}
        4. Pushing Repositories on GitHub. "Current"
        `);
        return pushGithubRepos(reposList);
      })
      .then(() => {
        log(`Migration Stepes:
        1. ${success(`Fetching Bitbucket Repositories. "Done"`)}
        2. ${success(`Creating Repositories on GitHub. "Done"`)}
        3. ${success(`Cloning Repositories to /repos. "Current"`)}
        4. ${success(`Pushing Repositories on GitHub. "Current"`)}
        `);
        success("Repositories Migrated Successfully");
      })
      .catch((err) => {
        console.error(err);
      });
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = {
  migrate,
  validateOptions,
  createGithubRepo,
  cloneRepo,
  pushRepo,
};
