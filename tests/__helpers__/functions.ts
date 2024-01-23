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
  },
};

export const generateFunction = (config: typeof functionConfig) => (
  {
    description: config.description,
    name: config.name,
    enabled: true,
    entryPoint: 'index.handler',
    runtime: 'nodejs18.x',
    timeLimit: 60,
    memoryLimit: 256,
    environmentVariables: config.environment,
    executionOptions: {
      permissionMode: 'permissionRequired',
    },
    retryPolicy: {
      enabled: false,
      errorsToRetry: [
        'CONNECTION_ERROR',
        'DATABASE_ERROR',
      ],
    },
    updateTimestamp: '2024-01-23T13:59:02.554Z',

  });

export const functionCode = 'exports.handler = async () => { console.log(\'Hello World!\'); };';
