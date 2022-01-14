import { epilogue } from '../helpers/util';

export const command = 'data <command>';
export const desc = 'Manage data';
export const builder = (yargs: any) => epilogue(yargs).commandDir('data');
export const handler = () => { /* empty */ };
