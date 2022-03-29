import * as fs from 'fs/promises';
import * as ospath from 'path';
import * as chalk from 'chalk';
import { runtimeChoices } from '../../constants';
import { epilogue } from '../../helpers/util';
import { zipFileFromDirectory } from './util';

interface TaskConfig {
  name?: string;
  path?: string;
  entryPoint?: string;
  runtime?: string;
  description?: string;
  timeLimit?: number;
  memoryLimit?: number;
  environment?: Record<string, any>;
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
})
  .check(async ({ path, entryPoint, runtime, name, code }) => {
    if (!path && (!name || !code || !runtime || !entryPoint)) {
      throw new Error('Need to specify either a task config file or all parameters separately');
    }
    return true;
  });

function replaceConfigVariables(config: any): any {
  let result: any;

  switch (typeof config) {
    case 'object':
      if (!Array.isArray(config)) {
        result = {};
        for (const [key, value] of Object.entries(config)) {
          result[key] = replaceConfigVariables(value);
        }
      } else {
        result = [];
        for (const element of config) {
          result.push(replaceConfigVariables(element));
        }
      }
      return result;
    case 'string':
      if (config.charAt(0) === '$') {
        const variable = config.slice(1);
        if (process.env[variable]) {
          return process.env[variable];
        }
        throw new Error(`Variable ${variable} not found in environment`);
      }
      return config;
    default:
      result = config;
      break;
  }
  return result;
}

async function verifyConfig(config: TaskConfig) {
  if (!config.name) throw new Error('Task name not specified');
  if (!config.entryPoint) throw new Error('Entrypoint not specified');
  if (!config.runtime) throw new Error('Runtime to specified');

  if (config.timeLimit !== undefined && (config.timeLimit < 3 || config.timeLimit > 900)) {
    throw new Error('ERROR: timeLimit out of bounds!');
  }
  if (config.memoryLimit !== undefined && (config.memoryLimit < 128 || config.memoryLimit > 10240)) {
    throw new Error('ERROR: memoryLimit out of bounds!');
  }
  if (!/^[A-Za-z0-9]+/g.test(config.name)) throw new Error('Please use only alphanumberic characters for your task name');
  if (!runtimeChoices.includes(config.runtime)) {
    throw new Error(`Runtime should be one of ${runtimeChoices.join(', ')}`);
  }

  if (config.path) {
    try {
      await fs.access(config.path);
    } catch (err) {
      throw new Error(`Please provide a valid directory path for your code, ${config.path} not found`);
    }
    if ((await fs.stat(config.path)).isFile()) {
      throw new Error(`please provide a valid directory path for your code, ${config.path} points to a file`);
    }
  } else {
    throw new Error('Code path not specified');
  }
  return true;
}

async function loadSingleConfigFile(path:string): Promise<TaskConfig|null> {
  let taskConfig: TaskConfig;
  try {
    /* load config file */
    taskConfig = JSON.parse((await fs.readFile(path)).toString()) as TaskConfig;
  } catch (err) {
    console.log(chalk.red('No config file:', path));
    return null;
  }
  /* Resolve variables before doing any further processing */
  taskConfig = replaceConfigVariables(taskConfig);
  /* The config file path is relative to the location of the config file, so change it */
  taskConfig.path = ospath.join(ospath.dirname(path), taskConfig.path);
  taskConfig.timeLimit ??= 60;
  taskConfig.memoryLimit ??= 128;
  taskConfig.environment ??= {};

  /* convert environment variables to the value format that the service expects */
  if (taskConfig.environment) {
    taskConfig.environment =
      Object.entries(taskConfig.environment).reduce((prev:any, curr:any) => ({ ...prev, [curr[0]]: { value: curr[1] } }), {});
  }
  return taskConfig;
}

