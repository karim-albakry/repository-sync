Bitbucket to Github Migration Tool 🚀
This tool allows you to migrate your Bitbucket repositories to Github. It is a command-line tool that uses the Github and Bitbucket REST APIs to perform the migration.

Installation
To install the tool, clone this repository and run the following command:

npm install
Usage
To use the tool, run the following command:

node src/index.js migrate -b <BITBUCKET_USER> -bt <BITBUCKET_TOKEN> -g <GITHUB_USER> -gt <GITHUB_TOKEN> -w <WORKSPACE_NAME> -p <PROJECT_NAME> [-o <ORGANIZATION_NAME>] [-e <REPO_NAMES>...]
Options
-b, --bitbucket-user <username>: Bitbucket username (required)
-bt, --bitbucket-token <token>: Bitbucket token (required)
-g, --github-user <username>: Github username (required)
-gt, --github-token <token>: Github token (required)
-w, --workspace <name>: Bitbucket workspace name (required)
-p, --project <name>: Bitbucket project name (required)
-o, --organization <name>: Github organization name (optional)
-e, --exclude <names...>: List of repository names to exclude (optional)
Example
node src/index.js migrate -b john_doe -bt <BITBUCKET_TOKEN> -g john_doe -gt <GITHUB_TOKEN> -w my_workspace -p my_project -o my_organization -e my_repo1 my_repo2
Testing
To run the tests, run the following command:

npm test
If you encounter the following error:

"Jest worker encountered 4 child process exceptions, exceeding retry limit"

You can use the following command to run Jest with the --detectOpenHandles flag:

npx jest --detectOpenHandles
This flag will detect any unclosed handles in your code and help you identify and fix the issue causing the error.

Building and Running the Tool
To build and run the tool as a command on Linux, follow these steps:

Make sure you have Node.js installed on your system. You can download it from the official website: https://nodejs.org/

Clone this repository to your local machine.

git clone https://github.com/example-user/bitbucket-to-github-migration-tool.git
Navigate to the project directory in your terminal.

cd bitbucket-to-github-migration-tool
Install the project dependencies by running the command:

npm install
Build the tool by running the command:

npm run build
Make the tool executable by running the command:

chmod +x bin/bitmig
Move the tool to your local bin directory. This will allow you to run the tool as a command from anywhere on your system.

sudo mv bin/bitmig /usr/local/bin/
Note: You may need to enter your password to complete this step.

Run the tool by running the command:

bitmig migrate -b <BITBUCKET_USER> -bt <BITBUCKET_TOKEN> -g <GITHUB_USER> -gt <GITHUB_TOKEN> -w <WORKSPACE_NAME> -p <PROJECT_NAME> [-o <ORGANIZATION_NAME>] [-e <REPO_NAMES>...]
Note: Replace <BITBUCKET_USER>, <BITBUCKET_TOKEN>, <GITHUB_USER>, <GITHUB_TOKEN>, <WORKSPACE_NAME>, and <PROJECT_NAME> with your own values. The -o and -e options are optional.

That's it! You should now be able to run the tool as a command from anywhere on your system by using the bitmig command followed by the migrate subcommand and the required options.

Compatibility
This version of the tool has only been tested on Linux systems. It may not work on other operating systems.

Code Structure
The src/index.js file contains the main code for the tool. It uses the commander package to parse command-line arguments and call the migrate function defined in src/commands/migrate.js.

The src/commands/migrate.js file contains the code for the migration logic. It uses the Bitbucket and Github classes defined in src/models/ to interact with the Bit