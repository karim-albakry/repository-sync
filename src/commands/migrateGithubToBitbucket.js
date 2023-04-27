const Joi = require("joi");
const { fetchRepos } = require("../models/github");

const optionsSchema = Joi.object({
  bitbucketUser: Joi.string().required(),
  bitbucketToken: Joi.string().required(),
  githubUser: Joi.string().required(),
  githubToken: Joi.string().required(),
  workspace: Joi.string().required(),
  exclude: Joi.array().items(Joi.string()),
  organization: Joi.string().allow(""),
  project: Joi.string().allow(null),
  specificRepos: Joi.array().items(Joi.string()),
});

function validateOptions(options) {
  const { error: err } = optionsSchema.validate(options);
  if (err) {
    throw new Error(`Invalid options: ${err.message}`);
  }
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
    specificRepos = [],
  } = options;

  try {
    // fetch GitHub Repos.
    const repos = await fetchRepos(githubUser || organization, githubToken);

    // Create Repos on bitbucit.
    // Clone Repos.
    // Push Repos.
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = {
  migrate,
  validateOptions,
};
