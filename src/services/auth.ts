import * as fs from 'fs/promises';
import * as chalk from 'chalk';
import { EXH_CONFIG_FILE_DIR, EXH_CONFIG_FILE } from '../constants';
import { sdkInitOnly } from '../exh';
import * as authRepository from '../repositories/auth';

export async function login(
  host: string,
  email: string,
  password: string,
  consumerKey: string,
  consumerSecret: string
) {
  // authenticate
  const sdk = sdkInitOnly(host, consumerKey, consumerSecret);
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
}

export async function whoami() {
  const host = authRepository.getHost();
  if (!host) {
    console.log('No ExH cluster host was found in the configuration.');
    return;
  }

  console.log('You are targeting:', host);

  const currentUser = await authRepository.fetchMe();
  console.log('You are logged in as:', currentUser.email);
}
