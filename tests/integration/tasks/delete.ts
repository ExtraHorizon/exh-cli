import * as chalk from 'chalk';
import { handler } from '../../../src/commands/tasks/delete';
import { functionRepositoryMock } from '../../__helpers__/functionRepositoryMock';

describe('exh tasks delete', () => {
  afterAll(async () => {
    jest.clearAllMocks();
  });

  it('Deletes a Function', async () => {
    const repositoryMock = functionRepositoryMock();
    const logSpy = jest.spyOn(global.console, 'log');

    await handler({ sdk: null, name: repositoryMock.functionConfig.name });

    expect(repositoryMock.removeSpy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.removeSpy).toHaveBeenCalledWith(null, repositoryMock.functionConfig.name);

    expect(logSpy).toHaveBeenCalledWith(chalk.green('Successfully deleted task', repositoryMock.functionConfig.name));
  });
});
