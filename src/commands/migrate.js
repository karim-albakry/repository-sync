const Joi = require("joi");
const { isNotEmpty } = require("../utils/validator");
const cmd = require("../utils/cmd");
const git = require("../utils/git");
const Github = require("../models/github");
const Bitbucket = require("../models/bitbucket");
const { success, log, fail } = require("../utils/logger");

/**
 * Validates the options object for the migration.
 *
 * @param {object} options - The options object for the migration.
 *
 * @throws {Error} Throws an error if the options object is not valid.
 */

const optionsSchema = Joi.object({
  bitbucketUser: Joi.string().required(),
  bitbucketToken: Joi.string().required(),
  githubUser: Joi.string().required(),
  githubToken: Joi.string().required(),
  workspace: Joi.string().required(),
  exclude: Joi.array().items(Joi.string()),
  organization: Joi.string().allow(""),
  project: Joi.string().allow(),
});

function validateOptions(options) {
  const { error } = optionsSchema.validate(options);
  if (error) {
    throw new Error(`Invalid options: ${error.message}`);
  }
}

/**
 * Deletes a repository located at the specified path.
 *
 * @param {string} repoLocation - The path to the repository to delete.
 *
 * @throws {Error} Throws an error if the repository cannot be deleted.
 */
async function cleanUp(repoLocation) {
  try {
    await cmd(`rm -r ${repoLocation}`);
  } catch (error) {
    throw new Error(`Failed to clean up ${repoLocation}: ${error.message}`);
  }
}

/**
 * Migrates repositories from Bitbucket to GitHub.
 *
 * @param {object} options - The options object for the migration.
 * @param {string} options.bitbucketUser - The Bitbucket username.
 * @param {string} options.bitbucketToken - The Bitbucket access token.
 * @param {string} options.githubUser - The GitHub username.
 * @param {string} options.githubToken - The GitHub access token.
 * @param {string} options.workspace - The Bitbucket workspace.
 * @param {string} [options.organization] - The GitHub organization to migrate the repositories to.
 * @param {string[]} [options.exclude] - A list of repository slugs to exclude from the migration.
 *
 * @throws {Error} Throws an error if the migration fails.
 */
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
    project,
  } = options;

  const bitbucket = new Bitbucket(bitbucketUser, bitbucketToken, workspace);
  const github = new Github(githubToken);
  const reposList = await bitbucket.listRepositories({
    exclude,
    q: `project.name = ${project}`,
  });
  const migrations = reposList.map(async ({ slug, isPrivate }) => {
    try {
      const repoLocation = `./repos/${slug}`;
      const sourceUrl = `https://${bitbucketUser}:${bitbucketToken}@bitbucket.org/${workspace}/${slug}`;
      const destinationUrl = isNotEmpty(organization)
        ? `https://${githubToken}@github.com/${organization}/${slug}.git`
        : `https://${githubToken}@github.com/${githubUser}/${slug}.git`;
      log(`Cloning: ${slug}`);
      await git.cloneRepository(sourceUrl, repoLocation, { mirror: true });
      process.chdir(repoLocation);
      if (isNotEmpty(organization)) {
        await github.createOrgRepo(organization, slug, isPrivate);
      } else {
        await github.createUserRepo(slug, { isPrivate, isTemplate: false });
      }
      await cmd(
        `git remote set-url --push origin ${destinationUrl} && git push --mirror`
      );
      await cleanUp(process.cwd());
    } catch (error) {
      fail(`Failed to migrate repository ${slug}: ${error.message}`);
      // throw new Error(`Failed to migrate repository ${slug}: ${error.message}`);
    }
  });

  try {
    await Promise.all(migrations);
    success("Migration completed successfully");
  } catch (error) {
    throw new Error(`Migration failed: ${error.message}`);
  }
}

module.exports = { migrate, cleanUp, validateOptions };
