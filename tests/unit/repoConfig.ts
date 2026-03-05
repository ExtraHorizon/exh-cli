import { getRepoConfig } from '../../src/helpers/repoConfig';
import { createTempDirectoryManager, TempDirectoryManager } from '../__helpers__/tempDirectoryManager';

describe('repoConfig', () => {
  let tempDir: TempDirectoryManager;

  beforeEach(async () => {
    tempDir = await createTempDirectoryManager();
  });

  afterEach(async () => {
    await tempDir.removeDirectory();
  });

  it('Returns the default config if no config file exists', async () => {
    await tempDir.createDirectory('schemas');
    await tempDir.createDirectory('templates');
    await tempDir.createDirectory('tasks');
    await tempDir.createDirectory('localizations');

    const config = getRepoConfig(tempDir.getPath());
    expect(config).toStrictEqual({
      schemas: ['schemas'],
      templates: ['templates'],
      tasks: ['tasks'],
      localizations: ['localizations'],
    });
  });

  it('Reads the config from a file if present', async () => {
    await tempDir.createDirectory('myCustomSchemas');
    await tempDir.createDirectory('myCustomTemplates');
    await tempDir.createDirectory('myCustomTasks');
    await tempDir.createDirectory('myCustomLocalizations');

    const fileConfig = {
      schemas: ['myCustomSchemas'],
      templates: ['myCustomTemplates'],
      tasks: ['myCustomTasks'],
      localizations: ['myCustomLocalizations'],
    };
    await tempDir.createJsonFile('repo-config', fileConfig);

    const config = getRepoConfig(tempDir.getPath());
    expect(config).toStrictEqual(fileConfig);
  });

  it('Filters out non-existing directories', async () => {
    await tempDir.createDirectory('myCustomSchemas');
    await tempDir.createDirectory('myCustomTemplates');
    await tempDir.createDirectory('myCustomTasks');
    await tempDir.createDirectory('myCustomLocalizations');

    const fileConfig = {
      schemas: ['myCustomSchemas', 'myNonExistingSchemas'],
      templates: ['myCustomTemplates', 'myNonExistingTemplates'],
      tasks: ['myCustomTasks', 'myNonExistingTasks'],
      localizations: ['myCustomLocalizations', 'myNonExistingLocalizations'],
    };

    await tempDir.createJsonFile('repo-config', fileConfig);

    const config = getRepoConfig(tempDir.getPath());
    expect(config).toStrictEqual({
      schemas: ['myCustomSchemas'],
      templates: ['myCustomTemplates'],
      tasks: ['myCustomTasks'],
      localizations: ['myCustomLocalizations'],
    });
  });

  it('Throws if a config entry is not an array', async () => {
    const badConfig = { schemas: 'not-an-array', templates: [], tasks: [], localizations: [] };
    await tempDir.createJsonFile('repo-config', badConfig);

    expect(() => getRepoConfig(tempDir.getPath())).toThrow('Not an array');
  });

  it('Throws if a path is not a directory', async () => {
    await tempDir.createFile('foo', 'not a dir');
    const fileConfig = { schemas: ['foo'], templates: [], tasks: [], localizations: [] };
    await tempDir.createJsonFile('repo-config', fileConfig);

    expect(() => getRepoConfig(tempDir.getPath())).toThrow('foo is not a directory');
  });
});
