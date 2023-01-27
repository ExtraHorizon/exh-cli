import * as fs from 'fs';
import { createOAuth1Client } from '@extrahorizon/javascript-sdk';
import { EXH_CONFIG_FILE } from './constants';

interface ExHCredentials {
  API_HOST?: string;
  API_OAUTH_CONSUMER_KEY?: string;
  API_OAUTH_CONSUMER_SECRET?: string;
  API_OAUTH_TOKEN?: string;
  API_OAUTH_TOKEN_SECRET?: string;
}

let sdk = null;

export async function sdkInitOnly(apiHost: string, consumerKey: string, consumerSecret: string) {
  sdk = createOAuth1Client({
    consumerKey,
    consumerSecret,
    host: apiHost,
  });
  return sdk;
}

export async function sdkAuth() {
  let credentials: any = {};
  let haveCredFile = false;
  const needed = ['API_HOST', 'API_OAUTH_CONSUMER_KEY', 'API_OAUTH_CONSUMER_SECRET', 'API_OAUTH_TOKEN', 'API_OAUTH_TOKEN_SECRET'];

  const error = missing => {
    let message = 'Failed to retrieve all credentials. ';
    if (!haveCredFile) {
      message += 'Couldn\'t open ~/.exh/credentials. ';
    }
    if (missing.length) {
      message += `Missing properties: ${missing.join(',')}`;
    }
    throw new Error(message);
  };

  /* First try to load from file */
  try {
    const credentialsFile = fs.readFileSync(EXH_CONFIG_FILE, 'utf-8');
    haveCredFile = true;
    credentials = credentialsFile
      .split(/\r?\n/).map(l => l.split(/=/)).filter(i => i.length === 2)
      .reduce<ExHCredentials>((r, v) => { r[v[0].trim()] = v[1].trim(); return r; }, {}); /* eslint-disable-line */

    /* Also set these as environment variable if they're not present already */
    for (const k of Object.keys(credentials)) {
      if (!process.env[k]) {
        process.env[k] = credentials[k];
      }
    }
  } catch (err) { /* */ }

  /* Override with environment variables if present */
  needed.forEach(v => { credentials[v] = process.env[v] ?? credentials[v]; });

  /* Check if we're missing any properties & throw error if needed */
  const missingProperties = needed.filter(p => credentials[p] === undefined);
  if (missingProperties.length) { error(missingProperties); }

  sdk = createOAuth1Client({
    consumerKey: credentials.API_OAUTH_CONSUMER_KEY,
    consumerSecret: credentials.API_OAUTH_CONSUMER_SECRET,
    host: credentials.API_HOST,
  });

  try {
    // authenticate
    await sdk.auth.authenticate({
      token: credentials.API_OAUTH_TOKEN,
      tokenSecret: credentials.API_OAUTH_TOKEN_SECRET,
    });
  } catch (err) {
    throw new Error(`Failed to authenticate. All credentials found but some might be wrong or no longer valid.\nError was: "${err}"`);
  }
  return sdk;
}
