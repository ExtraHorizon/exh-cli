import { OauthKeyError } from '@extrahorizon/javascript-sdk';
import { handler } from '../../src/commands/whoami';
import { exampleHost, exampleUser, mockAuthRepository, type AuthRepositoryMock } from '../__helpers__/authRepositoryMock';
import { spyOnConsole } from '../__helpers__/consoleSpy';

describe('exh whoami', () => {
  const { expectConsoleLogToContain } = spyOnConsole();
  let authRepositoryMock: AuthRepositoryMock;

  beforeAll(async () => {
    authRepositoryMock = mockAuthRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Reports the targeted cluster and email address of the currently logged in user', async () => {
    await handler();

    expectConsoleLogToContain('You are targeting:', exampleHost);
    expectConsoleLogToContain('You are logged in as:', exampleUser.email);
  });

  it('Reports if there is no cluster targeted', async () => {
    authRepositoryMock.getHostSpy.mockReturnValueOnce(undefined);

    await handler();

    expectConsoleLogToContain('No ExH cluster host was found in the configuration.');
  });

  it('Throws if the host is set but no tokens are set', async () => {
    authRepositoryMock.fetchMeSpy.mockRejectedValueOnce(new Error('No tokens found'));

    await expect(handler()).rejects.toThrow('No tokens found');
  });

  it('Throws if the tokens are not (or no longer) valid', async () => {
    authRepositoryMock.fetchMeSpy.mockRejectedValueOnce(new OauthKeyError({ name: 'OAUTH_KEY_EXCEPTION', message: 'The consumer key is unknown' }));

    await expect(handler()).rejects.toThrow(OauthKeyError);
  });
});
