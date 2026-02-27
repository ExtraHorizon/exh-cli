import { epilogue } from '../helpers/util';
import * as authService from '../services/auth';

export const command = 'whoami';
export const desc = 'Shows the currently logged in user';
export const builder = (yargs: any) => epilogue(yargs);

export const handler = async function whoami() {
  await authService.whoami();
};
