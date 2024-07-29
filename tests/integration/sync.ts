import { handler } from '../../src/commands/sync';
import { mockLocalizationRepository } from '../__helpers__/localizationRepositoryMock';
import { createTempDirectoryManager } from '../__helpers__/tempDirectoryManager';

describe('exh sync', () => {
  let tempDirectory: Awaited<ReturnType<typeof createTempDirectoryManager>>;
  let localizationRepositoryMock: ReturnType<typeof mockLocalizationRepository>;

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

    await handler({ sdk: undefined, path: tempDirectory.getPath() });

    expect(localizationRepositoryMock.createSpy).toHaveBeenCalledWith(undefined, [{ key: 'test_key', text: { EN: 'My text' } }]);
  });

  it('Syncs localizations within a specified custom directory', async () => {
    await tempDirectory.createJsonFile('repo-config', { localizations: ['locals'] });
    await tempDirectory.createDirectory('locals');
    await tempDirectory.createJsonFile('locals/en', { test_key: 'My text' });

    await handler({ sdk: undefined, path: tempDirectory.getPath() });

    expect(localizationRepositoryMock.createSpy).toHaveBeenCalledWith(undefined, [{ key: 'test_key', text: { EN: 'My text' } }]);
  });
});
