import { epilogue } from '../helpers/util.mjs';
import { commands } from './tasks/index.mjs';

export const command = 'tasks <command>';
export const desc = 'Manage tasks';
export const builder = (yargs: any) => epilogue(yargs).command(commands as any);

export const handler = () => { /* empty */ };
