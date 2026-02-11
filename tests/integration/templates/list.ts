import { handler } from '../../../src/commands/templates/list';
import { spyOnConsole } from '../../__helpers__/consoleSpy';
import { templateRepositoryMock, type TemplateRepositoryMock } from '../../__helpers__/templateRepositoryMock';
import { generateTemplate } from '../../__helpers__/templates';

describe('exh templates list', () => {
  const { expectConsoleLogToContain } = spyOnConsole();
  const templateA = generateTemplate();
  const templateB = generateTemplate();
  let repositoryMock: TemplateRepositoryMock;

  beforeAll(() => {
    repositoryMock = templateRepositoryMock();
    repositoryMock.findAllSpy.mockImplementation(async () => [templateA, templateB]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Lists templates', async () => {
    await handler({ isTTY: false });

    expectConsoleLogToContain(templateA, templateB);
  });

  it('Formats the output as a table when in a TTY environment', async () => {
    const consoleTableSpy = jest.spyOn(console, 'table').mockImplementation(() => { /* no-op */ });

    await handler({ isTTY: true });

    expect(consoleTableSpy).toHaveBeenCalledWith([
      {
        Id: templateA.id,
        Name: templateA.name,
        Description: templateA.description,
        'Last updated': templateA.updateTimestamp.toISOString(),
      },
      {
        Id: templateB.id,
        Name: templateB.name,
        Description: templateB.description,
        'Last updated': templateB.updateTimestamp.toISOString(),
      },
    ]);
  });

  it('Prints a message when no templates are found', async () => {
    repositoryMock.findAllSpy.mockImplementationOnce(async () => []);

    await handler({ isTTY: false });

    expectConsoleLogToContain('No templates found');
  });
});
