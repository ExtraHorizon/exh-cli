import { readFileSync } from 'fs';
import { sdkMock } from '../__mocks__/@extrahorizon/javascript-sdk';
import { sdkAuth } from '../src/exh';

jest.mock('fs');

const readFileSyncMock = <jest.Mock>readFileSync;

const env = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...env }
})

afterEach(() => {
  process.env = env
})

test('No existing file and no env credentials should throw an error', async () => {
  readFileSyncMock.mockImplementationOnce(() => { throw new Error(''); });
  await expect(sdkAuth()).rejects.toThrow();
});

test('Existing file with missing credentials should throw an error', async () => {
  readFileSyncMock.mockImplementationOnce(() => ({ foo: 'bar' }));
  await expect(sdkAuth()).rejects.toThrow();
});

test('File with correct credentials should not throw an error', async () => {
  readFileSyncMock.mockImplementationOnce(() => "API_HOST=test\r\nAPI_OAUTH_CONSUMER_KEY=test\r\nAPI_OAUTH_CONSUMER_SECRET=test\r\nAPI_OAUTH_TOKEN=testtoken\r\nAPI_OAUTH_TOKEN_SECRET=testsecret\r\n");
  await expect(sdkAuth()).resolves.toBe(sdkMock);
  const authCall = sdkMock.auth.authenticate;
  expect(authCall.mock.calls[authCall.mock.calls.length - 1][0].token).toBe('testtoken')
  expect(authCall.mock.calls[authCall.mock.calls.length - 1][0].tokenSecret).toBe('testsecret')
});

test('Check that whitespaces are trimmed from credentials file', async () => {
  readFileSyncMock.mockImplementationOnce(() => "   API_HOST   =   test   \r\n\
API_OAUTH_CONSUMER_KEY = test \r\n       API_OAUTH_CONSUMER_SECRET=test\r\n    API_OAUTH_TOKEN   =  testtoken\r\n    API_OAUTH_TOKEN_SECRET  =   testsecret  \r\n   ");
  await expect(sdkAuth()).resolves.toBe(sdkMock);
  const authCall = sdkMock.auth.authenticate;
  expect(authCall.mock.calls[authCall.mock.calls.length - 1][0].token).toBe('testtoken')
  expect(authCall.mock.calls[authCall.mock.calls.length - 1][0].tokenSecret).toBe('testsecret')
});

test('Credentials file variables can be overridden by environment variables', async () => {
  readFileSyncMock.mockImplementationOnce(() => "API_HOST=test\r\nAPI_OAUTH_CONSUMER_KEY=test\r\nAPI_OAUTH_CONSUMER_SECRET=test\r\nAPI_OAUTH_TOKEN=testtoken\r\nAPI_OAUTH_TOKEN_SECRET=testsecret\r\n");
  process.env.API_OAUTH_TOKEN_SECRET = "overriddentokensecret";
  await expect(sdkAuth()).resolves.toBe(sdkMock);
  delete process.env.API_OAUTH_TOKEN_SECRET;
  const authCall = sdkMock.auth.authenticate;
  expect(authCall.mock.calls[authCall.mock.calls.length - 1][0].token).toBe('testtoken')
  expect(authCall.mock.calls[authCall.mock.calls.length - 1][0].tokenSecret).toBe('overriddentokensecret')
});

test('Supplement credentials file with environment variables to get valid auth', async () => {
  readFileSyncMock.mockImplementationOnce(() => "API_HOST=test\r\nAPI_OAUTH_CONSUMER_KEY=test\r\nAPI_OAUTH_CONSUMER_SECRET=test\r\n");
  process.env.API_OAUTH_TOKEN = "envtoken";
  process.env.API_OAUTH_TOKEN_SECRET = "envtokensecret";
  await expect(sdkAuth()).resolves.toBe(sdkMock);
  delete process.env.API_OAUTH_TOKEN;
  delete process.env.API_OAUTH_TOKEN_SECRET;
  const authCall = sdkMock.auth.authenticate;
  expect(authCall.mock.calls[authCall.mock.calls.length - 1][0].token).toBe('envtoken')
  expect(authCall.mock.calls[authCall.mock.calls.length - 1][0].tokenSecret).toBe('envtokensecret')
});


