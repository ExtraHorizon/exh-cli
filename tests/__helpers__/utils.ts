import { randomBytes } from 'crypto';

export function randomHexString(numberOfBytes = 5) {
  return randomBytes(numberOfBytes).toString('hex');
}
