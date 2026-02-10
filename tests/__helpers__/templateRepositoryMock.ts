import * as templateRepository from '../../src/repositories/templates';

export type TemplateRepositoryMock = ReturnType<typeof templateRepositoryMock>;

export const templateRepositoryMock = () => {
  const findByNameSpy = jest.spyOn(templateRepository, 'findByName')
    .mockImplementation(async () => undefined);

  const findByIdSpy = jest.spyOn(templateRepository, 'findById')
    .mockImplementation(async () => undefined);

  const removeSpy = jest.spyOn(templateRepository, 'remove')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  return {
    findByNameSpy,
    findByIdSpy,
    removeSpy,
  };
};
