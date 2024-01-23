import * as chalk from 'chalk';
import { handler } from '../../../src/commands/tasks/sync';
import { runtimeChoices } from '../../../src/constants';
import { functionCode } from '../../__helpers__/functions';
import { tasksRepositoryMock } from '../../__helpers__/tasksRepositoryMock';
import { createTempDirectoryManager } from '../../__helpers__/tempDirectoryManager';

describe('exh tasks sync', () => {
  let tempDirectoryManager;
  let repositoryMock;

  beforeAll(async () => {
    tempDirectoryManager = await createTempDirectoryManager();
    repositoryMock = tasksRepositoryMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await tempDirectoryManager.removeDirectory();
  });

  const root = 'tests/__helpers__/task-configs/invalid-runtimes/';
  const runtimes = runtimeChoices.map(runtime => runtime).join(', ');

  it('Creates a Function', async () => {
    const taskConfigPath = await tempDirectoryManager.createTempJsonFile(repositoryMock.functionConfig);
    await tempDirectoryManager.createTempJsFile('index', functionCode);

    const logSpy = jest.spyOn(global.console, 'log');

    await handler({ sdk: null, path: taskConfigPath });
    expect(repositoryMock.findFunctionsSpy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.createFunctionSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(chalk.green('Successfully created task', repositoryMock.functionConfig.name));
  });

  it('Accepts a valid runtime when provided a task config file with a valid runtime', async () => {
    const error = await handler({ sdk: null, path: `${root}/valid-runtime.json` })
      .catch(e => e);

    // Proves that it proceeds passes the runtime validation
    const codePath = 'tests/__helpers__/task-configs/invalid-runtimes/build';
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
