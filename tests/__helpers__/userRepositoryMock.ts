import * as userRepository from '../../src/repositories/user';
import { generateFunctionGlobalRole, generateFunctionUser } from './users';

export const userRepositoryMock = (functionName: string, permissions: string[]) => {
  const user = generateFunctionUser(functionName);
  const globalRole = generateFunctionGlobalRole(functionName, permissions);

  const isEmailAvailableSpy = jest.spyOn(userRepository, 'isEmailAvailable')
    .mockResolvedValue(true);

  const findUserByEmailSpy = jest.spyOn(userRepository, 'findUserByEmail')
    .mockResolvedValue(undefined);

  const createUserSpy = jest.spyOn(userRepository, 'createUser')
    .mockResolvedValue(user);

  const findGlobalRoleByNameSpy = jest.spyOn(userRepository, 'findGlobalRoleByName')
    .mockResolvedValue(undefined);

  const createGlobalRoleSpy = jest.spyOn(userRepository, 'createGlobalRole')
    .mockResolvedValue(globalRole);

  const addPermissionsToGlobalRoleSpy = jest.spyOn(userRepository, 'addPermissionsToGlobalRole')
    .mockResolvedValue({ affectedRecords: 1 });

  const addGlobalRoleToUserSpy = jest.spyOn(userRepository, 'addGlobalRoleToUser')
    .mockResolvedValue({ affectedRecords: 1 });

  return {
    user,
    globalRole,
    isEmailAvailableSpy,
    findUserByEmailSpy,
    createUserSpy,
    findGlobalRoleByNameSpy,
    createGlobalRoleSpy,
    addPermissionsToGlobalRoleSpy,
    addGlobalRoleToUserSpy,
  };
};
