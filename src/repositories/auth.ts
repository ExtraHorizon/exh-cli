import { getSdk } from '../exh';

export function getHost() {
  return getSdk()?.raw?.defaults?.baseURL;
}

// TODO: Add this to the SDK
export async function createOAuth1Tokens(email: string, password: string) {
  const response = await getSdk().raw.post('/auth/v2/oauth1/tokens', { email, password });
  return response.data;
}

export async function fetchMe() {
  return await getSdk()?.users.me();
}
