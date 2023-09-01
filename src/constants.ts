import { homedir } from 'os';
import * as path from 'path';

export const EXH_CONFIG_FILE_DIR = path.join(homedir(), '/.exh');
export const EXH_CONFIG_FILE = `${EXH_CONFIG_FILE_DIR}/credentials`;
export const runtimeChoices = ['nodejs12.x', 'nodejs14.x', 'nodejs16.x', 'nodejs18.x', 'python3.7', 'python3.8', 'python3.9', 'python3.10', 'java8', 'java8.al2', 'java11', 'java17', 'dotnetcore3.1', 'dotnet6', 'dotnet7', 'go1.x', 'ruby2.7', 'ruby3.2'];

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
