import * as fs from 'fs';
import * as path from 'path';

import { builder as createBuilder } from './create';

export const command = 'update';
export const desc = 'Update a task';
export const builder = createBuilder;

export const handler = async ({ sdk, name, code, entryPoint, runtime, description, timeLimit, memoryLimit, env }) => {
  let envArr = Array.isArray(env) ? env : [env];
  envArr = envArr.map(e => e.split('=')).filter(e => e.length === 2).reduce((prev, curr) => ({ ...prev, [curr[0]]: { value: curr[1] } }), {});

  const file = fs.readFileSync(path.join(process.cwd(), code));

  const reponse = await sdk.raw.put(`/tasks/v1/functions/${name}`, {
    name,
    description: description || 'none',
    code: file.toString('base64'),
    entryPoint,
    runtime,
    timeLimit,
    memoryLimit,
    environmentVariables: envArr,
  });
  console.log(reponse.data);
};
