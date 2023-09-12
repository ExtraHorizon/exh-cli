import { Argv } from 'yargs';
import { epilogue } from '../helpers/util';

export const command = 'dispatchers <command>';
export const desc = 'Manage dispatchers within Extra Horizon';
export const builder = (yargs: Argv) => epilogue(yargs).commandDir('dispatchers');
export const handler = () => { /* empty */ };
