import { handler } from '../../src/commands/sync';
import { mockLocalizationRepository, type LocalizationRepositoryMock } from '../__helpers__/localizationRepositoryMock';
import { createTempDirectoryManager, type TempDirectoryManager } from '../__helpers__/tempDirectoryManager';

describe('exh sync', () => {
  let tempDirectory: TempDirectoryManager;
  let localizationRepositoryMock: LocalizationRepositoryMock;

  beforeAll(() => {
    localizationRepositoryMock = mockLocalizationRepository();
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
});
