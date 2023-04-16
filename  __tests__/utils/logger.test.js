const kleur = require('kleur');
const logger = require('../../src/utils/logger');

describe('logger', () => {
  describe('log', () => {
    test('should log an info message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const message = 'This is an info message';
      logger.log(message);
      expect(consoleSpy).toHaveBeenCalledWith(`[INFO] ${message}`);
      consoleSpy.mockRestore();
    });
  });

  describe('error', () => {
    test('should log an error message', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const message = 'This is an error message';
      logger.error(message);
      expect(consoleSpy).toHaveBeenCalledWith(`[ERROR] ${message}`);
      consoleSpy.mockRestore();
    });
  });

  describe('debug', () => {
    test('should log a debug message in blue color', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
      const message = 'This is a debug message';
      logger.debug(message);
      expect(consoleSpy).toHaveBeenCalledWith(kleur.blue(`[DEBUG] ${message}`));
      consoleSpy.mockRestore();
    });
  });

  describe('success', () => {
    test('should log a success message with green background', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const message = 'This is a success message';
      logger.success(message);
      expect(consoleSpy).toHaveBeenCalledWith(kleur.bgGreen().bold(`[INFO] ${message}`));
      consoleSpy.mockRestore();
    });
  });

  describe('fail', () => {
    test('should log a fail message with red background', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const message = 'This is a fail message';
      logger.fail(message);
      expect(consoleSpy).toHaveBeenCalledWith(kleur.bgRed().bold(`[INFO] ${message}`));
      consoleSpy.mockRestore();
    });
  });
});