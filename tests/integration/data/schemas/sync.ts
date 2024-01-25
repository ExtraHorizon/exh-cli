import { handler } from '../../../../src/commands/data/schemas/sync';
import { schemaRepositoryMock } from '../../../__helpers__/schemaRepositoryMock';
import { validSchema } from '../../../__helpers__/schemas';
import { createTempDirectoryManager } from '../../../__helpers__/tempDirectoryManager';

describe('exh data schemas sync', () => {
  let tempDirectoryManager;
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
    Object.keys(validSchema.properties).forEach((key: string) => {
      expect(repositoryMock.createPropertySpy)
        .toHaveBeenCalledWith(undefined, expect.any(String), expect.objectContaining({
          configuration: expect.any(Object),
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
    Object.keys(validSchema.statuses).forEach(name => {
      expect(repositoryMock.createStatusSpy)
        .toHaveBeenCalledWith(undefined, expect.any(String), name, expect.any(Object));
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
      .toHaveBeenCalledWith(undefined, expect.any(String), expect.objectContaining({
        configuration: expect.any(Object),
        name: 'newProp',
      }));
  });
});
