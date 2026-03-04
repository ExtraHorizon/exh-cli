import { Argv } from 'yargs';
import { epilogue } from '../helpers/util';

export const command = 'settings <command>';
export const desc = 'Manage Service Settings within Extra Horizon';
export const builder = (yargs: Argv) => epilogue(yargs).commandDir('settings');
export const handler = () => { /* empty */ };
