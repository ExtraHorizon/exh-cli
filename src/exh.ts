import { createOAuth1Client, OAuth1Client } from '@extrahorizon/javascript-sdk';
import { extractLocalCredentials } from './helpers/util';

let sdk: OAuth1Client = null;

export function sdkInitOnly(apiHost: string, consumerKey: string, consumerSecret: string) {
  sdk = createOAuth1Client({
    consumerKey,
    consumerSecret,
    host: apiHost,
  });
  return sdk;
}

export async function sdkAuth() {
  const credentials = extractLocalCredentials();

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
