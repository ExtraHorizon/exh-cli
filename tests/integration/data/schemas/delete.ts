import { green, red } from 'chalk';
import { handler } from '../../../../src/commands/data/schemas/delete';
import { schemaRepositoryMock } from '../../../__helpers__/schemaRepositoryMock';

describe('exh data schemas delete', () => {
  let repositoryMock;
  beforeAll(() => {
    repositoryMock = schemaRepositoryMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Deletes a schema', async () => {
    const logSpy = jest.spyOn(global.console, 'log');
    await handler({ sdk: undefined, id: 'validSchemaId' });

    expect(repositoryMock.removeSchemaSpy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.disableSchemaSpy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.removeSchemaSpy).toHaveBeenCalledWith(
      undefined,
      'validSchemaId'
    );

    expect(logSpy).toHaveBeenCalledWith(green('Successfully deleted schema validSchemaId'));
  });

  it('Throws on a non-existing schema', async () => {
    const logSpy = jest.spyOn(global.console, 'log');
    repositoryMock.disableSchemaSpy.mockImplementationOnce(() => ({ affectedRecords: 0 }));

    await handler({ sdk: undefined, id: 'InvalidSchemaId' });

    expect(logSpy).toHaveBeenCalledWith(red('Failed to delete schema InvalidSchemaId'));
  });
});
