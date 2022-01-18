import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import { epilogue } from '../../helpers/util';

export const command = 'create';
export const desc = 'Create a new task';
export const builder = (yargs: any) => epilogue(yargs).options({
  name: {
    demandOption: true,
    describe: 'Name of the function',
    type: 'string',
  },
  code: {
    demandOption: true,
    describe: 'File containing the code of the function',
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
    describe: 'A description for this function',
    type: 'string',
    default: '',
  },
  timeLimit: {
    describe: 'The execution time limit for this function (in seconds). Min: 3 max: 900',
    type: 'number',
    default: 60,
  },
  memoryLimit: {
    describe: 'The allocated memory for this function (in MB). Min: 128 max: 10240',
    type: 'number',
    default: 128,
  },
  env: {
    describe: 'Environment Variables set for this function. This option can be used multiple times.',
    type: 'string',
    default: [],
  },
})
  .check(({ timeLimit, memoryLimit, name, code }) => {
    if (timeLimit !== undefined && (timeLimit < 3 || timeLimit > 900)) {
      throw new Error('ERROR: timeLimit out of bounds!');
    }
    if (memoryLimit !== undefined && (memoryLimit < 128 || timeLimit > 10240)) {
      throw new Error('ERROR: memoryLimit out of bounds!');
    }
    if (!/^[A-Za-z0-9]+/g.test(name)) throw new Error('Please use only alphanumberic characters for your function name');

    if (!fs.existsSync(path.join(process.cwd(), code)) || !fs.statSync(path.join(process.cwd(), code)).isFile()) {
      throw new Error('please provide a valid file path for your code');
    }
    return true;
  });

export const handler = async ({ sdk, name, code, entryPoint, runtime, description, timeLimit, memoryLimit, env }) => {
  let envArr = Array.isArray(env) ? env : [env];
  envArr = envArr.map(e => e.split('=')).filter(e => e.length === 2).reduce((prev, curr) => ({ ...prev, [curr[0]]: { value: curr[1] } }), {});

  const file = fs.readFileSync(path.join(process.cwd(), code));

  const functions = (await sdk.raw.get('/tasks/v1/functions')).data.data;
  const myFunction = functions.find((f:any) => f.name === name);
  if (myFunction) throw new Error('Function name already exists. Either specify a new name or use the update command to update the existing function');

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
  console.log(chalk.green('Successfully created task', response.data.name));
};
