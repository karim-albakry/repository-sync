# Repository Sync Tool

This tool syncs repositories between Bitbucket and GitHub, allowing you to migrate repositories from a Bitbucket workspace to a GitHub user or organization account.

## Installation

1. Clone this repository:

git clone https://github.com/karim-albakry/repository-sync.git


2. Change to the project directory:

```
cd repository-sync
````

3. Install the dependencies:

````
npm install
````

## Usage

### Migrating Repositories

To run the `migrate` command and sync repositories, use the following command:

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

This command will run your test suite and report any leaked handles if they exist.

## Example

To migrate repositories from a [Bitbucket project](https://bitbucket.org/) to a [GitHub user account](https://github.com/), run:

```
npm start -- migrate -b btuser -bt btpass -g ghuser -gt ghtkn -w woks -p node_apps -s simple_go simple_node
```

This command will migrate the repositories `simple_go` and `simple_node` from the Bitbucket project `node_apps` in the workspace `woks` to the GitHub user account `ghuser`.

## License

This project is licensed under the [MIT License](LICENSE).
```