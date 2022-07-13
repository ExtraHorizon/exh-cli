import { rqlBuilder, getMockSdkOAuth1 } from '@extrahorizon/javascript-sdk';

export const sdkMock = getMockSdkOAuth1<jest.Mock>(jest.fn);

function createClient() {
  return sdkMock;
}

exports.createClient = createClient;
exports.rqlBuilder = rqlBuilder;
exports.createOAuth1Client = () => { return sdkMock; };
