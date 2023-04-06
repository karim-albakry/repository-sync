const GitHub = require('../../src/models/github');

describe('GitHub', () => {
    describe('createOrgRepo', () => {
        it('should create a new repository in the specified organization', async () => {
            // Mock the Octokit client to return a successful response
            const mockResponse = { data: { name: 'test-repo' } };
            const mockOctokitClient = { request: jest.fn().mockResolvedValue(mockResponse) };

            // Create a new instance of the GitHub class with the mock Octokit client
            const githubClient = new GitHub('test-token');
            githubClient.octokit = mockOctokitClient;

            // Call the createOrgRepo method with test data
            const orgName = 'test-org';
            const repoName = 'test-repo';
            const isPrivate = false;
            const response = await githubClient.createOrgRepo(orgName, repoName, isPrivate);

            // Assert that the Octokit client was called with the correct arguments
            expect(mockOctokitClient.request).toHaveBeenCalledWith('POST /orgs/{org}/repos', {
                org: orgName,
                name: repoName,
                private: isPrivate,
                homepage: 'https://github.com',
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });

            // Assert that the response data from the API call was returned
            expect(response).toEqual(mockResponse.data);
        });

        it('should throw an error if organization name is not provided', async () => {
            // Create a new instance of the GitHub class
            const githubClient = new GitHub('test-token');

            // Call the createOrgRepo method with missing organization name
            const orgName = null;
            const repoName = 'test-repo';
            const isPrivate = false;
            await expect(githubClient.createOrgRepo(orgName, repoName, isPrivate)).rejects.toThrow('GitHub organization name is required');
        });

        it('should throw an error if repository name is not provided', async () => {
            // Create a new instance of the GitHub class
            const githubClient = new GitHub('test-token');

            // Call the createOrgRepo method with missing repository name
            const orgName = 'test-org';
            const repoName = null;
            const isPrivate = false;
            await expect(githubClient.createOrgRepo(orgName, repoName, isPrivate)).rejects.toThrow('Repository name is required');
        });

        it('should throw an error if repository already exists in organization', async () => {
            // Mock the Octokit client to return a 422 error
            const mockError = { status: 422 };
            const mockOctokitClient = { request: jest.fn().mockRejectedValue(mockError) };

            // Create a new instance of the GitHub class with the mock Octokit client
            const githubClient = new GitHub('test-token');
            githubClient.octokit = mockOctokitClient;

            // Call the createOrgRepo method with test data
            const orgName = 'test-org';
            const repoName = 'test-repo';
            const isPrivate = false;
            await expect(githubClient.createOrgRepo(orgName, repoName, isPrivate)).rejects.toThrow(`Repository ${repoName} already exists in ${orgName} organization`);
        });

        it('should throw an error if invalid GitHub token is provided', async () => {
            // Mock the Octokit client to return a 401 error
            const mockError = { status: 401 };
            const mockOctokitClient = { request: jest.fn().mockRejectedValue(mockError) };

            // Create a new instance of the GitHub class with the mock Octokit client
            const githubClient = new GitHub('test-token');
            githubClient.octokit = mockOctokitClient;

            // Call the createOrgRepo method with test data
            const orgName = 'test-org';
            const repoName = 'test-repo';
            const isPrivate = false;
            await expect(githubClient.createOrgRepo(orgName, repoName, isPrivate)).rejects.toThrow('Invalid GitHub token provided');
        });

        it('should throw an error if there is an error creating the repository', async () => {
            // Mock the Octokit client to return a generic error
            const mockError = new Error('Test error');
            const mockOctokitClient = { request: jest.fn().mockRejectedValue(mockError) };

            // Create a new instance of the GitHub class with the mock Octokit client
            const githubClient = new GitHub('test-token');
            githubClient.octokit = mockOctokitClient;

            // Call the createOrgRepo method with test data
            const orgName = 'test-org';
            const repoName = 'test-repo';
            const isPrivate = false;
            await expect(githubClient.createOrgRepo(orgName, repoName, isPrivate)).rejects.toThrow(`Failed to create repository: ${mockError.message}`);
        });
    });
});