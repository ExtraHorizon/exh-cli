import { homedir } from 'os';
import * as path from 'path';

export const EXH_CONFIG_FILE_DIR = path.join(homedir(), '/.exh');
export const EXH_CONFIG_FILE = `${EXH_CONFIG_FILE_DIR}/credentials`;
export const runtimeChoices = ['nodejs18.x', 'nodejs16.x', 'nodejs14.x', 'python3.10', 'python3.9', 'python3.8', 'python3.7', 'java17', 'java11', 'java8', 'java8.al2', 'dotnet7', 'dotnet6', 'go1.x', 'ruby3.2', 'ruby2.7'];

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
