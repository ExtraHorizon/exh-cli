import { OAuth1Client, rqlBuilder } from '@extrahorizon/javascript-sdk';

// TODO: Add this to the SDK
export async function findUserByEmail(sdk: OAuth1Client, email: string) {
  const rql = rqlBuilder().eq('email', email).build();
  return await sdk.users.findFirst({ rql });
}
