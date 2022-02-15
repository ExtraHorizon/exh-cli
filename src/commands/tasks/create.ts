import * as fs from 'fs';
import { unlink } from 'fs/promises';
import * as ospath from 'path';
import * as chalk from 'chalk';
import { epilogue } from '../../helpers/util';
import { zipFileFromDirectory } from './util';

export const command = 'create';
export const desc = 'Create a new task';
export const builder = (yargs: any) => epilogue(yargs).options({
  name: {
    demandOption: true,
    describe: 'Name of the task',
    type: 'string',
  },
  code: {
    demandOption: false,
    describe: 'Zip\'d contents of the directory containing the (compiled) task code. Use either this option or the path option',
    type: 'string',
  },
  path: {
    demandOption: false,
    describe: 'This will zip the directory provided by path for you and upload the generated zip file. Use either this option or the code option',
    type: 'string',
  },
  entryPoint: {
    demandOption: true,
    describe: "The code function that should be invoked. For example 'index.handler' for Nodejs",
    type: 'string',
  },
  runtime: {
    demandOption: true,
    describe: 'Runtime to use for the task',
    choices: ['nodejs12.x', 'nodejs14.x', 'python3.7', 'python3.8', 'python3.9', 'ruby2.7', 'java8', 'java11', 'go1.x', 'dotnetcore3.1'],
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
    default: 60,
  },
  memoryLimit: {
    describe: 'The allocated memory for this task (in MB). Min: 128 max: 10240',
    type: 'number',
    default: 128,
  },
  env: {
    describe: 'Environment Variables set for this task. This option can be used multiple times.',
    type: 'string',
    default: [],
  },
})
  .check(({ timeLimit, memoryLimit, name, code, path }) => {
    if (timeLimit !== undefined && (timeLimit < 3 || timeLimit > 900)) {
      throw new Error('ERROR: timeLimit out of bounds!');
    }
    if (memoryLimit !== undefined && (memoryLimit < 128 || timeLimit > 10240)) {
      throw new Error('ERROR: memoryLimit out of bounds!');
    }
    if (!/^[A-Za-z0-9]+/g.test(name)) throw new Error('Please use only alphanumberic characters for your task name');

    if (code && (!fs.existsSync(ospath.join(process.cwd(), code)) || !fs.statSync(ospath.join(process.cwd(), code)).isFile())) {
      throw new Error('please provide a valid file path for your code');
    }
    if (path && (!fs.existsSync(ospath.join(process.cwd(), path)) || fs.statSync(ospath.join(process.cwd(), path)).isFile())) {
      console.log(ospath.join(process.cwd(), path));
      throw new Error('please provide a valid directory path for your code');
    }

    if ((code && path) || (!code && !path)) {
      throw new Error('Either path or code must be specified (but not both at the same time)');
    }
    return true;
  });

export const handler = async ({ sdk, name, code, path, entryPoint, runtime, description, timeLimit, memoryLimit, env }) => {
  let envArr = Array.isArray(env) ? env : [env];
  let uploadFilePath = code;
  envArr = envArr.map(e => e.split('=')).filter(e => e.length === 2).reduce((prev, curr) => ({ ...prev, [curr[0]]: { value: curr[1] } }), {});

  if (path) {
    uploadFilePath = await zipFileFromDirectory(ospath.join(process.cwd(), path));
  } else {
    uploadFilePath = ospath.join(process.cwd(), code);
  }
  const file = fs.readFileSync(uploadFilePath);

  const functions = (await sdk.raw.get('/tasks/v1/functions')).data.data;
  const myFunction = functions.find((f:any) => f.name === name);
  if (myFunction) throw new Error('Task name already exists. Either specify a new name or use the update command to update the existing task');

  const response = await sdk.raw.post('/tasks/v1/functions', {
    name,
    description: description || 'none',
    code: file.toString('base64'),
    entryPoint,
    runtime,
    timeLimit,
    memoryLimit,
    environmentVariables: envArr,
  });

  /* Remove temp file */
  if (path) {
    await unlink(uploadFilePath);
  }
  console.log(chalk.green('Successfully created task', response.data.name));
};
