import chalk = require('chalk');
import * as fs from 'fs';
import { unlink } from 'fs/promises';
import * as ospath from 'path';

import { builder as createBuilder } from './create';
import { zipFileFromDirectory } from './util';

export const command = 'update';
export const desc = 'Update a task';
export const builder = createBuilder;

export const handler = async ({ sdk, name, code, path, entryPoint, runtime, description, timeLimit, memoryLimit, env }) => {
  let uploadFilePath = code;
  let envArr = Array.isArray(env) ? env : [env];
  envArr = envArr.map(e => e.split('=')).filter(e => e.length === 2).reduce((prev, curr) => ({ ...prev, [curr[0]]: { value: curr[1] } }), {});

  if (path) {
    uploadFilePath = await zipFileFromDirectory(path);
  } else {
    uploadFilePath = ospath.join(process.cwd(), code);
  }
  const file = fs.readFileSync(uploadFilePath);

  /* Due to an issue in the backend, we can't update all data at once. Needs to be done in separate commands. Fix this once resolved */
  const response1 = await sdk.raw.put(`/tasks/v1/functions/${name}`, {
    name,
    description: description || 'none',
    entryPoint,
    runtime,
    timeLimit,
    memoryLimit,
    environmentVariables: envArr,
  });
  const response2 = await sdk.raw.put(`/tasks/v1/functions/${name}`, {
    code: file.toString('base64'),
  });

  /* Remove temp file */
  if (path) {
    await unlink(uploadFilePath);
  }

  if (response1.data?.affectedRecords && response2.data?.affectedRecords) {
    console.log(chalk.green(`Updated task ${name}`));
  } else {
    console.log(chalk.red(`Failed to update task ${name}`));
  }
};
