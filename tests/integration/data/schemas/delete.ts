import { green, red } from 'chalk';
import { handler } from '../../../../src/commands/data/schemas/delete';
import { schemaRepositoryMock, type SchemaRepositoryMock } from '../../../__helpers__/schemaRepositoryMock';

describe('exh data schemas delete', () => {
  let repositoryMock: SchemaRepositoryMock;

  beforeAll(() => {
    repositoryMock = schemaRepositoryMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Deletes a schema', async () => {
    const logSpy = jest.spyOn(global.console, 'log');
    await handler({ id: 'validSchemaId' });

    expect(repositoryMock.removeSchemaSpy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.disableSchemaSpy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.removeSchemaSpy).toHaveBeenCalledWith('validSchemaId');

    expect(logSpy).toHaveBeenCalledWith(green('Successfully deleted schema validSchemaId'));
  });

  it('Throws on a non-existing schema', async () => {
    const logSpy = jest.spyOn(global.console, 'log');
    repositoryMock.disableSchemaSpy.mockImplementationOnce(async () => ({ affectedRecords: 0 }));

    await handler({ id: 'InvalidSchemaId' });

    expect(logSpy).toHaveBeenCalledWith(red('Failed to delete schema InvalidSchemaId'));
  });
});
