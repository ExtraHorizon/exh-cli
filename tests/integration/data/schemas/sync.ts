import { handler } from '../../../../src/commands/data/schemas/sync';
import { schemaRepositoryMock } from '../../../__helpers__/schemaRepositoryMock';
import { defaultSchemaReturnId, minimalSchema, validSchema } from '../../../__helpers__/schemas';
import { createTempDirectoryManager } from '../../../__helpers__/tempDirectoryManager';

describe('exh data schemas sync', () => {
  let tempDirectoryManager: Awaited<ReturnType<typeof createTempDirectoryManager>>;
  let repositoryMock: ReturnType<typeof schemaRepositoryMock>;

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
      sdk: undefined,
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
        .toHaveBeenCalledWith(undefined, expect.any(String), expect.objectContaining({
          configuration: value,
          name: key,
        }));
    });

    // Transition creation is called for every transition
    expect(repositoryMock.createTransitionSpy).toBeCalledTimes(Object.keys(validSchema.transitions).length);
    validSchema.transitions.forEach(transition => {
      expect(repositoryMock.createTransitionSpy)
        .toHaveBeenCalledWith(undefined, expect.any(String), transition);
    });

    // Status creation is called for every status
    expect(repositoryMock.createStatusSpy).toBeCalledTimes(Object.keys(validSchema.statuses).length);
    Object.entries(validSchema.statuses).forEach(([name, value]) => {
      expect(repositoryMock.createStatusSpy)
        .toHaveBeenCalledWith(undefined, expect.any(String), name, value);
    });
  });

  it('Updates a schema by adding the new property', async () => {
    repositoryMock.fetchSchemaByNameSpy.mockImplementationOnce(() => Promise.resolve({ id: 'anyid', ...validSchema }));

    const path = await tempDirectoryManager.createTempJsonFile({
      ...validSchema,
      properties: { ...validSchema.properties, newProp: { type: 'string' } },
    });

    await handler({
      sdk: undefined,
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
      .toHaveBeenCalledWith(undefined, 'anyid', expect.objectContaining({
        configuration: { type: 'string' },
        name: 'newProp',
      }));
  });

  it('Ignores the $schema property', async () => {
    const schemaConfiguration = {
      ...minimalSchema,
      $schema: 'https://swagger.extrahorizon.com/cli/1.7.0/configuration-files/Schema.json',
    };

    const path = await tempDirectoryManager.createTempJsonFile(schemaConfiguration);

    await expect(handler({
      sdk: undefined,
      file: path,
      dir: undefined,
      dry: false,
      ignoreVerificationErrors: false,
    })).resolves.not.toThrow();

    expect(repositoryMock.createSchemaSpy).toHaveBeenCalledWith(undefined, schemaConfiguration.name, schemaConfiguration.description);
    expect(repositoryMock.updateSchemaSpy).not.toHaveBeenCalled();
  });

  it('Ignores the description property in the creationTransition', async () => {
    const schemaConfiguration = {
      ...minimalSchema,
      creationTransition: {
        type: 'manual',
        toStatus: 'new',
        description: 'This is a transition description, which should be ignored',
      },
    };

    const path = await tempDirectoryManager.createTempJsonFile(schemaConfiguration);

    await expect(handler({
      sdk: undefined,
      file: path,
      dir: undefined,
      dry: false,
      ignoreVerificationErrors: false,
    })).resolves.not.toThrow();

    expect(repositoryMock.updateCreationTransitionSpy).toHaveBeenCalledWith(undefined, defaultSchemaReturnId, {
      type: 'manual',
      toStatus: 'new',
      // No description property
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
      sdk: undefined,
      file: path,
      dir: undefined,
      dry: false,
      ignoreVerificationErrors: false,
    })).resolves.not.toThrow();

    expect(repositoryMock.createTransitionSpy).toHaveBeenCalledWith(undefined, defaultSchemaReturnId, {
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
      sdk: undefined,
      file: path,
      dir: undefined,
      dry: false,
      ignoreVerificationErrors: false,
    })).resolves.not.toThrow();

    expect(repositoryMock.createPropertySpy).toHaveBeenCalledWith(undefined, defaultSchemaReturnId, {
      name: 'exampleString',
      configuration: { type: 'string' },
    });

    expect(repositoryMock.createPropertySpy).toHaveBeenCalledWith(undefined, defaultSchemaReturnId, {
      name: 'exampleArray',
      configuration: {
        type: 'array',
        items: { type: 'string' },
      },
    });

    expect(repositoryMock.createPropertySpy).toHaveBeenCalledWith(undefined, defaultSchemaReturnId, {
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
      sdk: undefined,
      file: path,
      dir: undefined,
      dry: false,
      ignoreVerificationErrors: false,
    })).resolves.not.toThrow();

    expect(repositoryMock.createIndexSpy).toHaveBeenCalledWith(undefined, defaultSchemaReturnId, {
      name: 'exampleIndex',
      // No description property
      fields: [{
        name: 'data.exampleString',
        type: 'asc',
      }],
    });
  });
});
