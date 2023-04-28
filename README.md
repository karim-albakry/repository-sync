# Repository Sync Tool

This tool syncs repositories between Bitbucket and GitHub, allowing you to migrate repositories from a Bitbucket workspace to a GitHub user or organization account and vice versa.

## Installation

1. Clone this repository:

\`\`\`
git clone https://github.com/karim-albakry/repository-sync.git
\`\`\`

2. Change to the project directory:

\`\`\`
cd repository-sync
\`\`\`

3. Install the dependencies:

\`\`\`
npm install
\`\`\`

## Usage

### Migrating Repositories

#### Bitbucket to GitHub

To migrate repositories from a Bitbucket workspace to a GitHub user or organization account, use the following command:

\`\`\`
npm start -- bitbucket-to-github -b <bitbucket_user> -bt <bitbucket_token> -g <github_user> -gt <github_token> -w <workspace> -p <project> [options]
\`\`\`

#### GitHub to Bitbucket

To migrate repositories from a GitHub user or organization account to a Bitbucket workspace, use the following command:

\`\`\`
npm start -- github-to-bitbucket -b <bitbucket_user> -bt <bitbucket_token> -g <github_user> -gt <github_token> -w <workspace> -pk <project_key> [options]
\`\`\`

Replace the placeholders with your actual credentials and information:

- `<bitbucket_user>`: Your Bitbucket username
- `<bitbucket_token>`: Your Bitbucket token
- `<github_user>`: Your GitHub username
- `<github_token>`: Your GitHub token
- `<workspace>`: The Bitbucket workspace name
- `<project>`: The Bitbucket project name (for Bitbucket to GitHub migration)
- `<project_key>`: The Bitbucket project key (for GitHub to Bitbucket migration)

#### Options

- `-o, --organization <name>`: The GitHub organization name (optional)
- `-e, --exclude <names...>`: A list of repository names to exclude from the sync process (optional)
- `-s, --specific-repos <names...>`: A list of specific repository names to fetch and sync (optional)

### Running Tests

To run the tests using the [Jest testing framework](https://jestjs.io/), use the following command:

\`\`\`
npm test
\`\`\`

This command will run your test suite and report any leaked handles if they exist.

## Example

To migrate repositories from a [Bitbucket project](https://bitbucket.org/) to a [GitHub user account](https://github.com/), run:

\`\`\`
npm start -- bitbucket-to-github -b btuser -bt btpass -g ghuser -gt ghtkn -w woks -p node_apps -s simple_go simple_node
\`\`\`

This command will migrate the repositories `simple_go` and `simple_node` from the Bitbucket project `node_apps` in the workspace `woks` to the GitHub user account `ghuser`.

To migrate repositories from a [GitHub user account](https://github.com/) or organization to a [Bitbucket project](https://bitbucket.org/), run:

\`\`\`
npm start -- github-to-bitbucket -b btuser -bt btpass -g ghuser -gt ghtkn -w woks -pk prjkey -s react_app express_app
\`\`\`

This command will migrate the repositories `react_app` and `express_app` from the GitHub user account `ghuser` to the Bitbucket project with the key `prjkey` in the workspace `woks`.

## License

This project is licensed under the [MIT License](LICENSE).
