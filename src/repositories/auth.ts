import { getNewSdkInstance, getSdk } from '../exh';

export function getHost() {
  return getSdk()?.raw?.defaults?.baseURL;
}

export async function createOAuth1Tokens(email: string, password: string) {
  return getNewSdkInstance().auth.authenticate({ email, password });
}

export async function fetchMe() {
  return await getSdk()?.users.me();
}
