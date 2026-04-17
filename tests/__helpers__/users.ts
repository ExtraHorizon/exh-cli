import { EmailTemplates, PasswordPolicy, UserData, VerificationSettings } from '@extrahorizon/javascript-sdk';
import { generateId } from './utils';

export const generateFunctionUser = (functionName: string): UserData => ({
  id: generateId(),
  firstName: `${functionName}`,
  lastName: 'exh.tasks',
  email: `exh.tasks+${functionName}@extrahorizon.com`,
  phoneNumber: '0000000000',
  language: 'EN',
  activation: false,
  timeZone: 'Europe/Brussels',
  updateTimestamp: new Date(),
  creationTimestamp: new Date(),
  roles: [],
});

export const generateFunctionGlobalRole = (functionName: string, permissions: string []) => ({
  id: '6853c7e0fad1584e3a11287d',
  name: `exh.tasks.${functionName}`,
  description: `A role created by the CLI for the execution of the task ${functionName}`,
  permissions: permissions.map(permission => ({ name: permission, description: permission })),
  updateTimestamp: new Date(),
  creationTimestamp: new Date(),
});

export const generateTestUser = (): UserData => ({
  id: generateId(),
  firstName: 'Test',
  lastName: 'User',
  email: 'test_user@extrahorizon.com',
  phoneNumber: '0000000000',
  language: 'EN',
  activation: false,
  timeZone: 'Europe/Brussels',
  updateTimestamp: new Date(),
  creationTimestamp: new Date(),
  roles: [],
});

export const generateTestGlobalRole = () => ({
  id: generateId(),
  name: 'testRole',
  description: 'A test role created for testing purposes',
  permissions: [],
  updateTimestamp: new Date(),
  creationTimestamp: new Date(),
});

export const generateVerificationSettings = (): VerificationSettings => ({
  enablePinCodeActivationRequests: true,
  enablePinCodeForgotPasswordRequests: true,
  limitHashActivationRequests: true,
  limitHashForgotPasswordRequests: true,
});

export const generateEmailTemplates = (): Partial<EmailTemplates> => ({
  activationEmailTemplateName: 'activationEmailTemplateName',
  reactivationEmailTemplateName: 'reactivationEmailTemplateName',
  passwordResetEmailTemplateName: 'passwordResetEmailTemplateName',
  oidcUnlinkEmailTemplateName: 'oidcUnlinkEmailTemplateName',
  oidcUnlinkPinEmailTemplateName: 'oidcUnlinkPinEmailTemplateName',
  activationPinEmailTemplateName: 'activationPinEmailTemplateName',
  reactivationPinEmailTemplateName: 'reactivationPinEmailTemplateName',
  passwordResetPinEmailTemplateName: 'passwordResetPinEmailTemplateName',
});

export const generatePasswordPolicy = (): PasswordPolicy => ({
  minimumLength: 3,
  maximumLength: 18,
  upperCaseRequired: true,
  lowerCaseRequired: true,
  symbolRequired: true,
  numberRequired: true,
});
