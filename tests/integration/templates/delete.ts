import { handler } from '../../../src/commands/templates/delete';
import { spyOnConsole } from '../../__helpers__/consoleSpy';
import { templateRepositoryMock, type TemplateRepositoryMock } from '../../__helpers__/templateRepositoryMock';
import { generateTemplate } from '../../__helpers__/templates';

describe('exh templates delete', () => {
  const { expectConsoleLogToContain } = spyOnConsole();
  const template = generateTemplate();
  let repositoryMock: TemplateRepositoryMock;

  beforeAll(() => {
    repositoryMock = templateRepositoryMock();
    repositoryMock.findByIdSpy.mockResolvedValue(template);
    repositoryMock.findByNameSpy.mockResolvedValue(template);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Deletes a template by id', async () => {
    await handler({ id: template.id });

    expect(repositoryMock.findByIdSpy).toHaveBeenCalledWith(template.id);
    expect(repositoryMock.removeSpy).toHaveBeenCalledWith(template.id);

    expectConsoleLogToContain('Template deleted');
  });

  it('Deletes a template by name', async () => {
    await handler({ name: template.name });

    expect(repositoryMock.findByNameSpy).toHaveBeenCalledWith(template.name);
    expect(repositoryMock.removeSpy).toHaveBeenCalledWith(template.id);

    expectConsoleLogToContain('Template deleted');
  });
});
