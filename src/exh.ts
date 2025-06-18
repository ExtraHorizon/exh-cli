import { createOAuth1Client, OAuth1Client } from '@extrahorizon/javascript-sdk';
import { loadAndAssertCredentials } from './helpers/util';

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
  loadAndAssertCredentials();

  sdk = createOAuth1Client({
    host: process.env.API_HOST,
    consumerKey: process.env.API_OAUTH_CONSUMER_KEY,
    consumerSecret: process.env.API_OAUTH_CONSUMER_SECRET,
  });

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
