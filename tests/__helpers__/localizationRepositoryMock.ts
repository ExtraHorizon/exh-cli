import * as localizationRepository from '../../src/repositories/localizations';

export type LocalizationRepositoryMock = ReturnType<typeof mockLocalizationRepository>;

export const mockLocalizationRepository = () => {
  const createSpy = jest.spyOn(localizationRepository, 'create')
    .mockImplementation(localizations => Promise.resolve({ created: localizations.length, existing: 0, existingIds: [] }));

  const updateSpy = jest.spyOn(localizationRepository, 'update')
    .mockImplementation(localizations => Promise.resolve({ updated: localizations.length }));

  return {
    createSpy,
    updateSpy,
  };
};
