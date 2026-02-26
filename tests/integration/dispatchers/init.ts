import { writeFile } from 'fs/promises';
import { ActionType } from '@extrahorizon/javascript-sdk';
import { handler } from '../../../src/commands/dispatchers/init';
import { ConsoleSpy, spyOnConsole } from '../../__helpers__/consoleSpy';
import { createTempDirectoryManager, TempDirectoryManager } from '../../__helpers__/tempDirectoryManager';

describe('exh dispatchers init', () => {
  let tempDir: TempDirectoryManager;
  let consoleSpy: ConsoleSpy;

  beforeEach(async () => {
    tempDir = await createTempDirectoryManager();
    consoleSpy = spyOnConsole();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await tempDir.removeDirectory();
  });

  it('Creates a Dispatcher', async () => {
    const path = tempDir.getPath();
    const name = 'test-dispatcher';

    await handler({ name, path });

    consoleSpy.expectConsoleLogToContain(`✅  Successfully created ${path}/dispatchers.json`);

    const dispatcherFileAfter = await tempDir.readJsonFile('dispatchers');
    expect(dispatcherFileAfter).toStrictEqual(
      {
        dispatchers: [
          {
            eventType: 'my-custom-event',
            name,
            actions: [
              {
                type: ActionType.TASK,
                name: 'task-action',
                functionName: 'my-function-name',
              },
            ],
          },
        ],
        $schema: 'https://swagger.extrahorizon.com/cli/1.13.0/config-json-schemas/Dispatchers.json',
      }
    );
  });

  it('Updates an existing Dispatcher file', async () => {
    const path = tempDir.getPath();

    await handler({ name: 'first-dispatcher', path });
    consoleSpy.expectConsoleLogToContain(`✅  Successfully created ${path}/dispatchers.json`);

    await handler({ name: 'second-dispatcher', path });
    consoleSpy.expectConsoleLogToContain(`✅  Successfully updated ${path}/dispatchers.json`);

    const dispatcherFileAfter = await tempDir.readJsonFile('dispatchers');
    expect(dispatcherFileAfter).toStrictEqual(
      {
        dispatchers: [
          {

            eventType: 'my-custom-event',
            name: 'second-dispatcher',
            actions: [
              {
                type: ActionType.TASK,
                name: 'task-action',
                functionName: 'my-function-name',
              },
            ],
          },
          {
            eventType: 'my-custom-event',
            name: 'first-dispatcher',
            actions: [
              {
                type: ActionType.TASK,
                name: 'task-action',
                functionName: 'my-function-name',
              },
            ],
          },
        ],
        $schema: 'https://swagger.extrahorizon.com/cli/1.13.0/config-json-schemas/Dispatchers.json',
      }
    );
  });

  it('Creates the parent directory if it does not exist', async () => {
    const path = tempDir.getPath('dispatchers/');
    const name = 'test-dispatcher';

    await handler({ name, path });

    const dispatcherFileAfter = await tempDir.readJsonFile('dispatchers/dispatchers');
    expect(dispatcherFileAfter).not.toBeNull();
  });

  it('Throws an error when providing an invalid Dispatcher file path', async () => {
    const path = tempDir.getPath();

    const fileContentWithoutDispatchersArray = { $schema: 'https://swagger.extrahorizon.com/cli/1.13.0/config-json-schemas/Dispatchers.json' };
    await writeFile(`${path}/dispatchers.json`, JSON.stringify(fileContentWithoutDispatchersArray, null, 2));

    const name = 'test-dispatcher';
    const promise = handler({ name, path });
    await expect(promise).rejects.toThrow("must have required property 'dispatchers'");
  });
});
