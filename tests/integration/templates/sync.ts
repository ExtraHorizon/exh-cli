/* eslint-disable no-template-curly-in-string */
import { handler } from '../../../src/commands/templates/sync';
import { spyOnConsole } from '../../__helpers__/consoleSpy';
import { createTempDirectoryManager, type TempDirectoryManager } from '../../__helpers__/tempDirectoryManager';
import { templateRepositoryMock, type TemplateRepositoryMock } from '../../__helpers__/templateRepositoryMock';
import { generateTemplate, generateTemplateV2 } from '../../__helpers__/templates';
import { templateV2RepositoryMock, type TemplateV2RepositoryMock } from '../../__helpers__/templateV2RepositoryMock';

describe('exh templates sync', () => {
  const { expectConsoleLogToContain } = spyOnConsole();
  let v1RepositoryMock: TemplateRepositoryMock;
  let v2RepositoryMock: TemplateV2RepositoryMock;
  let tempDir: TempDirectoryManager;

  const minimalV1Config = {
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

  const minimalV2Config = {
    description: 'A simple template',
    inputs: {
      field1: { type: 'string' },
    },
    outputs: {
      message: 'A simple template',
    },
  };

  beforeAll(() => {
    process.env.EXH_CLI_TEST_ENV_VAR = 'FromEnv';
  });

  beforeEach(async () => {
    tempDir = await createTempDirectoryManager();
    v1RepositoryMock = templateRepositoryMock();
    v2RepositoryMock = templateV2RepositoryMock();
  });

  afterEach(async () => {
    await tempDir.removeDirectory();
    jest.clearAllMocks();
  });

  afterAll(() => {
    delete process.env.EXH_CLI_TEST_ENV_VAR;
  });

  describe('v1 templates', () => {
    it('Creates a template based on a file', async () => {
      const filePath = await tempDir.createJsonFile('myTemplate', minimalV1Config);

      await handler({ template: filePath });

      expectConsoleLogToContain('Creating', 'myTemplate');
      expect(v1RepositoryMock.createSpy).toHaveBeenCalledWith({
        ...minimalV1Config,
        name: 'myTemplate',
      });
    });

    it('Updates an existing template', async () => {
      const existingTemplate = generateTemplate({ name: 'myTemplate' });
      const filePath = await tempDir.createJsonFile('myTemplate', minimalV1Config);
      v1RepositoryMock.findByNameSpy.mockResolvedValueOnce(existingTemplate);

      await handler({ template: filePath });

      expectConsoleLogToContain('Updating', 'myTemplate');
      expect(v1RepositoryMock.updateSpy).toHaveBeenCalledWith(existingTemplate.id, {
        ...minimalV1Config,
        name: 'myTemplate',
      });
    });

    it('Creates a template based on a directory', async () => {
      const dirPath = await tempDir.createDirectory('a-dir-template');
      await tempDir.createJsonFile('a-dir-template/template', minimalV1Config);
      await tempDir.createFile('a-dir-template/extra.html', '<h1>Hello world</h1>');

      await handler({ template: dirPath });

      expectConsoleLogToContain('Creating', 'a-dir-template');
      expect(v1RepositoryMock.createSpy).toHaveBeenCalledWith({
        ...minimalV1Config,
        name: 'a-dir-template',
        fields: {
          message: 'A simple template',
          extra: '<h1>Hello world</h1>',
        },
      });
    });

    it('Allows extending other templates', async () => {
      const filePath = await tempDir.createJsonFile('myExtendingTemplate', {
        extends_template: 'my_base_template',
        description: 'Template extending another template',
        schema: {
          type: 'object',
          fields: {
            name: { type: 'string' },
          },
        },
        fields: { message: 'Hello $content.name' },
      });

      v1RepositoryMock.findByNameSpy.mockResolvedValueOnce(generateTemplate({
        name: 'my_base_template',
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
      }));

      await handler({ template: filePath });

      expectConsoleLogToContain('Creating', 'myExtendingTemplate');
      expect(v1RepositoryMock.createSpy).toHaveBeenCalledWith({
        name: 'myExtendingTemplate',
        description: 'Template extending another template',
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

    it('Throws an error for an invalid template file', async () => {
      const filePath = await tempDir.createJsonFile('invalidTemplate', {
        description: 'Invalid template',
        schema: '<--- should not be a string --->',
        fields: { message: 'Hello world' },
      });

      await expect(handler({ template: filePath }))
        .rejects.toThrow(/invalidTemplate\.json: "schema" must be object/);
    });
  });

  describe('v2 templates', () => {
    it('Creates a v2 template based on a file', async () => {
      const filePath = await tempDir.createJsonFile('myV2Template', minimalV2Config);

      await handler({ template: filePath });

      expectConsoleLogToContain('Creating', 'myV2Template');
      expect(v2RepositoryMock.createSpy).toHaveBeenCalledWith({
        ...minimalV2Config,
        name: 'myV2Template',
      });
    });

    it('Updates an existing v2 template', async () => {
      const filePath = await tempDir.createJsonFile('myV2Template', minimalV2Config);
      const existingTemplate = generateTemplateV2({ name: 'myV2Template' });
      v2RepositoryMock.findByNameSpy.mockResolvedValueOnce(existingTemplate);

      await handler({ template: filePath });

      expectConsoleLogToContain('Updating', 'myV2Template');
      expect(v2RepositoryMock.updateSpy).toHaveBeenCalledWith(existingTemplate.id, {
        ...minimalV2Config,
        name: 'myV2Template',
      });
    });

    it('Creates a v2 template based on a directory', async () => {
      const dirPath = await tempDir.createDirectory('a-dir-template');
      await tempDir.createJsonFile('a-dir-template/template', minimalV2Config);
      await tempDir.createFile('a-dir-template/extra.html', '<h1>Hello world</h1>');

      await handler({ template: dirPath });

      expectConsoleLogToContain('Creating', 'a-dir-template');
      expect(v2RepositoryMock.createSpy).toHaveBeenCalledWith({
        ...minimalV2Config,
        name: 'a-dir-template',
        outputs: {
          message: 'A simple template',
          extra: '<h1>Hello world</h1>',
        },
      });
    });

    it('Replaces variables in the outputs with the correct value', async () => {
      const filePath = await tempDir.createJsonFile('myV2Template', {
        ...minimalV2Config,
        variables: { VAR_1: 'Hello world' },
        outputs: {
          message_with_braces: '<div>${VAR_1}</div>',
          message_without_braces: '<div>$VAR_1</div>',
        },
      });

      await handler({ template: filePath });

      expectConsoleLogToContain('Creating', 'myV2Template');
      expect(v2RepositoryMock.createSpy).toHaveBeenCalledWith({
        ...minimalV2Config,
        name: 'myV2Template',
        outputs: {
          message_with_braces: '<div>Hello world</div>',
          message_without_braces: '<div>Hello world</div>',
        },
      });
    });

    it('Does not replace variables that are not defined in the template', async () => {
      const filePath = await tempDir.createJsonFile('myV2Template', {
        ...minimalV2Config,
        outputs: {
          message_with_braces: '<div>${UNDEFINED_VAR}</div>',
          message_without_braces: '<div>$VAR_1</div>',
        },
      });

      await handler({ template: filePath });

      expectConsoleLogToContain('Creating', 'myV2Template');
      expect(v2RepositoryMock.createSpy).toHaveBeenCalledWith({
        ...minimalV2Config,
        name: 'myV2Template',
        outputs: {
          message_with_braces: '<div>${UNDEFINED_VAR}</div>',
          message_without_braces: '<div>$VAR_1</div>',
        },
      });
    });

    it('Replaces variables with environment variable values', async () => {
      const filePath = await tempDir.createJsonFile('envVarTemplate', {
        ...minimalV2Config,
        variables: {
          VAR_WITHOUT_BRACES: '$EXH_CLI_TEST_ENV_VAR',
          VAR_WITH_BRACES: '${EXH_CLI_TEST_ENV_VAR}',
        },
        outputs: {
          message: 'Hello $VAR_WITHOUT_BRACES',
          message_braces: 'Hello $VAR_WITH_BRACES',
        },
      });

      await handler({ template: filePath });

      expectConsoleLogToContain('Creating', 'envVarTemplate');
      expect(v2RepositoryMock.createSpy).toHaveBeenCalledWith({
        ...minimalV2Config,
        name: 'envVarTemplate',
        outputs: {
          message: 'Hello FromEnv',
          message_braces: 'Hello FromEnv',
        },
      });
    });

    it('Throws an error when a variable value references an environment variable that is not defined', async () => {
      const filePath = await tempDir.createJsonFile('myV2Template', {
        ...minimalV2Config,
        variables: {
          VAR_1: '$UNDEFINED_ENV_VAR',
        },
        outputs: {
          message: 'Hello $VAR_1',
        },
      });

      await expect(handler({ template: filePath })).rejects.toThrow(/Variable UNDEFINED_ENV_VAR not found in environment/);
    });

    it('Throws an error when an environment variable name does not match the valid pattern', async () => {
      const filePath = await tempDir.createJsonFile('invalidEnvVarPatternTemplate', {
        ...minimalV2Config,
        variables: {
          VAR_1: '$INVALID-ENV-VAR', // Invalid env var name (contains a dash)
        },
        outputs: {
          message: 'Hello $VAR_1',
        },
      });

      await expect(handler({ template: filePath }))
        .rejects.toThrow(
          'Invalid environment variable name INVALID-ENV-VAR. Environment variable names must contain only uppercase letters, numbers, and underscores and must start with a letter.'
        );
    });

    it('Allows extending other v2 templates', async () => {
      const filePath = await tempDir.createJsonFile('myExtendingTemplate', {
        extendsTemplate: 'my_base_template',
        description: 'Template extending another template',
        inputs: {
          name: { type: 'string' },
        },
        outputs: {
          message: 'Hello {{@inputs.name}}',
        },
      });

      v2RepositoryMock.findByNameSpy.mockResolvedValueOnce(generateTemplateV2({
        name: 'my_base_template',
        inputs: {
          message: { type: 'string' },
        },
        outputs: {
          title: 'ExH: Notification',
          body: '<html><body>{{@inputs.message}}</body></html>',
        },
      }));

      await handler({ template: filePath });

      expectConsoleLogToContain('Creating', 'myExtendingTemplate');
      expect(v2RepositoryMock.createSpy).toHaveBeenCalledWith({
        name: 'myExtendingTemplate',
        description: 'Template extending another template',
        inputs: {
          name: { type: 'string' },
        },
        outputs: {
          title: 'ExH: Notification',
          body: '<html><body>Hello {{@inputs.name}}</body></html>',
        },
      });
    });

    it('Allows no defined outputs in the template.json when a file in the folder to be used as an output exists', async () => {
      const dirPath = await tempDir.createDirectory('a-dir-template');
      await tempDir.createJsonFile('a-dir-template/template', {
        description: 'A simple template',
        inputs: {
          field1: { type: 'string' },
        },
      });
      await tempDir.createFile('a-dir-template/body.html', '<h1>Hello world</h1>');

      await handler({ template: dirPath });

      expectConsoleLogToContain('Creating', 'a-dir-template');
      expect(v2RepositoryMock.createSpy).toHaveBeenCalledWith({
        name: 'a-dir-template',
        description: 'A simple template',
        inputs: {
          field1: { type: 'string' },
        },
        outputs: {
          body: '<h1>Hello world</h1>',
        },
      });
    });

    it('Allows using variables in the extends chain', async () => {
      await tempDir.createJsonFile('myExtendingTemplate', {
        extendsTemplate: 'myBaseTemplate',
        description: 'Template extending another template',
        inputs: {
          name: { type: 'string' },
        },
        outputs: {
          message: 'Hello {{@inputs.name}} $VAR_1',
        },
        variables: {
          VAR_1: 'From Extending Template Variable',
        },
      });

      await tempDir.createJsonFile('myBaseTemplate', {
        inputs: {
          message: { type: 'string' },
        },
        outputs: {
          title: 'ExH: Notification',
          body: '<html><body>{{@inputs.message}} $VAR_1</body></html>',
        },
        variables: {
          VAR_1: 'From Base Template Variable',
        },
      });

      await handler({ path: tempDir.getPath() });

      expectConsoleLogToContain('Creating', 'myExtendingTemplate');
      expect(v2RepositoryMock.createSpy).toHaveBeenCalledWith({
        name: 'myExtendingTemplate',
        description: 'Template extending another template',
        inputs: {
          name: { type: 'string' },
        },
        outputs: {
          title: 'ExH: Notification',
          body: '<html><body>Hello {{@inputs.name}} From Extending Template Variable From Base Template Variable</body></html>',
        },
      });
    });

    it('Throws an error for an invalid template file', async () => {
      const filePath = await tempDir.createJsonFile('invalidTemplate', {
        description: 'Invalid template',
        inputs: '<--- should not be a string --->',
        outputs: { message: 'Hello world' },
      });

      await expect(handler({ template: filePath }))
        .rejects.toThrow(/invalidTemplate\.json: "inputs" must be object/);
    });

    it('Throws when no outputs are defined', async () => {
      const filePath = await tempDir.createJsonFile('invalidTemplate', {
        description: 'Invalid template',
        inputs: { name: { type: 'string' } },
      });

      await expect(handler({ template: filePath }))
        .rejects.toThrow(/Template 'invalidTemplate' must have at least one output defined!/);
    });
  });

  it('Syncs multiple templates in a directory', async () => {
    const dirPath = await tempDir.createDirectory('multiple-templates');
    await tempDir.createJsonFile('multiple-templates/file-template-1', minimalV1Config);
    await tempDir.createJsonFile('multiple-templates/file-template-2', minimalV2Config);

    await tempDir.createDirectory('multiple-templates/dir-template');
    await tempDir.createJsonFile('multiple-templates/dir-template/template', minimalV1Config);
    await tempDir.createFile('multiple-templates/dir-template/body.html', '<i>Moar templates</i>');

    await handler({ path: dirPath });

    expectConsoleLogToContain('Creating', 'file-template-1');
    expectConsoleLogToContain('Creating', 'file-template-2');
    expectConsoleLogToContain('Creating', 'dir-template');
    expect(v1RepositoryMock.createSpy).toHaveBeenCalledWith({ ...minimalV1Config, name: 'file-template-1' });
    expect(v2RepositoryMock.createSpy).toHaveBeenCalledWith({ ...minimalV2Config, name: 'file-template-2' });
    expect(v1RepositoryMock.createSpy).toHaveBeenCalledWith({
      ...minimalV1Config,
      name: 'dir-template',
      fields: {
        message: 'A simple template',
        body: '<i>Moar templates</i>',
      },
    });
  });
});
