import { OAuth1Client } from '@extrahorizon/javascript-sdk';
import {
  createAuthenticatedClientWithToken, getClientParametersFromEnv, getTokensFromEnv,
} from './helpers/client';
import { loadAndAssertCredentials } from './helpers/util';

let sdk: OAuth1Client = null;

export function initSdk(newSdk: OAuth1Client) {
  sdk = newSdk;
  return sdk;
}

export async function initAuthenticatedSdkFromEnv() {
  loadAndAssertCredentials();

  try {
    const result = await createAuthenticatedClientWithToken(
      getClientParametersFromEnv(),
      getTokensFromEnv()
    );
    sdk = result.client;
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
