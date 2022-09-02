import { readFile, access, stat } from 'fs/promises';
import { loadSingleConfigFile, permissionModes, TaskConfig, validateConfig } from '../src/commands/tasks/taskConfig';
import { limits } from '../src/constants';
import { noEntryPointConfig, noNameConfig, noPathConfig, noRuntimeConfig, simpleVariableConfig, validFullConfig, wrongPathConfig } from './test-configs';

jest.mock('fs/promises');
const readFileMock = <jest.Mock>readFile;
const accessMock = <jest.Mock>access;
const statMock = <jest.Mock>stat;

const { env } = process;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...env };
  accessMock.mockImplementation(async () => true);
  statMock.mockImplementation(async () => ({ isFile: () => false }));
});

afterEach(() => {
  process.env = env;
});

describe('Loading config file', () => {
  test('Valid json config should not throw an error', async () => {
    readFileMock.mockImplementationOnce(async () => Buffer.from(JSON.stringify(validFullConfig)));
    let config: TaskConfig;
    try {
      config = await loadSingleConfigFile('mypath');
    } catch (err) {
      expect(err).toBeNull();
      return;
    }
    await expect(validateConfig(config)).resolves.toBe(true);
  });

  test('Default properties shouldn\'t be added if they are not specified', async () => {
    const testConfig = { ...validFullConfig };
    delete testConfig.memoryLimit;
    delete testConfig.timeLimit;
    delete testConfig.environment;
    readFileMock.mockImplementationOnce(async () => Buffer.from(JSON.stringify(testConfig)));
    let resultConfig: TaskConfig;

    try {
      resultConfig = await loadSingleConfigFile('mypath');
    } catch (err) {
      expect(err).toBeNull();
    }

    await expect(validateConfig(resultConfig)).resolves.toBe(true);
    expect(resultConfig.memoryLimit).toBeUndefined();
    expect(resultConfig.timeLimit).toBeUndefined();
    expect(resultConfig.environment).toBeUndefined();
  });

  test('Malformed json config file should throw an error', async () => {
    readFileMock.mockImplementationOnce(async () => Buffer.from("{ 'no json': here}"));
    await expect(loadSingleConfigFile('mypath')).rejects.toThrowError(/failed to parse file/);
  });

  test('Not-existing file should throw an error', async () => {
    readFileMock.mockImplementationOnce(async () => { throw new Error('File doesn\'t exist'); });
    await expect(loadSingleConfigFile('mypath')).rejects.toThrowError(/^Invalid config file/);
  });

  test('Task config variables which do not exist, should throw an error', async () => {
    readFileMock.mockImplementationOnce(async () => Buffer.from(JSON.stringify(simpleVariableConfig)));
    await expect(loadSingleConfigFile('mypath')).rejects.toThrowError(/not found in environment$/);
  });

  test('Multiple task config variables should be properly substituted', async () => {
    readFileMock.mockImplementationOnce(async () => Buffer.from(JSON.stringify(simpleVariableConfig)));
    process.env.TESTNAME = 'myname';
    process.env.TESTDESCRIPTION = 'mydescription';
    try {
      const result = await loadSingleConfigFile('mypath');
      expect(result.name).toBe('myname');
      expect(result.description).toBe('mydescription');
    } catch (err) {
      expect(err).toBeNull();
    }
    delete process.env.TESTNAME;
    delete process.env.TESTDESCRIPTION;
  });
});

describe('Validating config', () => {
  test('Valid config should pass the test', async () => {
    await expect(validateConfig(validFullConfig)).resolves.toBe(true);
  });

  test('Config without name should fail', async () => {
    await expect(validateConfig(noNameConfig)).rejects.toThrowError(/^"name" is required/);
  });
  test('Config without entryPoint should fail', async () => {
    await expect(validateConfig(noEntryPointConfig)).rejects.toThrowError(/^"entryPoint" is required/);
  });

  test('Config without runtime should fail', async () => {
    await expect(validateConfig(noRuntimeConfig)).rejects.toThrowError(/^"runtime" is required/);
  });

  test('Name with non-alphanumeric characters should fail', async () => {
    const testConfig = { ...validFullConfig, name: 'abcd_*' };
    await expect(validateConfig(testConfig)).rejects.toThrowError(/fails to match the required pattern/);
    testConfig.name = '*abcd';
    await expect(validateConfig(testConfig)).rejects.toThrowError(/fails to match the required pattern/);
    testConfig.name = 'ab*cd';
    await expect(validateConfig(testConfig)).rejects.toThrowError(/fails to match the required pattern/);
  });

  test('specifying an invalid path should fail', async () => {
    accessMock.mockImplementation(async () => { throw new Error(); });
    await expect(validateConfig(wrongPathConfig)).rejects.toThrowError(/not found$/);
  });

  test('Config without path should fail', async () => {
    await expect(validateConfig(noPathConfig)).rejects.toThrowError(/^Code path not specified$/);
  });

  test('specifying a file instead of a directory should fail', async () => {
    statMock.mockImplementation(async () => ({ isFile: () => true }));
    await expect(validateConfig(wrongPathConfig)).rejects.toThrowError(/points to a file$/);
  });

  test('Time limit value beyond limits should fail', async () => {
    let testConfig = { ...validFullConfig, timeLimit: limits.time.min - 1 };
    await expect(validateConfig(testConfig)).rejects.toThrowError(/^"timeLimit" must be greater than or equal/);

    testConfig = { ...validFullConfig, timeLimit: limits.time.max + 1 };
    await expect(validateConfig(testConfig)).rejects.toThrowError(/^"timeLimit" must be less than or equal/);
  });

  test('Memory limit value beyond limits should fail', async () => {
    let testConfig = { ...validFullConfig, memoryLimit: limits.memory.min - 1 };
    await expect(validateConfig(testConfig)).rejects.toThrowError(/^"memoryLimit" must be greater than or equal/);

    testConfig = { ...validFullConfig, memoryLimit: limits.memory.max + 1 };
    await expect(validateConfig(testConfig)).rejects.toThrowError(/^"memoryLimit" must be less than or equal/);
  });

  test('Invalid runtime should fail', async () => {
    const testConfig = { ...validFullConfig, runtime: 'myownruntime' };
    await expect(validateConfig(testConfig)).rejects.toThrowError(/^"runtime" must be one of/);
  });

  test('Invalid execution permission should fail', async () => {
    const testConfig = { ...validFullConfig, executionPermission: 'whatever' as permissionModes };
    await expect(validateConfig(testConfig)).rejects.toThrowError(/^"executionPermission" must be one of/);
  });

  test('Invalid retry policy should fail', async () => {
    let testConfig: any = { ...validFullConfig, retryPolicy: 'a string' };
    await expect(validateConfig(testConfig)).rejects.toThrowError(/^"retryPolicy" must be of type object/);
    testConfig = { ...validFullConfig, retryPolicy: { errorsToRetry: ['test'] } };
    await expect(validateConfig(testConfig)).rejects.toThrowError(/^"retryPolicy.enabled" is required$/);
    testConfig = { ...validFullConfig, retryPolicy: { enabled: true, errorsToRetry: [1] } };
    await expect(validateConfig(testConfig)).rejects.toThrowError(/^"retryPolicy.errorsToRetry\[0\]" must be a string$/);
  });
});
