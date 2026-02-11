import * as authRepository from '../../src/repositories/auth';
import { generateOAuth1Tokens } from '../__helpers__/auth';

export const exampleHost = 'https://api.dev.my-instance.extrahorizon.io';
export const exampleUser = {
  id: '660d0e619bfa72582ac6e2b5',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  language: 'EN',
  timeZone: 'Europe/Brussels',
  phoneNumber: '----',
  activation: true,
  updateTimestamp: new Date(),
  creationTimestamp: new Date(),
};

export type AuthRepositoryMock = ReturnType<typeof mockAuthRepository>;

export const mockAuthRepository = () => {
  const oAuth1Tokens = generateOAuth1Tokens();

  const fetchMeSpy = jest.spyOn(authRepository, 'fetchMe')
    .mockResolvedValue(exampleUser);

  const getHostSpy = jest.spyOn(authRepository, 'getHost')
    .mockReturnValue(exampleHost);

  const createOAuth1TokensSpy = jest.spyOn(authRepository, 'createOAuth1Tokens')
    .mockImplementation(async () => generateOAuth1Tokens());

  return {
    oAuth1Tokens,
    fetchMeSpy,
    getHostSpy,
    createOAuth1TokensSpy,
  };
};
