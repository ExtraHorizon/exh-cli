import { handler } from '../../../src/commands/templates/sync';
import { spyOnConsole } from '../../__helpers__/consoleSpy';
import { createTempDirectoryManager, type TempDirectoryManager } from '../../__helpers__/tempDirectoryManager';
import { templateRepositoryMock, type TemplateRepositoryMock } from '../../__helpers__/templateRepositoryMock';

describe('exh templates sync', () => {
  const { expectConsoleLogToContain } = spyOnConsole();
  let repositoryMock: TemplateRepositoryMock;
  let tempDir: TempDirectoryManager;

  const minimalConfig = {
    description: 'A simple template',
    schema: {
      type: 'object',
      fields: {
        field1: { type: 'string' },
      },
    },
    fields: {
      message: 'A simple template',
    },
  };

  beforeEach(async () => {
    repositoryMock = templateRepositoryMock();
    tempDir = await createTempDirectoryManager();
  });

  afterEach(async () => {
    await tempDir.removeDirectory();
    jest.clearAllMocks();
  });

  it('Creates a template based on a file', async () => {
    const filePath = await tempDir.createJsonFile('myTemplate', minimalConfig);

    await handler({ template: filePath });

    expectConsoleLogToContain('Creating', 'myTemplate');
    expect(repositoryMock.createSpy).toHaveBeenCalledWith({
      ...minimalConfig,
      name: 'myTemplate',
    });
  });

  it('Updates an existing template', async () => {
    const filePath = await tempDir.createJsonFile('myTemplate', minimalConfig);
    repositoryMock.findByNameSpy.mockResolvedValueOnce({ id: 'template-id' });

    await handler({ template: filePath });

    expectConsoleLogToContain('Updating', 'myTemplate');
    expect(repositoryMock.updateSpy).toHaveBeenCalledWith('template-id', {
      ...minimalConfig,
      name: 'myTemplate',
    });
  });

  it('Creates a template based on a directory', async () => {
    const dirPath = await tempDir.createDirectory('a-dir-template');
    await tempDir.createJsonFile('a-dir-template/template', minimalConfig);
    await tempDir.createFile('a-dir-template/extra.html', '<h1>Hello world</h1>');

    await handler({ template: dirPath });

    expectConsoleLogToContain('Creating', 'a-dir-template');
    expect(repositoryMock.createSpy).toHaveBeenCalledWith({
      ...minimalConfig,
      name: 'a-dir-template',
      fields: {
        message: 'A simple template',
        extra: '<h1>Hello world</h1>',
      },
    });
  });

  it('Syncs multiple templates in a directory', async () => {
    const dirPath = await tempDir.createDirectory('multiple-templates');
    await tempDir.createJsonFile('multiple-templates/file-template-1', minimalConfig);
    await tempDir.createJsonFile('multiple-templates/file-template-2', minimalConfig);

    await tempDir.createDirectory('multiple-templates/dir-template');
    await tempDir.createJsonFile('multiple-templates/dir-template/template', minimalConfig);
    await tempDir.createFile('multiple-templates/dir-template/body.html', '<i>Moar templates</i>');

    await handler({ path: dirPath });

    expectConsoleLogToContain('Creating', 'file-template-1');
    expectConsoleLogToContain('Creating', 'file-template-2');
    expectConsoleLogToContain('Creating', 'dir-template');
    expect(repositoryMock.createSpy).toHaveBeenCalledWith({ ...minimalConfig, name: 'file-template-1' });
    expect(repositoryMock.createSpy).toHaveBeenCalledWith({ ...minimalConfig, name: 'file-template-2' });
    expect(repositoryMock.createSpy).toHaveBeenCalledWith({
      ...minimalConfig,
      name: 'dir-template',
      fields: {
        message: 'A simple template',
        body: '<i>Moar templates</i>',
      },
    });
  });

  it('Allows extending other templates', async () => {
    const filePath = await tempDir.createJsonFile('myExtendingTemplate', {
      extends_template: 'my_base_template',
      description: 'Template that extends another template',
      schema: {
        type: 'object',
        fields: {
          name: { type: 'string' },
        },
      },
      fields: { message: 'Hello $content.name' },
    });

    repositoryMock.findByNameSpy.mockResolvedValueOnce({
      description: 'Base template',
      schema: {
        type: 'object',
        fields: {
          message: { type: 'string' },
        },
      },
      fields: {
        title: 'ExH: Notification',
        body: '<html><body>$content.message</body></html>',
      },
    });

    await handler({ template: filePath });

    expectConsoleLogToContain('Creating', 'myExtendingTemplate');
    expect(repositoryMock.createSpy).toHaveBeenCalledWith({
      name: 'myExtendingTemplate',
      description: 'Template that extends another template',
      schema: {
        type: 'object',
        fields: {
          name: { type: 'string' },
        },
      },
      fields: {
        title: 'ExH: Notification',
        body: '<html><body>Hello $content.name</body></html>',
      },
    });
  });
});
