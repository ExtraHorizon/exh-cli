import { epilogue } from '../helpers/util.mjs';
import { commands } from './data/index.mjs';

export const command = 'data <command>';
export const desc = 'Manage data';
export const builder = (yargs: any) => epilogue(yargs).command(commands as any);
export const handler = () => { /* empty */ };
