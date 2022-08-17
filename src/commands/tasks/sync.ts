import * as fs from 'fs/promises';
import * as chalk from 'chalk';
import { runtimeChoices } from '../../constants';
import { epilogue } from '../../helpers/util';
import { getValidatedConfigIterator, permissionModes, TaskConfig } from './taskConfig';
import { zipFileFromDirectory } from './util';

/* Structure for the request which will be sent to the backend */
interface TaskRequest {
  name: string;
  description: string;
  entryPoint: string;
  code: string;
  runtime: string;
  timeLimit: number;
  memoryLimit: number;
  environmentVariables: Record<string, any>;
  executionOptions?: {
    permissionMode: permissionModes;
  };
}

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
  permissionMode: {
    type: 'string',
    default: 'permissionRequired',
  },
})
  .check(async ({ path, entryPoint, runtime, name, code, permissionMode }) => {
    if (!path && (!name || !code || !runtime || !entryPoint)) {
      throw new Error('Need to specify either a task config file or all parameters separately');
    }
    if (permissionMode && !Object.values(permissionModes).includes(permissionMode as unknown as permissionModes)) {
      throw new Error(`permissionMode needs to be one of ${Object.values(permissionModes).join(' or ')}`);
    }
    return true;
  });

async function createTask(sdk:any, request: TaskRequest) {
  await sdk.raw.post('/tasks/v1/functions', request);
}

async function updateTask(sdk: any, request: TaskRequest) {
  const response1 = await sdk.raw.put(`/tasks/v1/functions/${request.name}`, request);
  if (!response1.data?.affectedRecords) {
    throw new Error(`Failed to update task ${request.name}`);
  }
}

export const handler = async ({ sdk, ...cmdLineParams }) => {
  for await (const config of getValidatedConfigIterator(cmdLineParams)) {
    console.log('Syncing task', config.name, '...');
    await syncSingleTask(sdk, config);
  }
};

async function syncSingleTask(sdk:any, config: TaskConfig) {
  /* load configuration & overload parameters passed through command line */

  const uploadFilePath = await zipFileFromDirectory(config.path);
  const file = await fs.readFile(uploadFilePath);

  /* Check if the function already exists */
  const allFunctions = (await sdk.raw.get('/tasks/v1/functions')).data.data;
  const myFunction = allFunctions.find((f:any) => f.name === config.name);

  /* Construct a request object to send to the API */
  const request: TaskRequest = {
    name: config.name,
    description: config.description || 'none',
    entryPoint: config.entryPoint,
    code: file.toString('base64'),
    runtime: config.runtime,
    timeLimit: config.timeLimit,
    memoryLimit: config.memoryLimit,
    environmentVariables: config.environment,
  };

  if (config.executionPermission) {
    request.executionOptions = { permissionMode: config.executionPermission };
  }

  if (myFunction === undefined) {
    await createTask(sdk, request);
    console.log(chalk.green('Successfully created task', config.name));
  } else {
    await updateTask(sdk, request);
    console.log(chalk.green('Successfully updated task', config.name));
  }
  /* Remove temp file */
  await fs.unlink(uploadFilePath);
}
