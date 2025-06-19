import * as fs from 'fs/promises';
import * as chalk from 'chalk';
import { runtimeChoices } from '../../constants';
import { epilogue } from '../../helpers/util';
import * as authRepository from '../../repositories/auth';
import * as functionRepository from '../../repositories/functions';
import { FunctionCreation } from '../../repositories/functions';
import { assertExecutionPermission, getValidatedConfigIterator, TaskConfig } from './taskConfig';
import { syncFunctionUser, zipFileFromDirectory } from './util';

export const command = 'sync';
export const desc = 'Sync a task. Will create the task first if it doesn\'t exist yet';
export const builder = (yargs: any) => epilogue(yargs).options({
  path: {
    demandOption: false,
    describe: `Path of the configuration json file containing task parameters. If a directory is given instead, all sub-directories will be searched for a task-config.json file & synced. 
    If this option is not used, each parameter (name, code, entryPoint, runtime, ...) will need to be supplied separately`,
    type: 'string',
  },
  name: {
    demandOption: false,
    describe: 'Name of the task',
    type: 'string',
  },
  code: {
    demandOption: false,
    describe: 'The path to a directory containing the built task. exh-cli will compress the directory and upload it',
    type: 'string',
  },
  entryPoint: {
    demandOption: false,
    describe: "The code function that should be invoked. For example 'index.handler' for Nodejs",
    type: 'string',
  },
  runtime: {
    demandOption: false,
    describe: 'Runtime to use for the task',
    choices: runtimeChoices,
    type: 'string',
  },
  description: {
    describe: 'A description for this task',
    type: 'string',
    default: '',
  },
  timeLimit: {
    describe: 'The execution time limit for this task (in seconds). Min: 3 max: 900',
    type: 'number',
  },
  memoryLimit: {
    describe: 'The allocated memory for this task (in MB). Min: 128 max: 10240',
    type: 'number',
  },
  env: {
    describe: 'Environment Variables set for this task. This option can be used multiple times.',
    type: 'string',
    default: [],
  },
  executionPermission: {
    type: 'string',
  },
})
  .check(async ({ path, entryPoint, runtime, name, code, executionPermission }) => {
    if (!path && (!name || !code || !runtime || !entryPoint)) {
      throw new Error('Need to specify either a task config file or all parameters separately');
    }

    assertExecutionPermission(executionPermission);
    return true;
  });

export const handler = async ({ sdk, ...cmdLineParams }) => {
  for await (const config of getValidatedConfigIterator(cmdLineParams)) {
    console.log('Syncing task', config.name, '...');
    await syncSingleTask(sdk, config);
  }
};

async function syncSingleTask(sdk: any, config: TaskConfig) {
  /* load configuration & overload parameters passed through command line */

  const uploadFilePath = await zipFileFromDirectory(config.path);
  const file = await fs.readFile(uploadFilePath);

  /* Check if the function already exists */
  const allFunctions = await functionRepository.find(sdk);
  const myFunction = allFunctions.find((f: any) => f.name === config.name);

  /* Construct a request object to send to the API */
  const request: FunctionCreation = {
    name: config.name,
    description: config.description || 'none',
    entryPoint: config.entryPoint,
    code: file.toString('base64'),
    runtime: config.runtime,
  };

  /* Add optional values */
  if (config.executionPermission) {
    request.executionOptions = { permissionMode: config.executionPermission };
  }

  if (config.timeLimit) {
    request.timeLimit = config.timeLimit;
  }

  if (config.memoryLimit) {
    request.memoryLimit = config.memoryLimit;
  }

  if (config.retryPolicy) {
    request.retryPolicy = config.retryPolicy;
  }

  if (config.executionCredentials) {
    const credentials = await syncFunctionUser(
      sdk,
      {
        taskName: config.name,
        targetEmail: config.executionCredentials.email,
        targetPermissions: config.executionCredentials.permissions,
      }
    );

    // eslint-disable-next-line no-param-reassign
    config.environment = {
      ...config.environment,
      API_HOST: authRepository.getHost(sdk),
      API_OAUTH_CONSUMER_KEY: process.env.API_OAUTH_CONSUMER_KEY,
      API_OAUTH_CONSUMER_SECRET: process.env.API_OAUTH_CONSUMER_SECRET,
      API_OAUTH_TOKEN: credentials.token,
      API_OAUTH_TOKEN_SECRET: credentials.tokenSecret,
    };
  }

  if (config.environment) {
    const environmentVariables: Record<string, { value: string; }> = {};
    for (const [key, value] of Object.entries(config.environment)) {
      environmentVariables[key] = { value };
    }

    request.environmentVariables = environmentVariables;
  }

  if (myFunction === undefined) {
    await functionRepository.create(sdk, request);
    console.log(chalk.green('Successfully created task', config.name));
  } else {
    // TODO: Check all fields and only update if they are different
    const existingFunction = await functionRepository.findByName(sdk, myFunction.name);
    if (request.runtime === existingFunction.runtime) {
      delete request.runtime;
    }

    const updateResponse = await functionRepository.update(sdk, request);
    if (!updateResponse?.affectedRecords) {
      throw new Error(`Failed to update task ${request.name}`);
    }

    console.log(chalk.green('Successfully updated task', config.name));
  }
  /* Remove temp file */
  await fs.unlink(uploadFilePath);
}
