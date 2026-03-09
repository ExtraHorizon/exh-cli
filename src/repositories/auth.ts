import { getSdk } from '../exh';
import { getClientParametersFromEnv, createAuthenticatedClientWithPassword } from '../helpers/client';

export function getHost() {
  return getSdk()?.raw?.defaults?.baseURL;
}

export async function createOAuth1Tokens(email: string, password: string) {
  const result = await createAuthenticatedClientWithPassword(
    getClientParametersFromEnv(),
    { email, password }
  );
  return result.tokenData;
}

export async function fetchMe() {
  return await getSdk()?.users.me();
}
