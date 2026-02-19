import { handler } from '../../src/commands/sync';
import { dispatcherRepositoryMock as mockDispatcherRepository, type DispatcherRepositoryMock } from '../__helpers__/dispatcherRepositoryMock';
import { functionRepositoryMock as mockFunctionRepository, type FunctionRepositoryMock } from '../__helpers__/functionRepositoryMock';
import { mockLocalizationRepository, type LocalizationRepositoryMock } from '../__helpers__/localizationRepositoryMock';
import { schemaRepositoryMock as mockSchemaRepository, type SchemaRepositoryMock } from '../__helpers__/schemaRepositoryMock';
import { minimalSchema } from '../__helpers__/schemas';
import { createTempDirectoryManager, type TempDirectoryManager } from '../__helpers__/tempDirectoryManager';
import { templateRepositoryMock as mockTemplateRepository, type TemplateRepositoryMock } from '../__helpers__/templateRepositoryMock';
import { templateV2RepositoryMock as mockTemplateV2Repository, type TemplateV2RepositoryMock } from '../__helpers__/templateV2RepositoryMock';

describe('exh sync', () => {
  let tempDirectory: TempDirectoryManager;
  let localizationRepositoryMock: LocalizationRepositoryMock;
  let schemaRepositoryMock: SchemaRepositoryMock;
  let templateRepositoryMock: TemplateRepositoryMock;
  let templateV2RepositoryMock: TemplateV2RepositoryMock;
  let dispatcherRepositoryMock: DispatcherRepositoryMock;
  let functionRepositoryMock: FunctionRepositoryMock;

  beforeAll(() => {
    localizationRepositoryMock = mockLocalizationRepository();
    schemaRepositoryMock = mockSchemaRepository();
    templateRepositoryMock = mockTemplateRepository();
    templateV2RepositoryMock = mockTemplateV2Repository();
    dispatcherRepositoryMock = mockDispatcherRepository();
    functionRepositoryMock = mockFunctionRepository();
  });

  beforeEach(async () => {
    tempDirectory = await createTempDirectoryManager();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await tempDirectory.removeDirectory();
  });

  it('Syncs localizations within the default \'localizations\' directory', async () => {
    await tempDirectory.createDirectory('localizations');
    await tempDirectory.createJsonFile('localizations/en', { test_key: 'My text' });

    await handler({ path: tempDirectory.getPath() });

    expect(localizationRepositoryMock.createSpy).toHaveBeenCalledWith([{ key: 'test_key', text: { EN: 'My text' } }]);
  });

  it('Syncs localizations within a specified custom directory', async () => {
    await tempDirectory.createJsonFile('repo-config', { localizations: ['locals'] });
    await tempDirectory.createDirectory('locals');
    await tempDirectory.createJsonFile('locals/en', { test_key: 'My text' });

    await handler({ path: tempDirectory.getPath() });

    expect(localizationRepositoryMock.createSpy).toHaveBeenCalledWith([{ key: 'test_key', text: { EN: 'My text' } }]);
  });

  it('Syncs the schemas within the default \'schemas\' directory', async () => {
    const schema = { ...minimalSchema, name: 'test_schema' };
    await tempDirectory.createDirectory('schemas');
    await tempDirectory.createJsonFile('schemas/test_schema', schema);

    await handler({ path: tempDirectory.getPath() });

    expect(schemaRepositoryMock.createSchemaSpy).toHaveBeenCalledWith(schema.name, schema.description);
  });

  it('Syncs the templates within the default \'templates\' directory', async () => {
    const templateV1Config = {
      description: 'A simple template',
      inputs: {
        field1: { type: 'string' },
      },
      outputs: {
        message: 'A simple template',
      },
    };

    const templateV2Config = {
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

    await tempDirectory.createDirectory('templates');
    await tempDirectory.createJsonFile('templates/test_template_v1', templateV1Config);
    await tempDirectory.createDirectory('templates/test_dir_template_v2');
    await tempDirectory.createJsonFile('templates/test_dir_template_v2/template', templateV2Config);

    await handler({ path: tempDirectory.getPath() });

    expect(templateV2RepositoryMock.createSpy).toHaveBeenCalledWith({ name: 'test_template_v1', ...templateV1Config });
    expect(templateRepositoryMock.createSpy).toHaveBeenCalledWith({ name: 'test_dir_template_v2', ...templateV2Config });
  });

  it('Syncs dispatchers within the default \'dispatchers.json\' file', async () => {
    const dispatcherConfig = {
      name: 'Test Dispatcher',
      eventType: 'test_event',
      actions: [
        {
          name: 'Start Task',
          type: 'task',
          functionName: 'my_task_function',
        },
      ],
    };
    await tempDirectory.createJsonFile('dispatchers', [dispatcherConfig]);

    await handler({ path: tempDirectory.getPath() });
    expect(dispatcherRepositoryMock.createSpy).toHaveBeenCalledWith(expect.objectContaining(dispatcherConfig));
  });

  it('Syncs tasks within the default \'tasks\' directory', async () => {
    const functionConfig = {
      name: 'test-function',
      path: './',
      entryPoint: 'index.handler',
      runtime: 'nodejs24.x',
    };

    await tempDirectory.createDirectory('tasks/test-function');
    await tempDirectory.createJsonFile('tasks/test-function/task-config', functionConfig);
    await tempDirectory.createFile('tasks/test-function/index.js', 'export function handler() { console.log("Hello World!"); }');

    await handler({ path: tempDirectory.getPath() });

    expect(functionRepositoryMock.createSpy).toHaveBeenCalledWith(expect.objectContaining({
      name: functionConfig.name,
      entryPoint: functionConfig.entryPoint,
      runtime: functionConfig.runtime,
      code: expect.any(String),
    }));
  });
});
