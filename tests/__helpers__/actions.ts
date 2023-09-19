import { randomHexString } from './utils';

export const generateTaskActionCreation = () => ({
  type: 'task',
  name: `unique-${randomHexString()}-name`,
  description: 'A task action created for testing purposes',
  functionName: `function-${randomHexString()}-name`,
  data: { key: 'value' },
  tags: [randomHexString(), randomHexString()],
  startTimestamp: new Date(),
});

export const generateMailActionCreation = () => ({
  type: 'mail',
  name: `unique-${randomHexString()}-name`,
  description: 'A mail action created for testing purposes',
  recipients: {
    to: [`${randomHexString()}@extrahorizon.com`],
  },
  templateId: `${randomHexString(12)}`,
});

export const generateTaskAction = (overrides?: any) => ({
  ...generateTaskActionCreation(),
  id: randomHexString(12),
  startTimestamp: new Date(),
  ...overrides,
});

export const generateMailAction = (overrides?: any) => ({
  ...generateMailActionCreation(),
  id: randomHexString(12),
  ...overrides,
});
