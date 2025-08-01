import { AssertionError } from 'assert';
import * as fs from 'fs/promises';
import * as ospath from 'path';
import Joi = require('joi');
import { limits, runtimeChoices } from '../../constants';

export enum permissionModes {
  permissionRequired = 'permissionRequired',
  allUsers = 'allUsers',
  public = 'public',
}

export interface TaskConfig {
  name?: string;
  path?: string;
  entryPoint?: string;
  runtime?: string;
  description?: string;
  timeLimit?: number;
  memoryLimit?: number;
  environment?: Record<string, string>;
  executionPermission?: permissionModes;
  retryPolicy?: {
    enabled: boolean;
    errorsToRetry: string[];
  };
  executionCredentials?: {
    email?: string;
    permissions: string[];
  };
}

const taskConfigSchema = Joi.object({
  name: Joi.string().pattern(/^[A-Za-z0-9-]+$/).required(),
  description: Joi.string(),
  entryPoint: Joi.string().required(),
  runtime: Joi.string().valid(...runtimeChoices).required(),
  timeLimit: Joi.number().min(limits.time.min).max(limits.time.max),
  memoryLimit: Joi.number().min(limits.memory.min).max(limits.memory.max),
  path: Joi.string(),
  retryPolicy: Joi.object({
    enabled: Joi.boolean().required(),
    errorsToRetry: Joi.array().items(Joi.string()),
  }),
  environment: Joi.object().pattern(/.*/, Joi.string()),
  executionPermission: Joi.string().valid(...Object.values(permissionModes)),
  executionCredentials: Joi.object({
    email: Joi.string(),
    permissions: Joi.array().items(Joi.string()).required(),
  }),
});

export function assertExecutionPermission(mode: string): asserts mode is permissionModes | undefined {
  if (mode !== undefined && !Object.values(permissionModes).includes(mode as permissionModes)) {
    throw new AssertionError({ message: `executionPermission incorrect. Should be one of ${Object.values(permissionModes).join(',')}` });
  }
}

function replaceConfigVariables(config: any): any {
  let result: any;

  switch (typeof config) {
    case 'object':
      if (Array.isArray(config)) {
        result = [];
        for (const element of config) {
          result.push(replaceConfigVariables(element));
        }
      } else {
        result = {};
        for (const [key, value] of Object.entries(config)) {
          result[key] = replaceConfigVariables(value);
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

export async function validateConfig(config: TaskConfig) {
  try {
    Joi.attempt(config, taskConfigSchema);
  } catch (err) {
    throw new Error(err.details[0]?.message || 'Unknown config validation error');
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

  if (config.executionCredentials && config.environment) {
    const restrictedProperties = ['API_HOST', 'API_OAUTH_CONSUMER_KEY', 'API_OAUTH_CONSUMER_SECRET', 'API_OAUTH_TOKEN', 'API_OAUTH_TOKEN_SECRET'];
    const foundProperties = Object.keys(config.environment).filter(key => restrictedProperties.includes(key));

    if (foundProperties.length > 0) {
      throw new Error(`❌  Environment variables [${foundProperties.join(', ')}] may not be provided when using executionCredentials`);
    }
  }

  assertExecutionPermission(config.executionPermission);

  return true;
}

export async function loadSingleConfigFile(path: string): Promise<TaskConfig> {
  let taskConfig: TaskConfig;
  try {
    /* load config file */
    const data = await fs.readFile(path);
    try {
      taskConfig = JSON.parse(data.toString()) as TaskConfig;
    } catch (err) {
      throw new Error(`failed to parse file ${err.message}`);
    }
  } catch (err2) {
    throw new Error(`Invalid config file: ${err2.message}`);
  }

  /* Resolve variables before doing any further processing */
  taskConfig = replaceConfigVariables(taskConfig);

  /* The config file path is relative to the location of the config file, so change it */
  if (taskConfig.path) {
    taskConfig.path = ospath.join(ospath.dirname(path), taskConfig.path);
  }

  return taskConfig;
}

export async function* getValidatedConfigIterator(
  { path, name, code, entryPoint, runtime, description, timeLimit, memoryLimit, executionPermission, env }: any
): AsyncGenerator<TaskConfig> {
  let taskConfig: TaskConfig = {};

  if (path) {
    /* Check if the specified path points to a directory or a file */
    const stat = await fs.stat(path);
    if (stat.isDirectory()) {
      /* If we have a directory, read the contents and try to sync each directory. We will not overload with command line parameters */
      const dirContents = await fs.readdir(path);

      for (const file of dirContents) {
        let filePath = ospath.join(path, file);
        if ((await fs.stat(filePath)).isDirectory()) {
          /* if directory, append task-config.json */
          filePath = ospath.join(filePath, 'task-config.json');
          const cfg = await loadSingleConfigFile(filePath);
          if (cfg) {
            await validateConfig(cfg);
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

  /* At this point,
        1. either a file was specified and we have an opportunity to overload parameters here through command line.
        2. Or no file was specified and everything needs to be supplied separately
   */
  if (name) { taskConfig.name = name; }
  if (code) { taskConfig.path = code; }
  if (entryPoint) { taskConfig.entryPoint = entryPoint; }
  if (runtime) { taskConfig.runtime = runtime; }
  if (description) { taskConfig.description = description; }
  if (timeLimit) { taskConfig.timeLimit = timeLimit; }
  if (memoryLimit) { taskConfig.memoryLimit = memoryLimit; }
  if (executionPermission) { taskConfig.executionPermission = executionPermission; }

  if (env && env.length) {
    const envArr = Array.isArray(env) ? env : [env];
    taskConfig.environment = envArr.map(e => e.split('=')).filter(e => e.length === 2).reduce((prev, curr) => ({ ...prev, [curr[0]]: curr[1] }), {});
  }
  await validateConfig(taskConfig);
  yield taskConfig;
}
