import { ServiceNotFoundError } from '@extrahorizon/javascript-sdk';
import { handler } from '../../../src/commands/templates/list';
import { spyOnConsole } from '../../__helpers__/consoleSpy';
import { templateRepositoryMock, type TemplateRepositoryMock } from '../../__helpers__/templateRepositoryMock';
import { generateTemplate, generateTemplateV2 } from '../../__helpers__/templates';
import { templateV2RepositoryMock, type TemplateV2RepositoryMock } from '../../__helpers__/templateV2RepositoryMock';

describe('exh templates list', () => {
  const { expectConsoleLogToContain } = spyOnConsole();
  const templateV1 = generateTemplate();
  const templateV2 = generateTemplateV2();
  let repositoryMockV1: TemplateRepositoryMock;
  let repositoryMockV2: TemplateV2RepositoryMock;

  beforeAll(() => {
    repositoryMockV1 = templateRepositoryMock();
    repositoryMockV1.findAllSpy.mockResolvedValue([templateV1]);
    repositoryMockV2 = templateV2RepositoryMock();
    repositoryMockV2.findAllSpy.mockResolvedValue([templateV2]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Lists templates', async () => {
    await handler({ isTTY: false });

    expectConsoleLogToContain(templateV1, templateV2);
  });

  it('Formats the output as a table when in a TTY environment', async () => {
    const consoleTableSpy = jest.spyOn(console, 'table').mockImplementation(() => { /* no-op */ });

    await handler({ isTTY: true });

    expect(consoleTableSpy).toHaveBeenCalledWith([
      {
        Id: templateV1.id,
        Name: templateV1.name,
        Description: templateV1.description,
        'Last updated': templateV1.updateTimestamp.toISOString(),
      },
      {
        Id: templateV2.id,
        Name: templateV2.name,
        Description: templateV2.description,
        'Last updated': templateV2.updateTimestamp.toISOString(),
      },
    ]);
  });

  it('Prints a message when no templates are found', async () => {
    repositoryMockV1.findAllSpy.mockResolvedValueOnce([]);
    repositoryMockV2.findAllSpy.mockResolvedValueOnce([]);

    await handler({ isTTY: false });

    expectConsoleLogToContain('No templates found');
  });

  it('Ignore the ServiceNotFoundError for template service V1 or V2', async () => {
    const serviceNotFoundError = new ServiceNotFoundError({ name: '', message: '' });

    // V1 not found
    repositoryMockV1.findAllSpy.mockRejectedValueOnce(serviceNotFoundError);
    await handler({ isTTY: false });
    expectConsoleLogToContain(templateV2);

    // V2 not found
    repositoryMockV2.findAllSpy.mockRejectedValueOnce(serviceNotFoundError);
    await handler({ isTTY: false });
    expectConsoleLogToContain(templateV1);

    // Both not found
    repositoryMockV1.findAllSpy.mockRejectedValueOnce(serviceNotFoundError);
    repositoryMockV2.findAllSpy.mockRejectedValueOnce(serviceNotFoundError);
    await handler({ isTTY: false });
    expectConsoleLogToContain('No templates found');
  });
});
