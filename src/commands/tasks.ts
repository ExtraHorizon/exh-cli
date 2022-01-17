import { epilogue } from '../helpers/util';

export const command = 'tasks <command>';
export const desc = 'Manage tasks';
export const builder = (yargs: any) => epilogue(yargs).commandDir('tasks');

export const handler = () => { /* empty */ };
