import { UserData } from '@extrahorizon/javascript-sdk';
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
