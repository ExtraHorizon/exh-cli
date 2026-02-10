import { handler } from '../../../../src/commands/data/schemas/list';
import { spyOnConsole } from '../../../__helpers__/consoleSpy';
import { schemaRepositoryMock, type SchemaRepositoryMock } from '../../../__helpers__/schemaRepositoryMock';
import { createEmptySchema } from '../../../__helpers__/schemas';

describe('exh data schemas list', () => {
  const { expectConsoleLogToContain } = spyOnConsole();
  let repositoryMock: SchemaRepositoryMock;
  const schemaA = createEmptySchema('TestSchemaA', 'A schema for testing');
  const schemaB = createEmptySchema('TestSchemaB', 'Another schema for testing');

  beforeAll(() => {
    repositoryMock = schemaRepositoryMock();
    repositoryMock.fetchAllSpy.mockImplementation(async () => [schemaA, schemaB]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Lists schemas', async () => {
    await handler({ isTTY: false });

    expectConsoleLogToContain(schemaA.id, schemaA.name);
    expectConsoleLogToContain(schemaB.id, schemaB.name);
  });

  it('Formats the output as a table when in a TTY environment', async () => {
    const consoleTableSpy = jest.spyOn(console, 'table').mockImplementation(() => { /* no-op */ });

    await handler({ isTTY: true });

    expect(consoleTableSpy).toHaveBeenCalledWith([{
      Id: schemaA.id,
      Name: schemaA.name,
      Description: schemaA.description,
    }, {
      Id: schemaB.id,
      Name: schemaB.name,
      Description: schemaB.description,
    }]);
  });
});
