import { homedir } from 'os';
import * as path from 'path';
import * as taskConfigSchema from './config-json-schemas/TaskConfig.json';

export const EXH_CONFIG_FILE_DIR = path.join(homedir(), '/.exh');
export const EXH_CONFIG_FILE = `${EXH_CONFIG_FILE_DIR}/credentials`;

// From: https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
export const runtimeChoices = taskConfigSchema.properties.runtime.enum;

export const limits = {
  time: {
    min: 3,
    max: 900,
  },
  memory: {
    min: 128,
    max: 10240,
  },
};
