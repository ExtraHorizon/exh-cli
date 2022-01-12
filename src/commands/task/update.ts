import * as fs from 'fs';
import * as path from 'path';

import { builder as createBuilder } from './create';

export const command = 'update';
export const desc = 'Update a task';
export const builder = createBuilder;

export const handler = async ({ sdk, name, code, entryPoint, runtime, description, timeLimit, memoryLimit, env }) => {
  const file = fs.readFileSync(path.join(process.cwd(), code));

  const reponse = await sdk.raw.put(`/tasks/v1/functions/${name}`, {
    name,
    description,
    code: file.toString('base64'),
    entryPoint,
    runtime,
    timeLimit,
    memoryLimit,
    environmentVariables: env,
  });
  console.log(reponse.data);
};

