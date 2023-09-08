import { sdkMock } from '../../../__mocks__/@extrahorizon/javascript-sdk';
import { handler as listHandler } from '../../../src/commands/tasks/list';
import { handler } from '../../../src/commands/tasks/sync';
import { runtimeChoices } from '../../../src/constants';

async function runCommand(...args) {
  process.argv = [
    'node',
    '../../../src/index',
    ...args,
  ];

  // Require the yargs CLI script
  return require('../../startCli');
}

describe('Tasks - Sync - Runtimes', () => {
  let originalArgv;

  beforeEach(() => {
    // Remove all cached modules. The cache needs to be cleared before running
    // each command, otherwise you will see the same results from the command
    // run in your first test in subsequent tests.
    jest.resetModules();

    // Each test overwrites process arguments so store the original arguments
    originalArgv = process.argv;
  });

  afterEach(() => {
    jest.resetAllMocks();

    // Set process arguments back to the original value
    process.argv = originalArgv;
  });

  const root = './tests/tasks/sync/configs/invalid-runtimes/';
  const runtimes = runtimeChoices.map(runtime => runtime).join(', ');

  it('Lists all functions -- Calling the handler', async () => {
    const mock = sdkMock;
    jest.spyOn(mock.raw, 'get').mockImplementationOnce(() => ({
      data: {
        data: [{
          description: 'this is a description',
          name: 'hello',
          updateTimestamp: new Date('2023-09-07T09:27:54.897Z'),
        }],
      },
    }));
    const logSpy = jest.spyOn(global.console, 'log');

    await listHandler({ sdk: mock, isTTY: true });

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('hello'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('2023-09-07T09:27:54.897Z'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('this is a description'));

    logSpy.mockRestore();
  });

  it('Lists all functions -- direct yargs call', async () => {
    // const logSpy = jest.spyOn(global.console, 'log');

    await runCommand('tasks', 'list');
    // expect(logSpy).toHaveBeenCalled();
    // expect(logSpy).toHaveBeenCalledTimes(1);
    // expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('hello'));
    // expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('2023-09-07T09:27:54.897Z'));
    // expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('this is a description'));
    //
    // logSpy.mockRestore();
  });

  it('Accepts a valid runtime when provided a task config file with a valid runtime', async () => {
    const error = await handler({ sdk: null, path: `${root}/valid-runtime.json` })
      .catch(e => e);

    // Proves that it proceeds passes the runtime validation
    const codePath = 'tests/tasks/sync/configs/invalid-runtimes/build';
    expect(error.message).toBe(`Please provide a valid directory path for your code, ${codePath} not found`);
  });

  it('Throws an invalid runtime error when provided an invalid runtime argument', async () => {
    const error = await handler({ sdk: null, name: 'test', entryPoint: 'index.js', runtime: 'nodejs8.x' })
      .catch(e => e);

    expect(error.message).toBe(`"runtime" must be one of [${runtimes}]`);
  });

  it('Throws an invalid runtime error when provided a task config file with an invalid runtime', async () => {
    const error = await handler({ sdk: null, path: `${root}/invalid-runtime.json` })
      .catch(e => e);

    expect(error.message).toBe(`"runtime" must be one of [${runtimes}]`);
  });

  it('Throws an invalid runtime error when provided a directory containing a task config with an invalid runtime', async () => {
    const error = await handler({ sdk: null, path: `${root}` })
      .catch(e => e);

    expect(error.message).toBe(`"runtime" must be one of [${runtimes}]`);
  });
});
