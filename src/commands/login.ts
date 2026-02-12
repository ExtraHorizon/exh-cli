import { epilogue } from '../helpers/util';
import * as authService from '../services/auth';

export const command = 'login';
export const desc = 'Retrieve credentials from ExH';
export const builder = (yargs: any) => epilogue(yargs).options({
  host: {
    demandOption: true,
    type: 'string',
    describe: 'the address of your ExH cloud instance (eg. https://api.dev.my-instance.extrahorizon.io)',
  },
  email: {
    demandOption: true,
    type: 'string',
    describe: 'email address of your ExH account',
  },
  password: {
    demandOption: true,
    type: 'string',
    describe: 'password of your ExH account',
  },
  consumerKey: {
    demandOption: true,
    type: 'string',
    describe: 'Consumer key',
  },
  consumerSecret: {
    demandOption: true,
    type: 'string',
    describe: 'Consumer secret',
  },
});

export const handler = async ({ host, email, password, consumerKey, consumerSecret }:
  { host:string; email: string; password: string; consumerKey: string; consumerSecret: string;}) => {
  await authService.login(host, email, password, consumerKey, consumerSecret);
};
