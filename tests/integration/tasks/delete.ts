import { handler } from '../../../src/commands/tasks/delete';
import { spyOnConsole } from '../../__helpers__/consoleSpy';
import { functionRepositoryMock } from '../../__helpers__/functionRepositoryMock';

describe('exh tasks delete', () => {
  const { expectConsoleLogToContain } = spyOnConsole();

  afterAll(async () => {
    jest.clearAllMocks();
  });

  it('Deletes a Function', async () => {
    const repositoryMock = functionRepositoryMock();

    await handler({ name: repositoryMock.functionConfig.name });

    expect(repositoryMock.removeSpy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.removeSpy).toHaveBeenCalledWith(repositoryMock.functionConfig.name);

    expectConsoleLogToContain('Successfully deleted task', repositoryMock.functionConfig.name);
  });
});
