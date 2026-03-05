import * as userRepository from '../../src/repositories/user';
import {
  generateEmailTemplates,
  generatePasswordPolicy, generateTestGlobalRole, generateTestUser, generateVerificationSettings,
} from './users';

export type UserRepositoryMock = ReturnType<typeof userRepositoryMock>;

export const userRepositoryMock = () => {
  const isEmailAvailableSpy = jest.spyOn(userRepository, 'isEmailAvailable')
    .mockResolvedValue(true);

  const findUserByEmailSpy = jest.spyOn(userRepository, 'findUserByEmail')
    .mockResolvedValue(undefined);

  const createUserSpy = jest.spyOn(userRepository, 'createUser')
    .mockResolvedValue(generateTestUser());

  const findGlobalRoleByNameSpy = jest.spyOn(userRepository, 'findGlobalRoleByName')
    .mockResolvedValue(undefined);

  const createGlobalRoleSpy = jest.spyOn(userRepository, 'createGlobalRole')
    .mockResolvedValue(generateTestGlobalRole());

  const addPermissionsToGlobalRoleSpy = jest.spyOn(userRepository, 'addPermissionsToGlobalRole')
    .mockResolvedValue({ affectedRecords: 1 });

  const addGlobalRoleToUserSpy = jest.spyOn(userRepository, 'addGlobalRoleToUser')
    .mockResolvedValue({ affectedRecords: 1 });

  const updateVerificationSettingsSpy = jest.spyOn(userRepository, 'updateVerificationSettings')
    .mockResolvedValue(generateVerificationSettings());

  const updateEmailTemplatesSpy = jest.spyOn(userRepository, 'updateEmailTemplates')
    .mockResolvedValue(generateEmailTemplates());

  const updatePasswordPolicySpy = jest.spyOn(userRepository, 'updatePasswordPolicy')
    .mockResolvedValue(generatePasswordPolicy());

  return {
    isEmailAvailableSpy,
    findUserByEmailSpy,
    createUserSpy,
    findGlobalRoleByNameSpy,
    createGlobalRoleSpy,
    addPermissionsToGlobalRoleSpy,
    addGlobalRoleToUserSpy,
    updateVerificationSettingsSpy,
    updateEmailTemplatesSpy,
    updatePasswordPolicySpy,
  };
};
