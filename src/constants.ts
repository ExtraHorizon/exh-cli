import { homedir } from 'os';
import * as path from 'path';

export const EXH_CONFIG_FILE_DIR = path.join(homedir(), '/.exh');
export const EXH_CONFIG_FILE = `${EXH_CONFIG_FILE_DIR}/credentials`;

// From: https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
export const runtimeChoices = [
  'nodejs16.x',
  'nodejs18.x',
  'nodejs20.x',
  'python3.8',
  'python3.9',
  'python3.10',
  'python3.11',
  'python3.12',
  'java8.al2',
  'java11',
  'java17',
  'java21',
  'dotnet6',
  'dotnet7',
  'dotnet8',
  'ruby3.2',
  'provided.al2',
  'provided.al2023',
];

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
