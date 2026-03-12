import * as schemaRepository from '../../src/repositories/schemas';
import { createEmptySchema } from './schemas';
import { generateId } from './utils';

export type SchemaRepositoryMock = ReturnType<typeof schemaRepositoryMock>;

export const schemaRepositoryMock = () => {
  const removeSchemaSpy = jest.spyOn(schemaRepository, 'remove')
    .mockResolvedValue({ affectedRecords: 1 });

  const disableSchemaSpy = jest.spyOn(schemaRepository, 'disable')
    .mockResolvedValue({ affectedRecords: 1 });

  const fetchSchemaByNameSpy = jest.spyOn(schemaRepository, 'fetchSchemaByName')
    .mockResolvedValue(undefined);

  const fetchAllSpy = jest.spyOn(schemaRepository, 'fetchAll')
    .mockResolvedValue([createEmptySchema()]);

  const createSchemaSpy = jest.spyOn(schemaRepository, 'createSchema')
    .mockImplementation(async (name, description) => createEmptySchema(name, description));

  const createPropertySpy = jest.spyOn(schemaRepository, 'createProperty')
    .mockResolvedValue({ affectedRecords: 1 });

  const createStatusSpy = jest.spyOn(schemaRepository, 'createStatus')
    .mockResolvedValue({ affectedRecords: 1 });

  const updateCreationTransitionSpy = jest.spyOn(schemaRepository, 'updateCreationTransition')
    .mockResolvedValue({ affectedRecords: 1 });

  const createTransitionSpy = jest.spyOn(schemaRepository, 'createTransition')
    .mockImplementation(async (_id, data) => ({ id: generateId(), ...data }));

  const createIndexSpy = jest.spyOn(schemaRepository, 'createIndex')
    .mockImplementation(async (_id, data) => ({ id: generateId(), name: generateId(), ...data }));

  const deleteStatusSpy = jest.spyOn(schemaRepository, 'deleteStatus')
    .mockResolvedValue({ affectedRecords: 1 });

  const updateSchemaSpy = jest.spyOn(schemaRepository, 'updateSchema')
    .mockResolvedValue({ affectedRecords: 1 });

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
