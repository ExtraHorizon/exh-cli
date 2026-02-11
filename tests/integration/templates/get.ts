import { handler } from '../../../src/commands/templates/get';
import { spyOnConsole } from '../../__helpers__/consoleSpy';
import { templateRepositoryMock, type TemplateRepositoryMock } from '../../__helpers__/templateRepositoryMock';
import { minimalTemplate } from '../../__helpers__/templates';

describe('exh templates get', () => {
  const { expectConsoleLogToContain } = spyOnConsole();
  let repositoryMock: TemplateRepositoryMock;

  beforeAll(() => {
    repositoryMock = templateRepositoryMock();
    repositoryMock.findByNameSpy.mockImplementation(async () => minimalTemplate);
    repositoryMock.findByIdSpy.mockImplementation(async () => minimalTemplate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Fetches a template by name', async () => {
    await handler({ name: 'TemplateA' });

    expect(repositoryMock.findByNameSpy).toHaveBeenCalledWith('TemplateA');
    expectConsoleLogToContain(JSON.stringify(minimalTemplate, null, 4));
  });

  it('Fetches a template by ID', async () => {
    await handler({ id: 'template-id' });

    expect(repositoryMock.findByIdSpy).toHaveBeenCalledWith('template-id');
    expectConsoleLogToContain(JSON.stringify(minimalTemplate, null, 4));
  });
});
