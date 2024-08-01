import * as authRepository from '../../src/repositories/auth';

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

export const mockAuthRepository = () => {
  const fetchMeSpy = jest.spyOn(authRepository, 'fetchMe')
    .mockImplementation(async () => exampleUser);

  const getHostSpy = jest.spyOn(authRepository, 'getHost')
    .mockImplementation(() => exampleHost);

  return {
    fetchMeSpy,
    getHostSpy,
  };
};
