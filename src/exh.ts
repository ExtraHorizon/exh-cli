import { createOAuth1Client } from '@extrahorizon/javascript-sdk';
import * as fs from 'fs';
import { EXH_CONFIG_FILE } from './constants';

interface ExHCredentials {
    API_HOST?: string;
    API_OAUTH_CONSUMER_KEY?: string;
    API_OAUTH_CONSUMER_SECRET?: string;
    API_OAUTH_TOKEN?: string;
    API_OAUTH_TOKEN_SECRET?: string;
}

let initialized = false;
let sdk = null;

export async function sdkInitOnly(apiHost: string, consumerKey: string, consumerSecret: string) {
  if (initialized) return sdk;
  sdk = createOAuth1Client({
    consumerKey,
    consumerSecret,
    host: apiHost,
  });
  return sdk;
}

export async function sdkAuth() {
  if (initialized) return sdk;
  let credentials: any = {};

  try {
    const credentialsFile = fs.readFileSync(EXH_CONFIG_FILE, 'utf-8');
    credentials = credentialsFile.split(/\r?\n/).map(l => l.split(/=/)).filter(i => i.length === 2)
      .reduce<ExHCredentials>((r, v) => { r[v[0]] = v[1]; return r; }, {}); /* eslint-disable-line */
  } catch (err) {
    throw new Error('Failed to open credentials file. Make sure they are correctly specified in ~/.exh/credentials');
  }

  if (!credentials.API_HOST) throw new Error('Missing credentials parameter API_HOST');
  if (!credentials.API_OAUTH_CONSUMER_KEY) throw new Error('Missing credential parameters API_OAUTH_CONSUMER_KEY');
  if (!credentials.API_OAUTH_CONSUMER_SECRET) throw new Error('Missing credential parameters API_OAUTH_CONSUMER_SECRET');
  if (!credentials.API_OAUTH_TOKEN) throw new Error('Missing credentials parameter API_OAUTH_TOKEN');
  if (!credentials.API_OAUTH_TOKEN_SECRET) throw new Error('Missing credentials parameter API_OAUTH_TOKEN_SECRET');

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
    throw new Error('Failed to authenticate. Please check credentials');
  }
  initialized = true;
  return sdk;
}
