import { createOAuth1Client, OAuth1Client } from '@extrahorizon/javascript-sdk';
import { loadAndAssertCredentials } from './helpers/util';

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
