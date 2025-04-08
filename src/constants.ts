import { homedir } from 'os';
import * as path from 'path';

export const EXH_CONFIG_FILE_DIR = path.join(homedir(), '/.exh');
export const EXH_CONFIG_FILE = `${EXH_CONFIG_FILE_DIR}/credentials`;

// From: https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
export const runtimeChoices = [
  'nodejs22.x',
  'nodejs16.x',
  'nodejs20.x',
  'nodejs18.x',
  'python3.13',
  'python3.12',
  'python3.11',
  'python3.10',
  'python3.9',
  'python3.8',
  'java21',
  'java17',
  'java11',
  'java8.al2',
  'dotnet9',
  'dotnet8',
  'dotnet7',
  'dotnet6',
  'ruby3.4',
  'ruby3.3',
  'ruby3.2',
  'provided.al2023',
  'provided.al2',
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
