import { Schema } from '@extrahorizon/javascript-sdk';
import { handler } from '../../../../src/commands/data/schemas/verify';
import { spyOnConsole } from '../../../__helpers__/consoleSpy';
import { minimalSchema } from '../../../__helpers__/schemas';
import { createTempDirectoryManager } from '../../../__helpers__/tempDirectoryManager';

describe('exh data schemas verify', () => {
  const { expectConsoleLogToContain } = spyOnConsole();
  let tempDirectoryManager: Awaited<ReturnType<typeof createTempDirectoryManager>>;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(async () => {
    tempDirectoryManager = await createTempDirectoryManager();
    consoleLogSpy = jest.spyOn(console, 'log');
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await tempDirectoryManager.removeDirectory();
  });

  it('Verifies a valid schema', async () => {
    await expect(handler({
      file: './tests/__helpers__/schemas/fairlyComplete.json',
      dir: undefined,
      ignoreVerificationErrors: false,
    })).resolves.not.toThrow();

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Checking'));
  });

  it('Throws for unknown fields in the property configuration', async () => {
    const path = await tempDirectoryManager.createTempJsonFile({
      ...minimalSchema,
      properties: {
        example: {
          type: 'object',
          unknownField: 'unknown',
        },
      },
    });

    await expect(handler({
      file: path,
      dir: undefined,
      ignoreVerificationErrors: false,
    })).rejects.toThrow();

    expectConsoleLogToContain('unknownField');
  });

  // For https://github.com/ExtraHorizon/exh-cli/issues/137
  it('Allows transition conditions without a configuration field to be used', async () => {
    const path = await tempDirectoryManager.createTempJsonFile({
      ...minimalSchema,
      creationTransition: {
        type: 'manual',
        toStatus: 'new',
        conditions: [
          {
            type: 'initiatorHasRelationToGroupInData',
            groupIdField: 'groupId',
            relation: 'staff',
          },
        ],
      },
      properties: {
        groupId: { type: 'string' },
      },
    } as Partial<Schema>);

    await expect(handler({
      file: path,
      dir: undefined,
      ignoreVerificationErrors: false,
    })).resolves.not.toThrow();
  });

  // For https://github.com/ExtraHorizon/exh-cli/issues/137
  it('Allows the document condition to be used in automatic transitions', async () => {
    const path = await tempDirectoryManager.createTempJsonFile({
      ...minimalSchema,
      statuses: {
        new: {},
        multiUserEnabled: {},
      },
      transitions: [
        {
          type: 'automatic',
          name: 'trigger-task',
          fromStatuses: ['new'],
          toStatus: 'multiUserEnabled',
          conditions: [
            {
              type: 'document',
              configuration: {
                type: 'object',
                properties: {
                  userIds: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    minItems: 2,
                  },
                },
              },
            },
          ],
        },
      ],
    });

    await expect(handler({
      file: path,
      dir: undefined,
      ignoreVerificationErrors: false,
    })).resolves.not.toThrow();
  });
});
