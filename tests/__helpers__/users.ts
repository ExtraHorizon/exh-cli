import { Permission } from '@extrahorizon/javascript-sdk';
import { v4 as uuidv4 } from 'uuid';
import { generateId } from './utils';

export const generateFunctionUser = (functionName: string) => ({
  id: generateId(),
  firstName: `${functionName}`,
  lastName: 'exh.tasks',
  email: `exh.tasks+${functionName}@extrahorizon.com`,
  password: `0Oo-${uuidv4()}`,
  phoneNumber: '0000000000',
  language: 'EN',
  activation: false,
  timeZone: 'Europe/Brussels',
  updateTimestamp: new Date(),
  creationTimestamp: new Date(),
});

export const generateFunctionGlobalRole = (functionName: string, permissions: Permission []) => ({
  id: '6853c7e0fad1584e3a11287d',
  name: `exh.tasks.${functionName}`,
  description: `A role created by the CLI for the execution of the task ${functionName}`,
  permissions,
  updateTimestamp: new Date(),
  creationTimestamp: new Date(),
});
