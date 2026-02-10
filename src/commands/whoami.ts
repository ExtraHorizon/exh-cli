import { epilogue } from '../helpers/util';
import * as authRepository from '../repositories/auth';

export const command = 'whoami';
export const desc = 'Shows the currently logged in user';
export const builder = (yargs: any) => epilogue(yargs);

export const handler = async function list() {
  const host = authRepository.getHost();
  if (!host) {
    console.log('No ExH cluster host was found in the configuration.');
    return;
  }

  console.log('You are targeting:', host);

  const currentUser = await authRepository.fetchMe();
  console.log('You are logged in as:', currentUser.email);
};
