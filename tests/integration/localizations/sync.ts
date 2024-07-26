import { handler } from '../../../src/commands/localizations/sync';
import { mockLocalizationRepository } from '../../__helpers__/localizationRepositoryMock';
import { createTempDirectoryManager } from '../../__helpers__/tempDirectoryManager';

describe('exh localizations sync', () => {
  let tempDirectoryManager: Awaited<ReturnType<typeof createTempDirectoryManager>>;
  let localizationRepositoryMock: ReturnType<typeof mockLocalizationRepository>;
  let logSpy: jest.SpyInstance;

  beforeEach(async () => {
    tempDirectoryManager = await createTempDirectoryManager();
    localizationRepositoryMock = mockLocalizationRepository();
    logSpy = jest.spyOn(global.console, 'log');
  });

  afterEach(async () => {
    await tempDirectoryManager.removeDirectory();
    jest.clearAllMocks();
  });

  it('Creates localizations', async () => {
    await tempDirectoryManager.createJsonFile('en', { test_key: 'My text' });
    await tempDirectoryManager.createJsonFile('nl', { test_key: 'Mijn tekst' });

    await handler({ sdk: undefined, path: tempDirectoryManager.getPath() });

    expect(localizationRepositoryMock.createSpy).toHaveBeenCalledWith(undefined, [
      { key: 'test_key', text: { EN: 'My text', NL: 'Mijn tekst' } },
    ]);
  });

  it('Updates localizations', async () => {
    await tempDirectoryManager.createJsonFile('en', { new_key: 'My new text', existing_key: 'My other text' });
    await tempDirectoryManager.createJsonFile('nl', { new_key: 'Mijn nieuwe tekst', existing_key: 'Mijn andere text' });

    localizationRepositoryMock.createSpy.mockResolvedValueOnce({
      created: 1,
      existing: 1,
      existingIds: ['existing_key'],
    });

    await handler({ sdk: undefined, path: tempDirectoryManager.getPath() });

    expect(localizationRepositoryMock.createSpy).toHaveBeenCalledWith(undefined, [
      { key: 'new_key', text: { EN: 'My new text', NL: 'Mijn nieuwe tekst' } },
      { key: 'existing_key', text: { EN: 'My other text', NL: 'Mijn andere text' } },
    ]);
    expect(localizationRepositoryMock.updateSpy).toHaveBeenCalledWith(undefined, [
      { key: 'existing_key', text: { EN: 'My other text', NL: 'Mijn andere text' } },
    ]);
  });

  it('Does nothing if no files are found', async () => {
    await handler({ sdk: undefined, path: tempDirectoryManager.getPath() });

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No localizations found'));

    expect(localizationRepositoryMock.createSpy).not.toHaveBeenCalled();
  });

  it('Chunks up localization creation and updates if there are more than 30', async () => {
    const fileContent = {};
    const localizations = [];

    for (let i = 0; i < 100; i += 1) {
      const key = `key_${i}`;
      const text = `Text ${i}`;

      fileContent[key] = text;
      localizations.push({ key, text: { EN: text } });
    }

    await tempDirectoryManager.createJsonFile('en', fileContent);

    // Make the CLI think that all localizations already exist, so that it will update them
    localizationRepositoryMock.createSpy
      .mockImplementation((_sdk, items) => Promise.resolve({ created: 0, existing: items.length, existingIds: items.map(item => item.key) }));

    await handler({ sdk: undefined, path: tempDirectoryManager.getPath() });

    expect(localizationRepositoryMock.createSpy).toHaveBeenCalledWith(undefined, localizations.slice(0, 30));
    expect(localizationRepositoryMock.createSpy).toHaveBeenCalledWith(undefined, localizations.slice(30, 60));
    expect(localizationRepositoryMock.createSpy).toHaveBeenCalledWith(undefined, localizations.slice(60, 90));
    expect(localizationRepositoryMock.createSpy).toHaveBeenCalledWith(undefined, localizations.slice(90));

    expect(localizationRepositoryMock.updateSpy).toHaveBeenCalledWith(undefined, localizations.slice(0, 30));
    expect(localizationRepositoryMock.updateSpy).toHaveBeenCalledWith(undefined, localizations.slice(30, 60));
    expect(localizationRepositoryMock.updateSpy).toHaveBeenCalledWith(undefined, localizations.slice(60, 90));
    expect(localizationRepositoryMock.updateSpy).toHaveBeenCalledWith(undefined, localizations.slice(90));
  });

  it('Throws if the target directory does not exist', async () => {
    const promise = handler({ sdk: undefined, path: 'non-existing-directory' });

    await expect(promise).rejects.toThrow(
      expect.objectContaining({ message: expect.stringContaining('Was not able to list localization files in directory \'non-existing-directory\'') })
    );
  });

  it('Throws if a json file is found with a name not being a valid language code', async () => {
    await tempDirectoryManager.createJsonFile('not-a-valid-language-code', { test_key: 'My text' });

    const promise = handler({ sdk: undefined, path: tempDirectoryManager.getPath() });

    await expect(promise).rejects.toThrow(
      expect.objectContaining({ message: expect.stringContaining('language code NOT-A-VALID-LANGUAGE-CODE is not available') })
    );
  });

  it('Throws if a json file its content is not valid json', async () => {
    await tempDirectoryManager.createFile('ru.json', 'Not a valid json file content');

    const promise = handler({ sdk: undefined, path: tempDirectoryManager.getPath() });

    await expect(promise).rejects.toThrow(
      expect.objectContaining({ message: expect.stringContaining('Was not able to parse \'ru.json\' is not a valid JSON file') })
    );
  });

  it('Throws if a json file its content is something else than an object', async () => {
    await tempDirectoryManager.createJsonFile('ru', ['Not', 'valid', 'localization', 'file', 'content']);

    const promise = handler({ sdk: undefined, path: tempDirectoryManager.getPath() });

    await expect(promise).rejects.toThrow(
      expect.objectContaining({ message: expect.stringContaining('The content of localization file \'ru.json\' is not valid') })
    );
  });

  it('Throws if one of the keys does not match the allowed pattern, mentioning the erroneous key', async () => {
    await tempDirectoryManager.createJsonFile('ru', { 'Not a valid key': 'My text' });

    const promise = handler({ sdk: undefined, path: tempDirectoryManager.getPath() });

    await expect(promise).rejects.toThrow(
      expect.objectContaining({ message: expect.stringContaining('Not a valid key') })
    );
  });

  it('Throws if one of the values is something else than a string, mentioning the erroneous key', async () => {
    await tempDirectoryManager.createJsonFile('ru', { key_with_invalid_value: ['Not', 'a', 'valid', 'localization', 'value'] });

    const promise = handler({ sdk: undefined, path: tempDirectoryManager.getPath() });

    await expect(promise).rejects.toThrow(
      expect.objectContaining({ message: expect.stringContaining('key_with_invalid_value') })
    );
  });

  it('Throws if keys do not have a value for the default language, mentioning the keys', async () => {
    await tempDirectoryManager.createJsonFile('en', { in_default: 'My text' });
    await tempDirectoryManager.createJsonFile('fr', { first_not_in_default: 'Nope nope nope' });
    await tempDirectoryManager.createJsonFile('nl', { second_not_in_default: 'Mijn andere tekst' });

    const promise = handler({ sdk: undefined, path: tempDirectoryManager.getPath() });

    await expect(promise).rejects.toThrow(
      expect.objectContaining({ message: expect.stringContaining(
        'The following localizations do not have a value for the default language (EN): first_not_in_default, second_not_in_default'
      ) })
    );
  });
});
