import { ActionType, MailAction, MailActionCreation, TaskAction, TaskActionCreation } from '@extrahorizon/javascript-sdk';
import { randomHexString } from './utils';

export const generateTaskActionCreation = (): TaskActionCreation => ({
  type: ActionType.TASK,
  name: `unique-${randomHexString()}-name`,
  description: 'A task action created for testing purposes',
  functionName: `function-${randomHexString()}-name`,
  data: { key: 'value' },
  tags: [randomHexString(), randomHexString()],
  startTimestamp: new Date(),
});

export const generateMailActionCreation = (): MailActionCreation => ({
  type: ActionType.MAIL,
  name: `unique-${randomHexString()}-name`,
  description: 'A mail action created for testing purposes',
  recipients: {
    to: [`${randomHexString()}@extrahorizon.com`],
  },
  templateId: `${randomHexString(12)}`,
});

export const generateTaskAction = (overrides?: Partial<TaskAction>): TaskAction => ({
  ...generateTaskActionCreation(),
  id: randomHexString(12),
  startTimestamp: new Date(),
  ...overrides,
});

export const generateMailAction = (overrides?: Partial<MailAction>): MailAction => ({
  ...generateMailActionCreation(),
  id: randomHexString(12),
  ...overrides,
});
