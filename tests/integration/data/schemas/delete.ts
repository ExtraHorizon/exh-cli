import { green, red } from 'chalk';
import { handler } from '../../../../src/commands/data/schemas/delete';
import { spyOnConsole } from '../../../__helpers__/consoleSpy';
import { schemaRepositoryMock, type SchemaRepositoryMock } from '../../../__helpers__/schemaRepositoryMock';

describe('exh data schemas delete', () => {
  const { expectConsoleLogToContain } = spyOnConsole();
  let repositoryMock: SchemaRepositoryMock;

  beforeAll(() => {
    repositoryMock = schemaRepositoryMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Deletes a schema', async () => {
    await handler({ id: 'validSchemaId' });

    expect(repositoryMock.removeSchemaSpy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.disableSchemaSpy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.removeSchemaSpy).toHaveBeenCalledWith('validSchemaId');

    expectConsoleLogToContain(green('Successfully deleted schema validSchemaId'));
  });

  it('Throws on a non-existing schema', async () => {
    repositoryMock.disableSchemaSpy.mockResolvedValue({ affectedRecords: 0 });

    await handler({ id: 'InvalidSchemaId' });

    expectConsoleLogToContain(red('Failed to delete schema InvalidSchemaId'));
  });
});
