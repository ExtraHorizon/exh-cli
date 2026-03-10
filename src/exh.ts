import * as fs from 'fs';
import { createOAuth1Client, OAuth1Client } from '@extrahorizon/javascript-sdk';
import * as chalk from 'chalk';
import { EXH_CONFIG_FILE, EXH_CONFIG_FILE_DIR } from './constants';

let sdk: OAuth1Client = null;

export async function sdkAuth() {
  loadAndAssertCredentials();

  sdk = getNewSdkInstance();

  try {
    // authenticate
    await sdk.auth.authenticate({
      token: process.env.API_OAUTH_TOKEN,
      tokenSecret: process.env.API_OAUTH_TOKEN_SECRET,
    });
  } catch (err) {
    throw new Error(`Failed to authenticate. All credentials found but some might be wrong or no longer valid.\nError was: "${err}"`);
  }

  return sdk;
}

export function getSdk() {
  if (!sdk) {
    throw new Error('SDK not initialized. Please call sdkAuth() or sdkInitOnly() first.');
  }
  return sdk;
}

export function getNewSdkInstance() {
  return createOAuth1Client({
    host: process.env.API_HOST,
    consumerKey: process.env.API_OAUTH_CONSUMER_KEY,
    consumerSecret: process.env.API_OAUTH_CONSUMER_SECRET,
  });
}

function loadAndAssertCredentials() {
  const credentials = {};
  let errorMessage = '';

  try {
    const credentialsFile = fs.readFileSync(EXH_CONFIG_FILE, 'utf-8');
    const credentialFileLines = credentialsFile.split(/\r?\n/);

    for (const credentialFileLine of credentialFileLines) {
      const [key, value] = credentialFileLine.split('=');

      if (key && value) {
        credentials[key.trim()] = value.trim();
      }
    }
  } catch (e) {
    errorMessage += 'Couldn\'t open ~/.exh/credentials. ';
  }

  const requiredEnvVariables = ['API_HOST', 'API_OAUTH_CONSUMER_KEY', 'API_OAUTH_CONSUMER_SECRET', 'API_OAUTH_TOKEN', 'API_OAUTH_TOKEN_SECRET'];
  for (const key of requiredEnvVariables) {
    // Set the environment variable if it's present in the credentials file, but not in the environment variables
    if (credentials[key] && !process.env[key]) {
      process.env[key] = credentials[key];
    }
  }

  const missingEnvironmentVariables = requiredEnvVariables.filter(key => !process.env[key]);
  if (missingEnvironmentVariables.length > 0) {
    errorMessage += `Missing environment variables: ${missingEnvironmentVariables.join(',')}`;
    throw new Error(`Failed to retrieve all credentials. ${errorMessage}`);
  }
}

export function writeCredentialsToFile(host: string, consumerKey: string, consumerSecret: string, token: string, tokenSecret:string) {
  /* Create directory if it doesn't exist yet */
  try {
    fs.statSync(EXH_CONFIG_FILE_DIR);
  } catch (err) {
    fs.mkdirSync(EXH_CONFIG_FILE_DIR);
  }

  fs.writeFileSync(EXH_CONFIG_FILE, `API_HOST=${host}
API_OAUTH_CONSUMER_KEY=${consumerKey}
API_OAUTH_CONSUMER_SECRET=${consumerSecret}
API_OAUTH_TOKEN=${token}
API_OAUTH_TOKEN_SECRET=${tokenSecret}
`);
  console.log(chalk.green('Wrote credentials to', EXH_CONFIG_FILE));
}
