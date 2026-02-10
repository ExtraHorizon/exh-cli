import { handler } from '../../../../src/commands/data/schemas/sync';
import type { Transition } from '../../../../src/repositories/schemas';
import { schemaRepositoryMock, type SchemaRepositoryMock } from '../../../__helpers__/schemaRepositoryMock';
import { defaultSchemaReturnId, minimalSchema, validSchema } from '../../../__helpers__/schemas';
import { createTempDirectoryManager, type TempDirectoryManager } from '../../../__helpers__/tempDirectoryManager';

describe('exh data schemas sync', () => {
  let tempDirectoryManager: TempDirectoryManager;
  let repositoryMock: SchemaRepositoryMock;

  beforeEach(async () => {
    tempDirectoryManager = await createTempDirectoryManager();
    repositoryMock = schemaRepositoryMock();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await tempDirectoryManager.removeDirectory();
  });

  it('Creates a schema', async () => {
    const path = await tempDirectoryManager.createTempJsonFile(validSchema);

    await handler({
      file: path,
      dir: undefined,
      dry: false,
      ignoreVerificationErrors: false,
    });

    // Schema creation is called
    expect(repositoryMock.createSchemaSpy).toBeCalledTimes(1);

    // Property creation is called for every property
    expect(repositoryMock.createPropertySpy).toBeCalledTimes(Object.keys(validSchema.properties).length);
    Object.entries(validSchema.properties).forEach(([key, value]) => {
      expect(repositoryMock.createPropertySpy)
        .toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
          configuration: value,
          name: key,
        }));
    });

    // Transition creation is called for every transition
    expect(repositoryMock.createTransitionSpy).toBeCalledTimes(Object.keys(validSchema.transitions).length);
    validSchema.transitions.forEach((transition: Transition) => {
      expect(repositoryMock.createTransitionSpy)
        .toHaveBeenCalledWith(expect.any(String), transition);
    });

    // Status creation is called for every status
    expect(repositoryMock.createStatusSpy).toBeCalledTimes(Object.keys(validSchema.statuses).length);
    Object.entries(validSchema.statuses).forEach(([name, value]) => {
      expect(repositoryMock.createStatusSpy)
        .toHaveBeenCalledWith(expect.any(String), name, value);
    });
  });

  it('Updates a schema by adding the new property', async () => {
    repositoryMock.fetchSchemaByNameSpy.mockImplementationOnce(() => Promise.resolve({ id: 'anyid', ...validSchema }));

    const path = await tempDirectoryManager.createTempJsonFile({
      ...validSchema,
      properties: { ...validSchema.properties, newProp: { type: 'string' } },
    });

    await handler({
      file: path,
      dir: undefined,
      dry: false,
      ignoreVerificationErrors: false,
    });

    // Schema creation is not called
    expect(repositoryMock.createSchemaSpy).toBeCalledTimes(0);

    // Property creation is called for the new property
    expect(repositoryMock.createPropertySpy).toBeCalledTimes(1);
    expect(repositoryMock.createPropertySpy)
      .toHaveBeenCalledWith('anyid', expect.objectContaining({
        configuration: { type: 'string' },
        name: 'newProp',
      }));
  });

  it('Ignores the $schema property', async () => {
    const schemaConfiguration = {
      ...minimalSchema,
      $schema: 'https://swagger.extrahorizon.com/cli/1.11.1/configuration-files/Schema.json',
    };

    const path = await tempDirectoryManager.createTempJsonFile(schemaConfiguration);

    await expect(handler({
      file: path,
      dir: undefined,
      dry: false,
      ignoreVerificationErrors: false,
    })).resolves.not.toThrow();

    expect(repositoryMock.createSchemaSpy).toHaveBeenCalledWith(schemaConfiguration.name, schemaConfiguration.description);
    expect(repositoryMock.updateSchemaSpy).not.toHaveBeenCalled();
  });

  it('Ignores the description property in the creationTransition', async () => {
    const schemaConfiguration = {
      ...minimalSchema,
      creationTransition: {
        type: 'manual',
        toStatus: 'new',
        description: 'This is a transition description, which should be ignored',
        conditions: [
          {
            type: 'initiatorHasRelationToUserInData',
            description: 'This is a condition description, which should be ignored',
            relation: 'isStaffOfTargetPatient',
            userIdField: 'myUserId',
          },
        ],
        actions: [
          {
            type: 'task',
            description: 'This is an action description, which should be ignored',
            functionName: 'on-document-creation',
          },
        ],
      },
      properties: {
        myUserId: { type: 'string' },
      },
    };

    const path = await tempDirectoryManager.createTempJsonFile(schemaConfiguration);

    await expect(handler({
      file: path,
      dir: undefined,
      dry: false,
      ignoreVerificationErrors: false,
    })).resolves.not.toThrow();

    expect(repositoryMock.updateCreationTransitionSpy).toHaveBeenCalledWith(defaultSchemaReturnId, {
      type: 'manual',
      toStatus: 'new',
      // No description property
      conditions: [
        {
          type: 'initiatorHasRelationToUserInData',
          // No description property
          relation: 'isStaffOfTargetPatient',
          userIdField: 'myUserId',
        },
      ],
      actions: [
        {
          type: 'task',
          // No description property
          functionName: 'on-document-creation',
        },
      ],
    });
  });

  it('Ignores description properties in transitions', async () => {
    const schemaConfiguration = {
      ...minimalSchema,
      properties: {
        systolic: { type: 'number' },
      },
      transitions: [
        {
          type: 'manual',
          name: 'my-transition',
          description: 'This is a transition description, which should be ignored',
          fromStatuses: ['new'],
          toStatus: 'new',
          conditions: [
            {
              type: 'input',
              description: 'This is a condition description, which should be ignored',
              configuration: {
                type: 'object',
                properties: {
                  systolic: {
                    type: 'number',
                    description: 'This is a property description, which should be ignored',
                  },
                },
              },
            },
            {
              type: 'document',
              description: 'This is a condition description, which should be ignored',
              configuration: {
                type: 'object',
                properties: {
                  userIds: {
                    type: 'array',
                    description: 'This is a property description, which should be ignored',
                    items: {
                      type: 'string',
                      description: 'This is an item description, which should be ignored',
                    },
                  },
                },
              },
            },
          ],
          actions: [
            {
              type: 'task',
              description: 'This is an action description, which should be ignored',
              functionName: 'analyze-blood-pressure',
            },
            {
              type: 'linkCreator',
              description: 'This is an action description, which should be ignored',
            },
          ],
        },
      ],
    };

    const path = await tempDirectoryManager.createTempJsonFile(schemaConfiguration);

    await expect(handler({
      file: path,
      dir: undefined,
      dry: false,
      ignoreVerificationErrors: false,
    })).resolves.not.toThrow();

    expect(repositoryMock.createTransitionSpy).toHaveBeenCalledWith(defaultSchemaReturnId, {
      type: 'manual',
      name: 'my-transition',
      // No description property
      fromStatuses: ['new'],
      toStatus: 'new',
      conditions: [
        {
          type: 'input',
          // No description property
          configuration: {
            type: 'object',
            properties: {
              systolic: {
                type: 'number',
                // No description property
              },
            },
          },
        },
        {
          type: 'document',
          // No description property
          configuration: {
            type: 'object',
            properties: {
              userIds: {
                type: 'array',
                // No description property
                items: {
                  type: 'string',
                  // No description property
                },
              },
            },
          },
        },
      ],
      actions: [
        {
          type: 'task',
          // No description property
          functionName: 'analyze-blood-pressure',
        },
        {
          type: 'linkCreator',
          // No description property
        },
      ],
    });
  });

  it('Ignores description properties in property configurations', async () => {
    const schemaConfiguration = {
      ...minimalSchema,
      properties: {
        exampleString: {
          type: 'string',
          description: 'This is a string description, which should be ignored',
        },
        exampleArray: {
          type: 'array',
          description: 'This is an array description, which should be ignored',
          items: {
            type: 'string',
            description: 'This an item description, which should be ignored',
          },
        },
        exampleObject: {
          type: 'object',
          description: 'This is an object description, which should be ignored',
          properties: {
            exampleNumber: {
              type: 'number',
              description: 'This is child property description, which should be ignored',
            },
          },
        },
      },
    };

    const path = await tempDirectoryManager.createTempJsonFile(schemaConfiguration);

    await expect(handler({
      file: path,
      dir: undefined,
      dry: false,
      ignoreVerificationErrors: false,
    })).resolves.not.toThrow();

    expect(repositoryMock.createPropertySpy).toHaveBeenCalledWith(defaultSchemaReturnId, {
      name: 'exampleString',
      configuration: { type: 'string' },
    });

    expect(repositoryMock.createPropertySpy).toHaveBeenCalledWith(defaultSchemaReturnId, {
      name: 'exampleArray',
      configuration: {
        type: 'array',
        items: { type: 'string' },
      },
    });

    expect(repositoryMock.createPropertySpy).toHaveBeenCalledWith(defaultSchemaReturnId, {
      name: 'exampleObject',
      configuration: {
        type: 'object',
        properties: {
          exampleNumber: { type: 'number' },
        },
      },
    });
  });

  it('Ignores description properties in indexes', async () => {
    const schemaConfiguration = {
      ...minimalSchema,
      indexes: [
        {
          name: 'exampleIndex',
          description: 'This is an index description, which should be ignored',
          fields: [{
            name: 'data.exampleString',
            type: 'asc',
          }],
        },
      ],
    };

    const path = await tempDirectoryManager.createTempJsonFile(schemaConfiguration);

    await expect(handler({
      file: path,
      dir: undefined,
      dry: false,
      ignoreVerificationErrors: false,
    })).resolves.not.toThrow();

    expect(repositoryMock.createIndexSpy).toHaveBeenCalledWith(defaultSchemaReturnId, {
      name: 'exampleIndex',
      // No description property
      fields: [{
        name: 'data.exampleString',
        type: 'asc',
      }],
    });
  });
});
