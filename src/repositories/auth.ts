import { OAuth1Client } from '@extrahorizon/javascript-sdk';

export function getHost(sdk: OAuth1Client) {
  return sdk?.raw?.defaults?.baseURL;
}

export async function fetchMe(sdk: OAuth1Client) {
  return await sdk?.users.me();
}
