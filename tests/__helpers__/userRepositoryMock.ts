import * as userRepository from '../../src/repositories/user';

export type UserRepositoryMock = ReturnType<typeof userRepositoryMock>;

export const userRepositoryMock = () => {
  const isEmailAvailableSpy = jest.spyOn(userRepository, 'isEmailAvailable')
    .mockResolvedValue(true);

  const findUserByEmailSpy = jest.spyOn(userRepository, 'findUserByEmail')
    .mockResolvedValue(undefined);

  const createUserSpy = jest.spyOn(userRepository, 'createUser')
    .mockResolvedValue({
      id: '69a837094548684b3d64c9aa',
      firstName: 'Test',
      lastName: 'User',
      email: 'testUser@extrahorizon.com',
      phoneNumber: '0000000000',
      language: 'EN',
      activation: false,
      timeZone: 'Europe/Brussels',
      updateTimestamp: new Date(),
      creationTimestamp: new Date(),
      roles: [],
    });

  const findGlobalRoleByNameSpy = jest.spyOn(userRepository, 'findGlobalRoleByName')
    .mockResolvedValue(undefined);

  const createGlobalRoleSpy = jest.spyOn(userRepository, 'createGlobalRole')
    .mockResolvedValue({
      id: '6853c7e0fad1584e3a11287d',
      name: 'testRole',
      description: 'A created test role',
      permissions: [],
      updateTimestamp: new Date(),
      creationTimestamp: new Date(),
    });

  const addPermissionsToGlobalRoleSpy = jest.spyOn(userRepository, 'addPermissionsToGlobalRole')
    .mockResolvedValue({ affectedRecords: 1 });

  const addGlobalRoleToUserSpy = jest.spyOn(userRepository, 'addGlobalRoleToUser')
    .mockResolvedValue({ affectedRecords: 1 });

  const updateVerificationSettingsSpy = jest.spyOn(userRepository, 'updateVerificationSettings')
    .mockResolvedValue({
      enablePinCodeActivationRequests: true,
      enablePinCodeForgotPasswordRequests: true,
      limitHashActivationRequests: true,
      limitHashForgotPasswordRequests: true,
    });

  const updateEmailTemplatesSpy = jest.spyOn(userRepository, 'updateEmailTemplates')
    .mockResolvedValue({
      activationEmailTemplateId: '69a837094548684b3d64c9f1',
      reactivationEmailTemplateId: '69a837094548684b3d64c9f3',
      passwordResetEmailTemplateId: '69a837094548684b3d64c9f4',
      oidcUnlinkEmailTemplateId: '69a837094548684b3d64c9f5',
      oidcUnlinkPinEmailTemplateId: '69a837094548684b3d64c9f5',
      activationPinEmailTemplateId: '69a837094548684b3d64c9f1',
      reactivationPinEmailTemplateId: '69a837094548684b3d64c9f3',
      passwordResetPinEmailTemplateId: '69a837094548684b3d64c9f4',
    });

  const updatePasswordPolicySpy = jest.spyOn(userRepository, 'updatePasswordPolicy')
    .mockResolvedValue({
      minimumLength: 3,
      maximumLength: 18,
      upperCaseRequired: true,
      lowerCaseRequired: true,
      symbolRequired: true,
      numberRequired: true,
    });

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
