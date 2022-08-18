import { epilogue } from '../helpers/util.mjs';
import { commands } from './templates/index.mjs';

export const command = 'templates <command>';
export const desc = 'Manage templates';
export const builder = (yargs: any) => epilogue(yargs).command(commands as any);

export const handler = () => { /* empty */ };
