import { FunctionPermissionMode, type FunctionDetails } from '@extrahorizon/javascript-sdk';
import { generateId } from './utils';

export const functionConfig = {
  name: `Test-Function-${generateId()}`,
  description: `Test-Function-Description-${generateId()}`,
  path: './',
  entryPoint: 'index.handler',
  runtime: 'nodejs16.x',
  timeLimit: 30,
  memoryLimit: 128,
  environment: {
    test: 'true',
  } as Record<string, string>,
};

export const generateFunction = (config: typeof functionConfig): FunctionDetails => (
  {
    description: config.description || `Test-Function-Description-${generateId()}`,
    name: config.name || `Test-Function-${generateId()}`,
    enabled: true,
    entryPoint: 'index.handler',
    runtime: 'nodejs18.x',
    timeLimit: 60,
    memoryLimit: 256,
    environmentVariables: {
      test: { value: 'true' },
    } as Record<string, { value: string; }>,
    executionOptions: {
      permissionMode: FunctionPermissionMode.PERMISSION_REQUIRED,
    },
    retryPolicy: {
      enabled: false,
      errorsToRetry: [
        'CONNECTION_ERROR',
        'DATABASE_ERROR',
      ],
    },
    updateTimestamp: new Date('2024-01-23T13:59:02.554Z'),
  });

export const functionCode = 'exports.handler = async () => { console.log(\'Hello World!\'); };';
