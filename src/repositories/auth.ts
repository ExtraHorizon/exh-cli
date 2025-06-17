import { OAuth1Client } from '@extrahorizon/javascript-sdk';

export function getHost(sdk: OAuth1Client) {
  return sdk?.raw?.defaults?.baseURL;
}

// TODO: Add this to the SDK
export async function createOAuth1Tokens(sdk: OAuth1Client, email: string, password: string) {
  const response = await sdk.raw.post('/auth/v2/oauth1/tokens', { email, password });
  return response.data;
}

export async function fetchMe(sdk: OAuth1Client) {
  return await sdk?.users.me();
}
