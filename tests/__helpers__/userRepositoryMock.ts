import { Permission } from '@extrahorizon/javascript-sdk';
import * as userRepository from '../../src/repositories/user';
import { generateFunctionGlobalRole, generateFunctionUser } from './users';

export const userRepositoryMock = (functionName: string, permissions: Permission[]) => {
  const user = generateFunctionUser(functionName);
  const globalRole = generateFunctionGlobalRole(functionName, permissions);

  const isEmailAvailableSpy = jest.spyOn(userRepository, 'isEmailAvailable')
    .mockImplementationOnce(() => Promise.resolve(true));

  const findUserByEmailSpy = jest.spyOn(userRepository, 'findUserByEmail')
    .mockImplementationOnce(() => Promise.resolve(undefined));

  const createUserSpy = jest.spyOn(userRepository, 'createUser')
    .mockImplementationOnce(() => Promise.resolve(user));

  const findGlobalRoleByNameSpy = jest.spyOn(userRepository, 'findGlobalRoleByName')
    .mockImplementationOnce(() => Promise.resolve(undefined));

  const createGlobalRoleSpy = jest.spyOn(userRepository, 'createGlobalRole')
    .mockImplementationOnce(() => Promise.resolve(globalRole));

  const addPermissionsToGlobalRoleSpy = jest.spyOn(userRepository, 'addPermissionsToGlobalRole')
    .mockImplementationOnce(() => Promise.resolve({ affectedRecords: 1 }));

  const addGlobalRoleToUserSpy = jest.spyOn(userRepository, 'addGlobalRoleToUser')
    .mockImplementationOnce(() => Promise.resolve({ affectedRecords: 1 }));

  return {
    user,
    isEmailAvailableSpy,
    findUserByEmailSpy,
    createUserSpy,
    findGlobalRoleByNameSpy,
    createGlobalRoleSpy,
    addPermissionsToGlobalRoleSpy,
    addGlobalRoleToUserSpy,
  };
};
