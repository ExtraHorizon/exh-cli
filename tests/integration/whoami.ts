import { OauthKeyError } from '@extrahorizon/javascript-sdk';
import { handler } from '../../src/commands/whoami';
import { exampleHost, exampleUser, mockAuthRepository } from '../__helpers__/authRepositoryMock';

describe('exh whoami', () => {
  const logSpy = jest.spyOn(global.console, 'log');
  let authRepositoryMock: ReturnType<typeof mockAuthRepository>;

  beforeAll(async () => {
    authRepositoryMock = mockAuthRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Reports the targeted cluster and email address of the currently logged in user', async () => {
    await handler({ sdk: null });

    expect(logSpy).toHaveBeenCalledWith('You are targeting:', exampleHost);
    expect(logSpy).toHaveBeenCalledWith('You are logged in as:', exampleUser.email);
  });

  it('Reports if there is no cluster targeted', async () => {
    authRepositoryMock.getHostSpy.mockReturnValueOnce(undefined);

    await handler({ sdk: null });

    expect(logSpy).toHaveBeenCalledWith('No ExH cluster host was found in the configuration.');
  });

  it('Throws if the host is set but no tokens are set', async () => {
    authRepositoryMock.fetchMeSpy.mockRejectedValueOnce(new Error('No tokens found'));

    await expect(handler({ sdk: null })).rejects.toThrow('No tokens found');
  });

  it('Throws if the tokens are not (or no longer) valid', async () => {
    authRepositoryMock.fetchMeSpy.mockRejectedValueOnce(new OauthKeyError({ name: 'OAUTH_KEY_EXCEPTION', message: 'The consumer key is unknown' }));

    await expect(handler({ sdk: null })).rejects.toThrow(OauthKeyError);
  });
});
