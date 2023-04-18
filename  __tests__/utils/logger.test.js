const kleur = require("kleur");
const logger = require("../../src/utils/logger");

describe("logger", () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleDebugSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  test("should log an informational message", () => {
    const message = "Test info message";
    logger.log(message);

    expect(consoleLogSpy).toHaveBeenCalledWith(kleur.blue(`[INFO] ${message}`));
  });

  test("should log an error message", () => {
    const message = "Test error message";
    logger.error(message);

    expect(consoleErrorSpy).toHaveBeenCalledWith(`[ERROR] ${message}`);
  });

  test("should log a debug message", () => {
    const message = "Test debug message";
    logger.debug(message);

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      kleur.magenta(`[DEBUG] ${message}`)
    );
  });

  test("should log a success message", () => {
    const message = "Test success message";
    logger.success(message);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      kleur.bgGreen().bold(`[INFO] ${message}`)
    );
  });

  test("should log a failure message", () => {
    const message = "Test failure message";
    logger.fail(message);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      kleur.bgRed().bold(`[ERROR] ${message}`)
    );
  });
});
