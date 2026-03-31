import { handler } from '../../../src/commands/templates/init';
import { ConsoleSpy, spyOnConsole } from '../../__helpers__/consoleSpy';
import { createTempDirectoryManager, TempDirectoryManager } from '../../__helpers__/tempDirectoryManager';

describe('exh templates init', () => {
  let tempDir: TempDirectoryManager;
  let consoleSpy: ConsoleSpy;

  beforeEach(async () => {
    tempDir = await createTempDirectoryManager();
    consoleSpy = spyOnConsole();
  });

  it('Creates a template', async () => {
    const path = tempDir.getPath();
    const name = 'test-template';

    await handler({ name, path });

    consoleSpy.expectConsoleLogToContain('✅  Successfully created');
    consoleSpy.expectConsoleLogToContain(`${path}/${name}/template.json`);
    consoleSpy.expectConsoleLogToContain(`${path}/${name}/body.hbs`);

    const templateFileAfter = await tempDir.readJsonFile(`/${name}/template`);
    expect(templateFileAfter).toStrictEqual({
      description: `The ${name} template`,
      inputs: {
        first_name: {
          type: 'string',
        },
      },
      outputs: {
        subject: 'Welcome {{@inputs.first_name}}',
      },
      $schema: 'https://swagger.extrahorizon.com/cli/1.13.1/config-json-schemas/Template.json',
    });
  });

  it('Creates the parent directory if it does not exist', async () => {
    const path = tempDir.getPath('templates/');
    const name = 'test-template';

    await handler({ name, path });

    const templateFileAfter = await tempDir.readJsonFile(`templates/${name}/template`);
    const bodyFileAfter = await tempDir.readFile(`templates/${name}/body.hbs`);

    expect(templateFileAfter).not.toBeNull();
    expect(bodyFileAfter).not.toBeNull();
  });
});
