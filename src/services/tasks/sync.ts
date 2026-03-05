import * as fs from 'fs/promises';
import { FunctionCreation } from '@extrahorizon/javascript-sdk';
import * as chalk from 'chalk';
import * as functionRepository from '../../repositories/functions';
import { getValidatedConfigIterator, TaskConfig } from '../../services/tasks/taskConfig';
import { syncFunctionUser, zipFileFromDirectory } from '../../services/tasks/util';

export async function sync(cmdLineParams) {
  for await (const config of getValidatedConfigIterator(cmdLineParams)) {
    console.log('Syncing task', config.name, '...');
    await syncSingleTask(config);
  }
}

async function syncSingleTask(config: TaskConfig) {
  /* load configuration & overload parameters passed through command line */

  const uploadFilePath = await zipFileFromDirectory(config.path);
  const file = await fs.readFile(uploadFilePath);

  /* Construct a request object to send to the API */
  const request: FunctionCreation = {
    name: config.name,
    description: config.description || 'none',
    entryPoint: config.entryPoint,
    code: file.toString('base64'),
    runtime: config.runtime,
  };

  /* Add optional values */
  if (config.executionPermission || config.defaultPriority) {
    request.executionOptions = {};
  }

  if (config.defaultPriority) {
    request.executionOptions.defaultPriority = config.defaultPriority;
  }

  if (config.executionPermission) {
    request.executionOptions.permissionMode = config.executionPermission;
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
    const credentials = await syncFunctionUser({
      taskName: config.name,
      targetEmail: config.executionCredentials.email,
      targetPermissions: config.executionCredentials.permissions,
    });

    // eslint-disable-next-line no-param-reassign
    config.environment = {
      ...config.environment,
      API_HOST: process.env.API_HOST,
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

  /* Check if the function already exists */
  const allFunctions = await functionRepository.find();
  const myFunction = allFunctions.find((f: any) => f.name === config.name);

  if (myFunction === undefined) {
    await functionRepository.create(request);
    console.log(chalk.green('Successfully created task', config.name));
  } else {
    // TODO: Check all fields and only update if they are different
    const existingFunction = await functionRepository.findByName(myFunction.name);
    if (request.runtime === existingFunction.runtime) {
      delete request.runtime;
    }

    const updateResponse = await functionRepository.update(request);
    if (!updateResponse?.affectedRecords) {
      throw new Error(`Failed to update task ${request.name}`);
    }

    console.log(chalk.green('Successfully updated task', config.name));
  }
  /* Remove temp file */
  await fs.unlink(uploadFilePath);
}
