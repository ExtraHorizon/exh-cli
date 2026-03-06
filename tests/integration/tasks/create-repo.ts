import { handler } from '../../../src/commands/tasks/create-repo';
import { spyOnConsole } from '../../__helpers__/consoleSpy';
import { createTempDirectoryManager, type TempDirectoryManager } from '../../__helpers__/tempDirectoryManager';

describe('exh tasks create-repo', () => {
  const { expectConsoleLogToContain } = spyOnConsole();
  let tempDir: TempDirectoryManager;

  beforeEach(async () => {
    tempDir = await createTempDirectoryManager();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await tempDir.removeDirectory();
  });

  it('Creates a Function based on a git repository', async () => {
    await handler({
      name: 'my-task',
      repo: 'https://github.com/ExtraHorizon/template-task',
      git: false,
      path: tempDir.getPath(),
    });

    expectConsoleLogToContain('Creating new repo');
    expectConsoleLogToContain('my-task');
    expectConsoleLogToContain('Done!');

    const packageJson = await tempDir.readJsonFile('my-task/package');
    expect(packageJson?.name).toBe('my-task');

    const taskConfig = await tempDir.readJsonFile('my-task/task-config');
    expect(taskConfig?.name).toBe('my-task');
    expect(taskConfig?.description).toBe('my-task task');
    expect(taskConfig?.$schema).toBe('https://swagger.extrahorizon.com/cli/1.13.0/config-json-schemas/TaskConfig.json');

    const gitFolderExists = await tempDir.exists('my-task/.git');
    expect(gitFolderExists).toBe(false);
  });
});
