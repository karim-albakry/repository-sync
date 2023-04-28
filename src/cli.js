const { Command } = require("commander");
const {
  migrate: migrateBitbucketToGithub,
} = require("./commands/migrateBitbucketToGithub");
const {
  migrate: migrateGithubToBitbucket,
} = require("./commands/migrateGithubToBitbucket");

const program = new Command();

program
  .command("bitbucket-to-github")
  .description("Sync repositories between Bitbucket and Github")
  .requiredOption("-b, --bitbucket-user <username>", "Bitbucket username")
  .requiredOption("-bt, --bitbucket-token <token>", "Bitbucket token")
  .requiredOption("-g, --github-user <username>", "Github username")
  .requiredOption("-gt, --github-token <token>", "Github token")
  .requiredOption("-w, --workspace <name>", "Bitbucket workspace name")
  .requiredOption("-p, --project <name>", "Bitbucket project name")
  .option("-o, --organization <name>", "Github organization name")
  .option("-e, --exclude <names...>", "List of repository names to exclude")
  .option(
    "-s, --specific-repos <names...>",
    "List of specific repository names to fetch"
  )
  .action(async (options) => {
    await migrateBitbucketToGithub(options);
  });

program
  .command("github-to-bitbucket")
  .description("Sync repositories between Bitbucket and Github")
  .requiredOption("-b, --bitbucket-user <username>", "Bitbucket username")
  .requiredOption("-bt, --bitbucket-token <token>", "Bitbucket token")
  .requiredOption("-g, --github-user <username>", "Github username")
  .requiredOption("-gt, --github-token <token>", "Github token")
  .requiredOption("-w, --workspace <name>", "Bitbucket workspace name")
  .requiredOption("-pk, --project-key <name>", "Bitbucket project key")
  .option("-o, --organization <name>", "Github organization name")
  .option("-e, --exclude <names...>", "List of repository names to exclude")
  .option(
    "-s, --specific-repos <names...>",
    "List of specific repository names to fetch"
  )
  .action(async (options) => {
    await migrateGithubToBitbucket(options);
  });

module.exports = { program };
