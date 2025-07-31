import { handler } from '../../../../src/commands/data/schemas/init';
import { ConsoleSpy, spyOnConsole } from '../../../__helpers__/consoleSpy';
import { createTempDirectoryManager } from '../../../__helpers__/tempDirectoryManager';

describe('exh data schemas init', () => {
  let tempDir: Awaited<ReturnType<typeof createTempDirectoryManager>>;
  let consoleSpy: ConsoleSpy;

  beforeEach(async () => {
    tempDir = await createTempDirectoryManager();
    consoleSpy = spyOnConsole();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await tempDir.removeDirectory();
  });

  it('Creates a schema', async () => {
    const path = tempDir.getPath();
    const name = 'test-schema';

    await handler({ name, path });

    consoleSpy.expectConsoleLogToContain('✅  Successfully created');
    consoleSpy.expectConsoleLogToContain(`${name}.json`);

    const schemaFileAfter = await tempDir.readJsonFile(name);
    expect(schemaFileAfter).toStrictEqual({
      $schema: 'https://swagger.extrahorizon.com/cli/1.10.0/config-json-schemas/Schema.json',
      name,
      description: `The ${name} schema`,
      createMode: 'allUsers',
      readMode: ['creator'],
      updateMode: ['creator'],
      deleteMode: ['creator'],
      statuses: { new: {} },
      creationTransition: {
        type: 'manual',
        toStatus: 'new',
      },
      transitions: [],
      properties: {
        firstProperty: { type: 'string' },
      },
    });
  });

  it('Creates the parent directory if it does not exist', async () => {
    const path = tempDir.getPath('schemas/');
    const name = 'test-schema';

    await handler({ name, path });

    const schemaFileAfter = await tempDir.readJsonFile(`schemas/${name}`);
    expect(schemaFileAfter).not.toBeNull();
  });
});
