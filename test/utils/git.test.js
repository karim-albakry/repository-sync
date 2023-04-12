const { cloneRepository } = require('../../src/utils/git');
const fs = require('fs');
const path = require('path');

describe('cloneRepository', () => {
  it('should clone a repository successfully', async () => {
    // Arrange
    const sourceUrl = 'https://github.com/karim-albakry/clone_me';
    const repoName = `repo-${Math.random().toString(36).substring(2, 8)}`;
    const repoLocation = path.join(`./repo/test/repo-${Math.random().toString(36).substring(2, 8)}`, repoName);
    const options = { force: true };

    // Act
    await cloneRepository(sourceUrl, repoLocation, options);

    // Assert
    const gitDir = path.join(repoLocation, '.git');
    const stats = fs.statSync(gitDir);
    expect(stats.isDirectory()).toBe(true);
  });

  it('should handle errors during cloning', async () => {
    // Arrange
    const sourceUrl = 'https://github.com/karim-albakry/invalid-url.git'; // An invalid URL that cannot be cloned
    const repoLocation = `./repo/test/repo-${Math.random().toString(36).substring(2, 8)}`;
    const options = { force: true };
    const expectedError = new Error('HTTP Error: 401 Unauthorized'); // Define the expected error

    // Act and assert
    await expect(cloneRepository(sourceUrl, repoLocation, options)).rejects.toThrow(expectedError);
  });
});