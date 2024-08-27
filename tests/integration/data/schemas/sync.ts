import { handler } from '../../../../src/commands/data/schemas/sync';
import { spyOnConsole } from '../../../__helpers__/logSpy';
import { schemaRepositoryMock } from '../../../__helpers__/schemaRepositoryMock';
import { minimalSchema, validSchema } from '../../../__helpers__/schemas';
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

  describe('Check if the schema has an array of objects with an id property', () => {
    const { expectLogToContain } = spyOnConsole();

    it('Throws for an array of objects with an id property', async () => {
      const path = await tempDirectoryManager.createTempJsonFile({
        ...minimalSchema,
        properties: {
          example: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' }, // Not allowed to be named `id`
              },
            },
          },
        },
      });

      await expect(
        handler({
          sdk: undefined,
          file: path,
          dir: undefined,
          dry: false,
          ignoreVerificationErrors: false,
        })
      ).rejects.toThrow();

      expectLogToContain('The following id property is not allowed: example.items.properties.id');
    });

    it('Traverses additionalProperties in an object', async () => {
      const path = await tempDirectoryManager.createTempJsonFile({
        ...minimalSchema,
        properties: {
          deeper: {
            type: 'object',
            additionalProperties: { // Special case required to traverse this
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' }, // Not allowed to be named `id`
                },
              },
            },
          },
        },
      });

      await expect(
        handler({
          sdk: undefined,
          file: path,
          dir: undefined,
          dry: false,
          ignoreVerificationErrors: false,
        })
      ).rejects.toThrow();

      expectLogToContain('The following id property is not allowed: deeper.additionalProperties.items.properties.id');
    });

    it('Traverses additionProperties in an object array', async () => {
      const path = await tempDirectoryManager.createTempJsonFile({
        ...minimalSchema,
        properties: {
          list: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: { // Special case required to traverse this
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' }, // Not allowed to be named `id`
                  },
                },
              },
            },
          },
        },
      });

      await expect(
        handler({
          sdk: undefined,
          file: path,
          dir: undefined,
          dry: false,
          ignoreVerificationErrors: false,
        })
      ).rejects.toThrow();

      expectLogToContain('The following id property is not allowed: list.items.additionalProperties.items.properties.id');
    });

    it('Supports having an object within an array with only its additionProperties set', async () => {
      const path = await tempDirectoryManager.createTempJsonFile({
        ...minimalSchema,
        properties: {
          example: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: { type: 'string' },
              // No `properties` key to traverse for the "array of objects with id" check
            },
          },
        },
      });

      await handler({
        sdk: undefined,
        file: path,
        dir: undefined,
        dry: false,
        ignoreVerificationErrors: false,
      });
    });
  });
});
