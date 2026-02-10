import * as schemaRepository from '../../src/repositories/schemas';
import { createEmptySchema } from './schemas';

export type SchemaRepositoryMock = ReturnType<typeof schemaRepositoryMock>;

export const schemaRepositoryMock = () => {
  const removeSchemaSpy = jest.spyOn(schemaRepository, 'remove')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  const disableSchemaSpy = jest.spyOn(schemaRepository, 'disable')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  const fetchSchemaByNameSpy = jest.spyOn(schemaRepository, 'fetchSchemaByName')
    .mockImplementation(() => Promise.resolve(undefined));

  const fetchAllSpy = jest.spyOn(schemaRepository, 'fetchAll')
    .mockImplementation(() => Promise.resolve([createEmptySchema()]));

  const createSchemaSpy = jest.spyOn(schemaRepository, 'createSchema')
    .mockImplementation((name, description) => Promise.resolve(createEmptySchema(name, description)));

  const createPropertySpy = jest.spyOn(schemaRepository, 'createProperty')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  const createStatusSpy = jest.spyOn(schemaRepository, 'createStatus')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  const updateCreationTransitionSpy = jest.spyOn(schemaRepository, 'updateCreationTransition')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  const createTransitionSpy = jest.spyOn(schemaRepository, 'createTransition')
    .mockImplementation((_id, data) => Promise.resolve(data));

  const createIndexSpy = jest.spyOn(schemaRepository, 'createIndex')
    .mockImplementation((_id, data) => Promise.resolve(data));

  const deleteStatusSpy = jest.spyOn(schemaRepository, 'deleteStatus')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  const updateSchemaSpy = jest.spyOn(schemaRepository, 'updateSchema')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  return {
    removeSchemaSpy,
    disableSchemaSpy,
    fetchSchemaByNameSpy,
    fetchAllSpy,
    createSchemaSpy,
    createPropertySpy,
    createStatusSpy,
    updateCreationTransitionSpy,
    createTransitionSpy,
    createIndexSpy,
    deleteStatusSpy,
    updateSchemaSpy,
  };
};
