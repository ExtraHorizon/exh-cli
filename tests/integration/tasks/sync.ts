import * as path from 'path';
import * as chalk from 'chalk';
import { sdkMock } from '../../../__mocks__/@extrahorizon/javascript-sdk';
import { handler } from '../../../src/commands/tasks/sync';
import { runtimeChoices } from '../../../src/constants';
import * as functionRepository from '../../../src/repositories/functions';
import * as userRepository from '../../../src/repositories/user';
import { mockAuthRepository } from '../../__helpers__/authRepositoryMock';
import { functionRepositoryMock } from '../../__helpers__/functionRepositoryMock';
import { functionCode } from '../../__helpers__/functions';
import { createTempDirectoryManager } from '../../__helpers__/tempDirectoryManager';
import { userRepositoryMock } from '../../__helpers__/userRepositoryMock';
import { generateFunctionGlobalRole, generateFunctionUser } from '../../__helpers__/users';

describe('exh tasks sync', () => {
  let tempDirectoryManager;
  let functionMock;

  beforeEach(async () => {
    tempDirectoryManager = await createTempDirectoryManager();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await tempDirectoryManager.removeDirectory();
  });

  const root = 'tests/__helpers__/task-configs/invalid-runtimes/';
  const runtimes = runtimeChoices.map(runtime => runtime).join(', ');

  it('Creates a Function', async () => {
    functionMock = functionRepositoryMock();
    const taskConfigPath = await tempDirectoryManager.createTempJsonFile(functionMock.functionConfig);
    await tempDirectoryManager.createTempJsFile('index', functionCode);

    const logSpy = jest.spyOn(global.console, 'log');

    await handler({ sdk: null, path: taskConfigPath });
    expect(functionMock.findSpy).toHaveBeenCalledTimes(1);
    expect(functionMock.createSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(chalk.green('Successfully created task', functionMock.functionConfig.name));
  });

  it('Creates a Function with a managed user', async () => {
    const permissions = [];

    functionMock = functionRepositoryMock();
    const userMock = userRepositoryMock(functionMock.functionConfig.name, permissions);
    const authMock = mockAuthRepository();

    const functionConfig = {
      ...functionMock.functionConfig,
      executionCredentials: {
        permissions: [
          'VIEW_DOCUMENTS:{schemaName}',
        ],
      },
    };

    const taskConfigPath = await tempDirectoryManager.createTempJsonFile(functionConfig);
    await tempDirectoryManager.createTempJsFile('index', functionCode);

    const logSpy = jest.spyOn(global.console, 'log');
    const groupSpy = jest.spyOn(global.console, 'group');

    await handler({ sdk: null, path: taskConfigPath });

    expect(logSpy).toHaveBeenCalledWith(chalk.green('Successfully created task', functionMock.functionConfig.name));

    expect(functionMock.createSpy).toHaveBeenCalledWith(null, expect.objectContaining({
      environmentVariables: expect.objectContaining({
        // The undefined values are retrieved from process.env, the fact that the variables are set should be evidence enough
        API_HOST: { value: undefined },
        API_OAUTH_CONSUMER_KEY: { value: undefined },
        API_OAUTH_CONSUMER_SECRET: { value: undefined },
        API_OAUTH_TOKEN: { value: authMock.oAuth1Tokens.token },
        API_OAUTH_TOKEN_SECRET: { value: authMock.oAuth1Tokens.tokenSecret },
      }),
    }));
    expect(groupSpy).toHaveBeenCalledWith(chalk.white(`🔄  Syncing role: exh.tasks.${functionConfig.name}`));
    expect(logSpy).toHaveBeenCalledWith(chalk.green('✅  Successfully synced role'));

    expect(groupSpy).toHaveBeenCalledWith(chalk.white(`🔄  Syncing user: ${userMock.user.email.toLowerCase()}`));
    expect(logSpy).toHaveBeenCalledWith(chalk.green('✅  Successfully synced user'));
  });

  it('Updates a managed users permissions', async () => {
    functionMock = functionRepositoryMock();

    const permissions = ['VIEW_DOCUMENTS:{schemaName}'];

    const user = generateFunctionUser(functionMock.functionConfig.name);
    const globalRole = generateFunctionGlobalRole(functionMock.functionConfig.name, permissions);

    user.roles = [globalRole];

    jest.spyOn(userRepository, 'findUserByEmail')
      .mockImplementationOnce(() => Promise.resolve(user));

    jest.spyOn(userRepository, 'findGlobalRoleByName')
      .mockImplementationOnce(() => Promise.resolve(globalRole));

    jest.spyOn(userRepository, 'addPermissionsToGlobalRole')
      .mockImplementationOnce(() => Promise.resolve({ affectedRecords: 1 }));

    jest.spyOn(userRepository, 'removePermissionsFromGlobalRole')
      .mockImplementationOnce(() => Promise.resolve({ affectedRecords: 1 }));

    functionMock.existingFunction.environmentVariables = {
      API_HOST: { value: 'https://api.env.customer.extrahorizon.io' },
      API_OAUTH_TOKEN_SECRET: { value: '68594bb838a0e90b884a7ed968594bbf25432027ec6f0167' },
      API_OAUTH_TOKEN: { value: '68594baa4cae07be6fe802e268594bb17845e89590e0ee36' },
      API_OAUTH_CONSUMER_KEY: { value: '685d0ae5ced87d2abfe7c35e685d0aeccc4239d0f68ffbb2' },
      API_OAUTH_CONSUMER_SECRET: { value: '685d0af08677cfa9e0c15827685d0af5d5cf798c6b118b3d' },
    };

    sdkMock.users.me.mockImplementationOnce(() => Promise.resolve(user));

    const functionConfig = {
      ...functionMock.functionConfig,
      executionCredentials: {
        permissions: [
          'UPDATE_DOCUMENTS:{schemaName}',
          'DELETE_DOCUMENTS:{schemaName}',
        ],
      },
    };

    const taskConfigPath = await tempDirectoryManager.createTempJsonFile(functionConfig);
    await tempDirectoryManager.createTempJsFile('index', functionCode);

    const logSpy = jest.spyOn(global.console, 'log');
    const groupSpy = jest.spyOn(global.console, 'group');

    await handler({ sdk: null, path: taskConfigPath });

    expect(logSpy).toHaveBeenCalledWith(chalk.green('Successfully created task', functionMock.functionConfig.name));

    expect(groupSpy).toHaveBeenCalledWith(chalk.white(`🔄  Syncing role: exh.tasks.${functionConfig.name}`));
    expect(logSpy).toHaveBeenCalledWith(chalk.white('🔐  Permissions added: [UPDATE_DOCUMENTS:{schemaName},DELETE_DOCUMENTS:{schemaName}]'));
    expect(logSpy).toHaveBeenCalledWith(chalk.white('🔐  Permissions removed: [VIEW_DOCUMENTS:{schemaName}]'));
    expect(logSpy).toHaveBeenCalledWith(chalk.green('✅  Successfully synced role'));

    expect(groupSpy).toHaveBeenCalledWith(chalk.white(`🔄  Syncing user: ${user.email.toLowerCase()}`));
    expect(logSpy).toHaveBeenCalledWith(chalk.green('✅  Successfully synced user'));
  });

  it('Updates a Function', async () => {
    functionMock = functionRepositoryMock();
    const existingFunctions = [{
      name: functionMock.functionConfig.name,
      description: functionMock.functionConfig.description,
      updateTimestamp: '2024-01-23T13:59:02.554Z',
    }];

    const findSpy = jest.spyOn(functionRepository, 'find')
      .mockImplementationOnce(() => Promise.resolve(existingFunctions));

    const taskConfigPath = await tempDirectoryManager.createTempJsonFile(functionMock.functionConfig);
    await tempDirectoryManager.createTempJsFile('index', functionCode);

    const logSpy = jest.spyOn(global.console, 'log');

    await handler({ sdk: null, path: taskConfigPath });
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(functionMock.findByNameSpy).toHaveBeenCalledTimes(1);
    expect(functionMock.updateSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(chalk.green('Successfully updated task', functionMock.functionConfig.name));
  });

  it('Accepts a valid runtime when provided a task config file with a valid runtime', async () => {
    const error = await handler({ sdk: null, path: `${root}/valid-runtime.json` })
      .catch(e => e);

    // Proves that it proceeds passes the runtime validation
    const codePath = path.join(root, 'build');
    expect(error.message).toBe(`Please provide a valid directory path for your code, ${codePath} not found`);
  });

  it('Throws an error when restricted environment variables are set with executionCredentials', async () => {
    functionMock = functionRepositoryMock();

    functionMock.functionConfig = {
      ...functionMock.functionConfig,
      environment: {
        API_OAUTH_TOKEN: '68594baa4cae07be6fe802e268594bb17845e89590e0ee36',
        API_OAUTH_TOKEN_SECRET: '68594bb838a0e90b884a7ed968594bbf25432027ec6f0167',
      },
      executionCredentials: {
        permissions: [
          'VIEW_DOCUMENTS',
        ],
      },
    };

    const taskConfigPath = await tempDirectoryManager.createTempJsonFile(functionMock.functionConfig);
    const error = await handler({ sdk: null, path: taskConfigPath })
      .catch(e => e);

    expect(error.message).toBe('❌  Environment variables [API_OAUTH_TOKEN, API_OAUTH_TOKEN_SECRET] may not be provided when using executionCredentials');
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
