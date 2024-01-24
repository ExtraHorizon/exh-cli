import * as schemaRepository from '../../src/repositories/schemas';

export const schemaRepositoryMock = () => {
  const removeSchemaSpy = jest.spyOn(schemaRepository, 'remove')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  const disableSchemaSpy = jest.spyOn(schemaRepository, 'disable')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  return {
    removeSchemaSpy,
    disableSchemaSpy,
  };
};
