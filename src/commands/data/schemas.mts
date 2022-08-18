import { epilogue } from '../../helpers/util.mjs';
import { commands } from './schemas/index.mjs';

export const command = 'schemas <command>';
export const desc = 'Manage data schemas';
export const builder = (yargs: any) => epilogue(yargs).command(commands as any);
export const handler = () => { /* empty */ };
