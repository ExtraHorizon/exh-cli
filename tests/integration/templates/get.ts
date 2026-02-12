import { handler } from '../../../src/commands/templates/get';
import { spyOnConsole } from '../../__helpers__/consoleSpy';
import { templateRepositoryMock, type TemplateRepositoryMock } from '../../__helpers__/templateRepositoryMock';
import { generateTemplate } from '../../__helpers__/templates';

describe('exh templates get', () => {
  const { expectConsoleLogToContain } = spyOnConsole();
  const template = generateTemplate();
  let repositoryMock: TemplateRepositoryMock;

  beforeAll(() => {
    repositoryMock = templateRepositoryMock();
    repositoryMock.findByNameSpy.mockResolvedValue(template);
    repositoryMock.findByIdSpy.mockResolvedValue(template);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Fetches a template by name', async () => {
    await handler({ name: 'TemplateA' });

    expect(repositoryMock.findByNameSpy).toHaveBeenCalledWith('TemplateA');
    expectConsoleLogToContain(JSON.stringify(template, null, 4));
  });

  it('Fetches a template by ID', async () => {
    await handler({ id: 'template-id' });

    expect(repositoryMock.findByIdSpy).toHaveBeenCalledWith('template-id');
    expectConsoleLogToContain(JSON.stringify(template, null, 4));
  });
});
