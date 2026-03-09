import { createOAuth1Client, ParamsOauth1 } from '@extrahorizon/javascript-sdk';

export function getClientParametersFromEnv(): ParamsOauth1 {
  return {
    host: process.env.API_HOST,
    consumerKey: process.env.API_OAUTH_CONSUMER_KEY,
    consumerSecret: process.env.API_OAUTH_CONSUMER_SECRET,
  };
}

export function getTokensFromEnv() {
  return {
    token: process.env.API_OAUTH_TOKEN,
    tokenSecret: process.env.API_OAUTH_TOKEN_SECRET,
  };
}

export async function createAuthenticatedClientWithToken(clientParams: ParamsOauth1, authParams: { token: string; tokenSecret: string; }) {
  const client = createOAuth1Client(clientParams);
  const tokenData = await client.auth.authenticate(authParams);
  return { client, tokenData };
}

export async function createAuthenticatedClientWithPassword(clientParams: ParamsOauth1, authParams: { email: string; password: string; }) {
  const client = createOAuth1Client(clientParams);
  const tokenData = await client.auth.authenticate(authParams);
  return { client, tokenData };
}
