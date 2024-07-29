import type { OAuth1Client } from '@extrahorizon/javascript-sdk';
import { epilogue } from '../helpers/util';
import * as authRepository from '../repositories/auth';

export const command = 'whoami';
export const desc = 'Shows the currently logged in user';
export const builder = (yargs: any) => epilogue(yargs);

export const handler = async function list({ sdk }: { sdk: OAuth1Client; }) {
  const host = authRepository.getHost(sdk);
  if (!host) {
    console.log('No ExH cluster host was found in the configuration.');
    return;
  }

  console.log('You are targeting:', host);

  const currentUser = await authRepository.fetchMe(sdk);
  console.log('You are logged in as:', currentUser.email);
};
