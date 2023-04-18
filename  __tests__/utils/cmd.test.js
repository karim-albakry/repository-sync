const { execSync } = require("child_process");
const executeShellCommand = require("../../src/utils/cmd");
const { error, log } = require("../../src/utils/logger");

jest.mock("child_process");
jest.mock("../../src/utils/logger");

describe("executeShellCommand", () => {
  afterEach(() => {
    execSync.mockClear();
    error.mockClear();
    log.mockClear();
  });

  test("should execute a valid shell command", () => {
    const command = "echo 'hello'";
    const stdout = "hello\n";
    execSync.mockReturnValueOnce(Buffer.from(stdout));

    executeShellCommand(command);

    expect(execSync).toHaveBeenCalledWith(command, {
      cwd: process.cwd(),
      timeout: 0,
    });
    expect(log).toHaveBeenCalledWith(`Stdout: ${stdout}`);
  });

  test("should throw an error if command is not a string", () => {
    const command = 42;

    expect(() => executeShellCommand(command)).toThrow(
      "Command must be a string"
    );
  });

  test("should throw an error if command is an empty string", () => {
    const command = "";

    expect(() => executeShellCommand(command)).toThrow(
      "Command must be not empty"
    );
  });

  test("should throw an error if options is not an object", () => {
    const command = "echo 'hello'";
    const options = "invalid";

    expect(() => executeShellCommand(command, options)).toThrow(
      "Options must be an object"
    );
  });

  test("should use provided options when executing command", () => {
    const command = "echo 'hello'";
    const stdout = "hello\n";
    const options = { cwd: "/tmp", timeout: 5000 };
    execSync.mockReturnValueOnce(Buffer.from(stdout));

    executeShellCommand(command, options);

    expect(execSync).toHaveBeenCalledWith(command, options);
    expect(log).toHaveBeenCalledWith(`Stdout: ${stdout}`);
  });

  test("should throw an error and log stderr if command execution fails", () => {
    const command = "non_existent_command";
    const stderr = "command not found: non_existent_command\n";
    const errorObject = new Error();
    errorObject.stderr = Buffer.from(stderr);
    execSync.mockImplementationOnce(() => {
      throw errorObject;
    });

    expect(() => executeShellCommand(command)).toThrow(
      `Failed to execute command: ${stderr}`
    );
    expect(error).toHaveBeenCalledWith(`Stderr: ${stderr}`);
  });
});
