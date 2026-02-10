import { handler } from '../../../src/commands/templates/delete';
import { spyOnConsole } from '../../__helpers__/consoleSpy';
import { templateRepositoryMock, type TemplateRepositoryMock } from '../../__helpers__/templateRepositoryMock';
import { minimalTemplate } from '../../__helpers__/templates';

describe('exh templates delete', () => {
  const { expectConsoleLogToContain } = spyOnConsole();
  let repositoryMock: TemplateRepositoryMock;

  beforeAll(() => {
    repositoryMock = templateRepositoryMock();
    repositoryMock.findByIdSpy.mockImplementation(async () => minimalTemplate);
    repositoryMock.findByNameSpy.mockImplementation(async () => minimalTemplate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Deletes a template by id', async () => {
    await handler({ id: minimalTemplate.id });

    expect(repositoryMock.findByIdSpy).toHaveBeenCalledWith(minimalTemplate.id);
    expect(repositoryMock.removeSpy).toHaveBeenCalledWith(minimalTemplate.id);

    expectConsoleLogToContain('Template deleted');
  });

  it('Deletes a template by name', async () => {
    await handler({ name: minimalTemplate.name });

    expect(repositoryMock.findByNameSpy).toHaveBeenCalledWith(minimalTemplate.name);
    expect(repositoryMock.removeSpy).toHaveBeenCalledWith(minimalTemplate.id);

    expectConsoleLogToContain('Template deleted');
  });
});
