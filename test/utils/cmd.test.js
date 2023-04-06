const executeShellCommand = require('../../src/utils/cmd');

describe('executeShellCommand', () => {
  describe('with valid parameters', () => {
    test('should execute the command and log the output', async () => {
      const command = 'echo "Hello World"';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await executeShellCommand(command);
      expect(consoleSpy).toHaveBeenCalledWith(`[INFO] Stdout: Hello World\n`);
      consoleSpy.mockRestore();
    });
  });

  describe('with invalid parameters', () => {
    test('should throw an error if command is not a string', async () => {
      const command = 123;
      await expect(executeShellCommand(command)).rejects.toThrow('Command must be a string');
    });

    test('should throw an error if command is empty', async () => {
      const command = '';
      await expect(executeShellCommand(command)).rejects.toThrow('Command must be not empty');
    });

    test('should throw an error if options is not an object', async () => {
      const command = 'echo "Hello World"';
      const options = 'invalid';
      await expect(executeShellCommand(command, options)).rejects.toThrow('Options must be an object');
    });
  });

  describe('when the command fails', () => {
    test('should log the error message', async () => {
      const command = 'ls invalid_dir';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await executeShellCommand(command);
      expect(consoleSpy).toHaveBeenCalledWith("[ERROR] Error: Command failed: ls invalid_dir"+"\n"+`ls: cannot access 'invalid_dir': No such file or directory\n`);
      consoleSpy.mockRestore();
    });
  });
});