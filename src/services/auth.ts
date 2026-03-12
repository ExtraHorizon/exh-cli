import { createOAuth1Client } from '@extrahorizon/javascript-sdk';
import { writeCredentialsToFile } from '../exh';
import * as authRepository from '../repositories/auth';

export async function login(
  host: string,
  email: string,
  password: string,
  consumerKey: string,
  consumerSecret: string
) {
  const sdk = createOAuth1Client({
    consumerKey,
    consumerSecret,
    host,
  });

  const response = await sdk.auth.authenticate({
    email,
    password,
  });

  writeCredentialsToFile(host, consumerKey, consumerSecret, response.token, response.tokenSecret);
}

export async function whoami() {
  const host = authRepository.getHost();
  if (!host) {
    console.log('No ExH cluster host was found in the configuration.');
    return;
  }

  console.log('You are targeting:', host);

  const currentUser = await authRepository.fetchMe();
  console.log('You are logged in as:', currentUser.email);
}
