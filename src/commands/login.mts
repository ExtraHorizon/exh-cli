import * as fs from 'fs/promises';
import { OAuth1Client } from '@extrahorizon/javascript-sdk';
import chalk from 'chalk';
import { EXH_CONFIG_FILE_DIR, EXH_CONFIG_FILE } from '../constants.mjs';
import { epilogue } from '../helpers/util.mjs';

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

export const handler = async ({ sdk, host, email, password, consumerKey, consumerSecret }:
  {sdk: OAuth1Client; host:string; email: string; password: string; consumerKey: string; consumerSecret: string;}) => {
  // authenticate
  const response = await sdk.auth.authenticate({
    email,
    password,
  });

  /* Create directory if it doesn't exist yet */
  try {
    await fs.stat(EXH_CONFIG_FILE_DIR);
  } catch (err) {
    await fs.mkdir(EXH_CONFIG_FILE_DIR);
  }

  await fs.writeFile(EXH_CONFIG_FILE, `API_HOST=${host}
API_OAUTH_CONSUMER_KEY=${consumerKey}
API_OAUTH_CONSUMER_SECRET=${consumerSecret}
API_OAUTH_TOKEN=${response.token}
API_OAUTH_TOKEN_SECRET=${response.tokenSecret}
`);
  console.log(chalk.green('Wrote credentials to', EXH_CONFIG_FILE));
};
