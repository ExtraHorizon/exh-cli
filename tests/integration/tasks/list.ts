import { handler } from '../../../src/commands/tasks/list';
import { spyOnConsole } from '../../__helpers__/consoleSpy';
import { functionRepositoryMock, type FunctionRepositoryMock } from '../../__helpers__/functionRepositoryMock';

describe('exh tasks list', () => {
  const { expectConsoleLogToContain } = spyOnConsole();
  const functionA = { name: 'FunctionA', description: 'My function A', updateTimestamp: new Date() };
  const functionB = { name: 'FunctionB', description: 'My function B', updateTimestamp: new Date() };
  let repositoryMock: FunctionRepositoryMock;

  beforeAll(() => {
    repositoryMock = functionRepositoryMock();
    repositoryMock.findSpy.mockResolvedValue([functionA, functionB]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Lists functions', async () => {
    await handler({ isTTY: false });

    expectConsoleLogToContain(functionA.name, functionB.name);
  });

  it('Formats the output as a table when in a TTY environment', async () => {
    const consoleTableSpy = jest.spyOn(console, 'table').mockImplementation(() => { /* no-op */ });

    await handler({ isTTY: true });

    expect(consoleTableSpy).toHaveBeenCalledWith([{
      Name: functionA.name,
      Description: functionA.description,
      'Last updated': functionA.updateTimestamp.toISOString(),
    }, {
      Name: functionB.name,
      Description: functionB.description,
      'Last updated': functionB.updateTimestamp.toISOString(),
    }]);
  });
});
