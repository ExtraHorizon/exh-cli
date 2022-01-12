import { epilogue } from '../../helpers/util';

export const command = 'schema <command>';
export const desc = 'Manage data schemas';
export const builder = (yargs: any) => epilogue(yargs).commandDir('schema');
export const handler = () => { /* empty */ };
