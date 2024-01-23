import * as chalk from 'chalk';
import { handler } from '../../../src/commands/tasks/sync';
import { runtimeChoices } from '../../../src/constants';
import * as taskRepository from '../../../src/repositories/tasks';
import { functionCode, functionConfig, functionDetails } from '../../__helpers__/functions';
import { createTempDirectoryManager } from '../../__helpers__/tempDirectoryManager';

describe('exh tasks sync', () => {
  let tempDirectoryManager;

  beforeAll(async () => {
    tempDirectoryManager = await createTempDirectoryManager();
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
    const taskConfigPath = await tempDirectoryManager.createTempJsonFile(functionConfig);
    await tempDirectoryManager.createTempJsFile('index', functionCode);

    const logSpy = jest.spyOn(global.console, 'log');
    jest.spyOn(taskRepository.functions, 'find').mockImplementationOnce(() => Promise.resolve([]));
    jest.spyOn(taskRepository.functions, 'create').mockImplementationOnce(() => Promise.resolve(functionDetails(functionConfig)));
    jest.spyOn(taskRepository.functions, 'findByName').mockImplementationOnce(() => Promise.resolve(functionDetails(functionConfig)));

    await handler({ sdk: null, path: taskConfigPath });
    expect(logSpy).toHaveBeenCalledWith(chalk.green('Successfully created task', functionConfig.name));
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
