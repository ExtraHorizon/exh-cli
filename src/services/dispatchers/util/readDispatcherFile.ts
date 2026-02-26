import { readFile } from 'fs/promises';
import { DispatcherCreation } from '@extrahorizon/javascript-sdk';
import * as dispatcherSchema from '../../../config-json-schemas/Dispatchers.json';
import { ajvValidate } from '../../../helpers/util';

export type DispatchersFile = DispatcherCreation[] | { dispatchers: DispatcherCreation[]; };

export async function readAndValidateDispatcherConfig(path: string) {
  let config: any;
  try {
    const buffer = await readFile(path);
    config = JSON.parse(buffer.toString());
  } catch (error) {
    throw new Error(`Failed to read Dispatchers from ${path}: ${error.message}`);
  }

  ajvValidate<DispatchersFile>(dispatcherSchema, config);

  if (Array.isArray(config)) {
    return config;
  }

  return config.dispatchers;
}
