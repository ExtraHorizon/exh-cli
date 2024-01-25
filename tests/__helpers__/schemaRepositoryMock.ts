import * as schemaRepository from '../../src/repositories/schemas';
import { createEmptySchema } from './schemas';

export const schemaRepositoryMock = () => {
  const removeSchemaSpy = jest.spyOn(schemaRepository, 'remove')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  const disableSchemaSpy = jest.spyOn(schemaRepository, 'disable')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  const fetchSchemaByNameSpy = jest.spyOn(schemaRepository, 'fetchSchemaByName')
    .mockImplementation(() => Promise.resolve(undefined));

  const createSchemaSpy = jest.spyOn(schemaRepository, 'createSchema')
    .mockImplementation((_sdk, name, description) => Promise.resolve(createEmptySchema(name, description)));

  const createPropertySpy = jest.spyOn(schemaRepository, 'createProperty')
    // @ts-expect-error axios object is being returned, hard to mock
    .mockImplementation(() => Promise.resolve({ status: 200, data: { affectedRecords: 1 } }));

  const createStatusSpy = jest.spyOn(schemaRepository, 'createStatus')
    // @ts-expect-error axios object is being returned, hard to mock
    .mockImplementation(() => Promise.resolve({ status: 200, data: { affectedRecords: 1 } }));

  const updateCreationTransitionSpy = jest.spyOn(schemaRepository, 'updateCreationTransition')
    // @ts-expect-error axios object is being returned, hard to mock
    .mockImplementation(() => Promise.resolve({ status: 200, data: { affectedRecords: 1 } }));

  const createTransitionSpy = jest.spyOn(schemaRepository, 'createTransition')
    // @ts-expect-error axios object is being returned, hard to mock
    .mockImplementation((_sdk, _id, data) => Promise.resolve({ status: 200, data }));

  const deleteStatusSpy = jest.spyOn(schemaRepository, 'deleteStatus')
    // @ts-expect-error axios object is being returned, hard to mock
    .mockImplementation(() => Promise.resolve({ status: 200, data: { affectedRecords: 1 } }));

  return {
    removeSchemaSpy,
    disableSchemaSpy,
    fetchSchemaByNameSpy,
    createSchemaSpy,
    createPropertySpy,
    createStatusSpy,
    updateCreationTransitionSpy,
    createTransitionSpy,
    deleteStatusSpy,
  };
};
