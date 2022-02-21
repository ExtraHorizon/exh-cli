import { epilogue } from '../helpers/util';

export const command = 'templates <command>';
export const desc = 'Manage templates';
export const builder = (yargs: any) => epilogue(yargs).commandDir('templates');

export const handler = () => { /* empty */ };
