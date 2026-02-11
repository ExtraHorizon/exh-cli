import * as templateRepository from '../../src/repositories/templatesV2';

export type TemplateV2RepositoryMock = ReturnType<typeof templateV2RepositoryMock>;

export const templateV2RepositoryMock = () => {
  const findByNameSpy = jest.spyOn(templateRepository, 'findByName')
    .mockResolvedValue(undefined);

  const findByIdSpy = jest.spyOn(templateRepository, 'findById')
    .mockResolvedValue(undefined);

  const findAllSpy = jest.spyOn(templateRepository, 'findAll')
    .mockResolvedValue([]);

  const createSpy = jest.spyOn(templateRepository, 'create')
    .mockImplementation(async data => ({
      ...data,
      id: 'template-id',
      updateTimestamp: new Date(),
      creationTimestamp: new Date(),
    }));

  const updateSpy = jest.spyOn(templateRepository, 'update')
    .mockResolvedValue({ affectedRecords: 1 });

  const removeSpy = jest.spyOn(templateRepository, 'remove')
    .mockResolvedValue({ affectedRecords: 1 });

  return {
    findByNameSpy,
    findByIdSpy,
    findAllSpy,
    createSpy,
    updateSpy,
    removeSpy,
  };
};
