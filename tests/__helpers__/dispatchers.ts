import { Dispatcher } from '@extrahorizon/javascript-sdk';
import { generateMailAction, generateTaskAction } from './actions';
import { randomHexString } from './utils';

export const generateDispatcher = (overrides?: Partial<Dispatcher>): Dispatcher => ({
  id: randomHexString(),
  name: `unique-${randomHexString()}-name`,
  description: 'A generated Dispatcher for testing',
  eventType: `unique-${randomHexString()}-event`,
  actions: [
    generateTaskAction(),
    generateMailAction(),
  ],
  tags: [randomHexString(), randomHexString(), 'EXH_CLI_MANAGED'],
  creationTimestamp: new Date(),
  updateTimestamp: new Date(),
  ...overrides,
});