async function* getConfig({ path, name, code, entryPoint, runtime, description, timeLimit, memoryLimit, env }: any): AsyncGenerator<TaskConfig> {
  let taskConfig: TaskConfig = {};

  if (path) {
    const stat = await fs.stat(path);
    if (stat.isDirectory()) {
      /* If we have a directory, read the contents and try to sync each directory. We do not overload with command line parameters */
      const dirContents = await fs.readdir(path);

      for (const file of dirContents) {
        let filePath = ospath.join(path, file);
        if ((await fs.stat(filePath)).isDirectory()) {
          /* if directory, append task-config.json */
          filePath = ospath.join(filePath, 'task-config.json');
          const cfg = await loadSingleConfigFile(filePath);
          if (cfg) {
            yield cfg;
          }
        }
      }
      return;
    }
    /* If it's a file, it should be a configuration file so try to load it */
    taskConfig = await loadSingleConfigFile(path);
    if (!taskConfig) {
      throw new Error("Path is a file but doesn't point to a valid configuration file");
    }
  }
  /* Either a file was specified and we have an opportunity to overload parameters here through command line.
     Or no file was specified and everything needs to be supplied separately */
  if (name) taskConfig.name = name;
  if (code) taskConfig.path = code;
  if (entryPoint) taskConfig.entryPoint = entryPoint;
  if (runtime) taskConfig.runtime = runtime;
  if (description) taskConfig.description = description;
  if (timeLimit) taskConfig.timeLimit = timeLimit;
  if (memoryLimit) taskConfig.memoryLimit = memoryLimit;

  taskConfig.timeLimit ??= 60;
  taskConfig.memoryLimit ??= 128;
  taskConfig.environment ??= {};
  if (env && env.length) {
    const envArr = Array.isArray(env) ? env : [env];
    taskConfig.environment = envArr.map(e => e.split('=')).filter(e => e.length === 2).reduce((prev, curr) => ({ ...prev, [curr[0]]: { value: curr[1] } }), {});
  }
  yield taskConfig;
}

async function createTask(sdk:any, config: TaskConfig, taskCode: Buffer) {
  await sdk.raw.post('/tasks/v1/functions', {
    name: config.name,
    description: config.description || 'none',
    code: taskCode.toString('base64'),
    entryPoint: config.entryPoint,
    runtime: config.runtime,
    timeLimit: config.timeLimit,
    memoryLimit: config.memoryLimit,
    environmentVariables: config.environment,
  });
}

async function updateTask(sdk: any, config: TaskConfig, taskCode: Buffer) {
  /* Due to an issue in the backend, we can't update all data at once. Needs to be done in separate commands. Fix this once resolved */
  const response1 = await sdk.raw.put(`/tasks/v1/functions/${config.name}`, {
    name: config.name,
    description: config.description || 'none',
    entryPoint: config.entryPoint,
    code: taskCode.toString('base64'),
    runtime: config.runtime,
    timeLimit: config.timeLimit,
    memoryLimit: config.memoryLimit,
    environmentVariables: config.environment,
  });
  if (!response1.data?.affectedRecords) {
    throw new Error(`Failed to update task ${config.name}`);
  }
}

export const handler = async ({ sdk, ...cmdLineParams }) => {
  for await (const config of getConfig(cmdLineParams)) {
    console.log('Syncing task', config.name, '...');
    await syncSingleTask(sdk, config);
  }
};

async function syncSingleTask(sdk:any, config: TaskConfig) {
  /* load configuration & overload parameters passed through command line */

  /* Check if everything is there */
  await verifyConfig(config);

  const uploadFilePath = await zipFileFromDirectory(config.path);
  const file = await fs.readFile(uploadFilePath);

  const allFunctions = (await sdk.raw.get('/tasks/v1/functions')).data.data;
  const myFunction = allFunctions.find((f:any) => f.name === config.name);
  if (myFunction === undefined) {
    await createTask(sdk, config, file);
    console.log(chalk.green('Successfully created task', config.name));
  } else {
    await updateTask(sdk, config, file);
    console.log(chalk.green('Successfully updated task', config.name));
  }
  /* Remove temp file */
  await fs.unlink(uploadFilePath);
}
