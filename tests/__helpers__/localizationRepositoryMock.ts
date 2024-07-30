import * as localizationRepository from '../../src/repositories/localizations';

export const mockLocalizationRepository = () => {
  const createSpy = jest.spyOn(localizationRepository, 'create')
    .mockImplementation((_sdk, localizations) => Promise.resolve({ created: localizations.length, existing: 0, existingIds: [] }));

  const updateSpy = jest.spyOn(localizationRepository, 'update')
    .mockImplementation((_sdk, localizations) => Promise.resolve({ updated: localizations.length }));

  return {
    createSpy,
    updateSpy,
  };
};
