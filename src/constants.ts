import { homedir } from 'os';
import * as path from 'path';

export const EXH_CONFIG_FILE_DIR = path.join(homedir(), '/.exh');
export const EXH_CONFIG_FILE = `${EXH_CONFIG_FILE_DIR}/credentials`;
export const runtimeChoices = ['nodejs12.x', 'nodejs14.x', 'python3.7', 'python3.8', 'python3.9', 'ruby2.7', 'java8', 'java11', 'go1.x', 'dotnetcore3.1'];
