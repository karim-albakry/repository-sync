# Repository Sync Tool

This tool syncs repositories between Bitbucket and GitHub, allowing you to migrate repositories from a Bitbucket workspace to a GitHub user or organization account.

## Installation

1. Clone this repository:

git clone https://github.com/karim-albakry/repo-migration-tool.git


2. Change to the project directory:

```
cd repo-migration-tool
````

3. Install the dependencies:

````
npm install
````

## Usage

### Migrating Repositories

To run the `migrate` command and, use the following command:

```
npm start -- migrate -b <bitbucket_user> -bt <bitbucket_token> -g <github_user> -gt <github_token> -w <workspace> -p <project> [options]
```

Replace the placeholders with your actual credentials and information:

- `<bitbucket_user>`: Your Bitbucket username
- `<bitbucket_token>`: Your Bitbucket token
- `<github_user>`: Your GitHub username
- `<github_token>`: Your GitHub token
- `<workspace>`: The Bitbucket workspace name
- `<project>`: The Bitbucket project name

#### Options

- `-o, --organization <name>`: The GitHub organization name (optional)
- `-e, --exclude <names...>`: A list of repository names to exclude from the sync process (optional)
- `-s, --specific-repos <names...>`: A list of specific repository names to fetch and sync (optional)

### Running Tests

To run the tests using the [Jest testing framework](https://jestjs.io/), use the following command:

```
npm test
```

This command will run your test and report any leaked handles if they exist.

## Example

To migrate repositories from a [Bitbucket project](https://bitbucket.org/) to a [GitHub user account or organization](https://github.com/), run:

```
npm start -- migrate -b bb_user -bt bb_tkn -g gh_user -gt gh_tkn -w bb_work_space -p bb_projct -s repo_01 repo_02
```

This command will migrate the repositories `repo_01` and `repo_02` from the Bitbucket project `bb_projct` in the workspace `bb_work_space` to the GitHub user account `gh_user`.

## License

This project is licensed under the [MIT License](LICENSE).
```