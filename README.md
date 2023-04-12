🎉 Welcome to the Bitbucket to GitHub Migration Tool! 🚀

Are you looking to move your repositories from Bitbucket to GitHub? Look no further! 🙌 Our tool is here to make the migration process quick and easy.

## 🛠️ Installation

To get started, clone the repository and run the following command:

npm install

## 🚀 Usage

Using our tool is a breeze! Simply run the following command:

node src/index.js migrate -b <BITBUCKET_USER> -bt <BITBUCKET_TOKEN> -g <GITHUB_USER> -gt <GITHUB_TOKEN> -w <WORKSPACE_NAME> -p <PROJECT_NAME> [-o <ORGANIZATION_NAME>] [-e <REPO_NAMES>...]
Here are the options you can use:

1. -b, --bitbucket-user: Bitbucket username (required)
2. -bt, --bitbucket-token: Bitbucket token (required)
3. -g, --github-user: GitHub username (required)
4. -gt, --github-token: GitHub token (required)
5. -w, --workspace: Bitbucket workspace name (required)
6. -p, --project: Bitbucket project name (required)
7. -o, --organization: GitHub organization name (optional)
8. -e, --exclude <names...>: List of repository names to exclude (optional)

## Example:

node src/index.js migrate -b john_doe -bt <BITBUCKET_TOKEN> -g john_doe -gt <GITHUB_TOKEN> -w my_workspace -p my_project -o my_organization -e my_repo1 my_repo2

## 🧪 Testing

We've got you covered with testing too! Simply run the following command:

npm test
If you encounter the "Jest worker encountered 4 child process exceptions, exceeding retry limit" error, use the following command to run Jest with the --detectOpenHandles flag:

npx jest --detectOpenHandles

👋 That's it! We hope our tool makes your migration process easy and fun! 🎉
