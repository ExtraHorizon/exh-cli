import { getMockSdkOAuth1 } from '@extrahorizon/javascript-sdk';

export * from '@extrahorizon/javascript-sdk';

export const sdkMock = getMockSdkOAuth1<jest.Mock>(jest.fn);

export function createClient() {
  return sdkMock;
}

export const createOAuth1Client = createClient;
