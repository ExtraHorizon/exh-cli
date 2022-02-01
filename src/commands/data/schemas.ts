import { epilogue } from '../../helpers/util';

export const command = 'schemas <command>';
export const desc = 'Manage data schemas';
export const builder = (yargs: any) => epilogue(yargs).commandDir('schemas');
export const handler = () => { /* empty */ };
