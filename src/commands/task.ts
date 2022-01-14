import { epilogue } from '../helpers/util';

export const command = 'task <command>';
export const desc = 'Manage tasks';
export const builder = (yargs: any) => epilogue(yargs).commandDir('task');

export const handler = () => { /* empty */ };
