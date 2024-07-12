import { epilogue } from '../helpers/util';

export const command = 'localizations <command>';
export const desc = 'Manage localizations';
export const builder = (yargs: any) => epilogue(yargs).commandDir('localizations');

export const handler = () => { /* empty */ };
